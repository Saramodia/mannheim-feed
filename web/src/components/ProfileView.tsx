import { useMemo, useState } from 'react'
import taxonomy from '../taxonomy.json'
import type { Article, Profile } from '../lib/types'
import { TagInput } from './TagInput'

type Props = {
  profile: Profile
  onChange: (p: Profile) => void
  articles: Article[]
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  email?: string
  onSignOut?: () => void
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

const SOURCE_NAMES: Record<string, string> = {
  mm: 'Mannheimer Morgen · Mannheim',
  'mm-top': 'Mannheimer Morgen · Lo más importante',
  'mm-adler': 'Mannheimer Morgen · Adler Mannheim',
  'mm-waldhof': 'Mannheimer Morgen · SV Waldhof',
  'stadt-news': 'Stadt Mannheim · Noticias',
  'stadt-presse': 'Stadt Mannheim · Notas de prensa',
  'stadt-events': 'Stadt Mannheim · Eventos',
  polizei: 'Polizei Mannheim',
  mannheim24: 'Mannheim24',
  gnews: 'Google News (varios medios)'
}

export function ProfileView({ profile, onChange, articles, saveState, email, onSignOut }: Props) {
  const [allBarrios, setAllBarrios] = useState(false)
  const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch })

  const sources = useMemo(() => {
    const ids = [...new Set(articles.map((a) => a.source_id))]
    return ids.sort((a, b) => (SOURCE_NAMES[a] ?? a).localeCompare(SOURCE_NAMES[b] ?? b))
  }, [articles])

  const barrios = allBarrios
    ? taxonomy.stadtteile
    : taxonomy.stadtteile.filter((s, i) => i < 10 || profile.stadtteile.includes(s))

  return (
    <section className="profile" aria-labelledby="profile-title">
      <header className="profile-head">
        <h1 id="profile-title">Tu perfil</h1>
        <p className="save-state" role="status">
          {saveState === 'saving' && 'Guardando…'}
          {saveState === 'saved' && 'Cambios guardados'}
          {saveState === 'error' && 'No se pudo guardar. Revisa tu conexión.'}
        </p>
      </header>

      <fieldset className="group">
        <legend>Temas que sigues</legend>
        <p className="hint">Las noticias de estos temas aparecen en “Para ti”.</p>
        <div className="chips">
          {taxonomy.topics.map((t) => (
            <button key={t.id} className="chip" aria-pressed={profile.topics.includes(t.id)}
              onClick={() => set({ topics: toggle(profile.topics, t.id) })}>
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="group">
        <legend>Barrios</legend>
        <p className="hint">Prioriza lo que pasa cerca de casa o del trabajo.</p>
        <div className="chips">
          {barrios.map((s) => (
            <button key={s} className="chip" aria-pressed={profile.stadtteile.includes(s)}
              onClick={() => set({ stadtteile: toggle(profile.stadtteile, s) })}>{s}</button>
          ))}
        </div>
        <button className="link-btn" onClick={() => setAllBarrios(!allBarrios)}>
          {allBarrios ? 'Ver menos barrios' : `Ver los ${taxonomy.stadtteile.length} barrios`}
        </button>
      </fieldset>

      <fieldset className="group">
        <legend><label htmlFor="kw">Palabras que quieres ver</label></legend>
        <p className="hint">Por ejemplo: Luisenpark, Wochenmarkt, Nationaltheater. Mejor en alemán, como en las noticias.</p>
        <TagInput id="kw" values={profile.keywords} onChange={(keywords) => set({ keywords })} placeholder="Escribe una palabra" />
      </fieldset>

      <fieldset className="group">
        <legend><label htmlFor="bl">Palabras que no quieres ver</label></legend>
        <p className="hint">Las noticias con estas palabras desaparecen de todo el feed.</p>
        <TagInput id="bl" values={profile.blocked} onChange={(blocked) => set({ blocked })} placeholder="Escribe una palabra" />
      </fieldset>

      <fieldset className="group">
        <legend>Fuentes</legend>
        <label className="switch-row">
          <span>
            <span className="switch-label">Solo noticias de Mannheim</span>
            <span className="hint">Oculta lo que pasa en Heidelberg, Ludwigshafen u otras ciudades.</span>
          </span>
          <input type="checkbox" role="switch" className="switch" checked={profile.onlyMannheim}
            onChange={(e) => set({ onlyMannheim: e.target.checked })} />
        </label>
        <ul className="source-list">
          {sources.map((id) => (
            <li key={id}>
              <label className="check-row">
                <input type="checkbox" checked={!profile.mutedSources.includes(id)}
                  onChange={() => set({ mutedSources: toggle(profile.mutedSources, id) })} />
                {SOURCE_NAMES[id] ?? id}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {email && onSignOut && (
        <div className="group account">
          <p>Conectada como <strong>{email}</strong></p>
          <button className="btn" onClick={onSignOut}>Cerrar sesión</button>
        </div>
      )}
    </section>
  )
}
