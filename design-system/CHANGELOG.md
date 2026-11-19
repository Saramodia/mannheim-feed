# Changelog

All notable changes to the Mannheim Feed design system. Newest first.
Versioning rules: `docs/versioning.md`.

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
