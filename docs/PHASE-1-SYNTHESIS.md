# Phase 1 Synthesis — Direction → Build

> The single coherent brief that distills all 12 Phase-1 deliverables into **locked direction** for
> the build. Maintained by the Lead. Each section links its source of truth. If you read one doc
> before building, read this.

---

## 1. What The Orchard is (LOCKED)
- **Positioning (ADR-0003):** *"By 2036, The Orchard is the community-owned environmental data
  infrastructure where people plant privacy-preserving Trees, verify real-world conditions through
  open hardware and Chia-backed proofs, and turn local sensing into a shared data network rewarded
  by $JUICE."* Category: **community-owned environmental data infrastructure** ("data commons" OK).
  Scope: environmental-led, **room to grow** (power/seismic/infra).
- **Legal posture (ADR-0004):** **NOT** run through Richard's existing 501(c)(3). Design for a
  standard (non-charity) entity; charity constraints don't apply. → [positioning-2036](product/positioning-2036.md)

## 2. Who, and the one action (LOCKED)
- **Primary persona:** the **crypto-native operator-builder** (can plant/test/break/report a Tree).
- **Primary 60-second action:** **"Start a Tree readiness check."**
- Secondary audiences (evaluators/explorers) served, not prioritized, at launch. → [personas-and-primary-action](product/personas-and-primary-action.md)

## 3. The experience (LOCKED)
- **Globe = homepage hero + dedicated `/atlas` route.** 10-route sitemap; progressive disclosure
  (1-min comprehension → action/proof → technical depth). → [information-architecture](product/information-architecture.md)
- **Fruit = data class** (🍊 temp · 🍇 particulates · 🍋 air quality · 🫐 humidity · 🍎 soil · 🍐 pressure ·
  ⭐ energy · 🟣 seismic). Type=class, quantity=count, size=coverage/confidence, freshness=Harvest
  recency. → [fruit-data-legend](product/fruit-data-legend.md)
- **Tree state = the container** (new growth → healthy → idle → stale → offline → failed →
  recovering → abandoned), each tied to a real signal. **State ≠ fruit freshness.** → [node-states-gamification](product/node-states-gamification.md)
- **Privacy everywhere:** coarse ~5 km geohash cells only; never exact GPS.

## 4. The market (REFERENCE)
- **Competitors:** borrow the transparent Explorer (our globe), geographic reward multipliers
  (GEODNET), BME + dual-issuance (Helium/DIMO); **keep ONE token**; avoid proprietary hardware. → [competitors](research/competitors.md)
- **Data buyers:** **air quality first**, microclimate second; two gates to a salable dataset —
  **latency** (epoch >5 min loses real-time buyers → focus analytics/insurance) and **calibration**. → [data-buyers-and-use-cases](research/data-buyers-and-use-cases.md)
- **Market pulse (2026-06-17):** "proof over promises" is rising; environmental is a **quiet lane** =
  our opening. Lean verification, not hype. → [depin-market-pulse](growth/depin-market-pulse.md)

## 5. The economics (v0 — REFERENCE, not committed)
- Streams: kits + data/API + Passes + services/licensing; **pivot to data revenue by ~Y5**.
- Reward model references: DIMO baseline+marketplace, Helium burn-and-mint. **All $JUICE allocation
  numbers are modeling assumptions — real tokenomics is a future Richard+Lead decision.** → [financial-model-v0](research/financial-model-v0.md)

## 6. Voice & growth (LOCKED enough to build copy from)
- **3 pillars:** verifiable data from accessible hardware · infrastructure-first (token supports the
  work) · built to be forked. Tagline: **GROW · CONNECT · EARN.** Anti-hype always. → [positioning-and-messaging](growth/positioning-and-messaging.md)
- **Growth:** GitHub-first, X light (2–4/wk), lean; globe hooks ("see your real Tree," "real density,"
  "fork the view"). → [community-and-growth-plan](growth/community-and-growth-plan.md)

## 7. The build spine (ADR-0002 + architecture)
- **deck.gl + MapLibre** globe; **three.js only at deep zoom**; **Cloudflare** (Workers/KV/D1/R2);
  **Astro islands** shell. Looks identical at 3 Trees or 100k. → [0001-atlas-globe](architecture/0001-atlas-globe.md)
- **Performance budget:** [performance-budget](architecture/performance-budget.md) (ORCH-041).
- **Data/privacy contract:** [atlas-data-privacy-contract](architecture/atlas-data-privacy-contract.md) (ORCH-042).

## 8. Open decisions still pending Richard (the queue)
From `tasks/backlog.md`: `/atlas` cold-start (live-only vs labeled demo) · ESG-vs-"verifiable
sensing" language · pressure = own fruit vs bundled · GPS as fruit vs metadata (Lead leans
metadata) · canonical heartbeat signal · show "abandoned" publicly vs "long offline" · **X handle** ·
**$JUICE tokenomics** · Y5 data-revenue pivot. None block the PoC.

## 9. What the PoC proves (ORCH-040)
A throwaway dark-globe prototype with the **3 real Trees**, auto-rotation, one data-flow pulse,
brand tokens, and a reduced-motion/no-WebGL fallback — **no backend.** It de-risks **render + look +
performance budget** before we wire the Cloudflare data layer. Everything above is the brief it's
built from.

*Last updated: 2026-06-17 · Lead. This doc is the bridge from Phase 1 (direction) to Phase 2 (design/build).*
