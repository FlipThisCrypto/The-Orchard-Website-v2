**THE ORCHARD v2 - DELIVERABLE**

- **Task ID:** ORCH-013
- **Title:** Fruit -> data-class legend + Explorer info hierarchy
- **Author:** ChatGPT
- **Version:** v1
- **Date:** 2026-06-17

### Sources used
1. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md - living globe requirements, example fruit language, privacy model, cold-start constraint, and lexicon.
2. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/governance/roles/advisor-chatgpt.md - ChatGPT scope for gamification, fruit-to-data spec, and information hierarchy.
3. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/information-architecture.md - accepted `/atlas` role, progressive disclosure rules, and Explorer expectations.
4. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/research/data-buyers-and-use-cases.md - buyer/use-case priority: air quality first, microclimate second, pressure bundled.
5. https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/VISION.md - long-term plausible device/data types: ESP32-S3, weather stations, environmental sensors, GPS modules, power/current sensors, geophones, air quality, weather, seismic, energy usage, uptime telemetry, citizen science.

### Assumptions & open questions
- **Assumption:** "Orange = one sensor" from MISSION.md should be preserved as the generic unit metaphor, while Gemini's illustrative "oranges = temp" can become the default MVP interpretation for a single microclimate sensor.
- **Assumption:** Water, soil, energy, and seismic classes are future-ready legend entries, not claims that those sensors are live today.
- **Assumption:** Exact thresholds for "fresh," "recent," or "stale" depend on Season cadence and sensor type; this deliverable defines UX semantics, not numeric cutoffs.
- **Open question for the Lead/Richard:** Should pressure be visible as its own pear/fruit class, or remain bundled under microclimate until there is enough pressure-specific value to expose?
- **Open question for the Lead/Richard:** Should GPS/location capability appear as a fruit at all, or stay as device metadata to avoid implying exact public location?

### Deliverable

## Recommendation

Use fruit type for **data class**, quantity for **how much evidence exists**, freshness for **how recent the last Harvest is**, and Explorer panels for details. The legend should lead with buyer-relevant classes without pretending the network already has every sensor live. Air quality and microclimate should be first-class from launch; soil, water, energy, and seismic should be future-ready but clearly labeled when absent.

The key reconciliation: keep **orange as the single-sensor unit** and make its launch meaning **temperature / basic microclimate**. Grapes become the visible "multi-sensor cluster" sign, not a particulate-specific fruit. Gemini's air-quality emphasis is better expressed by lemons and grapes together: lemons for air-quality gases/indices, grapes for particulate clusters where multiple small readings naturally feel clustered.

## Canonical Fruit -> Data-Class Legend

| Fruit | Canonical data class | Typical sensor/readings | Status in legend | Notes |
|---|---|---|---|---|
| Orange | Single sensor / temperature-first microclimate | Temperature; default one-channel environmental sensor | Launch core | One orange means one active sensor channel. For MVP, use temperature as the default orange meaning because Gemini mapped oranges to temp and microclimate is a strong fit. |
| Grapes | Multi-sensor cluster / particulates | PM1, PM2.5, PM10, or any tightly related multi-reading cluster | Launch core for air quality, general multi-sensor grammar | Reconciles MISSION.md "grapes = multi-sensor cluster" with Gemini's illustrative "grapes = particulates." At Tree level, grapes mean a clustered sensor package; at Grove level, they can summarize many Trees with the same class. |
| Lemon | Air quality gases / air-quality index | VOCs, NO2, CO2-equivalent, gas/air-quality sensor output | Launch priority if available | Keeps MISSION.md "lemon = air quality" and Gemini's "lemons = VOCs." Lemon should be the plain-language air-quality fruit; grapes can show particulate substructure. |
| Blueberry | Humidity / water-adjacent moisture | Relative humidity now; rainfall/water quality later if supported | Launch/future bridge | Reconciles Gemini "blueberries = humidity" with MISSION.md "blueberry = water." Treat humidity as atmospheric water now; reserve expanded water uses for later labels. |
| Apple | Soil / land conditions | Soil moisture, soil temperature, soil conductivity, growing conditions | Future-ready | Plausible for farms, educators, citizen science. Do not show as live unless a Tree has soil sensors. |
| Pear | Pressure / baseline atmosphere | Barometric pressure, pressure trend | Optional/bundled | Gemini says pressure is useful but not a lead use case. Pear can exist in the legend but should stay visually quiet or bundled under microclimate until needed. |
| Starfruit | Energy / infrastructure telemetry | Power/current, solar production, uptime telemetry beyond device health | Future-ready | Grounded in VISION.md broader telemetry. Use only when The Orchard expands beyond environmental-led sensing. |
| Plum | Seismic / ground motion | Geophone, vibration, seismic readings | Future-ready | Long-term scientific class from VISION.md. Keep out of launch prominence. |

## Encoding Rules

**Type = data class.** Fruit type must always answer "what kind of data is this?" Do not use fruit type for owner status, rewards, or marketing decoration.

**Quantity = count.** On a Tree, fruit count means active sensor channels or distinct readings in that class. In a Grove, fruit count means contributing Trees or aggregated sensor coverage, capped visually so large Groves do not become cluttered. When exact count is hidden at high density, show a numeric badge or rollup in the Explorer.

**Size = coverage/confidence, not hype.** At Tree level, fruit size should reflect sensor confidence or completeness where available, not raw value. At Grove level, size should reflect number of contributing Trees or recent Harvest density. Avoid mapping size directly to pollution/temperature values because it can make normal variation look like alarm.

**Color = fruit identity plus value band.** Keep each fruit recognizable. If value bands are needed, use subtle within-fruit treatments such as tint, glow, or ring intensity. Exact colors belong to Lead/brand, but the UX rule is: color should never make a lemon look like an apple.

**Freshness = recency of Harvest.** Fresh fruit means recent Harvest; muted/dim fruit means older Harvest. This is about data recency only, not full node health. Offline/withered/failure visuals are out of scope for ORCH-013 and should be handled in ORCH-014.

**Proof = inspectable, not always visible.** Do not overload the fruit with proof icons at map scale. Show proof status in hover/summary and Explorer: signed reading, Season uptime, DataLayer proof when available.

## Scale Rules: 3 Trees -> 100,000

At **3 Trees**, show individual Trees proudly. Each Tree can display a small curated branch of fruit with labels or tooltips. The experience should read as "live pre-alpha network" and "help plant the next Trees," not as an empty world.

At **dozens to hundreds**, group nearby Trees into Groves. Grove fruit should summarize dominant data classes: for example, a Grove with many air-quality Trees can show lemons/grapes first, with a count badge.

At **thousands to 100,000**, use level-of-detail rules: globe view shows Grove density and dominant classes; regional zoom shows Grove composition; local zoom shows individual Trees; Explorer contains exact counts and history. Never render every fruit at global scale.

Always preserve privacy. Public map positions should represent coarse regions or geohash cells, never exact GPS. Fruit should attach to the Tree/Grove public representation, not to precise device coordinates.

## Explorer Info Hierarchy

**Grove level - scan first**
- Grove name/region using coarse public location
- Tree count and active sensor-class mix
- Dominant fruit classes and last Harvest recency
- Aggregate uptime across current/recent Seasons
- Coverage note: live pre-alpha, sparse, or dense
- CTA: inspect Trees, view data classes, or start Tree readiness check

**Tree level - verify the node**
- Tree ID, e.g. ORCH-00427
- Coarse region only; no exact GPS
- Current fruit/data classes and sensor list
- Last Harvest timestamp/recency
- Season uptime summary
- Device health summary
- Rewards summary in $JUICE where available
- DataLayer proof summary where available

**Expanded Tree detail - trust and history**
- Reading history by data class
- Signed Harvest details and verification status
- Season-by-Season uptime
- Sensor metadata and calibration notes when available
- Device firmware/build info if public-safe
- DataLayer proof/link/reference
- Orchard Pass binding if public-safe and appropriate
- Known limitations or missing data

### Self-check against the Definition of Done
- [x] Fruit->data-class legend table (reconciles Gemini's illustrative mapping) - met
- [x] Encoding rules for size/color/freshness/quantity -> real metrics - met
- [x] Legibility + 3->100k scale rules - met
- [x] Tree/Grove Explorer info hierarchy (privacy-consistent) - met
- [x] Maps only to plausible sensor types; assumptions flagged; lexicon correct - met

### Proposed follow-ups
- ORCH-014 should define health/state visuals separately so freshness, offline, failed, and withered do not collapse into one vague visual language.
- A later data-quality task should define calibration/confidence labels before buyer-facing claims are made in `/data`.
