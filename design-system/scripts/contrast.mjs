// Checks that the colour pairs the app actually uses are readable (WCAG 2.2).
// Reads dist/json/tokens.json, so run `npm run build` first (npm run verify does both).
//
//   4.5 : normal text            3 : large text, icons, focus rings, UI outlines
//
// A pair that is known to fall short goes in KNOWN with a reason. It is reported
// as a warning, not a failure, so the problem stays visible without blocking you.
// A NEW pair that fails, or a KNOWN pair that now passes, fails the check.

import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(await readFile(join(root, 'dist/json/tokens.json'), 'utf8'))

const PAIRS = [
  // [foreground, background, minimum ratio, where it is used]
  ['color.text.primary', 'color.bg.page', 4.5, 'body text on the page'],
  ['color.text.primary', 'color.bg.surface', 4.5, 'text in inputs and cards'],
  ['color.text.secondary', 'color.bg.page', 4.5, 'meta text, hints'],
  ['color.text.secondary', 'color.bg.surface', 4.5, 'inactive tabs, summaries'],
  ['color.text.secondary', 'color.border.default', 4.5, 'unselected segment on its track'],
  ['color.text.on-accent', 'color.accent.default', 4.5, 'primary button, selected chip'],
  ['color.accent.default', 'color.bg.page', 4.5, 'links and the "for you" reasons'],
  ['color.accent.default', 'color.bg.surface', 4.5, 'text links on cards'],
  ['color.accent.default', 'color.accent.soft', 4.5, 'summary button label'],
  ['color.feedback.danger', 'color.bg.page', 4.5, 'error text'],
  ['color.focus.ring', 'color.bg.page', 3, 'keyboard focus ring'],
  ['color.accent.default', 'color.bg.surface', 3, 'switch on, active tab icon']
]

// Pairs that fall short today. Fixing the colour is a visual change, so it needs a decision.
const KNOWN = {
  'light|color.feedback.danger|color.bg.page|4.5':
    'red #E2463B on the light page is 3.75:1. A darker red (about #C8372D) would pass; needs a design decision.'
}

const hex = (h) => {
  const m = /^#([0-9a-f]{6})/i.exec(h)
  if (!m) throw new Error(`Not a plain hex colour: ${h}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(hex(a)), lum(hex(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

let failures = 0
let warnings = 0
for (const theme of ['light', 'dark']) {
  const colours = Object.fromEntries(data.themes[theme].map((t) => [t.name, t.resolved]))
  for (const [fg, bg, min, use] of PAIRS) {
    const r = ratio(colours[fg], colours[bg])
    const key = `${theme}|${fg}|${bg}|${min}`
    const ok = r >= min
    const label = `${theme.padEnd(5)} ${fg} on ${bg}  ${r.toFixed(2)}:1 (needs ${min})  ${use}`
    if (ok && !KNOWN[key]) console.log(`  ok    ${label}`)
    else if (ok && KNOWN[key]) { console.log(`  FAIL  ${label}  → now passes, remove it from KNOWN`); failures++ }
    else if (KNOWN[key]) { console.log(`  warn  ${label}  → known: ${KNOWN[key]}`); warnings++ }
    else { console.log(`  FAIL  ${label}`); failures++ }
  }
}
console.log(`\n${failures} failure(s), ${warnings} known warning(s)`)
process.exit(failures ? 1 : 0)
