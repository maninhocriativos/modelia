import { createId, json, readJson } from "../../_lib/http.js";
import { mapContact } from "../../_lib/leads.js";

export async function onRequestGet({ env }) {
  const contacts = await env.DB.prepare("SELECT * FROM contacts ORDER BY updated_at DESC").all();
  const messages = await env.DB.prepare("SELECT * FROM messages ORDER BY unixepoch(created_at) ASC, created_at ASC").all();
  const messagesByContact = new Map();

  for (const message of messages.results || []) {
    const list = messagesByContact.get(message.contact_id) || [];
    list.push(message);
    messagesByContact.set(message.contact_id, list);
  }

  return json({
    leads: (contacts.results || []).map((contact) => mapContact(contact, messagesByContact.get(contact.id) || [])),
  });
}

export async function onRequestPost({ env, request }) {
  const body = await readJson(request);
  const id = createId("lead");
  const messageId = createId("msg");
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const activities = ["Fazer primeiro contato", "Confirmar consentimento para receber fotos"];

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO contacts (id, name, phone, interest, source, stage, tags, activities)
       VALUES (?, ?, ?, ?, ?, 'novo', ?, ?)`
    ).bind(
      id,
      String(body.name || "").trim(),
      String(body.phone || "").trim(),
      String(body.interest || "").trim(),
      String(body.source || "WhatsApp").trim(),
      JSON.stringify(tags),
      JSON.stringify(activities)
    ),
    env.DB.prepare(
      `INSERT INTO messages (id, contact_id, direction, text, provider)
       VALUES (?, ?, 'inbound', 'Novo contato cadastrado no CRM.', 'system')`
    ).bind(messageId, id),
  ]);

  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(id).first();
  const messages = await env.DB.prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY unixepoch(created_at) ASC, created_at ASC").bind(id).all();

  return json(mapContact(contact, messages.results || []), { status: 201 });
}
