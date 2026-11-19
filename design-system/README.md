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

## The three layers

| Layer | Question it answers | Example | Who may use it |
|---|---|---|---|
| **Core** | "What values exist?" | `color.blue.600 = #1E4BD2` | Only other tokens |
| **Semantic** | "What does this value mean?" | `color.accent.default → color.blue.600` | App code (CSS, TS) |
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
- Semantic colour names say **role**, not appearance: `accent.default`, not `blue`. If the brand blue changes, no name changes.
- Spacing keys are multiples of 4px: `space.4` is 16px.

## What is and is not covered today

Covered: colour (light + dark), spacing, radius, font family / size / weight / width / line height / letter spacing, shadow, motion, z-index, control sizes, breakpoint, and five component groups (button, input, chip, switch, article).

Not covered yet, listed so nothing is a surprise:

- **Off-grid spacing** in `web/src/index.css` (2, 3, 6, 7, 10 and 14px) is still written as raw numbers. They are small optical adjustments; decide later whether to snap them to the grid.
- **The error red in light mode** (`#E2463B` on the light page) is 3.75:1, below the 4.5:1 WCAG AA minimum for text. Logged in `scripts/contrast.mjs`; fixing it changes the look, so it needs your decision.
- **Icons and the app icon** (`web/public/icon.svg`, PNG icons) still contain their own hex colours.
- **The breakpoint** (760px) cannot be a CSS variable inside `@media`. It is a token for TypeScript and docs, and mirrored by hand in `index.css`.
- **No theme switch in the UI yet.** The app follows the phone or computer setting. The tokens already support forcing a theme with `data-theme="dark"` or `"light"` on `<html>`.
