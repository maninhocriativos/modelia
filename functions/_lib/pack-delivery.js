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

const DEFAULT_PHOTO_PATHS = [
  "/imagens-modelos/lia/pack-01/fotos/grok-13f7d6f3-a590-4f0d-8e41-853ba1f3b957.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-25bbae71-8dc8-4edd-a5aa-b05db4691d07.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-53893a3c-62db-4a4a-90e6-e2761eac636d.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-6b27c520-a4dc-41fc-8698-55b0ae141259.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-770e81eb-9b4d-4c05-90f6-59aba2a76aab.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-8d30d6cb-01e1-472c-ace4-3e1f80afc9d0.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-b238247f-9af4-45f3-a0e0-a25902b63e15.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-b8444a2b-5024-41f7-8050-a3849d1921ea.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-b8fe5d02-c34e-4c6f-b539-85989bd5966e.jpg",
  "/imagens-modelos/lia/pack-01/fotos/grok-e1dae7c1-cde8-4eee-b43c-1b335a90d02d.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-0033eb5d-99ca-4c44-988a-aca9f954d851.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-214510bd-0a21-4a88-9e79-3f33afc99f99.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-24c54342-893b-4fbe-8527-a4a12984989c.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-54272167-ec24-465f-9dc5-f517037c9998.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-5ffebd9f-93b5-4943-919a-ece696c3f775.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-76ddb1a5-d044-44d8-b137-10ed66662738.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-a364730b-8d33-4661-878f-49497db504a2.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-a538875f-726b-4e60-8489-1bd9f7299672.jpg",
  "/imagens-modelos/ingredi/pack-01/fotos/grok-f9267038-5239-479e-969c-a59aeaca5223.jpg",
];

export async function deliverPaidPack(env, request, contact, payment) {
  const expected = PACK_MEDIA[payment.pack_id] || PACK_MEDIA.pack_30_fotos;
  const expectedTotal = Number(expected.images || 0) + Number(expected.videos || 0);
  const alreadyDelivered = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM messages
     WHERE contact_id = ?
       AND provider = 'asaas-delivery'
       AND text LIKE ?
       AND media_url IS NOT NULL
       AND status IN ('sent', 'delivered', 'read')`
  )
    .bind(contact.id, `%${payment.id}%`)
    .first();

  if (Number(alreadyDelivered?.count || 0) >= expectedTotal) {
    return { delivered: false, reason: "already_delivered", count: Number(alreadyDelivered.count), total: expectedTotal };
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

  const done = sent === media.length
    ? { text: `Pack entregue: ${payment.pack_title}.\n\nReferencia: ${payment.id}` }
    : { text: `Tive uma falha ao enviar parte do pack (${sent}/${media.length}). Vou deixar marcado aqui para reenviar.\n\nReferencia: ${payment.id}` };
  const doneResult = await sendMetaMessage(env, contact.phone, done);
  await insertOutbound(env, contact.id, done, doneResult, "asaas-delivery");

  return { delivered: sent === media.length, reason: sent === media.length ? null : "media_send_failed", count: sent, total: media.length };
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
    const photoPath = DEFAULT_PHOTO_PATHS[(index - 1) % DEFAULT_PHOTO_PATHS.length];
    media.push({
      title: `Foto ${String(index).padStart(2, "0")}`,
      type: "image",
      url: absolutizeUrl(request, photoPath),
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
