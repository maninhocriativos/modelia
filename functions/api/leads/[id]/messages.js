import { createId, json, readJson } from "../../../_lib/http.js";
import { buildAsaasPaymentMessage, createAsaasPayment } from "../../../_lib/asaas.js";
import { buildLiaRepliesWithAi, classifyAgeReply, LIA_SAMPLE_IMAGE_PATH, LIA_SAMPLE_VIDEO_PATH, mergeAgeTags, sendMetaMessage } from "../../../_lib/lia-agent.js";
import { parseJson } from "../../../_lib/leads.js";

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
  const replies = await buildLiaRepliesWithAi(env, contact, rows.results || [], { sampleUrl, sampleVideoUrl });
  const reply = Array.isArray(replies) ? replies.find(Boolean) : null;

  if (!reply) return;

  if (reply.paymentRequest?.provider === "asaas") {
    await sendAsaasPaymentReply(env, request, contact, reply.paymentRequest.packId);
    return;
  }

  const result = await sendMetaMessage(env, contact.phone, reply);
  await env.DB.prepare(
    `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
     VALUES (?, ?, 'outbound', ?, ?, ?, 'meta-auto', ?, ?)`
  )
    .bind(
      createId("msg"),
      contact.id,
      reply.text || "",
      reply.mediaUrl || null,
      reply.mediaType || null,
      result.providerMessageId,
      result.ok ? "sent" : "failed"
    )
    .run();

  if (reply.sampleVideoUrl) {
    const videoReply = {
      text: "E essa e uma previa em video do clima do pack.",
      mediaUrl: reply.sampleVideoUrl,
      mediaType: "video",
    };
    const videoResult = await sendMetaMessage(env, contact.phone, videoReply);
    await env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, ?, ?, 'meta-auto', ?, ?)`
    )
      .bind(
        createId("msg"),
        contact.id,
        videoReply.text,
        videoReply.mediaUrl,
        videoReply.mediaType,
        videoResult.providerMessageId,
        videoResult.ok ? "sent" : "failed"
      )
      .run();
  }
}

async function sendAsaasPaymentReply(env, request, contact, packId) {
  const payment = await createAsaasPayment(env, request, contact, packId);
  const reply = buildAsaasPaymentMessage(payment);
  const result = await sendMetaMessage(env, contact.phone, reply);

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, ?, ?, 'asaas-payment', ?, ?)`
    ).bind(createId("msg"), contact.id, reply.text, reply.mediaUrl, reply.mediaType, result.providerMessageId, result.ok ? "sent" : "failed"),
    env.DB.prepare("UPDATE contacts SET stage = 'proposta', updated_at = datetime('now') WHERE id = ?").bind(contact.id),
  ]);
}
