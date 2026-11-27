import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
// Brand colours come from the design system (design-system/tokens), not from hand-typed hex codes.
import { themes } from '../design-system/dist/ts/tokens.ts'

const themeColor = themes.light.accent.default // browser / status bar colour
const backgroundColor = themes.light.bg.page // splash screen colour

// Fills %THEME_COLOR% in index.html.
const designTokensHtml = (): Plugin => ({
  name: 'design-tokens-html',
  transformIndexHtml: (html) => html.replaceAll('%THEME_COLOR%', themeColor)
})

// VITE_BASE es la "carpeta" donde vive la app en internet.
// En GitHub Pages será /mannheim-feed/ (el nombre del repositorio); en local, /.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  // The dev server may read the design-system folder, which lives next to web/.
  server: { fs: { allow: ['..'] } },
  plugins: [
    react(),
    designTokensHtml(),
    // Esto convierte la web en una PWA: se puede "instalar" en el móvil como una app.
    process.env.VITE_NO_PWA ? null : VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mannheim Feed',
        short_name: 'MA Feed',
        description: 'Noticias de Mannheim filtradas según tus intereses',
        lang: 'es',
        theme_color: themeColor,
        background_color: backgroundColor,
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // woff2 = la fuente Inconsolata, para que la app instalada la tenga también sin conexión
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Las noticias se piden siempre frescas a internet; si no hay conexión, se usa la última copia.
        runtimeCaching: [
          { urlPattern: /demo-articles\.json$/, handler: 'NetworkFirst' },
          { urlPattern: /supabase\.co\/rest/, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ]
})
