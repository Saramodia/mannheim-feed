-- USUARIO "ENRICHER" (para la tarea programada de Claude, fase 2 sin API)
-- Copia este archivo en Supabase → SQL Editor → "Run". Solo hace falta una vez.
-- Después crea el usuario claude-enricher@example.com en Authentication → Users (Auto Confirm User).
--
-- Qué hace: permite que ESE usuario, y nadie más, cambie cinco columnas de las noticias
-- (alemán sencillo, resumen en español, temas, barrios, si habla de Mannheim). No puede borrar noticias,
-- ni cambiar títulos o enlaces, ni ver perfiles de nadie.

alter table public.articles add column if not exists summary_es text;

revoke update on public.articles from authenticated;
grant update (easy_german, summary_es, topics, stadtteile, is_mannheim) on public.articles to authenticated;

drop policy if exists "enricher etiqueta noticias" on public.articles;
create policy "enricher etiqueta noticias" on public.articles
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'claude-enricher@example.com')
  with check ((auth.jwt() ->> 'email') = 'claude-enricher@example.com');
