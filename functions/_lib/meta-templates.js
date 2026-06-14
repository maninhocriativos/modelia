import { createId } from "./http.js";

export const META_TEMPLATE_LANGUAGE = "pt_BR";

export const META_TEMPLATES = [
  {
    id: "reengagement",
    name: "modelia_retomar_atendimento_v1",
    language: META_TEMPLATE_LANGUAGE,
    category: "MARKETING",
    label: "Retomar atendimento",
    body: "Oi {{1}}, posso continuar seu atendimento por aqui?",
    buttons: [
      { id: "continue_yes", title: "Continuar" },
      { id: "see_options", title: "Ver opcoes" },
      { id: "not_now", title: "Agora nao" },
    ],
  },
];

export function getMetaTemplate(templateId = "reengagement") {
  return META_TEMPLATES.find((template) => template.id === templateId || template.name === templateId) || META_TEMPLATES[0];
}

export async function submitMetaTemplates(env) {
  const wabaId = await getWhatsAppBusinessAccountId(env);
  if (!env.META_ACCESS_TOKEN || !wabaId) {
    throw new Error("META_ACCESS_TOKEN ou META_WABA_ID nao configurado.");
  }

  const results = [];
  for (const template of META_TEMPLATES) {
    results.push(await submitMetaTemplate(env, wabaId, template));
  }
  return results;
}

export async function sendMetaTemplateMessage(env, contact, templateId = "reengagement") {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return { ok: false, providerMessageId: null, error: "META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID nao configurado." };
  }

  const to = normalizePhone(contact.phone);
  if (!to) {
    return { ok: false, providerMessageId: null, error: "Telefone invalido para envio." };
  }

  const template = getMetaTemplate(templateId);
  const payload = buildTemplatePayload(to, contact, template);

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, providerMessageId: null, error: data.error?.message || "Falha no envio do template pela Meta." };
    }

    return { ok: true, providerMessageId: data.messages?.[0]?.id || null, error: null, template };
  } catch (error) {
    return { ok: false, providerMessageId: null, error: error.message || "Falha de conexao com a Meta.", template };
  }
}

export async function insertTemplateOutbound(env, contact, result, template) {
  const text = `${template.label}: ${template.body.replace("{{1}}", firstName(contact.name) || "tudo bem")}`;
  await env.DB.prepare(
    `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
     VALUES (?, ?, 'outbound', ?, NULL, NULL, 'meta-template', ?, ?, ?)`
  )
    .bind(
      createId("msg"),
      contact.id,
      text,
      result.providerMessageId,
      result.ok ? "sent" : "failed",
      result.error || ""
    )
    .run();
}

async function submitMetaTemplate(env, wabaId, template) {
  const response = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: template.name,
      language: template.language,
      category: template.category,
      components: [
        { type: "BODY", text: template.body },
        {
          type: "BUTTONS",
          buttons: template.buttons.map((button) => ({
            type: "QUICK_REPLY",
            text: button.title,
          })),
        },
      ],
    }),
  });
  const data = await response.json().catch(() => ({}));

  return {
    template: template.name,
    ok: response.ok,
    status: data.status || null,
    id: data.id || null,
    error: response.ok ? null : data.error?.message || "Falha ao submeter template.",
  };
}

async function getWhatsAppBusinessAccountId(env) {
  if (env.META_WABA_ID) return env.META_WABA_ID;
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) return "";

  const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}?fields=whatsapp_business_account`, {
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
  });
  const data = await response.json().catch(() => ({}));

  return response.ok ? data.whatsapp_business_account?.id || "" : "";
}

function buildTemplatePayload(to, contact, template) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: firstName(contact.name) || "tudo bem" }],
        },
        ...template.buttons.map((button, index) => ({
          type: "button",
          sub_type: "quick_reply",
          index: String(index),
          parameters: [{ type: "payload", payload: button.id }],
        })),
      ],
    },
  };
}

function firstName(value) {
  return String(value || "").trim().split(/\s+/)[0] || "";
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}
