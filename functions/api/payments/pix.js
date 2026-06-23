import { buildAsaasPaymentMessage, createAsaasPayment, findPack } from "../../_lib/asaas.js";
import { createId, json, readJson } from "../../_lib/http.js";
import { deliverPaidPack } from "../../_lib/pack-delivery.js";
import { sendMetaMessage } from "../../_lib/lia-agent.js";
import { parseJson } from "../../_lib/leads.js";
import { isMetaReengagementError, sendReactivationTemplate } from "../../_lib/meta-templates.js";

export async function onRequestPost({ env, request }) {
  try {
    const body = await readJson(request);
    const contactId = String(body.contactId || body.leadId || "").trim();
    const packId = String(body.packId || "pack_30_fotos").trim();
    const coupon = String(body.coupon || body.couponCode || "").trim();
    let silent = body.silent === true || body.source === "landing";

    if (!contactId) {
      return json({ error: "Informe contactId." }, { status: 400 });
    }

    const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(contactId).first();
    if (!contact) {
      return json({ error: "Contato nao encontrado." }, { status: 404 });
    }
    const contactTags = parseJson(contact.tags, []);
    silent = silent || contact.source === "Página de vendas" || contactTags.includes("landing-page");

    if (coupon) {
      if (!isFullDiscountCoupon(env, coupon)) {
        return json({ error: "Cupom inválido." }, { status: 400 });
      }

      const payment = await createCouponPaidPayment(env, contact, packId, coupon);
      const delivery = await deliverPaidPack(env, request, contact, {
        id: payment.id,
        contact_id: payment.contactId,
        pack_id: payment.packId,
        pack_title: payment.packTitle,
        amount: payment.amount,
      });
      const activities = parseJson(contact.activities, []);
      const deliveredLabel = delivery.delivered
        ? `Pack entregue automaticamente (${delivery.count}/${delivery.total})`
        : delivery.reason === "already_delivered"
          ? "Pack completo ja entregue"
          : "Entrega automatica pendente";

      await env.DB.prepare("UPDATE contacts SET stage = 'ganho', activities = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(JSON.stringify([
          `Cupom 100% aplicado: ${payment.packTitle}`,
          deliveredLabel,
          ...activities.filter((item) => !String(item).startsWith("Aguardando Pix") && !String(item).startsWith("Aguardando pagamento")),
        ]), contact.id)
        .run();

      return json({
        payment,
        coupon: { applied: true, discountPercent: 100 },
        delivery,
        messageStatus: "skipped",
        providerMessageId: null,
        error: null,
      }, { status: 201 });
    }

    const payment = await createAsaasPayment(env, request, contact, packId);
    const reply = buildAsaasPaymentMessage(payment);
    const result = silent
      ? { ok: true, providerMessageId: null, error: null }
      : await sendMetaMessage(env, contact.phone, reply);
    const activities = parseJson(contact.activities, []);
    const nextActivities = [
      `Aguardando pagamento ${payment.packTitle}`,
      ...activities.filter((item) => !String(item).startsWith("Aguardando Pix") && !String(item).startsWith("Aguardando pagamento")),
    ];

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
         VALUES (?, ?, 'outbound', ?, ?, ?, 'asaas-payment', ?, ?, ?)`
      ).bind(createId("msg"), contact.id, reply.text, reply.mediaUrl, reply.mediaType, result.providerMessageId, result.ok ? "sent" : "failed", result.error || ""),
      env.DB.prepare("UPDATE contacts SET stage = 'proposta', activities = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(nextActivities), contact.id),
    ]);
    if (!silent && isMetaReengagementError(result)) {
      await sendReactivationTemplate(env, contact, "payment_followup");
    }

    return json({
      payment,
      messageStatus: silent ? "skipped" : result.ok ? "sent" : "failed",
      providerMessageId: result.providerMessageId,
      error: result.error || null,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Erro desconhecido");
    console.error("Falha ao gerar pagamento Asaas", { message, stack: error?.stack });
    const status = message.includes("ASAAS_API_KEY") ? 503 : 502;
    return json({ error: `Falha ao gerar pagamento no Asaas: ${message}` }, { status });
  }
}

async function createCouponPaidPayment(env, contact, packId, coupon) {
  const pack = findPack(packId);
  const paymentId = createId("pay");
  const paidAt = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO payments (
      id, contact_id, pack_id, pack_title, amount, provider, provider_payment_id,
      status, pix_payload, pix_qr_image, invoice_url, external_reference, raw_event, paid_at
    ) VALUES (?, ?, ?, ?, 0, 'coupon', ?, 'paid', '', '', '', ?, ?, ?)`
  )
    .bind(
      paymentId,
      contact.id,
      pack.id,
      pack.title,
      `coupon:${paymentId}`,
      paymentId,
      JSON.stringify({ type: "full_discount_coupon", coupon: maskCoupon(coupon), originalAmount: Number(pack.amount || 0) }),
      paidAt
    )
    .run();

  return {
    id: paymentId,
    providerPaymentId: `coupon:${paymentId}`,
    contactId: contact.id,
    packId: pack.id,
    packTitle: pack.title,
    amount: 0,
    originalAmount: Number(pack.amount || 0),
    status: "paid",
    billingType: "COUPON",
    pixPayload: "",
    qrImageUrl: "",
    invoiceUrl: "",
  };
}

function isFullDiscountCoupon(env, coupon) {
  const expected = normalizeCoupon(env.FULL_DISCOUNT_COUPON || "");
  return Boolean(expected) && normalizeCoupon(coupon) === expected;
}

function normalizeCoupon(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function maskCoupon(value) {
  const normalized = normalizeCoupon(value);
  if (normalized.length <= 4) return "****";
  return `${normalized.slice(0, 2)}***${normalized.slice(-2)}`;
}
