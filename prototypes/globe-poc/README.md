# Globe proof-of-concept (ORCH-040)

A **throwaway prototype** to prove the look & feel of the "living globe": a dark Earth where each
Tree is a glowing, fruit-bearing sensor node. Built to de-risk **render + aesthetic + performance**
before wiring the real data layer.

## Run it
- Open `index.html` via any static server (e.g. the `globe-poc` preview config), or just open the
  file — it's fully **self-contained and offline** (library + texture are vendored in `vendor/`).

## What it demonstrates
- Dark, branded globe (Orchard tokens), atmosphere glow, a gentle "first light" zoom toward the
  orchard on load. **Drag to rotate (no auto-spin)** — with smooth momentum.
- The **3 current Trees** as colored points with **pulsing rings** (the cold-start "alive" signal —
  identical mechanism at 3 Trees or 100k).
- **Hover** a Tree for a quick label; **click** a Tree for an Explorer-style panel (ID, coarse
  region, node **state**, Season uptime, fruit/data classes, a mocked Verify badge).
- **Fruit = data class** legend (🍊 temp · 🍋 air quality · 🫐 humidity · 🍐 pressure · 🍇 multi-sensor).
- **Graceful fallbacks:** honors `prefers-reduced-motion` (no spin/rings) and shows a 2D list if
  WebGL is unavailable.

## Honest data note
`trees.json` / the inline `TREES` array are **representative, coarse (region-level) positions —
NOT precise GPS.** ORCH-0003 is shown "recovering" to mirror the real device's known boot issue.
Production reads live `node:.geohash` (~5 km cells) via the Atlas API — see
[`../../docs/architecture/atlas-data-privacy-contract.md`](../../docs/architecture/atlas-data-privacy-contract.md).

## What this is NOT
- Not the production stack. globe.gl (three.js) is great for this look-test; the **production spine
  is deck.gl + MapLibre** with server-side H3 tiling for scale — see
  [`../../docs/architecture/0001-atlas-globe.md`](../../docs/architecture/0001-atlas-globe.md) and the
  [performance budget](../../docs/architecture/performance-budget.md).
- No backend, no live data, no LOD/clustering yet. Those are Phase-2/3 build tasks.

## Vendored (in `vendor/`, gitignored-safe to keep)
- `globe.gl.min.js` (standalone, includes three.js)
- `earth-night.jpg` (dark Earth texture)
