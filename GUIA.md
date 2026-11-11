# Mannheim Feed — guía paso a paso

Tu lector personal de noticias de Mannheim. Funciona en el móvil y en la laptop, y te enseña primero lo que encaja con tu perfil.

## Cómo funciona (la idea general)

```
Fuentes (RSS)  ──►  Recolector  ──►  Base de datos  ──►  App (PWA)
MM, Stadt,          cada 30 min       Supabase            móvil + laptop
Polizei, …          en GitHub         noticias + perfil
```

1. **Fuentes.** Los medios publican un RSS: una lista automática de sus últimas noticias. Leemos los RSS en lugar de "copiar" sus webs porque es la vía oficial, estable y legal.
2. **Recolector** (`collector/`). Un programa pequeño que lee las fuentes, limpia las noticias, detecta temas y barrios por palabras clave y quita duplicados. GitHub lo ejecuta gratis cada 30 minutos, así que no necesitas tener nada encendido.
3. **Base de datos** (Supabase). Guarda las noticias y tu perfil. Como el perfil está online, es el mismo en el móvil y en la laptop.
4. **App** (`web/`). Una PWA: una web que se instala en el móvil como una app. Un solo código sirve para todos los dispositivos, sin App Store.

### Fuentes que usa ahora

| Fuente | Qué aporta |
|---|---|
| Mannheimer Morgen (Mannheim, Lo más importante, Adler, SV Waldhof) | El periódico local |
| Stadt Mannheim (noticias, notas de prensa, eventos) | Información oficial y agenda de la ciudad |
| Polizei Mannheim (Presseportal) | Avisos de policía de la zona |
| Mannheim24 | Noticias locales y de servicio |
| Google News "Mannheim" | Todo lo demás: RNZ, Rheinpfalz, SWR, etc. |

SWR no permite lectores automáticos en su RSS, así que sus noticias llegan a través de Google News. Para añadir una fuente nueva, edita `collector/sources.js`.

### Cómo decide qué es "Para ti"

Cada noticia suma puntos: +3 por cada tema que sigues, +4 por cada barrio, +5 por cada palabra clave tuya. Luego pesa más lo reciente. Las palabras bloqueadas y las fuentes desactivadas no aparecen nunca. La regla está en `web/src/lib/rank.ts`, y los temas con sus palabras clave en `web/src/taxonomy.json`.

---

## Publicarla en internet (una sola vez, unos 30 minutos)

### Paso 1. Crear la cuenta de GitHub
GitHub es donde vive el código y donde se ejecuta el recolector.
1. Entra en github.com y pulsa **Sign up**. Usa tu email personal (es un proyecto tuyo, no de la empresa).
2. Crea un repositorio nuevo llamado `mannheim-feed`. Puede ser **Private**. No marques ninguna casilla de "Initialize".
3. En claude.ai, ve a **Settings → Connectors** y conecta GitHub. Así Claude podrá subir el código por ti.

### Paso 2. Crear la base de datos en Supabase
1. Entra en supabase.com, pulsa **Start your project** e inicia sesión con tu cuenta de GitHub.
2. **New project**: nombre `mannheim-feed`, región **Frankfurt (eu-central-1)**, plan **Free**. Guarda la contraseña que te pide en un lugar seguro.
3. Cuando esté listo, abre **SQL Editor**, pega todo el contenido de `supabase/schema.sql` y pulsa **Run**. Esto crea las tablas y las reglas de seguridad.
4. Ve a **Project Settings → API** y apunta tres valores: *Project URL*, la clave *anon public* y la clave *service_role* (esta última es secreta: no la compartas nunca).

### Paso 3. Darle las claves a GitHub
En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**. Crea tres:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_ANON_KEY` | la clave anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave service_role |

Los "secrets" son una caja fuerte: GitHub los usa al ejecutar el recolector, pero nadie puede verlos.

### Paso 4. Activar la publicación
1. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
2. Pestaña **Actions** → "Recoger noticias" → **Run workflow** (para llenar la base de datos por primera vez).
3. Tu app quedará en `https://TU-USUARIO.github.io/mannheim-feed/`.

### Paso 5. Ajustar el inicio de sesión
En Supabase: **Authentication → URL Configuration**. En *Site URL* y *Redirect URLs* pon la dirección del paso 4. Así el enlace del email te devuelve a tu app.

Opcional: cuando ya hayas entrado una vez, en **Authentication → Sign In / Providers** desactiva *Allow new users to sign up* para que nadie más pueda crearse una cuenta.

### Paso 6. Instalarla en el móvil
- **iPhone (Safari):** abre la dirección → botón compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** abre la dirección → menú ⋮ → *Instalar aplicación*.

---

## Probarla en tu ordenador (opcional)
Necesitas Node.js (nodejs.org, versión LTS).
```bash
cd collector && npm install && node collect.js   # descarga noticias de prueba
cd ../web && npm install && npm run dev           # abre http://localhost:5173
```
Sin el archivo `web/.env`, la app funciona en **modo prueba**: noticias del archivo local y perfil guardado solo en ese navegador.

## Próximos pasos (fase 2)
- **Alemán sencillo:** la IA reescribe cada noticia en *einfaches Deutsch* (la columna `easy_german` ya está preparada).
- **Filtro con IA:** que Claude puntúe cada noticia según tu perfil, más allá de las palabras clave.
Ambas necesitan una clave de la API de Anthropic, con un coste de pocos céntimos al mes.
