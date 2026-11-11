import { supabase } from './supabase'
import { EMPTY_PROFILE, type Article, type Profile } from './types'

const LOCAL_PROFILE = 'mannheim-feed:profile'

// ---------- Noticias ----------
export async function loadArticles(): Promise<Article[]> {
  if (!supabase) {
    const res = await fetch(`${import.meta.env.BASE_URL}demo-articles.json`)
    if (!res.ok) throw new Error('No se encontraron noticias de prueba. Ejecuta el recolector.')
    return res.json()
  }
  const since = new Date(Date.now() - 21 * 864e5).toISOString()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(600)
  if (error) throw new Error(error.message)
  return data as Article[]
}

// ---------- Perfil ----------
// Con Supabase el perfil se guarda online (y se sincroniza entre móvil y laptop).
// En modo prueba se guarda solo en este navegador.
export async function loadProfile(userId?: string): Promise<Profile> {
  if (supabase && userId) {
    const { data } = await supabase.from('profiles').select('data').eq('id', userId).maybeSingle()
    return { ...EMPTY_PROFILE, ...(data?.data ?? {}) }
  }
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE)
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE
  } catch {
    return EMPTY_PROFILE
  }
}

export async function saveProfile(profile: Profile, userId?: string): Promise<void> {
  if (supabase && userId) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, data: profile, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
    return
  }
  try {
    localStorage.setItem(LOCAL_PROFILE, JSON.stringify(profile))
  } catch {
    /* el navegador no permite guardar: el perfil durará hasta cerrar la pestaña */
  }
}
