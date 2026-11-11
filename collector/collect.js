// EL RECOLECTOR
// Qué hace, paso a paso:
//   1. Lee cada fuente de sources.js.
//   2. Limpia cada noticia (título, resumen, fecha, imagen).
//   3. Detecta de qué temas y barrios habla (buscando palabras clave).
//   4. Elimina duplicados (la misma noticia en dos fuentes).
//   5. Guarda el resultado: en Supabase (la base de datos online) si hay claves,
//      o en un archivo local de prueba si no las hay.

import Parser from 'rss-parser';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { SOURCES } from './sources.js';

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
const truncate = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
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
      const summary = src.id === 'gnews' ? '' : truncate(stripHtml(item.contentSnippet || item.content || item.summary || ''), 300);
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

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  // ---------- 5a: guardar en la base de datos online ----------
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { error } = await db.from('articles').upsert(articles, { onConflict: 'id', ignoreDuplicates: true });
  if (error) { console.error('❌ Error guardando:', error.message); process.exit(1); }
  await db.from('articles').delete().lt('published_at', new Date(cutoff).toISOString());
  console.log('✅ Guardado en Supabase');
} else {
  // ---------- 5b: modo prueba, sin base de datos ----------
  const out = new URL('../web/public/demo-articles.json', import.meta.url);
  writeFileSync(out, JSON.stringify(articles, null, 1));
  console.log('💾 Sin claves de Supabase: guardado en web/public/demo-articles.json (modo prueba)');
}

process.exit(0);
