# How We Built This — a Multi-AI Collaboration Tutorial

> A behind-the-scenes account of how **four AIs and one human** designed The Orchard's v2 direction
> together — who did what, what came out of it, and a playbook so you can run the same process
> yourself. The Orchard is meant to be forkable; so is the *way* it's being built.

---

## 1. The problem this solves

Point several AI assistants at one project and you get three predictable failures:

1. **Collisions** — they edit the same things and overwrite each other.
2. **Hallucination** — they confidently invent facts, numbers, and links.
3. **Scope drift** — each wanders outside what it's good at.

We fixed all three with structure: **one Lead, clear lanes, and two hard rules.** No magic — just a
small operating system that any small team (human or AI) can copy.

## 2. The cast — who's who

| Seat | Who | Lane |
|---|---|---|
| **Founder / Owner / Courier** | **Richard** | Owns the vision and every direction decision; relays work between the Lead and advisors; ground truth on hardware & Chia. |
| **Lead Developer & Integrator** | **Claude Code** | The **only** one who writes to the repo. Authors tasks, reviews every deliverable, integrates accepted work, keeps the board + dashboard honest, synthesizes conflicts into decisions. |
| **Product & UX Strategy** | **ChatGPT** | What the experience *is*: positioning, personas, information architecture, the fruit→data legend, node-state model. |
| **Research & Modeling** | **Gemini** | The evidence base: competitor teardowns, data-buyer research, the financial model, compliance research — every figure sourced. |
| **Growth & Markets** | **Grok** | How it sounds and spreads: messaging pillars, community/growth plan, real-time market pulse. |

The lanes weren't arbitrary — they're the **consensus** the four AIs reached when each was asked
where the others were strongest. The only contested seat ("who synthesizes?") was assigned by
Richard to the Lead.

## 3. The two laws

Everything hangs on two enforceable rules (full text in [`../AGENTS.md`](../AGENTS.md)):

1. **Anti-collision** — *only the Lead writes canonical files.* Advisors produce **one deliverable
   per task, in their lane**. Raw work is filed under `council/<agent>/submissions/`; only the
   reviewed version reaches `docs/`.
2. **Anti-hallucination** — every task ships with **scope-in, scope-out, grounding sources, and a
   Definition of Done.** Advisors must cite sources, flag assumptions, and never fabricate or expand
   scope. Out-of-scope ideas get filed to the backlog, not built.

## 4. The workflow — one task, start to finish

```
Lead writes a Task Brief  ──▶  council/<agent>/briefs/ORCH-###.md   (scope, sources, Definition of Done)
        │   Richard pastes it to the assigned AI
        ▼
Advisor returns a Deliverable (strict template: sources used · assumptions · content · self-check)
        │   Richard pastes it back to the Lead
        ▼
Lead runs the review gate ──▶ pass: file raw copy + integrate into docs/ + commit + dashboard ticks up
                          └─▶ gaps: changes_requested with a numbered fix list → advisor revises
```

The contracts that make this repeatable live in [`../governance/templates/`](../governance/templates/):
the **Task Brief** (what goes out), the **Deliverable** (what comes back), and the **ADR** (how a
decision is recorded). The whole board is one file, `tasks/tasks.json`, which generates both the
human-readable `TASKS.md` and the live dashboard.

## 5. Who did what — the results

Phase 1 produced twelve advisor deliverables plus the Lead's foundation, architecture, and PoC.
Every item below is in the repo and links to its integrated home.

### ChatGPT — Product & UX Strategy
| Task | Output |
|---|---|
| ORCH-010 | [Positioning & category (2036)](product/positioning-2036.md) → *"community-owned environmental data infrastructure"* |
| ORCH-011 | [Personas + the single 60-second action](product/personas-and-primary-action.md) → primary action: **"Start a Tree readiness check"** |
| ORCH-012 | [Information architecture / sitemap](product/information-architecture.md) → globe as hero **+ `/atlas`**, 10 routes |
| ORCH-013 | [Fruit → data-class legend](product/fruit-data-legend.md) → the 8-fruit data language |
| ORCH-014 | [Node-state & gamification model](product/node-states-gamification.md) → 8 honest states |

### Gemini — Research & Modeling
| Task | Output |
|---|---|
| ORCH-020 | [DePIN competitor teardown](research/competitors.md) → 6 projects, fully sourced |
| ORCH-021 | [Data-buyers & use cases](research/data-buyers-and-use-cases.md) → air quality first; latency + calibration gates |
| ORCH-022 | [Financial model v0](research/financial-model-v0.md) → ~$90k → $1.05M → $5.97M (Y1/3/10) |
| ORCH-023 | [Nonprofit / compliance research](research/nonprofit-compliance.md) → token + charity should be separate entities |

### Grok — Growth & Markets
| Task | Output |
|---|---|
| ORCH-030 | [Positioning & messaging pillars](growth/positioning-and-messaging.md) → 3 pillars, keep GROW · CONNECT · EARN |
| ORCH-031 | [Community & growth plan](growth/community-and-growth-plan.md) → GitHub-first, lean, globe launch hooks |
| ORCH-032 | [Real-time DePIN market pulse](growth/depin-market-pulse.md) → "proof over promises"; environmental is a quiet lane |

### Claude Code — Lead (foundation, architecture, synthesis, build)
The coordination system itself (`AGENTS.md`, roles, templates, task board, dashboard); the
[brand & voice reference](brand/brand-and-voice.md); the [Atlas globe architecture](architecture/0001-atlas-globe.md),
[performance budget](architecture/performance-budget.md), and [data/privacy contract](architecture/atlas-data-privacy-contract.md);
the four decisions of record ([ADRs](../governance/decisions/)); the [Phase-1 synthesis](PHASE-1-SYNTHESIS.md);
and the live **[globe proof-of-concept](../prototypes/globe-poc/)**.

## 6. The decisions of record (ADRs)

| ADR | Decision |
|---|---|
| [0001](../governance/decisions/0001-coordination-model.md) | Courier + sole-committer model; the two laws |
| [0002](../governance/decisions/0002-tech-stack.md) | deck.gl + MapLibre + three.js (deep zoom) + Cloudflare + Astro islands |
| [0003](../governance/decisions/0003-positioning.md) | "Community-owned environmental data infrastructure" (ratified) |
| [0004](../governance/decisions/0004-legal-posture.md) | The Orchard is **not** run through the existing 501(c)(3) |

## 7. Results so far

- **Phase 1 (Direction): 100% complete** — 23 seeded tasks done across all three advisors + the Lead.
- A single **[synthesis brief](PHASE-1-SYNTHESIS.md)** distilling everything into locked build direction.
- A **live globe proof-of-concept** (dark Earth, the real Trees, fruit-as-data, click-to-inspect) and a
  **live mission-control dashboard** — both on GitHub Pages.
- Notably, the three advisors **independently converged** on the same spine — *infrastructure first,
  the token supports it, show real density not fake* — a strong signal the direction is coherent.

## 8. Replicate it — the playbook

Want to run your own AI council? The whole skeleton is in this repo; here's the recipe:

1. **Write the ground truth** (`MISSION.md`) — one page every advisor reads first.
2. **Write the operating manual** (`AGENTS.md`) — roles, the two laws, the task lifecycle.
3. **Assign lanes** — give each AI the job it's strongest at; write a one-page guide per seat.
4. **Make contracts** — a Task Brief template and a Deliverable template. Self-contained, every time.
5. **Single source of truth for work** — one `tasks.json`; generate the human view + a dashboard from it.
6. **Run the loop** — Lead authors a scoped brief → courier relays → advisor returns → Lead gates →
   integrate → dashboard moves. One active task per advisor.
7. **Synthesize** — the Lead reconciles conflicts into decisions (ADRs); the human ratifies direction.

## 9. Honest lessons

- **A single Lead is the unlock.** "Only one writer" eliminated collisions entirely.
- **Definition-of-Done beats trust.** Grading each deliverable against an explicit checklist caught
  gaps and kept everyone in-scope.
- **Sources or it didn't happen.** Forcing citations made the research genuinely usable; estimates
  were labeled as estimates.
- **The process slipped, and we tightened it.** Twice, a bulk `git add` swept in advisor files before
  they'd passed the gate; the fix was to inventory and review submissions *before* every commit.
- **Humans still catch what tools miss.** A blank legend icon (a 2020 emoji absent from one OS) was
  spotted by Richard, not the machines — and fixed with font-independent colored swatches.
- **Transparency compounds.** Logging decisions as ADRs and keeping the dashboard honest meant
  anyone could see exactly where things stood, at any time.

*Last updated: 2026-06-17 · maintained by the Lead.*
