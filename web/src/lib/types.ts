// "Tipos": describen la forma de los datos, para que el editor nos avise si nos equivocamos.

export type Article = {
  id: string
  source_id: string
  source_label: string
  title: string
  summary: string
  link: string
  image_url: string | null
  published_at: string
  topics: string[]
  stadtteile: string[]
  is_mannheim: boolean
  easy_german?: string | null // resumen en alemán sencillo (lo escribe la IA)
  summary_es?: string | null  // el mismo resumen en español (lo escribe la IA)
  title_es?: string | null    // título traducido al español (IA)
  teaser_es?: string | null   // texto traducido al español (IA)
}

// Idioma en el que se leen las noticias: original en alemán, o traducido al español.
export type Lang = 'de' | 'es'

export type Profile = {
  topics: string[]        // temas que sigues
  stadtteile: string[]    // barrios que sigues
  keywords: string[]      // palabras que quieres ver (p. ej. "Luisenpark")
  blocked: string[]       // palabras que NO quieres ver
  mutedSources: string[]  // fuentes ocultas
  onlyMannheim: boolean   // ocultar noticias de otras ciudades
}

export const EMPTY_PROFILE: Profile = {
  topics: [],
  stadtteile: [],
  keywords: [],
  blocked: [],
  mutedSources: [],
  onlyMannheim: true
}
