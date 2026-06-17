**THE ORCHARD v2 - DELIVERABLE**

- **Task ID:** ORCH-012
- **Title:** Information architecture / sitemap + progressive disclosure
- **Author:** ChatGPT
- **Version:** v1
- **Date:** 2026-06-17

### Sources used
1. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md - ground truth for the living globe, privacy model, cold-start constraint, lexicon, and anti-hype/open-source ethos.
2. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/governance/roles/advisor-chatgpt.md - Product/UX scope for information architecture, journeys, and progressive disclosure.
3. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/positioning-2036.md - ratified positioning and category: community-owned environmental data infrastructure.
4. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/personas-and-primary-action.md - primary persona, ranked personas, and primary 60-second action.
5. https://theorchard.network/ - current public v1 structure, pre-alpha framing, "Plant a Tree," "View Live Trees," GitHub, and current get-started flow.

### Assumptions & open questions
- **Assumption:** The v2 site can support a homepage and a dedicated globe route without making two separate products; the homepage uses the globe as an entry point, while `/atlas` is the deeper explorer.
- **Assumption:** "Start Tree readiness check" can be implemented as a short flow, modal, or route later; this deliverable only defines placement and IA behavior.
- **Assumption:** SEO matters enough that critical explanations should exist as normal HTML content outside the globe/canvas layer.
- **Open question for the Lead/Richard:** Should `/atlas` launch immediately with only live Trees, or include clearly labeled demo/empty states to make the 3-Tree cold start feel intentional?
- **Open question for the Lead/Richard:** Should the readiness check include non-technical capture at launch, or keep launch conversion tightly focused on people who can plant now?

### Deliverable

## Recommendation

Make the globe both the **homepage hero** and a dedicated **`/atlas` route**. The homepage should use the living globe as the emotional proof surface and orientation layer, then quickly hand visitors to the primary action: **Start Tree readiness check**. The dedicated `/atlas` route should be the full Orchard map/explorer experience for people who want to inspect Trees, Groves, fruit/data classes, uptime, and proofs.

This solves the main tension: the globe is too central to hide behind a link, but too heavy and exploratory to carry every job on the homepage. The homepage must answer "what is this and what should I do next?" within 60 seconds. `/atlas` can answer "what is live, where are the Groves, what data exists, and can I trust it?"

## Top-Level Sitemap

**Primary routes**

1. **`/` - Home / Living overview**  
   Purpose: orient all visitors, establish The Orchard as community-owned environmental data infrastructure, show the globe preview, and route to Tree readiness, `/atlas`, and deeper explanation.

2. **`/atlas` - Living globe / Orchard explorer**  
   Purpose: full interactive globe. Shows Trees, Groves, fruit/data legend, coarse public regions, Tree Explorer panels, uptime, sensors, history, rewards, DataLayer proof, and device health. This is the proof surface, not the setup flow.

3. **`/plant` - Tree readiness check**  
   Purpose: the primary action route. Helps visitors answer "Can I plant a Tree, and what is my next step?" It can route to firmware flashing, claiming, build requirements, Pass status, or a later-interest path.

4. **`/learn` - How The Orchard works**  
   Purpose: durable explanation for SEO and non-crypto visitors: Trees, Harvests, Seasons, Groves, Keepers, Orchard Pass, $JUICE, Chia proofs, privacy, and open-source model.

5. **`/data` - Data commons / evaluator path**  
   Purpose: later-audience route for researchers, cities, farmers, insurers, educators, and environmental groups. It should explain what data exists, what is verifiable, what public location precision means, and what is not ready yet. At launch, it can be honest and lightweight.

6. **`/build` - Open-source builder resources**  
   Purpose: route to GitHub, firmware, sensor drivers, setup docs, contribution entry points, and issue/reporting paths. This overlaps with `/plant` but serves builders who already know they want the technical path.

7. **`/status` - Network status / roadmap**  
   Purpose: pre-alpha truth center. Shows what is live, what is in active development, known rough edges, roadmap stages, and how to report issues.

**Utility routes**

8. **`/juice` - $JUICE and rewards**  
   Purpose: explain $JUICE as support for real infrastructure, not the ecosystem itself. Include token basics, Season rewards, and links to verification.

9. **`/pass` - Orchard Pass**  
   Purpose: explain ownership credential and its role in binding Trees, without making NFT mechanics the first impression.

10. **`/privacy` - Location and data privacy**  
   Purpose: clear policy-level explanation that public location is coarse geohash and precise GPS is owner-only/scrubbed server-side.

## Navigation

Use a compact primary nav:

- **Atlas**
- **Plant a Tree**
- **Learn**
- **Data**
- **Build**
- **Status**

Persistent primary CTA: **Start readiness check**. Keep it visible but not oversized. It should appear in the header, near the home hero, after the first explanation section, and inside relevant Tree/Grove Explorer panels. It should not turn the whole homepage into a setup wizard.

Secondary footer links: GitHub, X/community, $JUICE, Orchard Pass, privacy, roadmap/status, live v1 or legacy links if needed.

## Globe and Site Relationship

The globe has three jobs:

1. **Wonder:** Make The Orchard feel alive even with roughly 3 Trees. Use clusters, coarse regions, and intentional empty-state language so scarcity reads as early proof, not failure.
2. **Proof:** Let visitors inspect real Trees/Groves and see signed Harvests, uptime, device health, rewards, and DataLayer proof where available.
3. **Routing:** Every globe state should offer a next step: plant a Tree, understand the data, inspect privacy, or learn the system.

The globe should not be the only way to navigate. Anything essential for SEO, accessibility, or comprehension should exist in normal page sections and routes. The homepage can load a lightweight globe preview or static/low-cost fallback first, with full interaction available on `/atlas`.

## Journey Paths

**Operator-builder path**  
Home globe preview -> sees live-but-early network -> "Start readiness check" -> `/plant` -> hardware/wallet/Pass/pre-alpha readiness -> flash, claim, build docs, or missing-step list -> `/status` or `/build` for follow-through.

**Data evaluator path**  
Home -> `/atlas` -> inspect Tree/Grove at coarse public location -> Explorer panel with uptime, sensors, history, device health, and DataLayer proof -> `/data` for data commons explanation and limitations -> `/privacy` if location confidence matters -> follow/watch/request later path when available.

**Curious explorer path**  
Home -> globe preview -> fruit legend teaser -> `/learn` for simple loop: plant Trees, Harvest readings, prove uptime, earn $JUICE -> `/atlas` to see real examples -> footer/community/GitHub or readiness check if motivated.

## Progressive Disclosure Rules

1. **First layer: one-minute comprehension.**  
   Show only the core loop: The Orchard is community-owned environmental data infrastructure; Trees measure the real world; readings are verified; operators earn $JUICE; public location is privacy-preserving.

2. **Second layer: action and proof.**  
   Reveal Tree readiness, live Tree/Grove examples, fruit/data classes, uptime, sensors, and proof summaries. This is where the visitor chooses operator, evaluator, or explorer intent.

3. **Third layer: technical depth.**  
   Put Chia DataLayer details, firmware/build specifics, reward mechanics, Orchard Pass mechanics, and raw proof/history behind explicit drill-downs. Do not force non-crypto visitors through this to understand the project.

4. **Performance rule.**  
   The page must remain useful before the globe fully loads. Key routes, copy, CTAs, privacy explanation, and Tree readiness entry must be available in HTML/normal UI. The full globe belongs on `/atlas`; the homepage preview should degrade gracefully.

5. **Privacy rule.**  
   Never imply exact Tree location. Route all map/explorer language through regions, Groves, or coarse public cells. Put privacy explanation close to any map, data export, or evaluator path.

6. **Cold-start rule.**  
   With 3 Trees, emphasize "live pre-alpha network" and "help plant the next Trees." At 100,000 Trees, the same IA should scale by shifting emphasis from planting scarcity to filtering, comparing, and exploring Groves.

### Self-check against the Definition of Done
- [x] Sitemap with sections/routes and nav - met
- [x] Globe-vs-site relationship defined - met
- [x] Paths for all 3 personas/journeys - met
- [x] Primary-action placement - met
- [x] Progressive-disclosure rules; respects performance + SEO constraints - met
- [x] Sources cited; assumptions & open questions flagged; lexicon correct - met

### Proposed follow-ups
- ORCH-013 should define the fruit-to-data legend and Tree/Grove Explorer information hierarchy so `/atlas` has a crisp data model.
- The Lead should decide whether the homepage globe preview is live, sampled, or static fallback-first based on performance constraints.
