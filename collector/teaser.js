// EL RECORTE DEL RESUMEN
// Convierte el texto largo de un medio en un resumen corto que termina en una frase completa.
// Antes cortábamos a los 300 caracteres, aunque fuera en mitad de una frase.

const ABBREVIATIONS = /^(dr|prof|nr|st|str|ca|bzw|usw|ggf|evtl|tel|mio|mrd|vs|inkl|max|min|abb|u\.a|z\.b|d\.h|z\.t|e\.v|o\.ä|u\.v\.m|i\.d\.r|s\.o|vgl|geb|ges|jh|hrsg|zzgl)\.$/i;
const MONTHS = /^(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)/i;

// Quita lo que los medios añaden al final de un resumen: "[…]", "...", "Weiterlesen", "Der Beitrag ... erschien zuerst auf ...".
function cleanEnd(text) {
  return text
    .replace(/\s*Der Beitrag .{0,200}? erschien (zuerst|first) auf .*$/i, '')
    .replace(/\s*(Weiterlesen|Mehr lesen|Mehr dazu|Read more)\b.*$/i, '')
    .replace(/\s*(\[(…|\.\.\.)\]|…|\.{2,})\s*$/, '')
    .trim();
}

function endsSentence(token, next) {
  if (!/[.!?]["“”)»]?$/.test(token)) return false;
  if (!next || !/^["„“(»]?[A-ZÄÖÜ0-9]/.test(next)) return false;
  const bare = token.replace(/["“”)»]$/, '');
  if (ABBREVIATIONS.test(bare)) return false;
  if (/^[A-ZÄÖÜ]\.$/.test(bare)) return false;            // inicial: "J. Müller"
  if (/^\d{1,2}\.$/.test(bare) && MONTHS.test(next)) return false; // "5. November"
  if (/^\d{1,2}\.$/.test(bare) && /^\d/.test(next)) return false;   // "5. 11."
  return true;
}

export function splitSentences(text) {
  const tokens = text.split(' ');
  const sentences = [];
  let current = [];
  tokens.forEach((tok, i) => {
    current.push(tok);
    if (endsSentence(tok, tokens[i + 1])) { sentences.push(current.join(' ')); current = []; }
  });
  if (current.length) sentences.push(current.join(' '));
  return sentences;
}

export function teaser(raw, max = 300) {
  let text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const hadCut = /(\[(…|\.\.\.)\]|…|\.{2,})\s*$/.test(text) || /Der Beitrag .+ erschien (zuerst|first) auf/i.test(text);
  text = cleanEnd(text).replace(/([a-zäöüß]{2}[.!?])([A-ZÄÖÜ])/g, '$1 $2'); // "verletzt.Der" → "verletzt. Der"
  if (!text) return '';

  const sentences = splitSentences(text);
  // Si el medio ya había cortado el texto, la última frase está incompleta: la descartamos si hay otra antes.
  if (hadCut && sentences.length > 1 && !/[.!?]["“”)»]?$/.test(sentences[sentences.length - 1])) sentences.pop();

  let out = '';
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  if (out) {
    const incomplete = !/[.!?:]["“”)»]?$/.test(out);
    return incomplete && (hadCut || out.length < text.length) ? `${out}…` : out;
  }
  // La primera frase ya es demasiado larga: cortamos en el límite de una palabra.
  const cut = sentences[0].slice(0, max).replace(/[\s,;:–-]*\S*$/, '');
  return `${cut}…`;
}
