// Genera los iconos de la app (public/icon.svg y los PNG) con los colores del design system.
// Ejecutar desde web/:  npm run icons   (después de cambiar los tokens y hacer npm run build en design-system/)
//
// Dibujo: la cuadrícula de Mannheim (los "Quadrate"), 3 x 3 cuadrados claros sobre terracota,
// con el cuadrado del centro en oro: el sol de la hora dorada.

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tokens = JSON.parse(await readFile(join(web, '../design-system/dist/json/tokens.json'), 'utf8'))
const light = Object.fromEntries(tokens.themes.light.map((t) => [t.name, t.resolved]))
const bg = light['color.brand.mark-bg']
const square = light['color.bg.surface']
const sun = light['color.brand.accent-mark']

// scale: qué parte del lienzo ocupa la cuadrícula; rounded: esquinas del fondo redondeadas (o lleno hasta el borde).
function svg({ scale, rounded }) {
  const size = 512, cell = 72, gap = 32
  const grid = 3 * cell + 2 * gap // 280 a escala 1
  const k = (size * scale) / grid
  const start = (size - grid * k) / 2
  const squares = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = start + c * (cell + gap) * k, y = start + r * (cell + gap) * k
      const fill = r === 1 && c === 1 ? sun : square
      squares.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cell * k).toFixed(1)}" height="${(cell * k).toFixed(1)}" rx="${(4 * k).toFixed(1)}" fill="${fill}"/>`)
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}"${rounded ? ' rx="48"' : ''} fill="${bg}"/>
  ${squares.join('\n  ')}
</svg>
`
}

const standard = svg({ scale: 280 / 512, rounded: true }) // mismas proporciones que el icono anterior
const fullBleed = svg({ scale: 280 / 512, rounded: false }) // iOS redondea las esquinas por su cuenta
const maskable = svg({ scale: 208 / 512, rounded: false }) // Android recorta en círculo: la cuadrícula queda en la zona segura

await writeFile(join(web, 'public/icon.svg'), standard)
const png = (src, px, file) => sharp(Buffer.from(src)).resize(px, px).png().toFile(join(web, 'public', file))
await png(standard, 192, 'icon-192.png')
await png(standard, 512, 'icon-512.png')
await png(maskable, 512, 'icon-maskable-512.png')
await png(fullBleed, 180, 'apple-touch-icon.png')
console.log(`Iconos generados: fondo ${bg}, cuadrados ${square}, sol ${sun}`)
