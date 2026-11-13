import { timeAgo, type Ranked } from '../lib/rank'
import type { Lang } from '../lib/types'

// Dirección de la fuente original, sin "www.". Las noticias de Google News pasan por su propio enlace.
function sourceHost(link: string) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    return host === 'news.google.com' ? 'Google News' : host
  } catch {
    return ''
  }
}

export function ArticleItem({ a, lang, showReasons }: { a: Ranked; lang: Lang; showReasons: boolean }) {
  // En español usamos la traducción si ya existe; si no, el original en alemán.
  const esTitle = lang === 'es' && !!a.title_es
  const esText = lang === 'es' && !!a.teaser_es
  const esSummary = lang === 'es' && !!a.summary_es
  const summary = esText ? a.teaser_es : a.summary

  return (
    <li className="article">
      <a href={a.link} target="_blank" rel="noopener noreferrer" className="article-link">
        <div className="article-body">
          <p className="article-meta">
            <span className="article-source">{a.source_label}</span>
            <time dateTime={a.published_at}>{timeAgo(a.published_at)}</time>
            {esTitle && <span className="article-ai">Traducido con IA</span>}
          </p>
          <h2 className="article-title" lang={esTitle ? 'es' : 'de'}>{esTitle ? a.title_es : a.title}</h2>
          {summary && <p className="article-summary" lang={esText ? 'es' : 'de'}>{summary}</p>}
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
            <span className="easy-badge">Creado con IA · {esSummary ? 'español' : 'alemán sencillo'}</span>
            <p lang={esSummary ? 'es' : 'de'}>{esSummary ? a.summary_es : a.easy_german}</p>
          </div>
        </details>
      )}
    </li>
  )
}
