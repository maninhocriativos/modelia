export async function onRequestGet({ env, params }) {
  const payment = await env.DB.prepare("SELECT pix_qr_image FROM payments WHERE id = ?").bind(params.id).first();
  const encoded = payment?.pix_qr_image || "";

  if (!encoded) {
    return new Response("QR Code nao encontrado.", { status: 404 });
  }

  const base64 = encoded.includes(",") ? encoded.split(",").pop() : encoded;
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return new Response(bytes, {
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store",
    },
  });
}
