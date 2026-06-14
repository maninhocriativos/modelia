import { json } from "../../_lib/http.js";
import { markAsaasPaymentFromWebhook } from "../../_lib/asaas.js";
import { deliverPaidPack } from "../../_lib/pack-delivery.js";
import { parseJson } from "../../_lib/leads.js";

export async function onRequestPost({ env, request, waitUntil }) {
  if (env.ASAAS_WEBHOOK_TOKEN) {
    const receivedToken =
      request.headers.get("asaas-access-token") ||
      request.headers.get("asaas-webhook-token") ||
      request.headers.get("x-asaas-webhook-token") ||
      "";
    if (receivedToken !== env.ASAAS_WEBHOOK_TOKEN) {
      return json({ error: "Webhook nao autorizado." }, { status: 401 });
    }
  }

  const event = await request.json().catch(() => ({}));
  const payment = await markAsaasPaymentFromWebhook(env, event);

  if (!payment) {
    return json({ ok: true, ignored: true });
  }

  let delivery = null;
  if (payment.status === "paid") {
    if (typeof waitUntil === "function") {
      waitUntil(notifyPaid(env, request, payment));
      delivery = { scheduled: true };
    } else {
      delivery = await notifyPaid(env, request, payment);
    }
  }

  return json({ ok: true, status: payment.status, delivery });
}

async function notifyPaid(env, request, payment) {
  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(payment.contact_id).first();
  if (!contact) return { delivered: false, reason: "contact_not_found" };

  const delivery = await deliverPaidPack(env, request, contact, payment);
  const activities = parseJson(contact.activities, []);
  const deliveredLabel = delivery.delivered
    ? `Pack entregue automaticamente (${delivery.count}/${delivery.total})`
    : delivery.reason === "already_delivered"
      ? "Pack completo ja entregue"
      : "Entrega automatica pendente";

  const nextActivities = [
    `Pagamento confirmado: ${payment.pack_title}`,
    deliveredLabel,
    ...activities.filter((item) => !String(item).startsWith("Aguardando Pix") && !String(item).startsWith("Aguardando pagamento")),
  ];

  await env.DB.prepare("UPDATE contacts SET stage = 'ganho', activities = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(JSON.stringify(nextActivities), contact.id)
    .run();

  return delivery;
}
