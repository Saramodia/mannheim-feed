import { timeAgo, type Ranked } from '../lib/rank'

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
