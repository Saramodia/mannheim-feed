# Using the tokens

## In CSS (browser and installed phone app)

`web/src/index.css` starts with one import, and everything after it uses `var(--mf-…)`:

```css
@import '../../design-system/dist/css/tokens.css';

.card {
  background: var(--mf-color-bg-surface);
  color: var(--mf-color-text-primary);
  border: 1px solid var(--mf-color-border-default);
  border-radius: var(--mf-radius-lg);
  padding: var(--mf-space-4);
}
```

Rules of thumb:

- Never type a colour, radius or font size by hand in `index.css`. If the value you need does not exist, add a token (see the README).
- Use semantic colours (`--mf-color-text-secondary`), not core colours (`--mf-color-neutral-600`).
- Use component tokens inside that component only (`--mf-chip-*` in `.chip`).

## In TypeScript

```ts
import { themes, tokens } from '../../design-system/dist/ts/tokens'

themes.light.accent.default   // '#1e4bd2'
themes.dark.bg.page           // '#10131a'
tokens.space[4]               // '16px'
tokens.breakpoint.tablet      // '760px'
```

`vite.config.ts` already does this for the PWA manifest (`theme_color`, `background_color`) and for the `theme-color` meta tag in `index.html`, so the colours of the installed app come from the same source as the UI.

## Themes (light and dark)

- By default the app follows the system setting through `prefers-color-scheme`.
- To force a theme, set the attribute on the root element: `document.documentElement.dataset.theme = 'dark'` (or `'light'`). Remove the attribute to return to the system setting.
- Dark mode only re-points the semantic colours. Nothing else changes.

## Mobile rules that are not tokens

These are platform rules the app already follows. Keep following them when you add screens.

- **Touch targets:** every tappable control is at least `--mf-size-tap-target` (44px) high.
- **Safe areas:** fixed bars use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` so content clears the notch and the home indicator. This needs `viewport-fit=cover` in `index.html`, which is set.
- **Reduced motion:** `index.css` turns transitions off when the user asks for it. New animations should respect that too.
- **Breakpoint:** the layout switches from phone to wide at 760px (`tokens.breakpoint.tablet`). Write the number in `@media (min-width: 760px)`; if you change the token, change it there as well.

## Adding a native app later

The tokens are in the W3C Design Tokens (DTCG) format, so they are not tied to the web. When a native app exists, add a platform to `scripts/build.mjs` and Style Dictionary will produce, for example:

- iOS: a Swift file with `Color` and spacing constants
- Android: a Compose theme file or `colors.xml` / `dimens.xml`

The semantic names (`color.text.primary`, `space.4`) stay the same on every platform, which is what keeps the web app and a native app looking like the same product. Rem-based sizes would need a transform to points or dp.

## Quick answers

| I want to… | Do this |
|---|---|
| Change the primary colour | Edit `color.ember.600` (daylight) or `color.sun.400` (golden hour) in `tokens/core/color.json`, then `npm run verify`; then `npm run icons` in `web/` for the app icon |
| Add an icon | See README → Icons |
| Add a new colour role | Add it to **both** `semantic/light.json` and `semantic/dark.json` (same name) |
| Add a spacing step | Add it to `space` in `tokens/core/scales.json`, in multiples of 4px |
| See all tokens | Open `dist/preview.html` |
| Check readability | `npm run check` |
