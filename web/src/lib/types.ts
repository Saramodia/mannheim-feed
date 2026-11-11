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
  easy_german?: string | null // versión en alemán sencillo (la escribe la IA)
}

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
