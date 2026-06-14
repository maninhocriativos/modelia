import { createId } from "./http.js";
import { sendMetaMessage } from "./lia-agent.js";

const PACK_MEDIA = {
  pack_10_fotos: { images: 10, videos: 0 },
  pack_30_fotos: { images: 30, videos: 0 },
  pack_20_fotos_1_video: { images: 20, videos: 1 },
};

const LIA_VIDEO_PATHS = [
  "/imagens-modelos/lia/pack-01/videos/grok-69f84467-0e85-4ae5-8d3a-7aec2b6f6aec.mp4",
  "/imagens-modelos/lia/pack-01/videos/grok-a25bd720-3e49-4e47-b0ad-a795e135cc19.mp4",
];

export async function deliverPaidPack(env, request, contact, payment) {
  const alreadyDelivered = await env.DB.prepare(
    "SELECT id FROM messages WHERE contact_id = ? AND provider = 'asaas-delivery' AND text LIKE ? LIMIT 1"
  )
    .bind(contact.id, `%${payment.id}%`)
    .first();

  if (alreadyDelivered) {
    return { delivered: false, reason: "already_delivered", count: 0 };
  }

  const media = await resolvePackMedia(env, request, payment.pack_id);
  if (!media.length) {
    const fallback = {
      text: `Pagamento confirmado!\n\nSeu ${payment.pack_title} foi aprovado, mas nao encontrei as midias desse pack cadastradas para entrega automatica.\n\nReferencia: ${payment.id}`,
    };
    const result = await sendMetaMessage(env, contact.phone, fallback);
    await insertOutbound(env, contact.id, fallback, result, "asaas-delivery");
    return { delivered: false, reason: "empty_pack", count: 0 };
  }

  const intro = {
    text: `Pagamento confirmado!\n\nSeu ${payment.pack_title} foi aprovado. Vou te mandar o pack completo agora.\n\nReferencia: ${payment.id}`,
  };
  const introResult = await sendMetaMessage(env, contact.phone, intro);
  await insertOutbound(env, contact.id, intro, introResult, "asaas-paid");

  let sent = 0;
  for (const [index, item] of media.entries()) {
    if (index > 0) await sleep(450);

    const reply = {
      text: buildCaption(payment, item, index, media.length),
      mediaUrl: item.url,
      mediaType: item.type,
    };
    const result = await sendMetaMessage(env, contact.phone, reply);
    await insertOutbound(env, contact.id, reply, result, "asaas-delivery");
    if (result.ok) sent += 1;
  }

  const done = {
    text: `Pack entregue: ${payment.pack_title}.\n\nReferencia: ${payment.id}`,
  };
  const doneResult = await sendMetaMessage(env, contact.phone, done);
  await insertOutbound(env, contact.id, done, doneResult, "asaas-delivery");

  return { delivered: true, count: sent, total: media.length };
}

async function resolvePackMedia(env, request, packId) {
  const dbPackId = getConfiguredMediaPackId(env, packId) || packId;
  const rows = await env.DB.prepare(
    "SELECT title, media_type, url, sort_order FROM media_items WHERE pack_id = ? ORDER BY sort_order ASC, unixepoch(created_at) ASC"
  )
    .bind(dbPackId)
    .all();

  const dbMedia = (rows.results || [])
    .map((item) => ({
      title: item.title || "",
      type: normalizeMediaType(item.media_type),
      url: absolutizeUrl(request, item.url),
      sortOrder: Number(item.sort_order || 0),
    }))
    .filter((item) => item.url);

  return dbMedia.length ? dbMedia : buildDefaultPackMedia(request, packId);
}

function buildDefaultPackMedia(request, packId) {
  const config = PACK_MEDIA[packId] || PACK_MEDIA.pack_30_fotos;
  const media = [];

  for (let index = 1; index <= config.images; index += 1) {
    const filename = String(index).padStart(2, "0");
    media.push({
      title: `Foto ${filename}`,
      type: "image",
      url: absolutizeUrl(request, `/imagens-modelos/webp/modelo-${filename}.webp`),
    });
  }

  for (let index = 0; index < config.videos; index += 1) {
    media.push({
      title: `Video ${String(index + 1).padStart(2, "0")}`,
      type: "video",
      url: absolutizeUrl(request, LIA_VIDEO_PATHS[index % LIA_VIDEO_PATHS.length]),
    });
  }

  return media;
}

function getConfiguredMediaPackId(env, packId) {
  const key = {
    pack_10_fotos: "LIA_PACK_10_MEDIA_PACK_ID",
    pack_30_fotos: "LIA_PACK_30_MEDIA_PACK_ID",
    pack_20_fotos_1_video: "LIA_PACK_20_VIDEO_MEDIA_PACK_ID",
  }[packId];
  return key ? String(env[key] || "").trim() : "";
}

function buildCaption(payment, item, index, total) {
  const label = item.type === "video" ? "Video" : "Foto";
  const current = String(index + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");
  return `${label} ${current}/${count} - ${payment.pack_title}`;
}

async function insertOutbound(env, contactId, reply, result, provider) {
  await env.DB.prepare(
    `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
     VALUES (?, ?, 'outbound', ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      createId("msg"),
      contactId,
      reply.text || "",
      reply.mediaUrl || null,
      reply.mediaType || null,
      provider,
      result.providerMessageId,
      result.ok ? "sent" : "failed"
    )
    .run();
}

function absolutizeUrl(request, url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, request.url).toString();
}

function normalizeMediaType(value) {
  return String(value || "").toLowerCase() === "video" ? "video" : "image";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
