import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inconsolata (pesos 200-900, anchos 50-200%) va dentro de la app: funciona sin conexión y no se pide a Google.
import '@fontsource-variable/inconsolata/standard.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// ACTUALIZACIONES EN EL MÓVIL
// La app instalada se queda en memoria y el móvil casi nunca busca versiones nuevas por su cuenta.
// Así que: (1) cada vez que vuelves a la app, le preguntamos a la web si hay una versión nueva;
// (2) cuando la versión nueva está lista, recargamos la pantalla una sola vez.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const hadController = !!navigator.serviceWorker.controller // en la primera visita no hay nada que recargar
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return
    reloaded = true
    window.location.reload()
  })
  const checkForUpdate = () => { navigator.serviceWorker.getRegistration().then((r) => r?.update()).catch(() => {}) }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate() })
  checkForUpdate()
}
