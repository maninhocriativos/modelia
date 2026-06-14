import { json, readJson } from "../../../_lib/http.js";
import { getMetaTemplate, insertTemplateOutbound, sendMetaTemplateMessage } from "../../../_lib/meta-templates.js";
import { parseJson } from "../../../_lib/leads.js";

export async function onRequestPost({ env, params, request }) {
  const body = await readJson(request);
  const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(params.id).first();

  if (!contact) {
    return json({ error: "Contato nao encontrado." }, { status: 404 });
  }

  const template = getMetaTemplate(body.templateId || "reengagement");
  const result = await sendMetaTemplateMessage(env, contact, template.id);
  await insertTemplateOutbound(env, contact, result, template);

  const activities = parseJson(contact.activities, []);
  const activity = result.ok ? `Template enviado: ${template.label}` : `Template falhou: ${template.label}`;
  await env.DB.prepare("UPDATE contacts SET activities = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(JSON.stringify([activity, ...activities.filter((item) => item !== activity)]), contact.id)
    .run();

  return json({
    ok: result.ok,
    status: result.ok ? "sent" : "failed",
    providerMessageId: result.providerMessageId,
    error: result.error || null,
    template: template.name,
  }, { status: result.ok ? 201 : 400 });
}
