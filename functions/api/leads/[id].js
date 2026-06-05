import { json, readJson } from "../../_lib/http.js";

const allowedStages = new Set(["novo", "contato", "proposta", "ganho"]);

export async function onRequestPatch({ env, params, request }) {
  const body = await readJson(request);
  const updates = [];
  const values = [];

  if (typeof body.stage === "string" && allowedStages.has(body.stage)) {
    updates.push("stage = ?");
    values.push(body.stage);
  }

  if (typeof body.notes === "string") {
    updates.push("notes = ?");
    values.push(body.notes);
  }

  if (Array.isArray(body.activities)) {
    updates.push("activities = ?");
    values.push(JSON.stringify(body.activities));
  }

  if (!updates.length) {
    return json({ error: "Nada para atualizar." }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(params.id);

  await env.DB.prepare(`UPDATE contacts SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}
