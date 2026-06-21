export function mapContact(row, messages = []) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    cpfCnpj: row.cpf_cnpj || "",
    interest: row.interest,
    source: row.source,
    stage: row.stage,
    tags: parseJson(row.tags, []),
    notes: row.notes || "",
    activities: parseJson(row.activities, []),
    messages: messages.map(mapMessage),
  };
}

export function mapMessage(row) {
  return {
    id: row.id,
    from: row.direction === "outbound" ? "agent" : "client",
    text: row.text || "",
    mediaUrl: row.media_url || "",
    mediaType: row.media_type || null,
    provider: row.provider,
    status: row.status,
    providerError: row.provider_error || "",
    at: formatTime(row.created_at),
  };
}

export function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Manaus",
  }).format(date);
}
