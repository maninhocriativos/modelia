import { json } from "../../_lib/http.js";
import { getRemoteMetaTemplates, META_TEMPLATES, submitMetaTemplates } from "../../_lib/meta-templates.js";

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  if (url.searchParams.get("remote") === "1") {
    try {
      return json({ templates: await getRemoteMetaTemplates(env) });
    } catch (error) {
      return json({ error: error.message || "Nao foi possivel consultar templates." }, { status: 400 });
    }
  }

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
