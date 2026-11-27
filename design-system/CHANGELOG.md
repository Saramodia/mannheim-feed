# Changelog

All notable changes to the Mannheim Feed design system. Newest first.
Versioning rules: `docs/versioning.md`.

## 2.0.0 · 2026-11-27

New identity: a daylight and golden-hour palette, the Inconsolata typeface and simple single-colour icons. Includes everything from 1.1.0 (readability, softness), which was never released on its own.

### Breaking (renamed or removed tokens)
- `font.family.sans` → **`font.family.mono`** (CSS `--mf-font-family-mono`).
- `radius.pill` and `radius.circle` removed (no round shapes in v2).
- Core colours renamed to the new palette: `color.neutral.*` → `color.sand.*`, `color.blue.*` → `color.sun.*` / `color.ember.*`, `color.red.*` → `color.rose.*`, `color.black-alpha.*` → `color.dusk-alpha.*`. Semantic colour names (`color.accent.default`, `color.text.primary`…) are unchanged.

### Changed: colour
- **No blue.** Light mode is *daylight*: light cream page `#FDFBF6`, near-white cards `#FFFDF8`, espresso text `#33291F`, terracotta primary `#9A4B2A`. Dark mode is *golden hour*: dusk `#262019`, cards `#2F2820`, candle-light text `#ECE1CF`, amber primary `#E3AE6A`.
- **Lighter backgrounds** in both modes for readability: daylight body text rises to 13.7:1, still under the 14:1 glare ceiling.
- Errors use evening rose (`#9C2C4F` / `#E992A5`), a different hue from the terracotta and amber.
- Shadows use translucent dusk brown instead of black.
- PWA status bar: terracotta `#9A4B2A`; splash background: cream.

### Changed: shape
- **Subtle corners only.** Radius scale is now 2 / 3 / 4 / 6 / 8px (was up to 20px). The `radius.pill` and `radius.circle` tokens are **removed**: chips, tabs, the language switch, badges and the toggle switch now have 3–4px corners. The app icon's corners are flatter too.

### Changed: type
- **Inconsolata** (variable, weights 200–900, widths 50–200%), bundled with the app via `@fontsource-variable/inconsolata` and cached for offline use. No more Google Fonts request.
- New token `font.size-adjust` = 0.5 (CSS `font-size-adjust`): Inconsolata's lowercase is short (0.46), so this enlarges it about 9% to read like a sans-serif at the same size.
- Hints and summaries avoid single stranded words at the end (`text-wrap: pretty`).

### Added: icons
- All icons from Pictogrammers (`@mdi/js`), filled, one colour (`currentColor`). They replace the two hand-drawn tab icons, the "↗" and "×" characters, and the 12 colourful topic emojis.
- Tokens `color.icon.default`, `color.icon.active`, `size.icon-xs` (16px). Icons are included in the contrast check (3:1).
- New app icon generated from the tokens (`npm run icons` in `web/`): cream Quadrate grid on terracotta, gold sun in the centre.

### Checks
- 32 colour pairs pass in both themes. Body text: 13.7:1 (daylight) and 12.5:1 (golden hour), inside the 7–14 soft range.

## 1.1.0 · 2026-11-27

A softer, calmer look with better readability. No token was renamed or removed, so nothing in the app code had to change: the new values flow in through the same `--mf-…` names.

### Changed: softer colours
- **Light mode:** warm paper page (`#F5F5F3`) and soft-white cards (`#FBFBFA`) instead of cool grey and pure white. Body text is soft charcoal (`#2A3040`) instead of near-black.
- **Accent:** a calm UI blue (`#3D5CA8`, light) and (`#8DA6E0`, dark) instead of the bright brand blue. Colour saturation drops from 75% to 47% in light mode and from 100% to 57% in dark mode.
- **Dark mode:** slightly lighter background and dimmer text (`#D6DAE3`), which reduces glare and halation on phones at night.
- **Brand blue `#1E4BD2` and coral `#FF5A4E` are kept for the logo and app icon only.** The PWA status-bar colour follows the new UI blue.
- **Shadows** are lighter and more diffuse (6% and 20% instead of 8% and 25%).

### Changed: readability
- **Text sizes:** nothing below 13px now. Caption 12 → 13px, small 12.8 → 14px, summaries 14.4 → 15px, titles 17.6 → 18px, headline 25.6 → 26px.
- **Line spacing:** running text 1.5 → 1.6, titles 1.3 → 1.35.
- **Article titles** are slightly wider (font width 92% → 96%).
- **More space between news items** (16px → 20px above and below).

### Changed: smoothness
- **Rounder corners:** buttons and inputs 10 → 12px, cards 12 → 14px, large 16 → 20px.
- **Motion:** transitions 150 → 200ms with a gentle ease-out curve.

### Fixed
- Light-mode error red (`#B2453D`) now passes WCAG AA: 5.05:1 on the page (was 3.75:1).

### Checks
- The contrast check is stricter: body text must reach AAA (7:1) **and** stay at or below 14:1, so it can never become harsh again. All 28 pairs pass in both themes (light body text: 12.1:1, dark: 12.4:1).

## 1.0.0 · 2026-11-19

First version. The values come from what the app already used, so the look is unchanged except for the type-size merges below.

### Added
- Tokens in W3C DTCG format, in three layers: core, semantic (light + dark) and component.
- Build to CSS custom properties (`--mf-…`), TypeScript constants and flat JSON, plus `dist/preview.html`.
- Colour contrast check for the colour pairs the app uses (`npm run check`).
- GitHub workflows: pull-request check and tagged releases.

### Changed in the app
- `web/src/index.css` now imports the tokens and uses `var(--mf-…)` instead of its own colour and size values.
- `vite.config.ts` and `index.html` take the PWA `theme_color` and `background_color` from the tokens.
- **Type sizes were merged into six steps.** Twelve slightly different sizes became caption (12px), small (12.8px), body-sm (14.4px), body (16px), title (17.6px) and headline (25.6px). The largest change is the hint text under group titles in the profile, 14.1px to 12.8px (-1.3px). The brand name in the top bar and the group titles grow by 0.8px (16.8px to 17.6px). Everything else moves by less than 0.8px.

### Known issues
- Light-mode error red `#E2463B` on the page background is 3.75:1 (needs 4.5:1 for text).
- Spacing values of 2, 3, 6, 7, 10 and 14px in `index.css` are not on the 4px grid and are still raw numbers.
