import { useMemo, useState } from 'react'
import taxonomy from '../taxonomy.json'
import { forYou, rank } from '../lib/rank'
import type { Article, Profile } from '../lib/types'
import { ArticleItem } from './ArticleItem'

type Props = {
  articles: Article[]
  profile: Profile
  loading: boolean
  error: string | null
  onRetry: () => void
  onOpenProfile: () => void
}

const PAGE = 30

export function Feed({ articles, profile, loading, error, onRetry, onOpenProfile }: Props) {
  const [view, setView] = useState<'foryou' | 'all'>('foryou')
  const [topic, setTopic] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  const ranked = useMemo(() => rank(articles, profile), [articles, profile])
  const list = useMemo(() => {
    const base = view === 'foryou' ? forYou(ranked) : ranked
    return topic ? base.filter((a) => a.topics.includes(topic)) : base
  }, [ranked, view, topic])

  const hasInterests = profile.topics.length + profile.stadtteile.length + profile.keywords.length > 0
  const switchView = (v: typeof view) => { setView(v); setShown(PAGE) }

  return (
    <section aria-label="Noticias">
      <div className="segmented" role="tablist" aria-label="Tipo de feed">
        <button role="tab" aria-selected={view === 'foryou'} onClick={() => switchView('foryou')}>Para ti</button>
        <button role="tab" aria-selected={view === 'all'} onClick={() => switchView('all')}>Todo</button>
      </div>

      <div className="chips chips-scroll" aria-label="Filtrar por tema">
        <button className="chip" aria-pressed={topic === null} onClick={() => setTopic(null)}>Todos los temas</button>
        {taxonomy.topics.map((t) => (
          <button key={t.id} className="chip" aria-pressed={topic === t.id} onClick={() => setTopic(topic === t.id ? null : t.id)}>
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="state">Cargando noticias…</p>}

      {error && (
        <div className="state">
          <p>No se pudieron cargar las noticias: {error}</p>
          <button className="btn" onClick={onRetry}>Reintentar</button>
        </div>
      )}

      {!loading && !error && view === 'foryou' && !hasInterests && (
        <div className="state">
          <p className="state-title">Tu feed aún no sabe qué te interesa</p>
          <p>Elige algunos temas o barrios en tu perfil y aquí aparecerán las noticias que encajan contigo.</p>
          <button className="btn btn-primary" onClick={onOpenProfile}>Configurar mi perfil</button>
        </div>
      )}

      {!loading && !error && (hasInterests || view === 'all') && list.length === 0 && (
        <div className="state">
          <p>No hay noticias que encajen con este filtro.</p>
          {topic && <button className="btn" onClick={() => setTopic(null)}>Ver todos los temas</button>}
        </div>
      )}

      <ul className="articles">
        {list.slice(0, shown).map((a) => <ArticleItem key={a.id} a={a} showReasons={view === 'foryou'} />)}
      </ul>

      {list.length > shown && (
        <button className="btn btn-block" onClick={() => setShown(shown + PAGE)}>
          Mostrar más ({list.length - shown})
        </button>
      )}
    </section>
  )
}
