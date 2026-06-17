**THE ORCHARD v2 - DELIVERABLE**

- **Task ID:** ORCH-014
- **Title:** Node-state & gamification model
- **Author:** ChatGPT
- **Version:** v1
- **Date:** 2026-06-17

### Sources used
1. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md - ground truth for Trees, Seasons, Harvests, privacy, cold start, and anti-hype ethos.
2. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/governance/roles/advisor-chatgpt.md - ChatGPT scope for gamification and node-state product rules.
3. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/fruit-data-legend.md - accepted rule that fruit freshness equals Harvest recency and node health/state is separate.
4. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/information-architecture.md - accepted `/atlas` role, Explorer hierarchy, privacy rules, and cold-start behavior.

### Assumptions & open questions
- **Assumption:** A Tree can expose enough public-safe health signals to distinguish heartbeat, last Harvest, Season uptime, and device health without revealing precise GPS or owner-private details.
- **Assumption:** The exact thresholds for idle, stale-data, offline, and abandoned depend on implementation and Season cadence; this deliverable defines the user-facing model, not numeric cutoffs.
- **Assumption:** "Failed" means detected fault or invalid submissions, while "offline" means absence of recent contact; those should not be collapsed.
- **Open question for the Lead/Richard:** Which signal is canonical for heartbeat: oracle check-in, signed Harvest arrival, device ping, or another public-safe status?
- **Open question for the Lead/Richard:** Should "abandoned" ever be shown publicly, or should the public UI use the softer "long offline" while owner/admin tools use abandoned?

### Deliverable

## Recommendation

Use Tree state to answer **"can this Tree be trusted right now?"** and fruit freshness to answer **"how recent is this data class?"** Those are related, but not the same. A Tree can be healthy while one fruit class is stale because a sensor missed a Harvest; a Tree can be offline while its last fruit still represents a real historical reading; a failed Tree should not look alive simply because old fruit exists.

The model should be honest and restrained. Gamification should reward real uptime, recovery, sensor diversity, and consistent Harvests across Seasons. It should never create fake density, fake motion, fake data, or a sense that the network is more alive than it is.

## State -> Signal -> Visual Mapping

| Tree state | Real signal basis | User meaning | Visual behavior | Fruit interaction |
|---|---|---|---|---|
| New growth | Recently registered/claimed Tree; not enough Season history yet | A newly planted Tree is joining the network | Small sprout/trunk, subtle new-growth ring, "new" badge in Explorer | Show configured fruit as pending or first-Harvest only; do not imply stable uptime yet |
| Healthy | Recent heartbeat/check-in, recent signed Harvests, acceptable device health, strong current Season uptime | This Tree is alive and contributing | Full Tree mark, steady glow, normal branch posture | Fruit uses ORCH-013 freshness normally; fresh fruit can look vivid if Harvests are recent |
| Idle | Heartbeat recent but no new Harvest for one or more expected intervals, or sensor class intentionally quiet | Device appears reachable, but data is not actively changing | Tree remains upright; glow is calm/low; no alarm styling | Fruit may be muted by freshness; Explorer explains whether idle is expected or missing data |
| Stale-data | Last Harvest is old beyond the expected recency window, but Tree is not confirmed offline | Data should be treated cautiously | Tree still present, with a thin "stale" outline or timestamp emphasis | Fruit visibly stale per ORCH-013; Tree state explains this is a data recency issue, not necessarily a dead device |
| Offline | No recent heartbeat/check-in and no recent Harvest; device health unknown | The Tree has stopped reporting for now | Dim Tree silhouette, no active pulse; still selectable | Fruit remains as historical data only, visually subdued; Explorer leads with last seen and last Harvest |
| Failed | Explicit fault, invalid signatures, sensor/device error, or rejected submissions | The Tree is reporting a problem or its data cannot be trusted | Error-marked Tree, crisp warning treatment, no celebratory effects | Fruit for affected classes should be suppressed or marked invalid; unaffected historical data remains inspectable |
| Withered - recovering | Previously offline/failed Tree has resumed heartbeat or partial Harvests, but has not rebuilt enough recent Season confidence | The Tree is coming back, but trust is not fully restored | Withered trunk beginning to brighten; recovery badge; minimal motion | Fruit reappears only for classes with valid recent Harvests; older fruit stays muted |
| Withered - abandoned | Long absence across multiple Seasons, no recovery signal, or owner/admin marks abandoned | Historical Tree, not part of current live network | Bare/dormant marker, low-contrast, visible only at closer zoom or filters | Fruit hidden by default or shown only in historical mode; do not count as live density |

## Signal Rules

Every state must be traceable to at least one real signal: heartbeat/check-in, last signed Harvest, current and recent Season uptime, device health, validation status, or owner/admin recovery marker. If a signal is missing, the UI should say "unknown" rather than inventing confidence.

State precedence should prevent ambiguity. **Failed** outranks healthy if validation or device fault exists. **Offline** outranks stale-data if heartbeat is absent. **Stale-data** is about Harvest recency. **Idle** is a reachable Tree with limited or intentionally quiet data. **Withered** is a longer-lived lifecycle state, not just a temporary stale moment.

## Honest Gamification

Gamification should make maintenance feel satisfying without overstating the network. Recommended mechanics:

- **Season streaks:** show completed uptime streaks only after a Season closes; no projected streaks.
- **Recovery credit:** celebrate a Tree returning from offline/failed to healthy after verified signals resume.
- **Stewardship badges:** recognize consistent uptime, sensor diversity, and contribution to sparse Groves, but keep badges secondary to data quality.
- **Grove health summaries:** show aggregate live/idle/offline composition so a Grove cannot look healthier than its Trees.
- **Builder prompts:** route offline/failed owner paths toward diagnostics, docs, or support, not shame.

Avoid mechanics that reward cosmetic activity, repeated manual refreshes, speculative future rewards, or fake "planting" markers that are not real Trees. Do not inflate live counts with demo Trees unless they are clearly labeled as demos.

## Reduced-Motion Behavior

Motion should be optional enhancement, never the only state cue. In reduced-motion mode:

- Replace pulses with static rings, badges, contrast, and timestamps.
- Keep healthy/idle/offline/failed distinguishable by shape, label, and Explorer text.
- Avoid looping growth or recovery animations; use a one-time state change marker or static "recovering" badge.
- Preserve all information in the Explorer so screen readers and low-motion users get the same state model.

## Interaction With Fruit Legend

Tree state controls the **container**; fruit controls the **data classes**. Fruit freshness remains Harvest recency. A healthy Tree can have one stale fruit if one sensor class has not updated. An offline Tree can retain historical fruit, but those fruit should be subdued and not counted as live data. A failed Tree should make invalid or suspect fruit clearly unavailable until valid signed Harvests return. A recovering Tree should grow back visually through verified data, not through time alone.

At Grove level, show both: "12 Trees: 8 healthy, 2 idle, 1 offline, 1 recovering" and "air quality, microclimate, humidity coverage." This keeps health and data composition legible without blending them.

### Self-check against the Definition of Done
- [x] State -> visual mapping table (clearly distinct from fruit freshness) - met
- [x] Each state tied to a real signal - met
- [x] Honest gamification (no misrepresentation of network liveliness) - met
- [x] Reduced-motion behavior + interaction with the fruit legend - met
- [x] Assumptions flagged; lexicon correct - met

### Proposed follow-ups
- The Lead should define exact state thresholds once heartbeat, Harvest cadence, and Season uptime fields are finalized.
- A later owner-dashboard task should specify private diagnostics for failed/offline Trees without exposing owner-only data publicly.
