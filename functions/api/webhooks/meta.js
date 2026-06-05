import { createId, json, readJson } from "../../_lib/http.js";
import { buildPixMessage, createAsaasPixPayment } from "../../_lib/asaas.js";
import { buildLiaRepliesWithAi, classifyAgeReply, LIA_SAMPLE_IMAGE_PATH, LIA_SAMPLE_VIDEO_PATH, mergeAgeTags, sendMetaAudioMessage, sendMetaMessage } from "../../_lib/lia-agent.js";
import { parseJson } from "../../_lib/leads.js";

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.META_VERIFY_TOKEN) {
    return new Response(challenge || "", {
      headers: { "content-type": "text/plain" },
    });
  }

  return json({ error: "Webhook nao verificado." }, { status: 403 });
}

export async function onRequestPost({ env, request }) {
  const body = await readJson(request);
  const events = extractMessages(body);
  let replied = 0;

  for (const event of events) {
    const enrichedEvent = await enrichInboundEvent(env, event);
    const stored = await storeInboundMessage(env.DB, enrichedEvent);
    if (stored.inserted) {
      const contact = await persistAgeDecision(env.DB, stored.contact, enrichedEvent.text);
      await sendAutomaticReply(env, request, contact);
      replied += 1;
    }
  }

  return json({ ok: true, received: events.length, replied });
}

function extractMessages(payload) {
  const events = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contactByWaId = new Map((value.contacts || []).map((contact) => [contact.wa_id, contact]));

      for (const message of value.messages || []) {
        const profile = contactByWaId.get(message.from)?.profile || {};
        const media = getMedia(message);

        events.push({
          providerMessageId: message.id || "",
          phone: message.from || "",
          name: profile.name || message.from || "Contato WhatsApp",
          text: getText(message),
          mediaUrl: media.url,
          mediaType: media.type,
          timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
        });
      }
    }
  }

  return events.filter((event) => event.phone);
}

function getText(message) {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  if (message.image?.caption) return message.image.caption;
  if (message.video?.caption) return message.video.caption;
  if (message.document?.caption) return message.document.caption;
  return "";
}

function getMedia(message) {
  if (message.image?.id) return { type: "image", url: `meta-media:${message.image.id}` };
  if (message.video?.id) return { type: "video", url: `meta-media:${message.video.id}` };
  if (message.audio?.id) return { type: "audio", url: `meta-media:${message.audio.id}` };
  if (message.document?.id) return { type: "document", url: `meta-media:${message.document.id}` };
  return { type: null, url: null };
}

async function enrichInboundEvent(env, event) {
  if (!event.mediaUrl?.startsWith("meta-media:")) return event;

  try {
    if (event.mediaType === "audio") {
      const transcript = await transcribeMetaAudio(env, event.mediaUrl);
      return {
        ...event,
        text: joinContext(event.text, transcript
          ? `Cliente enviou um audio. Transcricao: "${transcript}"`
          : "Cliente enviou um audio, mas nao foi possivel transcrever."),
      };
    }

    if (event.mediaType === "image") {
      const description = await describeMetaImage(env, event.mediaUrl, event.text);
      return {
        ...event,
        text: joinContext(event.text, description
          ? `Cliente enviou uma imagem. Descricao para contexto: ${description}`
          : "Cliente enviou uma imagem, mas nao foi possivel analisar."),
      };
    }
  } catch {
    return {
      ...event,
      text: joinContext(event.text, `Cliente enviou ${event.mediaType === "audio" ? "um audio" : "uma imagem"}, mas o sistema nao conseguiu interpretar agora.`),
    };
  }

  return event;
}

async function transcribeMetaAudio(env, mediaUrl) {
  if (!env.OPENAI_API_KEY) return "";
  const media = await fetchMetaMedia(env, mediaUrl);
  if (!media?.blob) return "";

  const form = new FormData();
  form.append("model", env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  form.append("language", "pt");
  form.append("response_format", "json");
  form.append(
    "prompt",
    "Transcreva audio curto de WhatsApp em portugues do Brasil. Preserve pedidos como audio, foto, imagem, maior de 18, preco, pack e respostas curtas."
  );
  form.append("file", media.blob, filenameForMime(media.mimeType, "audio"));

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: form,
  });

  if (!response.ok) return "";
  const data = await response.json();
  return String(data.text || "").trim().slice(0, 1200);
}

async function describeMetaImage(env, mediaUrl, caption = "") {
  if (!env.OPENAI_API_KEY) return "";
  const media = await fetchMetaMedia(env, mediaUrl);
  if (!media?.blob) return "";

  const imageDataUrl = await blobToDataUrl(media.blob, media.mimeType || "image/jpeg");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      max_output_tokens: 180,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Analise a imagem enviada por um cliente no WhatsApp para a Lia responder como pessoa real. ` +
                `Descreva objetivamente o que aparece, o clima da imagem e qualquer texto visivel. ` +
                `Nao seja grafico nem sexualize a descricao. Se houver legenda, considere: "${String(caption || "").slice(0, 300)}".`,
            },
            { type: "input_image", image_url: imageDataUrl },
          ],
        },
      ],
    }),
  });

  if (!response.ok) return "";
  const data = await response.json();
  return extractResponseText(data).slice(0, 900);
}

async function fetchMetaMedia(env, mediaUrl) {
  if (!env.META_ACCESS_TOKEN) return null;
  const mediaId = mediaUrl.replace(/^meta-media:/, "");
  if (!mediaId) return null;

  const metadataResponse = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
  });
  if (!metadataResponse.ok) return null;

  const metadata = await metadataResponse.json();
  if (!metadata.url) return null;

  const mediaResponse = await fetch(metadata.url, {
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
  });
  if (!mediaResponse.ok) return null;

  return {
    blob: await mediaResponse.blob(),
    mimeType: metadata.mime_type || mediaResponse.headers.get("content-type") || "",
  };
}

function joinContext(text, context) {
  const cleanText = String(text || "").trim();
  const cleanContext = String(context || "").trim();
  return [cleanText, cleanContext].filter(Boolean).join("\n\n");
}

function filenameForMime(mimeType = "", fallback = "file") {
  if (mimeType.includes("webm")) return `${fallback}.webm`;
  if (mimeType.includes("mp4")) return `${fallback}.mp4`;
  if (mimeType.includes("mpeg")) return `${fallback}.mp3`;
  if (mimeType.includes("mp3")) return `${fallback}.mp3`;
  if (mimeType.includes("mpga")) return `${fallback}.mpga`;
  if (mimeType.includes("m4a")) return `${fallback}.m4a`;
  if (mimeType.includes("wav")) return `${fallback}.wav`;
  if (mimeType.includes("ogg")) return `${fallback}.ogg`;
  if (mimeType.includes("png")) return `${fallback}.png`;
  if (mimeType.includes("webp")) return `${fallback}.webp`;
  return `${fallback}.jpg`;
}

async function blobToDataUrl(blob, mimeType) {
  const buffer = await blob.arrayBuffer();
  return `data:${mimeType};base64,${arrayBufferToBase64(buffer)}`;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function extractResponseText(data) {
  if (data.output_text) return String(data.output_text).trim();
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function storeInboundMessage(db, event) {
  let contact = await db.prepare("SELECT * FROM contacts WHERE phone = ? ORDER BY updated_at DESC LIMIT 1").bind(event.phone).first();

  if (!contact) {
    const contactId = createId("lead");
    await db
      .prepare(
        `INSERT INTO contacts (id, name, phone, interest, source, stage, tags, activities)
         VALUES (?, ?, ?, 'Mensagem recebida pelo WhatsApp', 'Meta WhatsApp', 'novo', ?, ?)`
      )
      .bind(
        contactId,
        event.name,
        event.phone,
        JSON.stringify(["whatsapp", "meta"]),
        JSON.stringify(["Responder nova mensagem", "Confirmar consentimento para receber fotos"])
      )
      .run();
    contact = await db.prepare("SELECT * FROM contacts WHERE id = ?").bind(contactId).first();
  }

  const existing = event.providerMessageId
    ? await db.prepare("SELECT id FROM messages WHERE provider_message_id = ? LIMIT 1").bind(event.providerMessageId).first()
    : null;

  if (existing) return { contact, inserted: false };

  await db.batch([
    db
      .prepare(
        `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, created_at)
         VALUES (?, ?, 'inbound', ?, ?, ?, 'meta', ?, 'received', ?)`
      )
      .bind(
        createId("msg"),
        contact.id,
        event.text,
        event.mediaUrl,
        event.mediaType,
        event.providerMessageId || null,
        event.timestamp
      ),
    db.prepare("UPDATE contacts SET name = COALESCE(NULLIF(?, ''), name), updated_at = datetime('now') WHERE id = ?").bind(event.name, contact.id),
  ]);

  return { contact: { ...contact, name: event.name || contact.name }, inserted: true };
}

async function persistAgeDecision(db, contact, text) {
  const decision = classifyAgeReply(text);
  if (!decision) return contact;

  const currentTags = parseJson(contact.tags, []);
  const tags = mergeAgeTags(currentTags, decision);
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

  const sampleUrl = buildSampleImageUrl(env, request);
  const sampleVideoUrl = buildSampleVideoUrl(env, request);
  const replies = await buildLiaRepliesWithAi(env, contact, rows.results || [], { sampleUrl, sampleVideoUrl });

  const expandedReplies = limitReplies(replies);
  if (!expandedReplies.length) {
    await env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, ?, ?, 'agent-auto', ?, ?)`
    )
      .bind(
        createId("msg"),
        contact.id,
        "[falha do agente: nenhuma resposta gerada]",
        null,
        null,
        null,
        "failed"
      )
      .run();
    return;
  }

  for (const [index, reply] of expandedReplies.entries()) {
    if (index > 0) await sleep(900);

    if (reply.generateImage) {
      await sendGeneratedLiaImage(env, request, contact, rows.results || [], reply.text);
      continue;
    }

    if (reply.paymentRequest?.provider === "asaas") {
      await sendAsaasPixReply(env, request, contact, reply.paymentRequest.packId);
      continue;
    }

    if (shouldSendAudio(env, reply, rows.results || [])) {
      const audioResult = await sendMetaAudioMessage(env, contact.phone, reply.text);
      await env.DB.prepare(
        `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
         VALUES (?, ?, 'outbound', ?, ?, ?, 'meta-auto', ?, ?)`
      )
        .bind(
          createId("msg"),
          contact.id,
          "[audio da Lia]",
          null,
          "audio",
          audioResult.providerMessageId,
          audioResult.ok ? "sent" : "failed"
        )
        .run();
      continue;
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
      await insertOutboundMessage(env, contact.id, videoReply, videoResult, "meta-auto");
    }
  }
}

async function sendAsaasPixReply(env, request, contact, packId) {
  const payment = await createAsaasPixPayment(env, request, contact, packId);
  const reply = buildPixMessage(payment);
  const result = await sendMetaMessage(env, contact.phone, reply);
  await insertOutboundMessage(env, contact.id, reply, result, "asaas-pix");
  await env.DB.prepare("UPDATE contacts SET stage = 'proposta', updated_at = datetime('now') WHERE id = ?").bind(contact.id).run();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function limitReplies(replies) {
  const list = Array.isArray(replies) ? replies.filter(Boolean) : [];
  if (list.length <= 1) return list;

  const technical = list.filter(
    (reply) => reply.paymentRequest || reply.generateImage || reply.mediaUrl || reply.buttons?.length || reply.packs?.length || hasPaymentText(reply.text || "")
  );
  if (technical.length) return technical.slice(0, 1);

  return list.slice(0, 1);
}

async function sendGeneratedLiaImage(env, request, contact, messages = [], agentBrief = "") {
  const lastInbound = [...messages].reverse().find((message) => message.direction === "inbound") || {};
  const generated = await generateLiaImage(env, request, contact, messages, agentBrief);
  const caption = generated.caption || agentBrief || buildGeneratedImageCaption(lastInbound.text || "");

  if (!generated.imageBytes) {
    const fallback = {
      text: "Posso te mandar uma imagem minha nesse clima, mas sem nada explicito demais. Me pede de um jeito mais leve que eu capricho pra voce.",
    };
    const result = await sendMetaMessage(env, contact.phone, fallback);
    await insertOutboundMessage(env, contact.id, fallback, result, "meta-auto");
    return;
  }

  const result = await sendMetaGeneratedImageMessage(env, contact.phone, generated.imageBytes, caption);
  await insertOutboundMessage(
    env,
    contact.id,
    { text: caption, mediaUrl: "[imagem gerada da Lia]", mediaType: "image" },
    result,
    "meta-auto"
  );
}

async function generateLiaImage(env, request, contact, messages = [], agentBrief = "") {
  if (!env.OPENAI_API_KEY) return { imageBytes: null, caption: "" };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_IMAGE_AGENT_MODEL || "gpt-4o-mini",
      tools: [
        {
          type: "image_generation",
          action: "generate",
          size: env.OPENAI_IMAGE_SIZE || "1024x1536",
          quality: env.OPENAI_IMAGE_QUALITY || "medium",
        },
      ],
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: buildLiaImagePrompt(contact, messages, agentBrief) },
            ...buildLiaReferenceImages(request).map((imageUrl) => ({ type: "input_image", image_url: imageUrl })),
          ],
        },
      ],
    }),
  });

  if (!response.ok) return { imageBytes: null, caption: "" };

  const data = await response.json();
  const imageBase64 = extractGeneratedImageBase64(data);
  if (!imageBase64) return { imageBytes: null, caption: "" };

  return {
    imageBytes: base64ToUint8Array(imageBase64),
    caption: agentBrief || buildGeneratedImageCaption(findLastInboundText(messages)),
  };
}

function buildLiaImagePrompt(contact, messages = [], agentBrief = "") {
  const agentPrompt = String(agentBrief || findLastInboundText(messages) || "").trim();
  return agentPrompt;
  const lastInbound = findLastInboundText(messages);
  const history = summarizeConversationForImage(messages);
  return `
Gere uma imagem fotorealista vertical da Lia.

Briefing escrito pelo agente/persona da Lia:
${agentBrief || "Criar uma imagem da Lia combinando com o pedido e com a conversa."}

Use as imagens anexadas como referencia visual de identidade, cabelo, rosto, estilo e clima da Lia. Preserve consistencia geral, mas gere uma imagem nova.

Pedido do cliente:
${lastInbound || "uma imagem bonita da Lia"}

Contexto recente da conversa:
${history}

Regras obrigatorias:
- Todas as pessoas na imagem sao adultas.
- Nao gerar nudez, sexo, ato sexual, genitais, transparencia explicita ou pose pornografica.
- Pode ser sensual, provocante, charmosa, com roupa bonita, lingerie discreta/coberta, vestido, look de quarto ou selfie de WhatsApp, mas sempre nao-explicita.
- Estilo realista, foto de celular, luz natural ou luz suave, pele realista, sem aparencia plastica.
- Nao incluir texto, marca d'agua, logo, bordas, interface de app ou dedos deformados.
- A imagem deve parecer uma foto que a Lia mandaria no WhatsApp, combinando com o pedido e com o clima da conversa.
`.trim();
}

function buildLiaReferenceImages(request) {
  return [
    new URL("/imagens-modelos/lia-amostra-01.png", request.url).toString(),
    new URL("/imagens-modelos/webp/modelo-01.webp", request.url).toString(),
    new URL("/imagens-modelos/webp/modelo-02.webp", request.url).toString(),
  ];
}

function summarizeConversationForImage(messages = []) {
  return messages
    .slice(-8)
    .map((message) => `${message.direction === "outbound" ? "Lia" : "Cliente"}: ${String(message.text || "").slice(0, 240)}`)
    .join("\n")
    .slice(0, 1400);
}

function findLastInboundText(messages = []) {
  return String([...messages].reverse().find((message) => message.direction === "inbound")?.text || "").slice(0, 600);
}

function extractGeneratedImageBase64(data) {
  for (const output of data.output || []) {
    if (output.type === "image_generation_call" && output.result) return output.result;
    for (const content of output.content || []) {
      if (content.type === "image_generation_call" && content.result) return content.result;
      if (content.image_base64) return content.image_base64;
    }
  }
  return "";
}

function buildGeneratedImageCaption(text) {
  const normalized = normalizeText(text || "");
  if (hasAny(normalized, ["nua", "nude", "pelada", "sem roupa", "sexo", "transando", "explicito", "explícito"])) {
    return "Fiz num clima bem gostoso, mas sem passar do limite por aqui 😘";
  }
  return "Fiz uma no clima que voce pediu 😘";
}

async function sendMetaGeneratedImageMessage(env, phone, imageBytes, caption = "") {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return { ok: false, providerMessageId: null, error: "META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID nao configurado." };
  }

  const mediaId = await uploadMetaImage(env, imageBytes);
  if (!mediaId) return { ok: false, providerMessageId: null, error: "Falha ao subir imagem gerada para a Meta." };

  const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(phone),
      type: "image",
      image: {
        id: mediaId,
        ...(caption ? { caption } : {}),
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) return { ok: false, providerMessageId: null, error: data.error?.message || "Falha no envio da imagem gerada." };
  return { ok: true, providerMessageId: data.messages?.[0]?.id || null, error: null };
}

async function uploadMetaImage(env, imageBytes) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "image/png");
  form.append("file", new Blob([imageBytes], { type: "image/png" }), "lia-gerada.png");

  const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/media`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
    body: form,
  });
  const data = await response.json();
  return response.ok ? data.id : null;
}

async function insertOutboundMessage(env, contactId, reply, result, provider) {
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

function base64ToUint8Array(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function shouldSendAudio(env, reply, messages = []) {
  if (env.LIA_AUDIO_ENABLED === "false") return false;
  const text = String(reply.text || "").trim();
  if (!text || text.length > 500) return false;
  if (reply.mediaUrl || reply.buttons?.length || reply.packs?.length) return false;
  if (hasPaymentText(text)) return false;
  const normalizedText = normalizeText(text);
  if (normalizedText.includes("maiores de 18") || normalizedText.includes("maior de 18")) return false;
  const lastInbound = [...messages].reverse().find((message) => message.direction === "inbound");
  const inboundText = normalizeText(lastInbound?.text || "");
  if (hasExplicitAudioRequest(inboundText)) return true;

  if (hasRecentAudio(messages)) return false;

  const inboundCount = messages.filter((message) => message.direction === "inbound").length;
  const intimateMoment = hasAny(normalizedText, ["baixinho", "segredo", "pertinho", "vontade", "saudade", "imagina", "arrepiada", "gostei de voce", "gostei de você"]);
  return intimateMoment && inboundCount >= 4 && inboundCount % 3 === 0;
}

function buildSampleImageUrl(env, request) {
  const imageCount = Math.max(0, Number.parseInt(env.LIA_IMAGE_COUNT || "30", 10) || 0);
  if (!imageCount) return new URL(LIA_SAMPLE_IMAGE_PATH, request.url).toString();

  const imageNumber = Math.floor(Math.random() * imageCount) + 1;
  const filename = String(imageNumber).padStart(2, "0");
  return new URL(`/imagens-modelos/webp/modelo-${filename}.webp`, request.url).toString();
}

function buildSampleVideoUrl(env, request) {
  if (env.LIA_SAMPLE_VIDEO_URL) return env.LIA_SAMPLE_VIDEO_URL;
  return new URL(LIA_SAMPLE_VIDEO_PATH, request.url).toString();
}

function hasExplicitAudioRequest(text) {
  return hasAny(text, [
    "audio",
    "áudio",
    "voz",
    "manda audio",
    "manda áudio",
    "manda um audio",
    "manda um áudio",
    "me manda audio",
    "me manda áudio",
    "quero audio",
    "quero áudio",
    "grava um audio",
    "grava um áudio",
    "fala comigo",
    "quero te ouvir",
  ]);
}

function hasRecentAudio(messages = []) {
  return messages
    .slice(-8)
    .some((message) => message.direction === "outbound" && (message.media_type === "audio" || normalizeText(message.text).includes("[audio da lia]")));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function hasPaymentText(text) {
  const value = text.toLowerCase();
  return value.includes("pix copia e cola") || value.includes("6304") || value.includes("comprovante");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}
