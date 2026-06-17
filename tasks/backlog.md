# Backlog — parked & out-of-scope ideas

> The parking lot. Advisors never build these; they file them via "Proposed follow-ups." The Lead
> triages here, then promotes the worthy ones into `tasks.json` when their phase arrives.
> Not a commitment — a memory.

## Seeded by the Lead (things deliberately deferred from Phase 0/1)

| Idea | Why it matters | Likely phase / owner |
|---|---|---|
| Accessibility (WCAG 2.1 AA) pass | Decade-long, global, public-good network — a11y from the start, not retrofit | 2 / Lead + ChatGPT |
| Internationalization (i18n) plan | Global network → multi-language eventually; cheap to plan now, painful later | 2 / ChatGPT |
| Content/CMS strategy | Over years: blog, docs, governance posts, research — static vs. headless CMS | 2 / Lead |
| North-star metric + analytics | "How do we know the site works?" Define before launch | 1–2 / ChatGPT |
| "Forkable site" angle | VISION.md says the whole project is meant to be forkable — could the site template be too? | later / Lead |
| Data marketplace / API storefront | A future revenue surface once data volume justifies it | 3+ / Gemini + Lead |
| Hardware store / Tree kits storefront | Frictionless onboarding + early capital (per council) | 3+ / ChatGPT + Lead |
| Governance & DAO surface | If $JUICE/Passes gain governance, the site needs a home for it | later / ChatGPT |
| Exit-readiness narrative | What an acquirer buys (the network/data/trust) shapes how we present it | later / Gemini + Grok |

## From Phase 1 — round 1 (triaged 2026-06-17)

| Idea | Source | Why | Phase / owner |
|---|---|---|---|
| ~~Decisions: data-commons + scope~~ | ChatGPT ORCH-010 | ✅ Resolved 2026-06-17 → ADR-0003 (data commons OK; environmental-led, room to grow) | done |
| Validate category distinctiveness vs DePIN/IoT/climate/weather | ChatGPT ORCH-010 | Confirm "community-owned environmental data infrastructure" is ownable | 1 / Gemini |
| Apply DIMO Baseline+Marketplace & Helium BME to $JUICE | Gemini ORCH-020 | Reward-model design input | feeds ORCH-022 / Gemini |
| Geographic reward multipliers for critical ecological zones | Gemini ORCH-020 (GEODNET SuperHex) | Direct deployment where data matters | later / ChatGPT+Lead |
| Fiat-abstracted B2B data buying (card → burn $JUICE) | Gemini ORCH-020 (Render) | Let Web2 firms buy data easily | 3+ / Lead+Gemini |
| Tagline A/B test in Discord/X before copy freeze | Grok ORCH-030 | Validate before v2 launch | 2 / Grok |
| "Globe-first" headline variants once globe is interactive | Grok ORCH-030 | The viz becomes a new message surface | 2 / Grok |
| Real operator/tester quotes for social proof | Grok ORCH-030 | Credibility for the pillars | 2 / Grok |

## From Phase 1 — round 2 (triaged 2026-06-17)

| Idea | Source | Why | Phase / owner |
|---|---|---|---|
| **Decision: X handle + who posts** | Grok ORCH-031 | Pick @handle (e.g. @theorchard) and posting owner before heavy posting | 1 / Richard |
| **Decision: seed Discord now or after ~5–10 active Trees** | Grok ORCH-031 | Avoid premature moderation overhead | 1 / Richard |
| Involve Genesis Pass holders in ambassador/tester design | Grok ORCH-031 | First-class participants shape mechanics | 2 / Grok+Richard |
| Primary-action design: immediate planters vs capturing non-tech supporters; is Pass required first? | ChatGPT ORCH-011 | Shapes the funnel | feeds ORCH-012 / ChatGPT |
| Hardware calibration pipeline (assure B2B data quality) | Gemini ORCH-021 | Buyers won't buy uncalibrated ESP32 data | main project / hardware+Lead |
| Latency vs. buyer segment (epoch >5min loses real-time algo buyers) | Gemini ORCH-021 | Architectural input; focus analytics/insurance | feeds ORCH-022 + architecture |
| Reconcile fruit→data mapping (Gemini illustrated) with the canonical legend | Gemini ORCH-021 / ChatGPT ORCH-013 | One source of truth for the legend | feeds ORCH-013 / ChatGPT |

## From Phase 1 — round 3 (triaged 2026-06-17)

| Idea | Source | Why | Phase / owner |
|---|---|---|---|
| **Decision: /atlas cold-start — live Trees only vs. labeled demo/empty states** | ChatGPT ORCH-012 | Make 3-Tree start feel intentional without faking density | 2 / Richard+Lead |
| **Decision: ESG/compliance language lean** (env-data-for-ESG vs. pure "verifiable sensing") | Grok ORCH-032 | Affects positioning emphasis | 2 / Richard |
| **$JUICE allocation/issuance is UNDECIDED** — model assumed 40M pool / 30% burn | Gemini ORCH-022 | Don't let modeling assumptions calcify into tokenomics | later / Richard+Lead |
| Design toward a **Y5 pivot to data revenue** (hardware saturates) | Gemini ORCH-022 | Solvency depends on B2B data by ~Y5 | strategy / Lead |
| $JUICE emissions decay curve over 520 weeks | Gemini ORCH-022 | Ensure reward pool lasts to Y10 | later / Gemini |
| Reference others' tactics in X threads ("what others are testing") | Grok ORCH-032 | Show awareness without copying | 2 / Grok |

## How to use this file

- One row per idea: **what** + **why** + a guess at phase/owner.
- When promoting: create the full task in `tasks.json` (scope, sources, DoD), then strike it here.
- When killing: move to a "Declined" note with a one-line reason (so we don't relitigate).
