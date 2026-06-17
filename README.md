# The Orchard — Website v2

The next-generation site for **[The Orchard](https://theorchard.network/)**, an open-source
environmental DePIN on the Chia blockchain. v2 is built around a **"living globe"**: a dark Earth
covered in Trees that bear fruit, where each fruit type encodes a class of sensor data — zoomable
from the whole planet down to a single node. It will eventually replace the current landing page.

This repo is **two things at once**: the v2 codebase, and the **operating system for the AI council**
that's building it — a small, repeatable method for many AIs to collaborate without colliding,
hallucinating, or drifting out of scope. If that part interests you, read
**[How we built this](docs/HOW-WE-BUILT-THIS.md)**.

> **Status:** Phase 1 (Direction) **complete** — positioning, personas, information architecture,
> the fruit/data legend, node-state model, competitor + data-buyer research, a v0 financial model,
> messaging, and a growth plan are all integrated. A globe **proof-of-concept is live** (below).
> Next: Phase 2 (the production build). The live v1 site is separate and untouched.

## See it live
- 🌍 **Globe proof-of-concept** — https://flipthiscrypto.github.io/The-Orchard-Website-v2/prototypes/globe-poc/
- 📊 **Mission-control dashboard** — https://flipthiscrypto.github.io/The-Orchard-Website-v2/dashboard/

## Start here

| If you are… | Read |
|---|---|
| **curious how this was built** | [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md) — the multi-AI collaboration tutorial |
| **anyone, first** | [`MISSION.md`](MISSION.md) — the one-page ground truth |
| **looking for the locked direction** | [`docs/PHASE-1-SYNTHESIS.md`](docs/PHASE-1-SYNTHESIS.md) — everything distilled into one brief |
| **running the project** | [`AGENTS.md`](AGENTS.md) — the operating manual |
| **an advisor (Grok / Gemini / ChatGPT)** | your guide in [`governance/roles/`](governance/roles/) |
| **watching progress** | the [dashboard](dashboard/index.html) · [`tasks/TASKS.md`](tasks/TASKS.md) |
| **tracing a decision** | [`governance/decisions/`](governance/decisions/) (ADRs) |
| **the architecture** | [`docs/architecture/`](docs/architecture/) (globe, performance, data/privacy) |
| **security** | [`SECURITY.md`](SECURITY.md) |

## How the council works (in brief)

- **Claude Code is the Lead** — the sole committer. It authors tasks, reviews every deliverable,
  and integrates accepted work.
- **Advisors** — **Grok** (Growth & Markets), **Gemini** (Research & Modeling), **ChatGPT**
  (Product & UX Strategy) — each produce one scoped deliverable per task, in their lane.
- **Richard** is founder + courier: relays Task Briefs out and deliverables back.
- **Two laws:** (1) only the Lead writes canonical files; (2) every task carries scope, grounding
  sources, and a Definition of Done — advisors cite sources, flag assumptions, never fabricate or
  expand scope. Full detail in [`AGENTS.md`](AGENTS.md) · the full story in [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md).

## Layout

```
MISSION.md  AGENTS.md            ground truth + operating manual
docs/HOW-WE-BUILT-THIS.md        the multi-AI collaboration tutorial
governance/ roles · workflow · templates · decisions (ADRs)
tasks/      tasks.json (source of truth) · TASKS.md · backlog.md
dashboard/  index.html (live progress) · data.js (generated)
council/    per-advisor workspace — briefs/ (instructions) + submissions/ (returned work)
docs/       product (ChatGPT) · research (Gemini) · growth (Grok) · architecture + brand (Lead)
prototypes/ globe-poc — the living-globe proof-of-concept
design/ app/   design assets · the Astro site (later phases)
scripts/    generate.mjs — rebuilds TASKS.md + data.js from tasks.json
```

## Regenerating the board

`tasks/tasks.json` is the only file to edit for tasks. After changing it:

```bash
node scripts/generate.mjs   # rebuilds tasks/TASKS.md and dashboard/data.js
```

## Security

No secrets are stored in this repo, and Tree locations are shown only as **coarse (~5 km) regions** —
never precise GPS. See [`SECURITY.md`](SECURITY.md) for the disclosure policy and privacy model.

## License

Code is licensed **Apache-2.0** (see [`LICENSE`](LICENSE)), matching the main project — The Orchard
is built in the open and meant to be forkable. Brand assets, the $JUICE mark, and bundled
third-party libraries (e.g. `prototypes/globe-poc/vendor/`) are not covered by that license.
