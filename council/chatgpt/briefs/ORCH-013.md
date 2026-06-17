# THE ORCHARD v2 — TASK BRIEF

- **Task ID:** ORCH-013
- **Title:** Fruit → data-class legend + Explorer info hierarchy
- **Assigned to:** ChatGPT — Product & UX Strategy advisor.
- **Priority:** P1
- **Return as:** a Deliverable in the [deliverable template](../../../governance/templates/deliverable.md). Filed to `council/chatgpt/submissions/`, integrated into `docs/product/fruit-data-legend.md`.

## Before you start, read in full
1. [`MISSION.md`](../../../MISSION.md) — https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md
2. Your role guide — https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/governance/roles/advisor-chatgpt.md
3. **Your IA (ORCH-012)** — https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/information-architecture.md
4. **Gemini's data-buyer research (ORCH-021)** — https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/research/data-buyers-and-use-cases.md (note: Gemini *illustratively* mapped grapes=particulates, lemons=VOCs, oranges=temp, blueberries=humidity — reconcile into ONE canonical legend)
5. Vision (sensor types) — https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/VISION.md

## Context
The globe's fruit is **information architecture, not decoration.** `/atlas` needs a crisp data model.
Define the **canonical** fruit→data-class legend and the Tree/Grove Explorer info hierarchy, and
reconcile Gemini's illustrative mapping into one source of truth.

## Scope — IN
- **Fruit → data-class legend** — which fruit = which sensor/data class (ground in plausible sensor types; flag any you're inferring). One single orange = one sensor; a cluster (grapes) = multi-sensor, etc.
- **Encoding rules** — how **size / color / freshness / quantity** encode real metrics (recency, count, value, health). Keep it legible — rules that prevent clutter at high density.
- **Scale rules** — how the legend reads at 3 Trees and still works at 100,000 (LOD-friendly).
- **Explorer info hierarchy** — what fields show at Grove level vs. Tree level vs. expanded (uptime, sensors, history, rewards, DataLayer proof, device health), consistent with privacy (coarse location only).

## Scope — OUT (hand back)
- 3D/rendering implementation and exact hex values (Lead / brand). - Node *state* visuals — offline/withered/etc. (that's ORCH-014, next). - Sitemap (done, ORCH-012).

## Deliverable
Markdown, Deliverable template, **~800–1,200 words** + a legend table. Becomes `docs/product/fruit-data-legend.md`.

## Definition of Done
- [ ] Fruit→data-class legend table (reconciles Gemini's illustrative mapping)
- [ ] Encoding rules for size/color/freshness/quantity → real metrics
- [ ] Legibility + 3→100k scale rules
- [ ] Tree/Grove Explorer info hierarchy (privacy-consistent)
- [ ] Maps only to plausible sensor types; assumptions flagged; lexicon correct

**Rules:** one deliverable, your lane only. Recommend, don't just enumerate. No fabrication, no scope creep. Out-of-scope ideas → "Proposed follow-ups."
