import { json, createId } from "../../_lib/http.js";
import { markAsaasPaymentFromWebhook } from "../../_lib/asaas.js";
import { sendMetaMessage } from "../../_lib/lia-agent.js";
import { parseJson } from "../../_lib/leads.js";

export async function onRequestPost({ env, request }) {
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

  if (payment.status === "paid") {
    await notifyPaid(env, payment);
  }

  return json({ ok: true, status: payment.status });
}

async function notifyPaid(env, payment) {
  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(payment.contact_id).first();
  if (!contact) return;

  const alreadyNotified = await env.DB.prepare(
    "SELECT id FROM messages WHERE contact_id = ? AND provider = 'asaas-paid' AND text LIKE ? LIMIT 1"
  )
    .bind(contact.id, `%${payment.id}%`)
    .first();
  if (alreadyNotified) return;

  const reply = {
    text: `Pagamento confirmado ✅\n\nSeu ${payment.pack_title} foi aprovado. Vou liberar o pack completo agora.\n\nReferencia: ${payment.id}`,
  };
  const result = await sendMetaMessage(env, contact.phone, reply);
  const activities = parseJson(contact.activities, []);
  const nextActivities = [
    `Pagamento confirmado: ${payment.pack_title}`,
    "Liberar pack completo",
    ...activities.filter((item) => !String(item).startsWith("Aguardando Pix")),
  ];

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, NULL, NULL, 'asaas-paid', ?, ?)`
    ).bind(createId("msg"), contact.id, reply.text, result.providerMessageId, result.ok ? "sent" : "failed"),
    env.DB.prepare("UPDATE contacts SET stage = 'ganho', activities = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(nextActivities), contact.id),
  ]);
}
