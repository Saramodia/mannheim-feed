// EL RECOLECTOR
// Qué hace, paso a paso:
//   1. Lee cada fuente de sources.js.
//   2. Limpia cada noticia (título, resumen en frases completas, fecha, imagen).
//   3. Detecta de qué temas y barrios habla (buscando palabras clave).
//   4. Elimina duplicados (la misma noticia en dos fuentes).
//   5. Si hay clave de Anthropic: la IA añade alemán sencillo y afina temas y barrios
//      (solo en noticias nuevas o que aún no lo tienen, con un tope por ejecución).
//   6. Guarda el resultado: en Supabase (la base de datos online) si hay claves,
//      o en un archivo local de prueba si no las hay.

import Parser from 'rss-parser';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { SOURCES } from './sources.js';
import { enrichArticles } from './ai.js';
import { teaser } from './teaser.js';

const taxonomy = JSON.parse(readFileSync(new URL('../web/src/taxonomy.json', import.meta.url), 'utf8'));
const KEEP_DAYS = 21; // borramos noticias de más de 3 semanas

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'MannheimFeed/1.0 (personal news reader)' },
  customFields: { item: ['source', ['media:content', 'media'], ['media:thumbnail', 'thumb']] }
});

// ---------- utilidades ----------
const decode = (s = '') =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
   .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
const stripHtml = (s = '') => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-zäöüß0-9 ]/g, '').replace(/\s+/g, ' ').trim();

// Busca palabras completas (o el inicio de palabra) para no confundir "bus" con "Business".
const hasWord = (text, word) => new RegExp(`(^|[^a-zäöüß])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(text);

function classify(text) {
  const lower = text.toLowerCase();
  const topics = taxonomy.topics.filter((t) => t.keywords.some((k) => hasWord(lower, k))).map((t) => t.id);
  const stadtteile = taxonomy.stadtteile.filter((s) => hasWord(lower, s.toLowerCase()));
  const isMannheim = hasWord(lower, 'mannheim') || stadtteile.length > 0;
  return { topics, stadtteile, isMannheim };
}

function imageOf(item) {
  if (item.enclosure?.url && /image|\.(jpe?g|png|webp)/i.test(item.enclosure.type || item.enclosure.url)) return item.enclosure.url;
  return item.media?.$?.url || item.thumb?.$?.url || null;
}

// ---------- 1 y 2: leer y limpiar ----------
async function fetchSource(src) {
  try {
    const feed = await parser.parseURL(src.url);
    return feed.items.map((item) => {
      let title = stripHtml(item.title || '');
      let label = src.label;
      // Google News añade " - Periódico" al título; lo separamos para mostrar la fuente real.
      if (src.id === 'gnews') {
        const publisher = typeof item.source === 'string' ? item.source : item.source?._;
        if (publisher && title.endsWith(` - ${publisher}`)) {
          title = title.slice(0, -(publisher.length + 3)).trim();
        } else {
          const m = title.match(/^(.*) - ([^-]+)$/);
          if (m) title = m[1].trim();
        }
        label = publisher || label;
      }
      const summary = src.id === 'gnews' ? '' : teaser(stripHtml(item.contentSnippet || item.content || item.summary || ''), 300);
      const c = classify(`${title} ${summary}`);
      const date = new Date(item.isoDate || item.pubDate || Date.now());
      return {
        id: hash(item.link || title),
        source_id: src.id,
        source_label: label,
        title,
        summary,
        link: item.link,
        image_url: imageOf(item),
        published_at: (isNaN(date) ? new Date() : date).toISOString(),
        topics: [...new Set([...(src.topics || []), ...c.topics])],
        stadtteile: c.stadtteile,
        is_mannheim: src.regional ? c.isMannheim : true
      };
    }).filter((a) => a.title && a.link);
  } catch (err) {
    console.warn(`⚠️  ${src.id}: no se pudo leer (${err.message})`);
    return [];
  }
}

// ---------- 4: quitar duplicados ----------
function dedupe(articles) {
  const byKey = new Map();
  // Preferimos la fuente original antes que Google News.
  for (const a of articles.sort((x, y) => (x.source_id === 'gnews') - (y.source_id === 'gnews'))) {
    const key = norm(a.title).slice(0, 70);
    if (!byKey.has(key) && !byKey.has(a.id)) { byKey.set(key, a); byKey.set(a.id, a); }
  }
  return [...new Set(byKey.values())];
}

// ---------- programa principal ----------
const cutoff = Date.now() - KEEP_DAYS * 864e5;
const all = (await Promise.all(SOURCES.map(fetchSource))).flat();
const articles = dedupe(all)
  .filter((a) => new Date(a.published_at).getTime() > cutoff)
  .sort((a, b) => b.published_at.localeCompare(a.published_at));

console.log(`📰 ${all.length} noticias leídas → ${articles.length} tras quitar duplicados`);

// ---------- 5: IA (opcional) ----------
const AI_KEY = (process.env.ANTHROPIC_API_KEY || '').trim();
const AI_MAX = Number(process.env.AI_MAX_PER_RUN) || 60; // tope de noticias por ejecución: limita el gasto
if (!AI_KEY) console.log('ℹ️  Sin ANTHROPIC_API_KEY: se guardan las noticias sin alemán sencillo.');

// Mezcla lo que dice la IA con la noticia. Los temas fijos de cada fuente (p. ej. Polizei → seguridad) se mantienen.
function applyAi(a, r) {
  const src = SOURCES.find((s) => s.id === a.source_id);
  return {
    ...a,
    easy_german: r.easy_german,
    topics: [...new Set([...(src?.topics || []), ...r.topics])],
    stadtteile: r.stadtteile,
    is_mannheim: src?.regional ? r.is_mannheim : true
  };
}

// Limpiamos la dirección por si se copió con una barra final o con "/rest/v1" al final.
const cleanUrl = (u = '') => u.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '').replace(/\/+$/, '');
const SUPABASE_URL = cleanUrl(process.env.SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL)) {
    console.warn('⚠️  SUPABASE_URL no tiene la forma https://xxxx.supabase.co — revisa el secret en GitHub.');
  }
  // ---------- 6a: guardar en la base de datos online ----------
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const cutoffIso = new Date(cutoff).toISOString();

  // Qué noticias ya están guardadas (así solo pagamos la IA por las nuevas).
  const { data: existing, error: readError } = await db.from('articles').select('id, summary').gte('published_at', cutoffIso).limit(5000);
  if (readError) { console.error('❌ Error leyendo la base de datos:', readError.message); process.exit(1); }
  const known = new Set(existing.map((r) => r.id));

  // Noticias ya guardadas cuyo resumen ha cambiado (p. ej. por un recorte mejor): solo se actualiza el resumen,
  // para no pisar lo que haya añadido la IA.
  const oldSummary = new Map(existing.map((r) => [r.id, r.summary || '']));
  const resumed = articles.filter((a) => known.has(a.id) && oldSummary.get(a.id) !== a.summary);
  for (let i = 0; i < resumed.length; i += 20) {
    await Promise.all(resumed.slice(i, i + 20).map((a) => db.from('articles').update({ summary: a.summary }).eq('id', a.id)));
  }
  if (resumed.length) console.log(`✂️  ${resumed.length} resúmenes existentes reajustados`);
  const fresh = articles.filter((a) => !known.has(a.id));

  // Noticias ya guardadas que todavía no tienen alemán sencillo (por ejemplo, las de antes de activar la IA).
  let backlog = [];
  if (AI_KEY) {
    const { data } = await db.from('articles').select('*').is('easy_german', null)
      .gte('published_at', cutoffIso).order('published_at', { ascending: false }).limit(AI_MAX);
    backlog = data || [];
  }

  const queue = AI_KEY ? [...fresh, ...backlog].slice(0, AI_MAX) : [];
  const enriched = queue.length ? await enrichArticles(queue, taxonomy, AI_KEY) : new Map();

  const freshRows = fresh.map((a) => (enriched.has(a.id) ? applyAi(a, enriched.get(a.id)) : a));
  const backlogRows = backlog.filter((a) => enriched.has(a.id)).map((a) => applyAi(a, enriched.get(a.id)));

  if (freshRows.length) {
    const { error } = await db.from('articles').upsert(freshRows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) { console.error('❌ Error guardando:', error.message); process.exit(1); }
  }
  if (backlogRows.length) {
    const { error } = await db.from('articles').upsert(backlogRows, { onConflict: 'id' });
    if (error) { console.error('❌ Error actualizando:', error.message); process.exit(1); }
  }
  await db.from('articles').delete().lt('published_at', cutoffIso);
  console.log(`✅ Guardado en Supabase: ${freshRows.length} nuevas, ${backlogRows.length} actualizadas con IA`);
} else {
  // ---------- 6b: modo prueba, sin base de datos ----------
  let rows = articles;
  if (AI_KEY) {
    const enriched = await enrichArticles(articles.slice(0, AI_MAX), taxonomy, AI_KEY);
    rows = articles.map((a) => (enriched.has(a.id) ? applyAi(a, enriched.get(a.id)) : a));
  }
  const out = new URL('../web/public/demo-articles.json', import.meta.url);
  writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log('💾 Sin claves de Supabase: guardado en web/public/demo-articles.json (modo prueba)');
}

process.exit(0);
