# Performance Budget & Device Targets

> Lead deliverable (**ORCH-041**). The hard numbers the build is held to, so the globe stays
> "clean, crisp, light." Pairs with [0001-atlas-globe.md](0001-atlas-globe.md).

## Budgets by surface
| Surface | Metric | Budget |
|---|---|---|
| **Marketing pages** (`/`, `/learn`, `/data`…) | Critical CSS (inline) | < 20 KB |
| | Marketing JS shipped | ~0 KB (Astro islands; JS only for interactive islands) |
| | LCP (mid-tier 4G) | **< 1.5 s** |
| | Total transfer (initial) | < 150 KB |
| **Globe island** (`/atlas`, homepage preview) | Core bundle (deck.gl + MapLibre), gzip | **< 250 KB**, lazy-loaded |
| | three.js (deep-zoom L2 only), gzip | + ~120 KB, **dynamically imported on demand** |
| | Texture atlas (fruit sprites) | < 256 KB, one atlas |
| | Memory (globe route) | < 300 MB; dispose three.js on route leave |
| **Frame rate** | Desktop + modern mobile (L0/L1) | 60 fps |
| | Low-end (L2 deep zoom) | **≥ 30 fps floor** (degrade instanced count) |

**Hard rule:** the heavy 3D never blocks first paint or marketing routes. The homepage shows a
lightweight preview (or static fallback) and only hydrates the full globe on `/atlas` or on explicit
interaction.

## Device & capability matrix
| Capability | Behavior |
|---|---|
| WebGL2 | Full experience (preferred) |
| WebGL1 only | Full experience, reduced instancing |
| No WebGL | **2D Canvas/SVG fallback** rendering the same data |
| `prefers-reduced-motion` | Static globe — no rotation/arcs/pulses; state via shape/label/badge |
| `Save-Data` / low `deviceMemory` / low `hardwareConcurrency` | Start in low mode (fewer points, no 3D), offer "load full globe" |
| Screen readers | All node/Grove state + data available as DOM in the Explorer (not canvas-only) |

## Techniques to hold the budget
- **Code-split & dynamic-import** the 3D engine; never in the landing critical path.
- **Server-side aggregation** (H3/supercluster → KV tiles) so the client never clusters or downloads 100k records.
- **GPU instancing** for deep-zoom fruit; **sprite/billboard LOD** + **texture atlas**; cap visible instanced fruit (≤ 2–5k) to the viewport.
- **`IntersectionObserver`** to defer globe init until scrolled into view; **`requestIdleCallback`** for warmups.
- **Off-main-thread** parse (web worker / OffscreenCanvas) for any heavy data.
- **Cross-fade LOD** across a zoom band (points → sprites → instanced) so transitions are cheap.

## Degradation ladder (runtime)
1. Detect capability (WebGL tier, deviceMemory, reduced-motion, Save-Data) at load.
2. Pick a starting tier (full 3D / sprite-only / 2D).
3. **Live FPS monitor:** if sustained < target, drop instanced count → sprite LOD → 2D, and stop arcs/rotation.
4. Always keep the page **useful before the globe loads** (routes, copy, CTAs, privacy, readiness check are HTML).

## Verification (when built)
Lighthouse (LCP/TBT/CLS) on marketing routes; bundle-size check in CI against the table above;
manual FPS check on a mid-tier phone at L0/L1/L2; confirm 2D + reduced-motion paths render the same
data. No-WebGL tested by disabling WebGL in devtools.

*Source: Lead. Numbers are targets to validate with the PoC (ORCH-040) and refine in build.*
