# Mannheim Feed design system

One set of design decisions (colours, type, spacing, radius, motion) that the browser app and the installed phone app share. The decisions live as **tokens**: small named values in JSON files. A build step turns them into the files the app uses.

```
design-system/
├── tokens/                 ← the source of truth. Edit these.
│   ├── core/               raw values: palette, spacing, type, radius, shadow, motion
│   ├── semantic/           meaning: "page background", "primary text", per theme
│   │   ├── light.json
│   │   └── dark.json
│   └── component/          decisions per component: button, chip, input, switch
├── scripts/                build, contrast check, preview generator
├── dist/                   ← generated. Committed on purpose. Never edit by hand.
│   ├── css/tokens.css      CSS custom properties (light + dark)  ← the web app imports this
│   ├── ts/tokens.ts        typed constants for TypeScript        ← vite.config.ts imports this
│   ├── json/tokens.json    flat list for other tools
│   └── preview.html        visual reference page: open it in a browser
├── docs/
│   ├── usage.md            how to use tokens in code, themes, native apps later
│   └── versioning.md       how versions, tags and releases work
├── CHANGELOG.md            what changed in each version
└── package.json            the design system's own version number lives here
```

## Design principles

**Daylight and golden hour; soft, calm and easy to read.** The colour rules are enforced by `npm run check`, not just written down.

- **Daylight and golden hour.** Light mode is *daylight*: warm cream paper, espresso ink, terracotta as the primary colour. Dark mode is *golden hour*: dusk browns lit by a low amber sun. No blue anywhere.
- **Calm colour.** Warm but muted (no neon orange). Error rose is kept apart from the terracotta by hue, so an error never looks like a button.
- **No glare.** Off-white surfaces and charcoal text instead of pure white and black. Body text contrast must stay between 7:1 (WCAG AAA) and 14:1.
- **Readable text.** Nothing smaller than 13px; running text at 15–16px with 1.6 line spacing; lines no longer than about 60 characters.
- **One typeface: Inconsolata.** A monospace font, bundled with the app (works offline, never loaded from Google). `font-size-adjust: 0.5` makes up for its short lowercase letters, so it reads as large as a sans-serif.
- **Simple, single-colour icons** from Pictogrammers. See [Icons](#icons).
- **Smooth shapes and motion.** Rounded corners, light shadows, 200ms ease-out transitions (switched off when the phone asks for reduced motion).

## Icons

All icons come from **[Pictogrammers](https://pictogrammers.com/library/mdi/)** (Material Design Icons, npm package `@mdi/js`, Apache 2.0).

- **Simple and filled:** one solid shape per icon, drawn on a 24px grid. No outlines mixed with fills, no multi-colour icons, no emoji.
- **One plain colour:** icons are painted with `currentColor`, so they take the colour of the text next to them. In daylight that is driftwood grey (`color.icon.default`) or terracotta when selected (`color.icon.active`); at golden hour, dry grass or amber.
- **Sizes:** `size.icon-xs` 16px inside a line of text (chips, link arrow, remove), `size.icon-sm` 18px for tabs on wide screens, `size.icon-md` 24px for tabs on phones.
- **Contrast:** icons need 3:1 against their background (WCAG non-text contrast); `npm run check` tests this.
- **Where:** the list lives in `web/src/lib/icons.ts`; draw one with `<Icon path={…} />` from `web/src/components/Icon.tsx`.

| Use | Icon |
|---|---|
| Tab "Noticias" | `newspaper-variant` |
| Tab "Perfil" | `account` |
| Open the original article | `arrow-top-right` |
| Remove a keyword | `close` |
| Topics | `tram`, `drama-masks`, `party-popper`, `police-badge`, `bank`, `home-city`, `briefcase`, `soccer`, `school`, `tree`, `stethoscope`, `silverware-fork-knife` |

To add or change an icon: find it in the Pictogrammers library, import it in `web/src/lib/icons.ts` as `mdi` + its name in CamelCase (`party-popper` → `mdiPartyPopper`).

**The app icon** (`web/public/icon.svg` and the PNGs) is generated from the tokens: `npm run icons` inside `web/`. It shows Mannheim's grid of squares (the *Quadrate*) in cream on terracotta, with the centre square in gold: the sun at golden hour.

## The three layers

| Layer | Question it answers | Example | Who may use it |
|---|---|---|---|
| **Core** | "What values exist?" | `color.ember.600 = #9A4B2A` | Only other tokens |
| **Semantic** | "What does this value mean?" | `color.accent.default → color.ember.600` | App code (CSS, TS) |
| **Component** | "How is this component built?" | `chip.min-height → size.control-sm` | The component's own CSS |

The rule that makes theming work: **app code uses semantic and component tokens, never core ones.** Dark mode only swaps which core value each semantic token points to. A component never needs to know which theme is active.

## Daily commands

Run these inside `design-system/`.

```bash
npm install        # once
npm run build      # tokens/*.json → dist/
npm run check      # contrast check on every colour pair the app uses
npm run verify     # build + check (run this before every commit)
```

Open `dist/preview.html` in a browser to see every token. The button in the corner switches system, light and dark.

## Change a token (the 6-step loop)

1. Edit the value in `tokens/…`. Example: make the accent a little darker in `tokens/core/color.json`.
2. `npm run verify`. The build regenerates `dist/`, the check tells you if any text pair became unreadable.
3. Open `dist/preview.html` and look at it in light and dark.
4. Decide the version bump and write the entry in `CHANGELOG.md` (see `docs/versioning.md`).
5. Commit the token change, the new `dist/` and the changelog together, and open a pull request. GitHub checks that `dist/` matches the tokens.
6. After merging, tag the release (`design-system-v1.1.0`). GitHub saves a downloadable release.

## Naming

- Tokens are dotted paths: `color.text.secondary`, `space.4`, `font.size.body`.
- In CSS they become `--mf-` + the path with dashes: `--mf-color-text-secondary`, `--mf-space-4`.
- Semantic colour names say **role**, not appearance: `accent.default`, not `terracotta`. If the primary colour changes, no name changes.
- Spacing keys are multiples of 4px: `space.4` is 16px.

## What is and is not covered today

Covered: colour (light + dark), spacing, radius, font family / size / weight / width / line height / letter spacing, shadow, motion, z-index, control sizes, breakpoint, and five component groups (button, input, chip, switch, article).

Not covered yet, listed so nothing is a surprise:

- **Off-grid spacing** in `web/src/index.css` (2, 3, 6, 7, 10 and 14px) is still written as raw numbers. They are small optical adjustments; decide later whether to snap them to the grid.
- **Demo mode header on phones:** with the "Modo prueba" badge, the DE/ES switch is cut off on screens narrower than about 425px. The real app (no badge) fits. This was the same before v1.1.
- **The installed app keeps its old icon** on a phone until the app is removed and added to the home screen again; browsers cache home-screen icons.
- **The breakpoint** (760px) cannot be a CSS variable inside `@media`. It is a token for TypeScript and docs, and mirrored by hand in `index.css`.
- **No theme switch in the UI yet.** The app follows the phone or computer setting. The tokens already support forcing a theme with `data-theme="dark"` or `"light"` on `<html>`.
