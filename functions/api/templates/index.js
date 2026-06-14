import { json } from "../../_lib/http.js";
import { META_TEMPLATES, submitMetaTemplates } from "../../_lib/meta-templates.js";

export async function onRequestGet() {
  return json({ templates: META_TEMPLATES });
}

export async function onRequestPost({ env }) {
  try {
    const results = await submitMetaTemplates(env);
    return json({ ok: results.every((result) => result.ok), results });
  } catch (error) {
    return json({ ok: false, error: error.message || "Nao foi possivel submeter templates." }, { status: 400 });
  }
}
