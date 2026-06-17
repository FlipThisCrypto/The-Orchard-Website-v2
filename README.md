# The Orchard — Website v2

The next-generation site for **[The Orchard](https://theorchard.network/)**, an open-source
environmental DePIN on the Chia blockchain. v2 is built around a **"living globe"**: a dark Earth
covered in Trees that bear fruit, where each fruit type encodes a class of sensor data — zoomable
from the whole planet down to a single node. It will eventually replace the current landing page.

This repo is **two things at once**: the v2 codebase, and the **operating system for the AI
council** that's building it. Work is produced by advisors, integrated by a single Lead.

> **Status:** Phase 0 (Foundation) — the coordination system is in place; direction work
> (Phase 1) is next. The live v1 site is separate and untouched.

## Start here

| If you are… | Read |
|---|---|
| **anyone, first** | [`MISSION.md`](MISSION.md) — the one-page ground truth |
| **running the project** | [`AGENTS.md`](AGENTS.md) — the operating manual |
| **an advisor (Grok / Gemini / ChatGPT)** | your guide in [`governance/roles/`](governance/roles/) |
| **watching progress** | [`dashboard/index.html`](dashboard/index.html) (live) · [`tasks/TASKS.md`](tasks/TASKS.md) |
| **tracing a decision** | [`governance/decisions/`](governance/decisions/) (ADRs) |
| **the architecture** | [`docs/architecture/0001-atlas-globe.md`](docs/architecture/0001-atlas-globe.md) |

## How the council works (in brief)

- **Claude Code is the Lead** — the sole committer. It authors tasks, reviews every deliverable,
  and integrates accepted work.
- **Advisors** — **Grok** (Growth & Markets), **Gemini** (Research & Modeling), **ChatGPT**
  (Product & UX Strategy) — each produce one scoped deliverable per task, in their lane.
- **Richard** is founder + courier: relays Task Briefs out and deliverables back.
- **Two laws:** (1) only the Lead writes canonical files; (2) every task carries scope, grounding
  sources, and a Definition of Done — advisors cite sources, flag assumptions, never fabricate or
  expand scope. Full detail in [`AGENTS.md`](AGENTS.md).

## Layout

```
MISSION.md  AGENTS.md            ground truth + operating manual
governance/ roles · workflow · templates · decisions (ADRs)
tasks/      tasks.json (source of truth) · TASKS.md · backlog.md
dashboard/  index.html (live progress) · data.js (generated)
council/    per-advisor workspace — briefs/ (instructions) + submissions/ (returned work)
docs/       product (ChatGPT) · research (Gemini) · growth (Grok) · architecture + brand (Lead)
design/ prototypes/ app/   design assets · experiments · the Astro site (later phases)
scripts/    generate.mjs — rebuilds TASKS.md + data.js from tasks.json
```

## Regenerating the board

`tasks/tasks.json` is the only file to edit for tasks. After changing it:

```bash
node scripts/generate.mjs   # rebuilds tasks/TASKS.md and dashboard/data.js
```

## License

Intended to match the main project (Apache-2.0). The Orchard is built in the open and meant to be
forkable. Brand assets and the $JUICE mark are not covered by the code license.
