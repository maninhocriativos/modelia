import { buildPixMessage, createAsaasPixPayment } from "../../_lib/asaas.js";
import { createId, json, readJson } from "../../_lib/http.js";
import { sendMetaMessage } from "../../_lib/lia-agent.js";
import { parseJson } from "../../_lib/leads.js";

export async function onRequestPost({ env, request }) {
  const body = await readJson(request);
  const contactId = String(body.contactId || body.leadId || "").trim();
  const packId = String(body.packId || "pack_30_fotos").trim();

  if (!contactId) {
    return json({ error: "Informe contactId." }, { status: 400 });
  }

  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(contactId).first();
  if (!contact) {
    return json({ error: "Contato nao encontrado." }, { status: 404 });
  }

  const payment = await createAsaasPixPayment(env, request, contact, packId);
  const reply = buildPixMessage(payment);
  const result = await sendMetaMessage(env, contact.phone, reply);
  const activities = parseJson(contact.activities, []);
  const nextActivities = [
    `Aguardando Pix ${payment.packTitle}`,
    ...activities.filter((item) => !String(item).startsWith("Aguardando Pix")),
  ];

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status)
       VALUES (?, ?, 'outbound', ?, ?, ?, 'asaas-pix', ?, ?)`
    ).bind(createId("msg"), contact.id, reply.text, reply.mediaUrl, reply.mediaType, result.providerMessageId, result.ok ? "sent" : "failed"),
    env.DB.prepare("UPDATE contacts SET stage = 'proposta', activities = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(nextActivities), contact.id),
  ]);

  return json({ payment, messageStatus: result.ok ? "sent" : "failed", providerMessageId: result.providerMessageId, error: result.error || null }, { status: 201 });
}
