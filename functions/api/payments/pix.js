import { buildAsaasPaymentMessage, createAsaasPayment } from "../../_lib/asaas.js";
import { createId, json, readJson } from "../../_lib/http.js";
import { sendMetaMessage } from "../../_lib/lia-agent.js";
import { parseJson } from "../../_lib/leads.js";
import { isMetaReengagementError, sendReactivationTemplate } from "../../_lib/meta-templates.js";

export async function onRequestPost({ env, request }) {
  try {
    const body = await readJson(request);
    const contactId = String(body.contactId || body.leadId || "").trim();
    const packId = String(body.packId || "pack_30_fotos").trim();
    let silent = body.silent === true || body.source === "landing";

    if (!contactId) {
      return json({ error: "Informe contactId." }, { status: 400 });
    }

    const contact = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?").bind(contactId).first();
    if (!contact) {
      return json({ error: "Contato nao encontrado." }, { status: 404 });
    }
    const contactTags = parseJson(contact.tags, []);
    silent = silent || contact.source === "Página de vendas" || contactTags.includes("landing-page");

    const payment = await createAsaasPayment(env, request, contact, packId);
    const reply = buildAsaasPaymentMessage(payment);
    const result = silent
      ? { ok: true, providerMessageId: null, error: null }
      : await sendMetaMessage(env, contact.phone, reply);
    const activities = parseJson(contact.activities, []);
    const nextActivities = [
      `Aguardando pagamento ${payment.packTitle}`,
      ...activities.filter((item) => !String(item).startsWith("Aguardando Pix") && !String(item).startsWith("Aguardando pagamento")),
    ];

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO messages (id, contact_id, direction, text, media_url, media_type, provider, provider_message_id, status, provider_error)
         VALUES (?, ?, 'outbound', ?, ?, ?, 'asaas-payment', ?, ?, ?)`
      ).bind(createId("msg"), contact.id, reply.text, reply.mediaUrl, reply.mediaType, result.providerMessageId, result.ok ? "sent" : "failed", result.error || ""),
      env.DB.prepare("UPDATE contacts SET stage = 'proposta', activities = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(nextActivities), contact.id),
    ]);
    if (!silent && isMetaReengagementError(result)) {
      await sendReactivationTemplate(env, contact, "payment_followup");
    }

    return json({
      payment,
      messageStatus: silent ? "skipped" : result.ok ? "sent" : "failed",
      providerMessageId: result.providerMessageId,
      error: result.error || null,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Erro desconhecido");
    console.error("Falha ao gerar pagamento Asaas", { message, stack: error?.stack });
    const status = message.includes("ASAAS_API_KEY") ? 503 : 502;
    return json({ error: `Falha ao gerar pagamento no Asaas: ${message}` }, { status });
  }
}
