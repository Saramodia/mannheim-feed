-- TRADUCCIÓN AL ESPAÑOL DE TÍTULO Y TEXTO (13 nov 2026)
-- Copia este archivo en Supabase → SQL Editor → "Run". Solo hace falta una vez.
-- 1. Añade dos columnas vacías: el título y el texto de cada noticia en español.
-- 2. Deja que el usuario de la tarea de Claude rellene también esas dos columnas (y nada más).

alter table public.articles add column if not exists title_es text;
alter table public.articles add column if not exists teaser_es text;

revoke update on public.articles from authenticated;
grant update (easy_german, summary_es, title_es, teaser_es, topics, stadtteile, is_mannheim) on public.articles to authenticated;
