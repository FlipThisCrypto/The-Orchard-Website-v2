# Fruit → Data-Class Legend & Explorer Hierarchy

> Canonical product doc. Integrated by the Lead from ChatGPT's **ORCH-013**
> (`council/chatgpt/submissions/ORCH-013-v1.md`). Date: 2026-06-17.
> Reconciles MISSION.md's example fruit language with Gemini's illustrative mapping (ORCH-021) into
> one source of truth. **Fruit is information architecture, not decoration.**

## The model in one line
**Fruit type = data class · quantity = how much evidence · size = coverage/confidence · freshness =
recency of Harvest · Explorer = the details.** Lead with buyer-relevant classes; never imply a
sensor is live when it isn't.

## Canonical legend
| Fruit | Data class | Typical readings | Status | Notes |
|---|---|---|---|---|
| 🍊 Orange | Single sensor / temp-first microclimate | Temperature; default 1-channel sensor | **Launch core** | One orange = one active channel; MVP meaning = temperature. |
| 🍇 Grapes | Multi-sensor cluster / particulates | PM1/2.5/10 or tightly-related cluster | **Launch core** | Reconciles "multi-sensor cluster" (MISSION) + "particulates" (Gemini). Tree = clustered package; Grove = many Trees of a class. |
| 🍋 Lemon | Air-quality gases / AQI | VOCs, NO2, CO2-eq, gas/AQI output | **Launch priority** (if available) | Plain-language air-quality fruit; grapes show particulate substructure. |
| 🫐 Blueberry | Humidity / water-adjacent moisture | Relative humidity now; rainfall/water later | **Launch/future bridge** | Humidity as atmospheric water now; expanded water uses later. |
| 🍎 Apple | Soil / land conditions | Soil moisture/temp/conductivity | **Future-ready** | Farms, educators, citizen science; only show if soil sensors present. |
| 🍐 Pear | Pressure / baseline atmosphere | Barometric pressure + trend | **Optional/bundled** | Useful but not a lead use case; stay quiet/bundled under microclimate until needed. |
| ⭐ Starfruit | Energy / infrastructure telemetry | Power/current, solar, uptime telemetry | **Future-ready** | VISION broader telemetry; only when expanding beyond environmental-led. |
| 🟣 Plum | Seismic / ground motion | Geophone, vibration, seismic | **Future-ready** | Long-term scientific class; out of launch prominence. |

## Encoding rules
- **Type = data class** — always answers "what kind of data?"; never owner/rewards/decoration.
- **Quantity = count** — Tree: active channels/readings in that class; Grove: contributing Trees/coverage (visually capped; exact count in a badge/Explorer at high density).
- **Size = coverage/confidence, not value** — avoid mapping size to pollution/temperature value (normal variation shouldn't look like alarm); Grove size = contributing Trees / recent Harvest density.
- **Color = fruit identity + optional value band** — keep each fruit recognizable; value bands via subtle tint/glow/ring; exact hex is Lead/brand. (A lemon must never look like an apple.)
- **Freshness = recency of Harvest** — fresh = recent; muted = older. Data recency only — **node health/offline/withered visuals are ORCH-014, not here.**
- **Proof = inspectable, not always visible** — don't clutter the map with proof icons; show signed reading / Season uptime / DataLayer proof in hover + Explorer.

## Scale rules (3 → 100,000)
- **3 Trees:** show individual Trees proudly, small curated fruit branch + labels; reads as "live pre-alpha, help plant the next," not empty.
- **Dozens–hundreds:** group into Groves; Grove fruit summarizes dominant classes + count badge.
- **Thousands–100k:** LOD — globe shows Grove density + dominant class; regional zoom shows composition; local zoom shows Trees; Explorer holds exact counts/history. Never render every fruit at global scale.
- **Privacy always:** fruit attaches to the coarse public Tree/Grove representation (geohash cell/region), never precise GPS.

## Explorer info hierarchy
- **Grove (scan first):** region (coarse) · Tree count + sensor-class mix · dominant fruit + last-Harvest recency · aggregate uptime · coverage note (pre-alpha/sparse/dense) · CTA (inspect / view classes / readiness check).
- **Tree (verify the node):** ID (ORCH-#####) · coarse region only · current fruit/classes + sensor list · last Harvest · Season uptime · device health · $JUICE rewards · DataLayer proof — all where available.
- **Expanded (trust & history):** reading history by class · signed-Harvest + verification · Season-by-Season uptime · sensor metadata/calibration · firmware/build (if public-safe) · DataLayer proof link · Pass binding (if public-safe) · known limitations/missing data.

## Open questions for Richard (carried from ORCH-013)
1. **Pressure** — its own pear class, or bundled under microclimate until it earns distinct value?
2. **GPS/location** — show as a fruit at all, or keep as device metadata to avoid implying exact location? *(Lead leans metadata, for privacy.)*

*Feeds node-state visuals (ORCH-014) and the `/atlas` build. Source: ChatGPT, ORCH-013.*
