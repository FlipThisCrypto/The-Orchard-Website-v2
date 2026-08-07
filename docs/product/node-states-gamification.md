# Node States & Gamification

> Canonical product doc. Integrated by the Lead from ChatGPT's **ORCH-014**
> (`council/chatgpt/submissions/ORCH-014-v1.md`). Date: 2026-06-17.
> Pairs with the fruit legend (ORCH-013): **Tree state = the container ("can this Tree be trusted
> right now?"); fruit freshness = data recency ("how recent is this data class?").** Related, not the same.

## Principle
Honest and restrained. Gamification rewards real uptime, recovery, sensor diversity, and consistent
Harvests across Seasons. It must **never** create fake density, fake motion, fake data, or a sense
that the network is more alive than it is.

## State → signal → visual mapping
| State | Real signal basis | Meaning | Visual | Fruit interaction |
|---|---|---|---|---|
| **New growth** | Recently registered/claimed; little Season history | A newly planted Tree joining | Small sprout, subtle new-growth ring, "new" badge | Fruit pending / first-Harvest only; don't imply stable uptime |
| **Healthy** | Recent heartbeat + signed Harvests, OK device health, strong Season uptime | Alive and contributing | Full Tree, steady glow | Fruit uses ORCH-013 freshness normally |
| **Idle** | Heartbeat recent, but no new Harvest for ≥1 expected interval (or class intentionally quiet) | Reachable, data not changing | Upright, calm low glow, no alarm | Fruit may mute by freshness; Explorer says if idle is expected |
| **Stale-data** | Last Harvest old beyond recency window, not confirmed offline | Treat data cautiously | Thin "stale" outline / timestamp emphasis | Fruit visibly stale; state clarifies it's a recency issue, not a dead device |
| **Offline** | No recent heartbeat + no recent Harvest; health unknown | Stopped reporting for now | Dim silhouette, no pulse, still selectable | Fruit = historical only, subdued; Explorer leads with "last seen" |
| **Failed** | Explicit fault, invalid signatures, sensor/device error, rejected submissions | Problem / data not trustworthy | Error-marked, crisp warning, no celebratory effects | Affected-class fruit suppressed/invalid; unaffected history still inspectable |
| **Withered — recovering** | Was offline/failed, heartbeat/partial Harvests resumed, confidence not rebuilt | Coming back, trust not fully restored | Withered trunk brightening, recovery badge, minimal motion | Fruit returns only for classes with valid recent Harvests; old fruit stays muted |
| **Withered — abandoned** | Long absence across Seasons, no recovery, or owner/admin-marked | Historical, not part of the live network | Bare/dormant, low-contrast, only at close zoom/filters | Fruit hidden by default / historical mode; **not** counted as live density |

## What `worldview/` implements today (and what it deliberately doesn't)

The oracle publishes **two** usable signals for this model: `last_seen_at` (heartbeat — is the device
reachable?) and `last_reading_at` (Harvest recency — is the data moving?). That is exactly what the
precedence rule *"Offline > Stale-data if no heartbeat"* needs, so stale-data is real rather than
assumed away. Freshness is judged against the oracle's own `as_of_utc`, never the visitor's clock.
Enforced by `tests/worldview-data.test.mjs`.

| State | Live? | Derived from | On the globe |
|---|---|---|---|
| **Healthy** | ✅ | heartbeat < 26 h and Harvest < 2 h | largest/tallest, `#4ade80`, "reporting" |
| **Idle** | ✅ | heartbeat < 26 h, Harvest 2–26 h | `#2bd4d4`, "quiet for a while" |
| **Stale-data** | ✅ | heartbeat < 26 h, Harvest > 26 h | `#ff9f2e`, "reachable, data has stopped" |
| **New growth** | ✅ `new` | reachable (or registered) but no Harvest ever | `#a3e635`, "planted, no Harvest yet" |
| **Offline** | ✅ | no heartbeat for > 26 h | smallest/flattest, `#76907f`, "not reporting" |
| **(not in the model)** | ✅ `ahead` | timestamps ahead of the oracle's own `as_of_utc` | `#e2554f`, "timestamps ahead of the oracle" |
| **Failed** | ❌ | needs validation status / fault reporting | — |
| **Withered — recovering** | ❌ | needs Season history + a recovery marker | — |
| **Withered — abandoned** | ❌ | needs multi-Season absence or an owner/admin mark | — |

`ahead` is not one of the model's states. It exists because two live Trees currently carry
timestamps ~4 h ahead of the oracle's own clock, and both alternatives were false: reading them as
fresh made them permanently "healthy", and coercing them to `new` claimed they had never harvested.
Surfacing the anomaly is the honest third option.

Corrections logged here so the record is straight: until 2026-08-07 a Tree that had **never
reported** rendered as *healthy*, and an earlier note in this file claimed the oracle exposed only
one signal — it exposes both, and `normalizeNodes` was silently dropping the heartbeat.

## Signal rules & precedence
Every state traces to a real signal (heartbeat/check-in · last signed Harvest · current/recent Season
uptime · device health · validation status · owner/admin recovery marker). Missing signal → show
**"unknown,"** never invented confidence. Precedence: **Failed** > Healthy (if fault/invalid);
**Offline** > Stale-data (if no heartbeat); Stale-data = Harvest recency; Idle = reachable but quiet;
Withered = longer lifecycle state, not a momentary stale.

## Honest gamification
- **Season streaks** shown only *after* a Season closes — no projected streaks.
- **Recovery credit** when a Tree returns offline/failed → healthy on verified signals.
- **Stewardship badges** for consistent uptime, sensor diversity, contributing to sparse Groves — secondary to data quality.
- **Grove health summaries** so a Grove can't look healthier than its Trees.
- **Builder prompts** route offline/failed owners to diagnostics/docs/support, not shame.
- **Avoid:** rewarding cosmetic activity, manual-refresh farming, speculative future rewards, fake "planting" markers, or inflating live counts with unlabeled demos.

## Reduced-motion
Motion is optional enhancement, never the only cue. In reduced-motion: replace pulses with static
rings/badges/contrast/timestamps; keep states distinguishable by shape + label + Explorer text;
no looping growth/recovery animations (use a one-time marker or static "recovering" badge); all
state info available in the Explorer for screen readers.

## Grove-level display
Show both health and data composition, unblended — e.g. *"12 Trees: 8 healthy, 2 idle, 1 offline,
1 recovering"* alongside *"air quality, microclimate, humidity coverage."*

## Open questions for Richard (carried from ORCH-014)
1. **Canonical heartbeat signal** — oracle check-in, signed-Harvest arrival, device ping, or another public-safe status?
2. Show **"abandoned" publicly**, or use softer **"long offline"** in public UI and reserve "abandoned" for owner/admin tools?

*Exact thresholds (idle/stale/offline cutoffs) are a Lead build task once Harvest cadence + uptime
fields are finalized. Source: ChatGPT, ORCH-014.*
