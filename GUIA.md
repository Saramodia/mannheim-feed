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

## Dónde está todo

| Qué | Dónde |
|---|---|
| La app | https://saramodia.github.io/mannheim-feed/ |
| El código | https://github.com/Saramodia/mannheim-feed |
| La base de datos | Proyecto `mannheim-feed` en supabase.com (región Frankfurt) |

Para entrar en la app: tu email y tu contraseña. El mismo usuario sirve en el móvil y en la laptop.

---

## Cómo se publicó (una sola vez)

Estos pasos ya están hechos. Quedan aquí para entender cómo está montada la app, o por si algún día hay que repetirlo.

### Paso 1. Cuenta y repositorio de GitHub
GitHub guarda el código, ejecuta el recolector y publica la app.
1. Crear la cuenta en github.com con el email personal (es un proyecto personal, no de la empresa).
2. Crear el repositorio `mannheim-feed` y hacerlo **público**. El plan gratuito de GitHub solo publica webs (GitHub Pages) desde repositorios públicos. No hay riesgo: las claves no están en el código, sino en los Secrets (paso 3).
3. Conectar GitHub en claude.ai (**Settings → Connectors**) e instalar la app de Claude en GitHub con acceso solo a `mannheim-feed` (https://github.com/settings/installations → Claude → Configure → *Repository access*). Sin este segundo permiso, Claude puede leer el repositorio pero no subir código.

### Paso 2. Base de datos en Supabase
1. Entrar en supabase.com con la cuenta de GitHub.
2. **New project**: nombre `mannheim-feed`, región **Frankfurt** (la más cercana a Mannheim, y los datos se quedan en la UE), plan **Free**. Guardar la contraseña de administración en un lugar seguro.
3. **SQL Editor** → pegar todo `supabase/schema.sql` → **Run**. Crea las tablas `articles` y `profiles` y las reglas de seguridad. Supabase avisa de que la consulta es "destructiva" porque contiene `drop policy if exists`: es normal, solo rehace las reglas de seguridad y no borra datos.
4. Apuntar tres valores:
   - **Project URL**: en **Project Settings → Data API**, o en el botón **Connect**. Tiene la forma `https://xxxx.supabase.co`.
   - **Publishable key** (empieza por `sb_publishable_`): en **Project Settings → API Keys**. Es la clave que usa la app para leer. Puede ser visible.
   - **Secret key** (empieza por `sb_secret_`): en el mismo sitio. La usa el recolector para escribir noticias. Es secreta: no la compartas nunca.

   Antes Supabase llamaba a estas dos claves *anon* y *service_role*. Las antiguas siguen en la pestaña *Legacy* y también funcionan.

### Paso 3. Darle las claves a GitHub
En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**. Se crean tres:

| Nombre en GitHub | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_ANON_KEY` | la publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | la secret key |

Los nombres en GitHub se quedan así aunque Supabase haya cambiado los suyos, porque son los que usa el código. Los Secrets son una caja fuerte: GitHub los usa al ejecutar las acciones, pero nadie puede verlos, ni siquiera Claude.

### Paso 4. Activar la publicación
1. **Settings → Pages → Source: GitHub Actions**.
2. Pestaña **Actions** → **Recoger noticias** → **Run workflow**. Llena la base de datos por primera vez. Después se repite solo cada 30 minutos.
3. Pestaña **Actions** → **Publicar la app** → **Run workflow**. Construye la app con las claves y la publica. Después se repite sola cada vez que cambia el código.

GitHub encuentra estas dos acciones porque están descritas en la carpeta `.github/workflows/` del repositorio.

### Paso 5. Crear tu usuario
La app usa **email y contraseña**. Primero se probó entrar con un enlace por email, pero no funcionaba en la app instalada en el móvil: el enlace abría el navegador, que guarda la sesión aparte. Tampoco se pudo enviar un código por email, porque el plan gratuito de Supabase no deja cambiar el texto de los emails.

1. En Supabase: **Authentication → Users → Add user → Create new user**. Escribir el email y la contraseña, y dejar marcado **Auto Confirm User**. Así no hace falta ningún email de confirmación. El servicio de email gratuito de Supabase solo envía unos pocos emails por hora, y al pasarse sale el error "email rate limit exceeded".
2. **Authentication → Sign In / Providers** → desactivar **Allow new users to sign up**. Así nadie más puede crearse una cuenta en tu app.

### Paso 6. Instalarla en el móvil
- **iPhone (Safari):** abre la dirección de la app → botón compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** abre la dirección de la app → menú ⋮ → *Instalar aplicación*.

Cuando la app cambia, el móvil carga la versión nueva sola. Si no la ves, cierra la app del todo y vuelve a abrirla.

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
