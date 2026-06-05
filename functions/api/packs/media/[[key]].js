export async function onRequestGet({ env, params }) {
  const key = Array.isArray(params.key) ? params.key.join("/") : params.key;
  if (!key || !env.PACKS_BUCKET) return new Response("Not found", { status: 404 });

  const object = await env.PACKS_BUCKET.get(decodeURIComponent(key));
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
