# ADR-0002: Front-end & globe tech stack (working assumption)

- **Status:** Proposed *(working assumption for prototyping; ratified or revised after Phase 1)*
- **Date:** 2026-06-17
- **Deciders:** Lead (Claude Code); to be ratified with Richard after Phase 1 direction
- **Tasks:** ORCH-007, ORCH-040, ORCH-041, ORCH-042

## Context

The v2 hero is a "living globe" that must look alive with **3** Trees and scale to **100,000**
without a redesign, stay **clean/crisp/light** (mobile + low-end included), keep first paint fast
and indexable, and last a decade. The current v1 is a single 33 KB static HTML on Cloudflare
Pages — a large jump to interactive 3D. The backend already exists (Oracle FastAPI + Chia
DataLayer) and an "Orchard Atlas" with a frozen data contract and privacy model is already
specified in the main project.

## Decision

Adopt, as the **working assumption**, this spine (full reasoning in
`docs/architecture/0001-atlas-globe.md`):

- **Globe:** **deck.gl + MapLibre GL** (one WebGL context). GPU points zoomed out → clustered
  Groves at medium → instanced fruit-bearing Trees only at deep zoom → DOM detail panel on click.
- **Deep-zoom 3D:** **three.js**, dynamically imported **only** when the user reaches deep zoom.
- **Site shell:** **Astro islands** — marketing pages ship ~zero JS (fast, SEO-friendly); the
  globe is an isolated, lazy-loaded island/route.
- **Backend-for-frontend:** **Cloudflare** (Workers + KV precomputed H3 aggregate tiles + D1
  queryable mirror + R2 cold history) — same host as today; no proprietary lock-in.
- **Fallbacks:** a 2D Canvas/SVG path for no-WebGL / low-end / `prefers-reduced-motion`.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| deck.gl + MapLibre (+ three.js deep) | Geospatial-native; 3 or 100k points = same code; data-driven color; MIT | Two libs to learn | **chosen (working)** |
| globe.gl / three-globe only | Fast pretty globe | Fights you on tiling/picking at scale; weak 2D fallback | PoC look only |
| Cesium / Resium | Best true-3D terrain globe | Heavy (multi-MB); pulls toward proprietary tilesets | rejected (too heavy) |
| Pure 2D map | Lightest, simplest | Loses the "wow"/3D fruit vision | fallback layer only |

## Consequences

- Marketing stays near-instant; the heavy 3D never blocks first paint.
- The client never downloads 100k records — it reads precomputed aggregate tiles by zoom.
- We consume the **existing** privacy model (≈5 km geohash public; GPS owner-only) — no redesign.
- Reversible: this is `Proposed`. Phase 1 research (Gemini competitor teardown) and a globe PoC
  (ORCH-040) will confirm or revise it before it becomes `Accepted`.

## Notes

Status stays `Proposed` deliberately — Richard wanted the council's input before committing.
The PoC is the cheapest way to validate the look and the performance budget.
