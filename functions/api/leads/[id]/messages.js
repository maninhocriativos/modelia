import { createId, json, readJson } from "../../../_lib/http.js";
import { buildAsaasPaymentMessage, createAsaasPayment } from "../../../_lib/asaas.js";
import { buildLiaRepliesWithAi, classifyAgeReply, classifyPackReply, LIA_SAMPLE_IMAGE_PATH, LIA_SAMPLE_VIDEO_PATH, mergeAgeTags, PACKS, sendMetaMessage } from "../../../_lib/lia-agent.js";
import { isFullDiscountCoupon } from "../../../_lib/coupons.js";
import { parseJson } from "../../../_lib/leads.js";
import { isMetaReengagementError, sendReactivationTemplate } from "../../../_lib/meta-templates.js";
import { onRequestPost as createPixPayment } from "../../payments/pix.js";

export async function onRequestPost({ env, params, request }) {
  const body = await readJson(request);
  const id = createId("msg");
  const direction = body.direction === "inbound" ? "inbound" : "outbound";
  const text = String(body.text || "").trim();
  const mediaUrl = body.mediaUrl ? String(body.mediaUrl).trim() : null;
  const mediaType = body.mediaType ? String(body.mediaType).trim() : null;
  let contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(params.id).first();

  if (!contact) {
    return json({ error: "Contato nao encontrado." }, { status: 404 });
  }

  let provider = body.provider ? String(body.provider).trim() : "manual";
  let providerMessageId = body.providerMessageId ? String(body.providerMessageId).trim() : null;
  let status = body.status ? String(body.status).trim() : "stored";
  let providerError = null;

  if (direction === "outbound") {
    provider = "meta";
    const result = await sendMetaMessage(env, contact.phone, { text, mediaUrl, mediaType });
    providerMessageId = result.providerMessageId;
    status = result.ok ? "sent" : "failed";
    providerError = result.error;
    if (isMetaReengagementError(result)) {
      await sendReactivationTemplate(env, contact, "support_followup");
    }
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, params.id, direction, text, mediaUrl, mediaType, provider, providerMessageId, status, providerError || ""),
    env.DB.prepare("UPDATE contacts SET updated_at = datetime('now') WHERE id = ?").bind(params.id),
  ]);

  if (direction === "inbound") {
    contact = await persistAgeDecision(env.DB, contact, text);
    await sendAutomaticReply(env, request, contact);
  }

  return json({ id, status, providerMessageId, providerError }, { status: 201 });
}

async function persistAgeDecision(db, contact, text) {
  const decision = classifyAgeReply(text);
  if (!decision) return contact;

  const tags = mergeAgeTags(parseJson(contact.tags, []), decision);
  const activities =
    decision === "adult"
      ? ["Maioridade confirmada: conteudo adulto liberado", "Enviar amostra gratis"]
      : ["Menor de idade informado: atendimento adulto bloqueado"];

  await db
    .prepare("UPDATE contacts SET tags = ?, activities = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(JSON.stringify(tags), JSON.stringify(activities), contact.id)
    .run();

  return { ...contact, tags: JSON.stringify(tags), activities: JSON.stringify(activities) };
}

async function sendAutomaticReply(env, request, contact) {
  const rows = await env.DB.prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY unixepoch(created_at) ASC, created_at ASC")
    .bind(contact.id)
    .all();
  const sampleUrl = new URL(LIA_SAMPLE_IMAGE_PATH, request.url).toString();
  const sampleVideoUrl = new URL(LIA_SAMPLE_VIDEO_PATH, request.url).toString();
  const lastInbound = [...(rows.results || [])].reverse().find((message) => message.direction === "inbound");
  if (await handleFullDiscountCoupon(env, request, contact, rows.results || [], lastInbound?.text || "")) {
    return;
  }
  const replies = await buildLiaRepliesWithAi(env, contact, rows.results || [], { sampleUrl, sampleVideoUrl });
  const reply = Array.isArray(replies) ? replies.find(Boolean) : null;

  if (!reply) return;

  if (reply.paymentRequest?.provider === "asaas") {
    await sendAsaasPaymentReply(env, request, contact, reply.paymentRequest.packId);
    return;
  }

  const result = await sendMetaMessage(env, contact.phone, reply);
  await insertOutboundMessage(env, contact.id, reply, result, "meta-auto");
  let reactivationSent = false;
  if (isMetaReengagementError(result)) {
    await sendReactivationTemplate(env, contact, "support_followup");
    reactivationSent = true;
  }

  if (reply.sampleVideoUrl) {
    const videoReply = {
      text: "E essa e uma previa em video do clima do pack.",
      mediaUrl: reply.sampleVideoUrl,
      mediaType: "video",
    };
    const videoResult = await sendMetaMessage(env, contact.phone, videoReply);
    await insertOutboundMessage(env, contact.id, videoReply, videoResult, "meta-auto");
    if (!reactivationSent && isMetaReengagementError(videoResult)) {
      await sendReactivationTemplate(env, contact, "support_followup");
    }
  }
}

async function sendAsaasPaymentReply(env, request, contact, packId) {
  const payment = await createAsaasPayment(env, request, contact, packId);
  const reply = buildAsaasPaymentMessage(payment);
  const result = await sendMetaMessage(env, contact.phone, reply);

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
       VALUES (?, ?, 'outbound', ?, ?, ?, 'asaas-payment', ?, ?, ?)`
    ).bind(createId("msg"), contact.id, reply.text, reply.mediaUrl, reply.mediaType, result.providerMessageId, result.ok ? "sent" : "failed", result.error || ""),
    env.DB.prepare("UPDATE contacts SET stage = 'proposta', updated_at = datetime('now') WHERE id = ?").bind(contact.id),
  ]);
  if (isMetaReengagementError(result)) {
    await sendReactivationTemplate(env, contact, "payment_followup");
  }
}

async function handleFullDiscountCoupon(env, request, contact, messages, text) {
  if (!isFullDiscountCoupon(env, text)) return false;

  const packId = inferPackForCoupon(contact, messages);
  if (!packId) {
    const reply = {
      text: "Cupom aceito. Agora escolhe qual pack voce quer liberar:",
      buttons: PACKS.map((pack) => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
      })),
    };
    const result = await sendMetaMessage(env, contact.phone, reply);
    await insertOutboundMessage(env, contact.id, reply, result, "coupon");
    return true;
  }

  const response = await createPixPayment({
    env,
    request: new Request(request.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contactId: contact.id,
        packId,
        coupon: text,
        source: "crm",
        silent: true,
      }),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reply = { text: data.error || "Nao consegui aplicar esse cupom agora. Tenta de novo em instantes." };
    const result = await sendMetaMessage(env, contact.phone, reply);
    await insertOutboundMessage(env, contact.id, reply, result, "coupon");
  }
  return true;
}

function inferPackForCoupon(contact, messages) {
  const fromInterest = classifyPackReply(contact?.interest || "");
  if (fromInterest) return fromInterest;

  for (const message of [...messages].reverse()) {
    const packId = classifyPackReply(message.text || "");
    if (packId) return packId;
  }

  return null;
}

async function insertOutboundMessage(env, contactId, reply, result, provider) {
  await env.DB.prepare(
    `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
     VALUES (?, ?, 'outbound', ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      createId("msg"),
      contactId,
      reply.text || "",
      reply.mediaUrl || null,
      reply.mediaType || null,
      provider,
      result.providerMessageId,
      result.ok ? "sent" : "failed",
      result.error || ""
    )
    .run();
}
