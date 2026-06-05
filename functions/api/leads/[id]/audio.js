import { createId, json, readJson } from "../../../_lib/http.js";
import { sendMetaAudioMessage } from "../../../_lib/lia-agent.js";

export async function onRequestPost({ env, params, request }) {
  const body = await readJson(request);
  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(params.id).first();

  if (!contact) {
    return json({ error: "Contato nao encontrado." }, { status: 404 });
  }

  const text =
    String(body.text || "").trim() ||
    `Oi, ${firstName(contact.name)}. Passei aqui rapidinho pra te mandar uma previa em audio do clima do pack.`;

  const result = await sendMetaAudioMessage(env, contact.phone, text);

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, ?, 'audio', 'meta-audio', ?, ?)`
    ).bind(
      createId("msg"),
      contact.id,
      "[audio da Lia]",
      null,
      result.providerMessageId,
      result.ok ? "sent" : "failed"
    ),
    env.DB.prepare("UPDATE contacts SET updated_at = datetime('now') WHERE id = ?").bind(contact.id),
  ]);

  return json({ ok: result.ok, status: result.ok ? "sent" : "failed", providerMessageId: result.providerMessageId, error: result.error || null });
}

function firstName(value) {
  return String(value || "").trim().split(/\s+/)[0] || "";
}
