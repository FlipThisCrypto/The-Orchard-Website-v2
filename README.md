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
> messaging, and a growth plan are all integrated.
>
> **Worldview is live on real data** at [worldview.theorchard.network](https://worldview.theorchard.network/):
> the globe reads the oracle directly, is keyboard- and screen-reader-navigable, loads its 3D engine
> off the critical path, survives a lost GPU context, and bounds what it draws as the network grows.
> The repo has a test suite and CI ([`node --test`](tests/)), response-header hardening, and a task
> board that regenerates deterministically. This is **Path 🅰** — the interim real-data page. The
> production Astro shell, tiled Atlas API and Grove-level LOD are still ahead, and Phase 4 (cutover)
> is not planned yet. The live v1 site is separate and untouched.

## See it live
- 🌳 **Worldview — the live Trees globe** — https://worldview.theorchard.network/ — real nodes,
  real readings, straight from the oracle. This is the one that matters.
- 🌍 **Globe proof-of-concept** — https://flipthiscrypto.github.io/The-Orchard-Website-v2/prototypes/globe-poc/ — the
  original throwaway prototype, on representative sample data. Superseded by Worldview.
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
tests/      node --test suite (worldview data logic + security controls)
```

## Regenerating the board

`tasks/tasks.json` is the only file to edit for tasks. After changing it:

```bash
node scripts/generate.mjs   # rebuilds tasks/TASKS.md and dashboard/data.js
```

The output is a pure function of `tasks.json` (no timestamps), so CI can — and does — verify the
generated files were not forgotten:

```bash
node scripts/generate.mjs --check
```

## Checks

One command runs everything this repo knows how to verify — tests, board sync, script versions,
syntax, and a secrets scan over the tree and all history:

```bash
node scripts/checks.mjs
```

This is the *only* definition of the gate: CI and the pre-commit hook both invoke it rather than
keeping their own lists, because when they kept their own lists the three drifted and the check none
of them shared is the one that broke. The hook runs `--fast` (about two seconds); CI runs the full
set including the history scan.

Add `--live` to also check that production is running this repo and that the oracle still publishes
what the page reads. Every script takes `--help`, and refuses a flag it doesn't recognise rather
than silently doing its default thing.

Just the tests — zero dependencies, Node's built-in runner, no install step:

```bash
node --test
```

Wire the same checks to your commits (tests, board sync, syntax) so a red tree can't be committed
by accident:

```bash
git config core.hooksPath scripts/hooks
```

Deployment is separate from CI: the Pages project is **direct-upload**, so a push deploys nothing.
To check whether production is actually running this repo (byte-exact, plus the security headers):

```bash
node scripts/check-deployed.mjs
```

And to check the live oracle still publishes what the page reads — field presence and type, plus
anything newly published that the page could be using:

```bash
node scripts/check-oracle.mjs
```

And to re-verify SECURITY.md's "no secrets" guarantee over every file that could reach a commit and
all of git history (CI runs this too, so it can't quietly rot):

```bash
node scripts/scan-secrets.mjs
```

Script URLs carry a hash of their file's contents so a deploy can't leave a browser on the old
script. It's derived, not typed — after editing any page script, run:

```bash
node scripts/stamp-assets.mjs
```

Covers the worldview data logic in [`worldview/orchard-data.js`](worldview/orchard-data.js) (fruit
classification, node-state thresholds, geohash decoding) and the untrusted-input controls that
`SECURITY.md` promises — escaping and Pass/geohash validation. CI runs the same command on every
push and pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Security

No secrets are stored in this repo, and Tree locations are shown only as **coarse (~5 km) regions** —
never precise GPS. See [`SECURITY.md`](SECURITY.md) for the disclosure policy and privacy model.

## License

Code is licensed **Apache-2.0** (see [`LICENSE`](LICENSE)), matching the main project — The Orchard
is built in the open and meant to be forkable. Brand assets, the $JUICE mark, and bundled
third-party libraries (e.g. `prototypes/globe-poc/vendor/`) are not covered by that license.
