import taxonomy from '../taxonomy.json'
import type { Article, Profile } from './types'

// EL FILTRO PERSONAL
// Para cada noticia calculamos una puntuación según tu perfil:
//   +3 por cada tema que sigues, +4 por cada barrio que sigues, +5 por cada palabra clave.
// Después la combinamos con la antigüedad: una noticia de hoy pesa más que una de hace una semana.
// Las noticias con palabras bloqueadas o de fuentes ocultas no aparecen nunca.

export type Ranked = Article & { score: number; reasons: string[] }

const topicLabel = new Map(taxonomy.topics.map((t) => [t.id, t.label]))
const contains = (text: string, word: string) => text.includes(word.trim().toLowerCase())

export function rank(articles: Article[], p: Profile): Ranked[] {
  const now = Date.now()
  return articles
    .filter((a) => {
      const text = `${a.title} ${a.summary}`.toLowerCase()
      if (p.mutedSources.includes(a.source_id)) return false
      if (p.onlyMannheim && !a.is_mannheim) return false
      return !p.blocked.some((w) => w.trim() && contains(text, w))
    })
    .map((a) => {
      const text = `${a.title} ${a.summary}`.toLowerCase()
      const reasons: string[] = []
      let score = 0
      for (const t of a.topics) if (p.topics.includes(t)) { score += 3; reasons.push(topicLabel.get(t) ?? t) }
      for (const s of a.stadtteile) if (p.stadtteile.includes(s)) { score += 4; reasons.push(s) }
      for (const k of p.keywords) if (k.trim() && contains(text, k)) { score += 5; reasons.push(`“${k}”`) }
      const ageDays = (now - new Date(a.published_at).getTime()) / 864e5
      return { ...a, score: score / (1 + Math.max(ageDays, 0)), reasons }
    })
}

export function forYou(list: Ranked[]) {
  return list.filter((a) => a.reasons.length > 0).sort((a, b) => b.score - a.score)
}

export function timeAgo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}
