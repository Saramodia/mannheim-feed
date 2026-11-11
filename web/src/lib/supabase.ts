import { createClient } from '@supabase/supabase-js'

// Supabase es la base de datos online donde viven las noticias y tu perfil.
// Las dos claves se ponen en un archivo .env (ver GUIA.md). Esta clave "anon" es pública
// por diseño: la seguridad la dan las reglas de la base de datos (Row Level Security).
// Limpiamos la dirección por si se copió con una barra final o con "/rest/v1" al final.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
  .replace(/\/+$/, '').replace(/\/rest\/v1$/, '').replace(/\/+$/, '')
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

// Si no hay claves, la app funciona en "modo prueba": noticias de un archivo local
// y perfil guardado solo en este navegador.
export const supabase = url && key ? createClient(url, key) : null
export const isDemo = supabase === null
