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

### Cómo se recortan los resúmenes y cómo se ve la fuente original

Cada noticia muestra un resumen de como máximo unos 300 caracteres que **termina siempre en una frase completa** (`collector/teaser.js`). El recolector no corta en mitad de una frase, respeta abreviaturas como "Dr." o fechas como "5. November", y quita los "[…]" y "Weiterlesen" que añaden algunos medios. Si una noticia ya estaba guardada, su resumen se ajusta solo en la siguiente ejecución.

Bajo cada noticia aparece **Leer en** y la web de origen (por ejemplo mannheimer-morgen.de). Pulsar la noticia abre el artículo original. En las que llegan por Google News aparece "Google News" porque el enlace pasa por allí; el periódico real se ve arriba, junto a la hora.

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

## Fase 2: alemán sencillo y etiquetado con IA

Cuando hay una clave de la API de Anthropic, el recolector pide a Claude (modelo Haiku 5.5, el más barato) dos cosas por cada noticia nueva:
- Una versión corta en **alemán sencillo** (Einfache Sprache). En la app aparece como un botón **Einfaches Deutsch** debajo de cada noticia, que la despliega.
- El **tema**, el **barrio** y si la noticia habla de **Mannheim**, con más criterio que las palabras clave. Así "Para ti" acierta más.

Límites que conviene saber:
- La versión sencilla se basa en el título y el resumen que publica cada medio, no en el artículo completo. En las noticias que llegan por Google News solo hay título.
- La IA puede equivocarse. Por eso la app siempre muestra también el original y su enlace.
- Cada ejecución procesa como máximo 60 noticias (`AI_MAX_PER_RUN`). Las noticias que ya estaban guardadas antes de activar la IA se procesan poco a poco, unas cuantas horas.
- Sin clave, o si falla la IA, el recolector funciona igual que antes, solo sin alemán sencillo.

### Paso 7. Activar la IA
1. Crear una cuenta en platform.claude.com (es distinta de la de claude.ai) y añadir crédito en **Billing**.
2. En **Settings → Limits**, poner un límite de gasto mensual (por ejemplo, 5 dólares).
3. En **API keys**, crear una clave llamada `mannheim-feed`. Copiarla sin pegarla en ningún chat ni documento.
4. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Nombre: `ANTHROPIC_API_KEY`. Valor: la clave.
5. En **Actions → Recoger noticias → Run workflow**. En el registro de la ejecución aparece una línea `🤖 IA` con las noticias procesadas, los tokens usados y el coste aproximado.

La clave solo la usa el recolector, dentro de GitHub. La app no la ve nunca.

Coste estimado: con unas 150 noticias nuevas al día, menos de 1 dólar al mes con Haiku 5.5 (0,10 $ por millón de tokens de entrada y 0,50 $ por millón de salida, según la [página de precios](https://platform.claude.com/docs/en/about-claude/pricing)). Es una estimación, no una medición: lo real se ve en el registro de cada ejecución y en la pestaña **Usage** de platform.claude.com.

### Idioma: alemán original o español

Arriba a la derecha hay un interruptor **DE / ES** que cambia todas las noticias a la vez (la app lo recuerda):
- **DE:** título y texto originales en alemán. El botón **Resumen** abre el resumen en alemán sencillo.
- **ES:** título y texto traducidos al español, con la etiqueta "Traducido con IA". El botón **Resumen** abre el resumen en español.

Las traducciones y los resúmenes los hace la tarea programada de Claude. Una noticia que aún no está traducida se ve en alemán. Todo se basa en el título y el texto que publica cada medio, no en el artículo completo, y la IA puede equivocarse: el original siempre está en "Leer en…".

### Alternativa sin API: tarea programada de Claude

En lugar de la clave de la API, puede encargarse una **tarea programada de Claude** (gasta de tu suscripción, no cobra aparte). Varias veces al día, Claude lee en Supabase las noticias sin alemán sencillo, las procesa y guarda el resultado. Lo hace con un usuario propio (`claude-enricher@example.com`) que solo puede cambiar siete campos de las noticias: no puede borrar nada, ni ver perfiles. El permiso se crea con `supabase/enricher.sql` (y `supabase/traduccion-es.sql` para las columnas de traducción). Las instrucciones de la tarea están en `claude-task/INSTRUCCIONES.md`, y la validación (temas y barrios solo de la lista, sin HTML) en `claude-task/enrich.mjs`. El recolector no cambia: sin clave de API simplemente deja esos campos vacíos.

### Ideas para más adelante
- Puntuar cada noticia según tu perfil completo, en lugar de solo etiquetarla.
- Un resumen diario con lo más relevante para ti.
