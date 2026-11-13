import { useState } from 'react'
import { timeAgo, type Ranked } from '../lib/rank'

// Dirección de la fuente original, sin "www.". Las noticias de Google News pasan por su propio enlace.
function sourceHost(link: string) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    return host === 'news.google.com' ? 'Google News' : host
  } catch {
    return ''
  }
}

// El idioma elegido en el resumen se recuerda para las demás noticias (solo en este navegador).
const LANG_KEY = 'mf-summary-lang'
function savedLang(): 'de' | 'es' {
  try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'de' } catch { return 'de' }
}

export function ArticleItem({ a, showReasons }: { a: Ranked; showReasons: boolean }) {
  const [lang, setLang] = useState<'de' | 'es'>(savedLang)
  const chooseLang = (l: 'de' | 'es') => {
    setLang(l)
    try { localStorage.setItem(LANG_KEY, l) } catch { /* sin almacenamiento: no pasa nada */ }
  }
  const showEs = lang === 'es' && !!a.summary_es

  return (
    <li className="article">
      <a href={a.link} target="_blank" rel="noopener noreferrer" className="article-link">
        <div className="article-body">
          <p className="article-meta">
            <span className="article-source">{a.source_label}</span>
            <time dateTime={a.published_at}>{timeAgo(a.published_at)}</time>
          </p>
          <h2 className="article-title">{a.title}</h2>
          {a.summary && <p className="article-summary">{a.summary}</p>}
          <p className="article-origin">
            Leer en <strong>{sourceHost(a.link) || a.source_label}</strong> ↗
          </p>
          {showReasons && a.reasons.length > 0 && (
            <p className="article-reasons">Porque sigues {a.reasons.join(', ')}</p>
          )}
        </div>
        {a.image_url && (
          <img className="article-img" src={a.image_url} alt="" loading="lazy" referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
      </a>
      {a.easy_german && (
        // Va fuera del enlace para que abrirlo no abra la noticia.
        <details className="easy">
          <summary>Resumen</summary>
          <div className="easy-box">
            <div className="easy-head">
              <span className="easy-badge">Creado con IA</span>
              {a.summary_es && (
                <div className="easy-lang" role="group" aria-label="Idioma del resumen">
                  <button type="button" aria-pressed={!showEs} onClick={() => chooseLang('de')}>Einfaches Deutsch</button>
                  <button type="button" aria-pressed={showEs} onClick={() => chooseLang('es')}>Español</button>
                </div>
              )}
            </div>
            <p lang={showEs ? 'es' : 'de'}>{showEs ? a.summary_es : a.easy_german}</p>
          </div>
        </details>
      )}
    </li>
  )
}
