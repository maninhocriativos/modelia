import { createId } from "./http.js";

export const META_TEMPLATE_LANGUAGE = "pt_BR";

export const META_TEMPLATES = [
  {
    id: "reengagement",
    name: "modelia_continuar_atendimento_v2",
    language: META_TEMPLATE_LANGUAGE,
    category: "MARKETING",
    label: "Retomar atendimento",
    body: "Oi {{1}}, aqui e da Musas Net Manaus. Podemos continuar seu atendimento pelo WhatsApp?",
    buttons: [
      { id: "continue_yes", title: "Continuar" },
      { id: "see_options", title: "Ver opcoes" },
      { id: "stop", title: "Parar" },
    ],
  },
  {
    id: "support_followup",
    name: "modelia_retorno_suporte_v1",
    language: META_TEMPLATE_LANGUAGE,
    category: "UTILITY",
    label: "Retorno de suporte",
    body: "Oi {{1}}, estamos retornando sobre seu atendimento na Musas Net Manaus. Podemos continuar por aqui?",
    buttons: [
      { id: "continue_service", title: "Continuar" },
      { id: "talk_later", title: "Depois" },
    ],
  },
  {
    id: "options_followup",
    name: "modelia_ver_opcoes_v1",
    language: META_TEMPLATE_LANGUAGE,
    category: "MARKETING",
    label: "Ver opcoes",
    body: "Oi {{1}}, temos novas opcoes disponiveis no atendimento da Musas Net Manaus. Quer receber as informacoes por aqui?",
    buttons: [
      { id: "send_options", title: "Ver opcoes" },
      { id: "not_now", title: "Agora nao" },
      { id: "stop", title: "Parar" },
    ],
  },
  {
    id: "payment_followup",
    name: "modelia_pagamento_pendente_v1",
    language: META_TEMPLATE_LANGUAGE,
    category: "UTILITY",
    label: "Pagamento pendente",
    body: "Oi {{1}}, seu atendimento na Musas Net Manaus tem uma etapa de pagamento pendente. Quer continuar agora?",
    buttons: [
      { id: "continue_payment", title: "Continuar" },
      { id: "need_help", title: "Ajuda" },
    ],
  },
  {
    id: "consent_check",
    name: "modelia_confirmar_contato_v1",
    language: META_TEMPLATE_LANGUAGE,
    category: "UTILITY",
    label: "Confirmar contato",
    body: "Oi {{1}}, podemos enviar atualizacoes sobre seu atendimento da Musas Net Manaus neste WhatsApp?",
    buttons: [
      { id: "yes_updates", title: "Pode enviar" },
      { id: "no_updates", title: "Nao enviar" },
    ],
  },
];

export function getMetaTemplate(templateId = "reengagement") {
  return META_TEMPLATES.find((template) => template.id === templateId || template.name === templateId) || META_TEMPLATES[0];
}

export async function submitMetaTemplates(env) {
  const wabaId = await getWhatsAppBusinessAccountId(env);
  if (!env.META_ACCESS_TOKEN || !wabaId) {
    throw new Error("Configure META_WABA_ID nos secrets do Pages para criar templates na Meta.");
  }

  const results = [];
  for (const template of META_TEMPLATES) {
    results.push(await submitMetaTemplate(env, wabaId, template));
  }
  return results;
}

export async function getRemoteMetaTemplates(env) {
  const wabaId = await getWhatsAppBusinessAccountId(env);
  if (!env.META_ACCESS_TOKEN || !wabaId) {
    throw new Error("Configure META_WABA_ID nos secrets do Pages para consultar templates na Meta.");
  }

  const names = META_TEMPLATES.map((template) => template.name);
  const response = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/message_templates?fields=name,status,language,category,rejected_reason&limit=100`, {
    headers: { authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Falha ao consultar templates na Meta.");
  }

  return (data.data || []).filter((template) => names.includes(template.name));
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
      return { ok: false, providerMessageId: null, error: normalizeTemplateError(data.error?.message || "Falha no envio do template pela Meta."), template };
    }

    return { ok: true, providerMessageId: data.messages?.[0]?.id || null, error: null, template };
  } catch (error) {
    return { ok: false, providerMessageId: null, error: normalizeTemplateError(error.message || "Falha de conexao com a Meta."), template };
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

export function isMetaReengagementError(result) {
  const error = String(result?.error || result?.providerError || "");
  return error.includes("131047") || error.toLowerCase().includes("re-engagement");
}

export async function sendReactivationTemplate(env, contact, templateId = "support_followup") {
  const template = getMetaTemplate(templateId);
  const result = await sendMetaTemplateMessage(env, contact, template.id);
  await insertTemplateOutbound(env, contact, result, template);

  const activities = parseJsonArray(contact.activities);
  const activity = result.ok ? `Template automatico enviado: ${template.label}` : `Template automatico falhou: ${template.label}`;
  await env.DB.prepare("UPDATE contacts SET activities = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(JSON.stringify([activity, ...activities.filter((item) => item !== activity)]), contact.id)
    .run();

  return result;
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
        { type: "BODY", text: template.body, example: { body_text: [["Thiago"]] } },
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

function normalizeTemplateError(message) {
  const text = String(message || "");
  if (text.includes("#132001") || text.toLowerCase().includes("template name does not exist")) {
    return "Template ainda nao existe/aprovou na Meta. Clique em Submeter templates e aguarde a aprovacao antes de enviar.";
  }
  return text;
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
