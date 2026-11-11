-- BASE DE DATOS DE MANNHEIM FEED
-- Copia todo este archivo en Supabase → SQL Editor → "Run". Solo hace falta una vez.

-- 1) Tabla de noticias (la rellena el recolector cada 30 minutos)
create table if not exists public.articles (
  id            text primary key,
  source_id     text not null,
  source_label  text not null,
  title         text not null,
  summary       text default '',
  link          text not null,
  image_url     text,
  published_at  timestamptz not null,
  topics        text[] default '{}',
  stadtteile    text[] default '{}',
  is_mannheim   boolean default true,
  easy_german   text,            -- fase 2: resumen en alemán sencillo hecho por IA
  created_at    timestamptz default now()
);
create index if not exists articles_published_idx on public.articles (published_at desc);

-- 2) Tabla de perfiles: una fila por persona, con sus preferencias
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  data        jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- 3) Reglas de seguridad (Row Level Security)
--    Noticias: cualquier usuario conectado puede leerlas; nadie puede escribirlas desde la app.
--    Perfiles: cada persona solo ve y cambia el suyo.
alter table public.articles enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "leer noticias" on public.articles;
create policy "leer noticias" on public.articles
  for select to authenticated using (true);

drop policy if exists "ver mi perfil" on public.profiles;
create policy "ver mi perfil" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "crear mi perfil" on public.profiles;
create policy "crear mi perfil" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "cambiar mi perfil" on public.profiles;
create policy "cambiar mi perfil" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
