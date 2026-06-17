# Brand & Voice Reference

> Canonical design tokens and voice for The Orchard v2, ported verbatim from the live v1 site
> (`theorchard.network/index.html`) so v2 stays visually continuous. Owned by the Lead.
> Source of truth for color/type; advisors reference this, the build consumes it.

## Voice (non-negotiable)

The Orchard sounds **humble, precise, and anti-hype.** It is built in the open by someone who
respects the reader's intelligence.

- **Do:** plain language; concrete claims; "pre-alpha, expect rough edges, tell us what breaks";
  credit the open-source nature; let the work speak.
- **Don't:** moonshot/price talk, "revolutionary," urgency manipulation, fake scarcity, implying
  scale we don't have. **The token supports the ecosystem; it isn't the point of it.**
- **Signature lines:** `GROW · CONNECT · EARN` · "Plant a Tree. Harvest verifiable data."
- **Honesty about stage:** we have ~3 Trees. We say so. One real Tree rendered beautifully beats
  thousands of fake ones.

## Color tokens (CSS custom properties — copy as-is)

```css
:root{
  --bg:#070b09;            /* near-black green, page base */
  --bg-2:#0a1410;          /* slightly lifted base */
  --panel:rgba(13,26,20,.58);     /* glass panel fill */
  --border:rgba(120,230,200,.16); /* hairline */
  --border-strong:rgba(120,230,200,.34);
  --text:#ecfbf3;          /* primary text (off-white green) */
  --muted:#a3bcb0;         /* secondary text */
  --muted-2:#76907f;       /* tertiary / hints */
  --green:#4ade80;         /* primary green */
  --green-bright:#a3e635;  /* lime accent / "live" */
  --cyan:#2bd4d4;          /* cyan accent */
  --purple:#b14aef;        /* purple accent */
  --orange:#ff9f2e;        /* $JUICE — reserve for token & rewards */
  --orange-soft:#ffbf6a;
  /* signature holographic gradient */
  --holo:linear-gradient(100deg,#b14aef 0%,#4f7bff 26%,#28d0d0 50%,#46e08a 72%,#f4d23c 100%);
  --maxw:1120px;           /* content max width */
  --r:18px;                /* card radius */
}
```

**Usage rules**
- **Orange = $JUICE / rewards only.** Don't use it for generic UI accents.
- **Green/green-bright = "live / healthy / grow."** Used for status dots and primary CTAs.
- **Holographic gradient** is the hero signature — text clip, borders, primary buttons, top
  accent bars. Use sparingly so it stays special.
- **On the globe:** sensor/data classes get their own encoding (see
  `docs/product/fruit-data-legend.md`, ChatGPT) but must draw from this palette.

## Background & surfaces

Page background layers radial glows (purple top-right, cyan top-left, orange bottom) over a
vertical dark gradient, `background-attachment:fixed`. Panels are translucent
(`--panel`) with `backdrop-filter:blur(6px)` and a hairline `--border`; cards carry a 3px
holographic top edge.

## Typography & motion

- **Type:** system stack — `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
  Helvetica, Arial, sans-serif`. No web-font cost. Headings 800 weight, tight tracking
  (`-0.02em`); body line-height ~1.6; mono = `ui-monospace, "Cascadia Code", Consolas`.
- **Motion:** subtle only (hover lift, gentle pulse, holographic shimmer). **Always** honor
  `@media (prefers-reduced-motion: reduce)` — disable animation/transition/smooth-scroll.

## Iconography & marks

- Favicon/mark: a **circuit-tree bearing $JUICE fruit** — green branches, orange fruit dots.
  The fruit-as-data metaphor is already in the brand mark; v2's globe should echo it.
- Logos on disk (reference, read-only): `Chia DePIN/docs/photos/The Orchard LOGO.png`,
  `Juice logo small.png`.

## Lexicon

Always use the authoritative names from [`MISSION.md`](../../MISSION.md): Trees, Groves, Seasons,
Harvest, Keepers, Orchard View, Orchard Passes, $JUICE. Node IDs read `ORCH-#####`.

*Last updated: 2026-06-17 · ported from v1 by the Lead.*
