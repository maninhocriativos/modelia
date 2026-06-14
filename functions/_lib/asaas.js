import { createId } from "./http.js";
import { PACKS } from "./lia-agent.js";

const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";
const ASAAS_SANDBOX_URL = "https://api-sandbox.asaas.com/v3";

export function findPack(packId) {
  return PACKS.find((pack) => pack.id === packId) || PACKS[0];
}

export function hasAsaasConfig(env) {
  return Boolean(env.ASAAS_API_KEY);
}

export async function createAsaasPayment(env, request, contact, packId) {
  if (!hasAsaasConfig(env)) {
    throw new Error("ASAAS_API_KEY nao configurada.");
  }

  const pack = findPack(packId);
  const paymentId = createId("pay");
  const externalReference = paymentId;
  const customer = await createAsaasCustomer(env, contact);
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const payment = await asaasFetch(env, "/payments", {
    method: "POST",
    body: {
      customer: customer.id,
      billingType: "UNDEFINED",
      value: Number(pack.amount || 0),
      dueDate,
      description: `Modelia - ${pack.title}`,
      externalReference,
    },
  });
  const qrCode = await getAsaasPixQrCode(env, payment.id);
  const qrUrl = new URL(`/api/payments/${encodeURIComponent(paymentId)}/qr`, request.url).toString();
  const qrImage = qrCode.encodedImage || "";

  await env.DB.prepare(
    `INSERT INTO payments (
      id, contact_id, pack_id, pack_title, amount, provider_payment_id, provider_customer_id,
      status, pix_payload, pix_qr_image, invoice_url, external_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
  )
    .bind(
      paymentId,
      contact.id,
      pack.id,
      pack.title,
      Number(pack.amount || 0),
      payment.id,
      customer.id,
      qrCode.payload || "",
      qrImage,
      payment.invoiceUrl || payment.bankSlipUrl || "",
      externalReference
    )
    .run();

  return {
    id: paymentId,
    providerPaymentId: payment.id,
    contactId: contact.id,
    packId: pack.id,
    packTitle: pack.title,
    amount: Number(pack.amount || 0),
    status: "pending",
    billingType: "UNDEFINED",
    pixPayload: qrCode.payload || "",
    qrImageUrl: qrImage ? qrUrl : "",
    invoiceUrl: payment.invoiceUrl || payment.bankSlipUrl || "",
  };
}

export async function createAsaasPixPayment(env, request, contact, packId) {
  return createAsaasPayment(env, request, contact, packId);
}

export function buildAsaasPaymentMessage(payment) {
  const amount = formatCurrency(payment.amount);
  const paymentLink = payment.invoiceUrl ? `\n\nLink para pagar com cartao ou Pix:\n${payment.invoiceUrl}` : "";
  const pix = payment.pixPayload ? `\n\nPix copia e cola:\n${payment.pixPayload}` : "";

  return {
    text: `Fechei pra voce: ${payment.packTitle} por ${amount}.\n\nPode pagar por Pix ou cartao.${paymentLink}${pix}\n\nAssim que o pagamento cair, eu confirmo aqui e libero o pack completo automaticamente.`,
    mediaUrl: payment.qrImageUrl || null,
    mediaType: payment.qrImageUrl ? "image" : null,
  };
}

export const buildPixMessage = buildAsaasPaymentMessage;

export async function markAsaasPaymentFromWebhook(env, event) {
  const payment = event?.payment || {};
  const providerPaymentId = payment.id || "";
  if (!providerPaymentId) return null;

  const row = await env.DB.prepare("SELECT * FROM payments WHERE provider_payment_id = ? LIMIT 1").bind(providerPaymentId).first();
  if (!row) return null;

  const status = mapAsaasStatus(payment.status);
  const paidAt = status === "paid" ? payment.paymentDate || payment.clientPaymentDate || new Date().toISOString() : row.paid_at;

  await env.DB.prepare(
    `UPDATE payments
     SET status = ?, raw_event = ?, paid_at = COALESCE(?, paid_at), updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(status, JSON.stringify(event || {}), paidAt || null, row.id)
    .run();

  return { ...row, status, paid_at: paidAt };
}

function mapAsaasStatus(status) {
  const value = String(status || "").toUpperCase();
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(value)) return "paid";
  if (["OVERDUE"].includes(value)) return "overdue";
  if (["REFUNDED", "CHARGEBACK_REFUND"].includes(value)) return "refunded";
  if (["CANCELED"].includes(value)) return "canceled";
  return "pending";
}

async function createAsaasCustomer(env, contact) {
  return asaasFetch(env, "/customers", {
    method: "POST",
    body: {
      name: contact.name || "Cliente Modelia",
      mobilePhone: onlyDigits(contact.phone || ""),
      externalReference: contact.id,
    },
  });
}

async function asaasFetch(env, path, options = {}) {
  const baseUrl = getAsaasBaseUrl(env);
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      "content-type": "application/json",
      access_token: env.ASAAS_API_KEY,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.errors?.[0]?.description || data?.message || `Asaas ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function getAsaasPixQrCode(env, paymentId) {
  try {
    return await asaasFetch(env, `/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
  } catch (error) {
    return { payload: "", encodedImage: "" };
  }
}

function getAsaasBaseUrl(env) {
  if (env.ASAAS_BASE_URL) return env.ASAAS_BASE_URL.replace(/\/$/, "");
  return String(env.ASAAS_ENV || "").toLowerCase() === "sandbox" ? ASAAS_SANDBOX_URL : ASAAS_PRODUCTION_URL;
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}
