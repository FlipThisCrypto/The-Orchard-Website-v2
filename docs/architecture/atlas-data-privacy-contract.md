# Atlas Data & Privacy Contract

> Lead deliverable (**ORCH-042**). What the globe is allowed to fetch and show, and the privacy
> invariants it must never violate. Must be reconciled against the main project's
> `docs/datalayer/SPEC.md §8/§9` during build (field names below are the intended public subset;
> confirm exact keys against SPEC). Pairs with [0001-atlas-globe.md](0001-atlas-globe.md).

## Privacy invariants (non-negotiable)
1. **Public location = coarse geohash (~5 km, precision 5) only.** The globe renders the **cell
   centroid / H3 cell**, never raw lat/lon.
2. **Precise GPS is owner-only** and is already scrubbed server-side (per the main project's
   `readings` route). It must **never** enter the Atlas pipeline (D1/KV/R2) or any public endpoint.
3. **Snap-to-grid via H3**; multiple Trees in an area share a cell (k-anonymity-ish).
4. **Deterministic display jitter only *within* the cell** so co-located Trees don't overlap — never beyond the cell.
5. **No client-side reverse-geocoding** (no precise coords are ever sent to the client).
6. If a field isn't on the public list below, it is **not** published.

## Public endpoints (read-only)
| Endpoint | Returns | Notes |
|---|---|---|
| `GET /atlas/tiles/:z/:cell` | aggregated cells: `{ centroid, tree_count, dominant_class, class_breakdown }` | **No node_ids.** L0/L1. Served from precomputed KV tiles. |
| `GET /atlas/nodes?bbox=&z=` | per-node points: `{ node_id, cell_centroid, sensors[], state, verify_status, last_reading_at }` | Deep zoom only; **never raw GPS.** From D1. |
| `GET /atlas/node/:id` | the public Explorer subset (see below) | From D1 + R2 history. |
| `GET /network/stats` | aggregate counters (Trees, Seasons, Harvests, coverage) | Already exists; powers the hero counter. |

## Field → visibility map
| Field | Public? | Source (intended) | Used for |
|---|---|---|---|
| `node_id` (ORCH-#####) | ✅ (deep zoom) | `node:` | Explorer identity |
| coarse cell centroid / geohash-5 | ✅ | `node:.geohash` | Globe placement |
| **precise lat/lon** | ❌ owner-only | `readings` (scrubbed) | never published |
| `sensors[]` / data classes | ✅ | `node:` | fruit legend |
| `state` (healthy/idle/offline/…) | ✅ | heartbeat + `latest:` + uptime | node-state visual |
| `last_reading_at` / freshness | ✅ | `latest:` | fruit freshness |
| Season uptime / `season_score` | ✅ | `attest:` | trust, rewards |
| `verify_status` (signed/proof) | ✅ | `attest:` / DataLayer | Verify badge |
| device health summary | ✅ (coarse) | `latest:` | Explorer |
| firmware/build | ⚠️ only if public-safe | `node:` | Explorer (optional) |
| Orchard Pass binding | ⚠️ only if public-safe | `pass:` | Explorer (optional) |
| rewards ($JUICE) summary | ✅ | reward logic | Explorer |
| operator wallet / owner identity | ❌ owner-only | — | never published |

## Freshness tiers
- **Aggregate tiles (L0/L1):** recomputed every **5–15 min** (this is "everywhere," not a trading screen).
- **Live pulse (`latest:`):** polled **15–30 s** on an open node view.
- **History / attestations:** minutes–hours (sealed per Season anyway).

## Cloudflare mapping
- **Worker (cron, 5–15 min):** read public DataLayer/oracle records → upsert **D1**; recompute **KV** aggregate tiles.
- **D1:** queryable mirror (powers `/atlas/nodes`, `/atlas/node/:id`).
- **KV:** precomputed aggregate tiles (the 100k-safe L0/L1 path).
- **R2:** cold history + static globe assets (atlas, 2D-fallback GeoJSON snapshot).

## Verification (when built)
Contract test: assert no endpoint ever returns precise lat/lon or owner identity; fuzz `/atlas/*`
for field leakage; confirm two Trees in one geohash cell share a centroid (+ deterministic jitter);
confirm the client never receives coords finer than the cell.

*Source: Lead. Reconcile field keys with `SPEC.md §8` before implementation.*
