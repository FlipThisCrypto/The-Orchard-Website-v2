# Information Architecture & Sitemap

> Canonical product doc. Integrated by the Lead from ChatGPT's **ORCH-012**
> (`council/chatgpt/submissions/ORCH-012-v1.md`). Date: 2026-06-17.
> Anchored on the ratified positioning (ADR-0003), personas + primary action (ORCH-011).

## Recommendation
Make the living globe **both the homepage hero and a dedicated `/atlas` route.** The homepage uses
the globe as the emotional proof + orientation layer, then hands visitors to the primary action —
**Start a Tree readiness check.** `/atlas` is the full explorer (Trees, Groves, fruit/data classes,
uptime, proofs). This resolves the core tension: the globe is too central to hide behind a link,
but too heavy to carry every job on the homepage. Home answers *"what is this and what do I do
next?"* in 60 seconds; `/atlas` answers *"what's live, where, what data, can I trust it?"*

## Top-level sitemap
**Primary routes**
1. **`/` — Home / living overview** — orient everyone, establish the category, show a globe preview, route to readiness / `/atlas` / deeper explanation.
2. **`/atlas` — living globe / explorer** — full interactive globe: Trees, Groves, fruit/data legend, coarse public regions, Tree Explorer panels (uptime, sensors, history, rewards, DataLayer proof, device health). Proof surface, not setup.
3. **`/plant` — Tree readiness check** — the primary action route ("Can I plant, and what's my next step?"); routes to flash / claim / build docs / Pass status / later-interest.
4. **`/learn` — how it works** — durable SEO + non-crypto explainer: Trees, Harvests, Seasons, Groves, Keepers, Orchard Pass, $JUICE, Chia proofs, privacy, open-source.
5. **`/data` — data commons / evaluator path** — later-audience route (researchers, cities, farmers, insurers, educators); what data exists, what's verifiable, location precision, what's not ready yet. Honest + lightweight at launch.
6. **`/build` — open-source builder resources** — GitHub, firmware, drivers, setup docs, contribution + issue paths (overlaps `/plant`, serves builders who know the technical path).
7. **`/status` — network status / roadmap** — pre-alpha truth center: what's live, in development, known rough edges, roadmap, how to report issues.

**Utility routes**
8. **`/juice`** — $JUICE supports real infrastructure (not the ecosystem itself); basics, Season rewards, verification links.
9. **`/pass`** — Orchard Pass ownership credential; not the first impression.
10. **`/privacy`** — coarse public geohash; precise GPS owner-only/scrubbed.

## Navigation
Compact primary nav: **Atlas · Plant a Tree · Learn · Data · Build · Status.** Persistent CTA
**"Start readiness check"** — visible (header, home hero, after the first explainer, inside Explorer
panels) but not oversized; must not turn the homepage into a setup wizard. Footer: GitHub, X/community,
$JUICE, Pass, privacy, status.

## Globe ↔ site relationship — the globe has three jobs
1. **Wonder** — feel alive with ~3 Trees via clusters, coarse regions, intentional empty-state language (scarcity reads as early proof, not failure).
2. **Proof** — inspect real Trees/Groves: signed Harvests, uptime, device health, rewards, DataLayer proof.
3. **Routing** — every globe state offers a next step (plant, understand data, inspect privacy, learn).

The globe is **not the only way to navigate.** Anything essential for SEO/accessibility/comprehension
exists in normal page sections. Homepage loads a lightweight preview / low-cost fallback first; full
interaction lives on `/atlas`.

## Journey paths
- **Operator-builder:** home preview → live-but-early → "Start readiness check" → `/plant` → hardware/wallet/Pass/pre-alpha → flash/claim/build docs or missing-step list → `/status` or `/build`.
- **Data evaluator:** home → `/atlas` → inspect Tree/Grove (coarse location) → Explorer (uptime, sensors, history, device health, proof) → `/data` (limitations) → `/privacy` → follow/watch/request-later.
- **Curious explorer:** home → globe preview → fruit-legend teaser → `/learn` (the loop) → `/atlas` examples → footer/community/GitHub or readiness check.

## Progressive-disclosure rules
1. **One-minute comprehension first** — only the core loop (category; Trees measure; readings verified; operators earn $JUICE; privacy-preserving location).
2. **Action & proof second** — readiness, live examples, fruit/data classes, uptime/proof summaries; visitor chooses operator/evaluator/explorer intent.
3. **Technical depth third** — DataLayer, firmware/build, reward + Pass mechanics, raw proof/history behind explicit drill-downs.
4. **Performance** — page useful before the globe loads; key routes/copy/CTAs/privacy/readiness in HTML; full globe on `/atlas`; homepage preview degrades gracefully.
5. **Privacy** — never imply exact location; route map language through regions/Groves/coarse cells; privacy explainer near any map/export/evaluator path.
6. **Cold-start** — at 3 Trees emphasize "live pre-alpha network / help plant the next"; at 100k the same IA shifts emphasis to filtering/comparing/exploring Groves.

## Open questions for Richard (carried from ORCH-012)
1. Should `/atlas` launch with **only live Trees**, or include clearly-labeled demo/empty states so the 3-Tree cold start feels intentional?
2. Should the readiness check **capture non-technical supporters** at launch, or stay tightly focused on people who can plant now? *(Mirrors ORCH-011's open question.)*

*Feeds the fruit/data legend (ORCH-013) and the globe build (Phase 2/3). Source: ChatGPT, ORCH-012.*
