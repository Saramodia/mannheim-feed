import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// VITE_BASE es la "carpeta" donde vive la app en internet.
// En GitHub Pages será /mannheim-feed/ (el nombre del repositorio); en local, /.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    // Esto convierte la web en una PWA: se puede "instalar" en el móvil como una app.
    process.env.VITE_NO_PWA ? null : VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mannheim Feed',
        short_name: 'MA Feed',
        description: 'Noticias de Mannheim filtradas según tus intereses',
        lang: 'es',
        theme_color: '#1E4BD2',
        background_color: '#F4F6FA',
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
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // Las noticias se piden siempre frescas a internet; si no hay conexión, se usa la última copia.
        runtimeCaching: [
          { urlPattern: /demo-articles\.json$/, handler: 'NetworkFirst' },
          { urlPattern: /supabase\.co\/rest/, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ]
})
