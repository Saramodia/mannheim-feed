// AYUDANTE PARA LA TAREA PROGRAMADA DE CLAUDE (fase 2 sin API)
// Dos pasos:
//   node claude-task/enrich.mjs fetch [N]        → guarda las N noticias pendientes en pending.json
//   node claude-task/enrich.mjs save results.json → valida lo que escribió Claude y lo guarda en Supabase
// Variables: SUPABASE_URL, SUPABASE_ANON_KEY (clave pública), ENRICHER_EMAIL, ENRICHER_PASSWORD
// La validación es la misma que en collector/ai.js: temas y barrios solo de la lista, sin HTML, longitud limitada.

import { readFileSync, writeFileSync } from 'node:fs';
import { SOURCES } from '../collector/sources.js';

const taxonomy = JSON.parse(readFileSync(new URL('../web/src/taxonomy.json', import.meta.url), 'utf8'));
const URL_ = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
if (!URL_ || !KEY || !process.env.ENRICHER_EMAIL || !process.env.ENRICHER_PASSWORD) {
  console.error('Faltan variables: SUPABASE_URL, SUPABASE_ANON_KEY, ENRICHER_EMAIL, ENRICHER_PASSWORD'); process.exit(1);
}

async function login() {
  const res = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.ENRICHER_EMAIL, password: process.env.ENRICHER_PASSWORD })
  });
  const json = await res.json();
  if (!res.ok) { console.error('No se pudo iniciar sesión:', json.error_description || json.msg || res.status); process.exit(1); }
  return json.access_token;
}
const headers = (token, extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${token}`, 'content-type': 'application/json', ...extra });

const [cmd, arg] = process.argv.slice(2);
const token = await login();

if (cmd === 'fetch') {
  const limit = Math.min(Number(arg) || 40, 80);
  const res = await fetch(`${URL_}/rest/v1/articles?select=id,source_id,source_label,title,summary,easy_german&or=(easy_german.is.null,summary_es.is.null)&order=published_at.desc&limit=${limit}`, { headers: headers(token) });
  if (!res.ok) { console.error('Error leyendo noticias:', res.status, await res.text()); process.exit(1); }
  const items = await res.json();
  const out = {
    topics: taxonomy.topics.map((t) => ({ id: t.id, label: t.label, examples: t.keywords.slice(0, 8) })),
    stadtteile: taxonomy.stadtteile,
    items: items.map((a) => ({ id: a.id, source: a.source_label, title: a.title, summary: a.summary || '', ...(a.easy_german ? { easy_german: a.easy_german } : {}) }))
  };
  writeFileSync('pending.json', JSON.stringify(out, null, 1));
  console.log(`📥 ${items.length} noticias pendientes guardadas en pending.json`);
} else if (cmd === 'save') {
  const results = JSON.parse(readFileSync(arg, 'utf8'));
  if (!Array.isArray(results)) { console.error('results.json debe ser una lista'); process.exit(1); }
  const validTopics = new Set(taxonomy.topics.map((t) => t.id));
  const validBarrios = new Set(taxonomy.stadtteile);
  const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);

  let ok = 0, skipped = 0;
  for (const r of results) {
    const easy = clean(r?.easy_german);
    const es = clean(r?.summary_es);
    if (!r?.id || (!easy && !es)) { skipped++; continue; }
    const rowRes = await fetch(`${URL_}/rest/v1/articles?select=source_id&id=eq.${encodeURIComponent(r.id)}`, { headers: headers(token) });
    const row = (await rowRes.json())[0];
    if (!row) { skipped++; continue; }
    const source = SOURCES.find((s) => s.id === row.source_id);
    const aiTopics = (Array.isArray(r.topics) ? r.topics : []).filter((t) => validTopics.has(t));
    // Si la noticia ya tenía alemán sencillo, solo llega el resumen en español.
    const body = easy
      ? {
          easy_german: easy,
          ...(es ? { summary_es: es } : {}),
          topics: [...new Set([...(source?.topics || []), ...aiTopics])].slice(0, 4),
          stadtteile: [...new Set((Array.isArray(r.stadtteile) ? r.stadtteile : []).filter((s) => validBarrios.has(s)))],
          is_mannheim: source?.regional ? r.is_mannheim !== false : true
        }
      : { summary_es: es };
    const res = await fetch(`${URL_}/rest/v1/articles?id=eq.${encodeURIComponent(r.id)}`, {
      method: 'PATCH', headers: headers(token, { Prefer: 'return=representation' }), body: JSON.stringify(body)
    });
    const updated = res.ok ? await res.json() : [];
    if (updated.length === 1) ok++; else { skipped++; if (!res.ok) console.warn(`⚠️ ${r.id}: ${res.status} ${await res.text()}`); }
  }
  console.log(`💾 ${ok} noticias guardadas, ${skipped} omitidas`);
} else {
  console.error('Uso: node claude-task/enrich.mjs fetch [N]  |  node claude-task/enrich.mjs save results.json'); process.exit(1);
}
