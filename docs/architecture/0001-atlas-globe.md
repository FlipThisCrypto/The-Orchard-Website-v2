# Architecture: The Orchard Atlas (the living globe)

> The staged technical design for the v2 hero globe and how it sits inside a fast site.
> Owned by the Lead. Pairs with [`../../governance/decisions/0002-tech-stack.md`](../../governance/decisions/0002-tech-stack.md)
> (status: Proposed). Grounded in the main project's `docs/datalayer/SPEC.md` and
> `docs/decisions/0003-datalayer-verifiable-dataset.md` (the "Orchard Atlas" mandate + privacy).

## The one-line recommendation

**deck.gl + MapLibre GL** for the globe, fed by **Cloudflare Workers + KV (precomputed H3
aggregate tiles) + D1 (queryable mirror) + R2 (cold history)**, wrapped in an **Astro islands**
site on Cloudflare Pages, consuming the **existing coarse-geohash privacy model**. **three.js**
enters only as a deep-zoom overlay. The globe looks identical with 3 Trees or 100,000.

## Why this isn't greenfield

The Atlas is already specified: it's a read-only public renderer of the Chia DataLayer, and the
live v1 site already links it ("View Live Trees" → `view.theorchard.network`). Its **data
contract and privacy model are already decided and enforced in code** (precise GPS is owner-only
and scrubbed server-side; public location is a ~5 km geohash cell). Our job is the rendering and
experience layer on top of a contract that exists — that de-risks everything.

## The four zoom levels → level-of-detail (LOD)

You cannot render 100k fruit-laden 3D trees in a browser. You never try. One data contract, swap
layers by zoom:

| Level | View | What renders | How |
|---|---|---|---|
| **L0** | Whole Earth | glowing points, color = dominant data class | deck.gl `ScatterplotLayer` over H3-cell centroids; radius = `log(tree_count)` |
| **L1** | Region / Groves | stylized tree sprites + region stats | clusters resolve (H3/supercluster) → `IconLayer`; hover card: Tree count, streams, history |
| **L2** | Local | **fruit-bearing Trees** (fruit = data class) | crossed only when zoom is deep **and** visible nodes < ~300; sprite atlas first, three.js `InstancedMesh` overlay only if needed |
| **L3** | Node | the Explorer detail panel | click → picking returns `node_id` → fetch node → DOM panel (not 3D) |

Transition L0→L1→L2 is a **cross-fade across a zoom band** (point layer opacity ramps out as the
sprite/instanced layer ramps in). **three.js is dynamically imported only when L2 is entered**,
and instanced fruit is capped to the viewport — you instance the few hundred Trees on screen,
never 100k.

## Rendering tech (trade-offs)

| Candidate | Verdict | Why |
|---|---|---|
| **deck.gl + MapLibre** | **Primary** | Geospatial-native (feed lon/lat from geohash), GPU layers render 3 or 100k identically, data-driven color, built-in picking, MIT. |
| three.js / react-three-fiber | **Deep-zoom overlay only** | Max control for stylized fruit Trees; but reimplementing projection/tiling/picking as the base is wasteful. |
| globe.gl / three-globe | PoC look only | Fast pretty globe; fights you on tiling/picking at scale and on the 2D fallback. |
| Cesium / Resium | Rejected | Heaviest; pulls toward proprietary tilesets — the "bloated WebGL monster" we must avoid. |
| Pure 2D (Canvas/SVG + d3-geo) | **Mandatory fallback** | Renders the same data for no-WebGL / low-end / reduced-motion. |

## Data architecture at scale (Cloudflare)

**The client fetches pre-aggregated tiles by zoom; it never downloads raw nodes.** Source of
truth stays the per-operator Chia DataLayer stores (Atlas reads independent of any single oracle).

- **Worker (cron indexer, every 5–15 min):** reads known stores / public oracle routes → upserts
  into D1. Swappable to DataLayer-direct later without touching the client.
- **D1 (edge SQLite):** queryable mirror — `nodes(node_id, geohash, h3_r0..r3, sensors_json,
  board, fw, last_reading_at, uptime, season_score, store_id, verify_status)`. Powers node panel
  + on-the-fly bbox queries.
- **KV:** precomputed aggregate tiles keyed by `(zoom-band, h3-cell)` → tiny JSON of centroids +
  counts + dominant class. The 100k-safe L0/L1 path; recomputed by the cron.
- **R2:** cold history (per-node Season timelines), the static texture atlas, the 2D-fallback
  GeoJSON snapshot.
- **Durable Objects:** deferred — only if we later want live "a reading just landed" push.

**Public endpoints** (privacy-safe by construction; full mapping in
[`atlas-data-privacy-contract.md`](atlas-data-privacy-contract.md), ORCH-042):
`GET /atlas/tiles/:z/:cell` (aggregates, no node_ids) · `GET /atlas/nodes?bbox=&z=` (per-node
points for deep zoom, never raw GPS) · `GET /atlas/node/:id` (public subset of the panel) · reuse
existing `GET /network/stats` for the hero counter.

**Freshness:** aggregates 5–15 min · live `latest:` pulse polled 15–30 s on an open node · history
minutes–hours (sealed per Season).

## Performance budget (summary; full detail in `performance-budget.md`, ORCH-041)

- **Landing shell:** <20 KB critical CSS inline, ~0 marketing JS (Astro islands), **LCP < 1.5 s**.
- **Globe bundle:** **< 250 KB gzip** (deck.gl + MapLibre core), lazy-loaded; three.js **+~120 KB
  dynamically imported at L2 only.** Never on the landing critical path.
- **FPS:** 60 desktop/modern mobile at L0/L1; **≥ 30 floor** at L2 on low-end (degrade instanced
  count). **Memory** < 300 MB on the globe route; dispose three.js on route leave.
- **Fallbacks:** no-WebGL → 2D; `prefers-reduced-motion` → static globe, no arcs/pulses;
  honor `Save-Data`.

## Cold-start: 3 Trees that feel alive (and don't become gimmicks at 100k)

Source the "life" from things that scale, and lean into the anti-hype voice:
- **Ambient life from the planet** — slow auto-rotation, atmosphere/rim glow, starfield (killed
  under reduced-motion). Beautiful at 3, correct at 100k.
- **Real data-flow arcs** — pulse a short arc on each Tree's real `latest:` update; a heartbeat at
  3 Trees, ambient shimmer at 100k. Same mechanism.
- **Honest framing** — "3 Trees planted · first light in Mount Washington, KY," counter from real
  `/network/stats`.
- **"First light" intro** — on load, zoom to ORCH-0001 and open its live reading.
- **No-redesign guarantee** — L0 is H3 aggregates; 3 cells vs. 100k cells is identical code.

## Privacy (consume the existing decision)

Public location = `node:<ID>.geohash` at precision ~5 km; the globe renders the **cell centroid /
H3 cell**, never raw lat/lon. Precise GPS is owner-only and must **never** enter the D1/KV/Atlas
pipeline. Snap-to-grid via H3; deterministic display jitter **within** the cell so co-located
Trees don't overlap — never beyond it. No client-side reverse-geocoding (no precise coords are
ever sent).

## Site shell & migration

- **Framework: Astro with islands** on Cloudflare Pages — marketing pages ship ~zero JS; the globe
  is one lazily-hydrated island that dynamically imports deck.gl. Reuse the v1 `:root` tokens and
  system-font stack; keep the `prefers-reduced-motion` block and the shared
  `connect.js` wallet widget.
- **Migrate without touching the live site:** build v2 in this folder → deploy to a **separate**
  Pages project + preview subdomain → ship the globe first on its own subdomain (`view`/`atlas`)
  → cut over via DNS/production-branch switch only at parity. The archived v1
  (`theorchard.network-originals`) is the rollback.

## Staged build path (de-risking order)

1. **RENDER risk →** smallest PoC (ORCH-040): static page, deck.gl/MapLibre dark globe, **3 real
   Trees**, auto-rotation + one pulse arc, 2D fallback. No backend. Proves look + perf budget.
2. **DATA risk →** Cloudflare Worker serving `/atlas/tiles` + `/atlas/nodes` from D1/KV
   (bootstrapped off public oracle routes); globe reads the API. Proves the privacy-safe geo
   contract end-to-end.
3. **LOD risk →** L0→L1→L2 transitions + the L3 node panel with the Verify badge from `attest:`.
4. **SCALE risk →** H3 precompute in the cron; load-test KV tiles with 100k synthetic nodes; add
   instanced three.js fruit only if sprites prove insufficient.
5. **POLISH →** cold-start storytelling, accessibility/reduced-motion, migration/cutover.

*Last updated: 2026-06-17 · Lead. ADR-0002 governs the stack decision (Proposed until Phase 1).*
