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

export function ArticleItem({ a, showReasons }: { a: Ranked; showReasons: boolean }) {
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
          <summary>Einfaches Deutsch</summary>
          <p lang="de">{a.easy_german}</p>
        </details>
      )}
    </li>
  )
}
