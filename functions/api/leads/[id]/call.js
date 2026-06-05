import { createId, json } from "../../../_lib/http.js";
import { sendMetaMessage } from "../../../_lib/lia-agent.js";
import { parseJson } from "../../../_lib/leads.js";

export async function onRequestPost({ env, params }) {
  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(params.id).first();

  if (!contact) {
    return json({ error: "Contato nao encontrado." }, { status: 404 });
  }

  const reply = {
    text: `Posso te ligar pelo WhatsApp agora, ${firstName(contact.name)}? Se preferir, continuo por mensagem.`,
    buttons: [
      { id: "call_yes", title: "Pode ligar" },
      { id: "call_no", title: "Agora nao" },
    ],
  };

  const result = await sendMetaMessage(env, contact.phone, reply);
  const activities = parseJson(contact.activities, []);
  const nextActivities = ["Aguardando permissao para ligacao no WhatsApp", ...activities.filter((item) => item !== "Aguardando permissao para ligacao no WhatsApp")];

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, NULL, NULL, 'meta-call-request', ?, ?)`
    ).bind(createId("msg"), contact.id, reply.text, result.providerMessageId, result.ok ? "sent" : "failed"),
    env.DB.prepare("UPDATE contacts SET activities = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(nextActivities), contact.id),
  ]);

  return json({
    ok: result.ok,
    mode: "permission_request",
    status: result.ok ? "sent" : "failed",
    providerMessageId: result.providerMessageId,
    error: result.error || null,
    note: "Chamada real via Calling API exige habilitacao WebRTC/SIP da Meta; este endpoint solicita permissao pelo WhatsApp e registra a acao.",
  });
}

function firstName(value) {
  return String(value || "").trim().split(/\s+/)[0] || "";
}
