import { createId, json } from "../../_lib/http.js";

export async function onRequestGet({ env }) {
  const packs = await env.DB.prepare("SELECT * FROM media_packs ORDER BY unixepoch(created_at) DESC, created_at DESC").all();
  const items = await env.DB.prepare("SELECT * FROM media_items ORDER BY sort_order ASC, unixepoch(created_at) ASC").all();
  const itemsByPack = new Map();

  for (const item of items.results || []) {
    const list = itemsByPack.get(item.pack_id) || [];
    list.push(mapItem(item));
    itemsByPack.set(item.pack_id, list);
  }

  return json({
    packs: (packs.results || []).map((pack) => ({
      id: pack.id,
      title: pack.title,
      model: pack.model,
      description: pack.description,
      price: pack.price,
      cover: pack.cover_url,
      media: itemsByPack.get(pack.id) || [],
    })),
  });
}

export async function onRequestPost({ env, request }) {
  if (!env.PACKS_BUCKET) {
    return json({ error: "R2 PACKS_BUCKET nao configurado." }, { status: 500 });
  }

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const model = String(form.get("model") || "").trim();
  const price = String(form.get("price") || "R$ 49").trim();
  const files = form.getAll("files").filter((file) => file && file.size);

  if (!title || !model || !files.length) {
    return json({ error: "Informe nome, modelo e arquivos." }, { status: 400 });
  }

  const packId = createId("pack");
  const media = [];

  for (const [index, file] of files.entries()) {
    const type = file.type?.startsWith("video/") ? "video" : "image";
    const safeName = String(file.name || `${type}-${index + 1}`).replace(/[^\w.\-]+/g, "-").slice(-120);
    const key = `${packId}/${Date.now()}-${index}-${safeName}`;
    await env.PACKS_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg") },
    });

    media.push({
      id: createId("media"),
      packId,
      title: `${type === "video" ? "Video" : "Foto"} ${String(index + 1).padStart(2, "0")}`,
      type,
      url: `/api/packs/media/${encodeURIComponent(key)}`,
      sortOrder: index,
    });
  }

  const cover = media.find((item) => item.type === "image")?.url || media[0]?.url || "";
  const description = `${media.filter((item) => item.type === "image").length} fotos e ${media.filter((item) => item.type === "video").length} videos`;

  const statements = [
    env.DB.prepare(
      `INSERT INTO media_packs (id, title, model, description, price, cover_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(packId, title, model, description, price, cover),
    ...media.map((item) =>
      env.DB.prepare(
        `INSERT INTO media_items (id, pack_id, title, media_type, url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(item.id, item.packId, item.title, item.type, item.url, item.sortOrder)
    ),
  ];

  await env.DB.batch(statements);

  return json({
    id: packId,
    title,
    model,
    description,
    price,
    cover,
    media: media.map((item) => ({ id: item.id, title: item.title, path: item.url, type: item.type })),
  }, { status: 201 });
}

function mapItem(item) {
  return {
    id: item.id,
    title: item.title,
    path: item.url,
    type: item.media_type,
  };
}
