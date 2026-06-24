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
    contact = await persistTaxId(env.DB, contact, text);
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

async function persistTaxId(db, contact, text) {
  const raw = String(text || "").trim();
  const digits = raw.replace(/\D/g, "");
  const looksLikeTaxId = /cpf|cnpj/i.test(raw) || /^[\d.\-\/\s]+$/.test(raw);
  if (!looksLikeTaxId || ![11, 14].includes(digits.length)) return contact;

  await db.prepare("UPDATE contacts SET cpf_cnpj = ?, updated_at = datetime('now') WHERE id = ?").bind(digits, contact.id).run();
  return { ...contact, cpf_cnpj: digits };
}

async function sendAutomaticReply(env, request, contact) {
  const rows = await env.DB.prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY unixepoch(created_at) ASC, created_at ASC")
    .bind(contact.id)
    .all();
  const sampleUrl = new URL(LIA_SAMPLE_IMAGE_PATH, request.url).toString();
  const sampleVideoUrl = new URL(LIA_SAMPLE_VIDEO_PATH, request.url).toString();
  const lastInbound = [...(rows.results || [])].reverse().find((message) => message.direction === "inbound");
  if (await handleTaxIdCheckout(env, request, contact, rows.results || [], lastInbound?.text || "")) {
    return;
  }
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
  try {
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
  } catch (error) {
    const reply = { text: buildPaymentFailureMessage(error) };
    const result = await sendMetaMessage(env, contact.phone, reply);
    await insertOutboundMessage(env, contact.id, reply, result, "asaas-payment");
    if (isMetaReengagementError(result)) {
      await sendReactivationTemplate(env, contact, "payment_followup");
    }
  }
}

async function handleTaxIdCheckout(env, request, contact, messages, text) {
  if (!isTaxIdText(text) || !hasValidTaxId(contact)) return false;

  const packId = inferPackForCoupon(contact, messages);
  if (!packId) {
    const reply = {
      text: "CPF recebido. Agora escolhe qual pack voce quer que eu gere o Pix:",
      buttons: PACKS.map((pack) => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
      })),
    };
    const result = await sendMetaMessage(env, contact.phone, reply);
    await insertOutboundMessage(env, contact.id, reply, result, "asaas-payment");
    return true;
  }

  await sendAsaasPaymentReply(env, request, contact, packId);
  return true;
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
  if (fromInterest && countPackMentions(contact?.interest || "") === 1) return fromInterest;

  for (const message of [...messages].reverse()) {
    const text = String(message.text || "");
    if (!text || isTechnicalFailureMessage(text)) continue;

    const packId = classifyPackReply(text);
    if (!packId) continue;

    if (message.direction === "inbound") return packId;
    if (isCheckoutOrPaymentText(text)) return packId;
  }

  return null;
}

function buildPaymentFailureMessage(error) {
  const message = String(error?.message || error || "");
  if (message.toLowerCase().includes("cpf") || message.toLowerCase().includes("cnpj")) {
    return "Nao consegui validar esse CPF/CNPJ para gerar o Pix. Confere os numeros e me manda de novo, por favor.";
  }
  return "Nao consegui gerar o Pix agora. Me chama de novo em instantes que eu tento novamente pra voce.";
}

function isCheckoutOrPaymentText(text) {
  const value = normalizeText(text);
  return (
    value.includes("fechei o") ||
    value.includes("fechei pra voce") ||
    value.includes("pagamento por pix") ||
    value.includes("pix copia e cola") ||
    value.includes("cpf do titular")
  );
}

function countPackMentions(text) {
  const value = normalizeText(text);
  let count = 0;
  if (value.includes("pack_10_fotos") || value.includes("10 fotos") || value.includes("19,90") || value.includes("19.90")) count += 1;
  if (value.includes("pack_30_fotos") || value.includes("30 fotos") || value.includes("39,90") || value.includes("39.90")) count += 1;
  if (value.includes("pack_20_fotos_1_video") || value.includes("20 fotos") || value.includes("video") || value.includes("59,90") || value.includes("59.90")) count += 1;
  return count;
}

function isTechnicalFailureMessage(text) {
  const value = normalizeText(text);
  return value.includes("falha do agente") || value.includes("nenhuma resposta gerada");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isTaxIdText(text) {
  const raw = String(text || "").trim();
  const digits = raw.replace(/\D/g, "");
  const looksLikeTaxId = /cpf|cnpj/i.test(raw) || /^[\d.\-\/\s]+$/.test(raw);
  return looksLikeTaxId && [11, 14].includes(digits.length);
}

function hasValidTaxId(contact) {
  return [11, 14].includes(String(contact?.cpf_cnpj || "").replace(/\D/g, "").length);
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
