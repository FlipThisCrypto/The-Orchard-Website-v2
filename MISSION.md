# MISSION.md — Read this first

> **Every advisor reads this file before every task.** It is the shared ground truth.
> One page. If something you're about to write contradicts this file, stop and flag it.

---

## What The Orchard is

The Orchard is an **open-source environmental DePIN on the Chia blockchain**. People deploy
low-cost ESP32 devices — called **Trees** — that measure the real world (air quality,
temperature, humidity, pressure, GPS, particulates, and more over time), cryptographically
**sign** their readings, prove their **uptime** on-chain via the **Chia DataLayer**, and earn
their operators **$JUICE**.

The ethos is fixed and non-negotiable in tone:

- **Hardware-first. Infrastructure-first. Learning-first. Open-source-first.**
- **The token supports the ecosystem instead of *being* the ecosystem.**
- Anti-hype. Built in the open. "Pre-alpha, expect rough edges, tell us what breaks."

If it's truly the world's most valuable asset in 2036, it's because it became **the world's
largest community-owned environmental data network** — not because of a token price.

**Positioning (ratified 2026-06-17 · ADR-0003):** *"By 2036, The Orchard is the community-owned
environmental data infrastructure where people plant privacy-preserving Trees, verify real-world
conditions through open hardware and Chia-backed proofs, and turn local sensing into a shared data
network rewarded by $JUICE."* Category: **community-owned environmental data infrastructure**
("data commons" is acceptable language). Scope is **environmental-led but not walled off** — broader
telemetry (power, seismic, infrastructure) may grow under the umbrella over time.

## What we are building (this project: v2 website)

A new landing experience built around a **"living globe."** A dark Earth comes into view
covered in glowing points where Trees are planted. Zoom in and clusters resolve into
**Groves**; zoom further and individual **Trees** appear bearing **fruit**, where **each
fruit type encodes a class of sensor data** (e.g. a single orange = one sensor; grapes = a
multi-sensor cluster; lemon = air quality; blueberry = water; apple = soil). Click a Tree to
open its **Explorer** panel (ID, region, uptime, sensors, history, rewards, DataLayer proof,
device health).

**Fruit is information architecture, not decoration.** The globe will *eventually replace the
current landing page*. It must be **clean, crisp, fast, and navigable** — never a heavy WebGL
monster.

## The hard realities (design to these, not around them)

- **Cold start:** ~**3 Trees are live today** (first one in Mount Washington, KY). The globe
  must look intentional and alive with **3** Trees and scale gracefully toward a design target
  of **100,000** without a redesign.
- **Two audiences over time:** crypto-native early adopters **now**; universities, cities,
  researchers, farmers, insurers, environmental groups **later**. Serve both; alienate neither.
- **Privacy is already decided and enforced in code:** public location is a coarse **~5 km
  geohash cell**; **precise GPS is owner-only** and scrubbed server-side. Never design anything
  that would expose a Tree's exact location.
- **Decade horizon:** choose things that won't need a rewrite in two years.
- **The live v1 site is not touched.** v2 is built in a separate workspace and migrated later.
- **Legal posture:** The Orchard is **not** operated through Richard's existing 501(c)(3) (ADR-0004); design for a standard (non-charity) entity — exact structure TBD.

## Authoritative lexicon (use these names in all user-facing work)

| User-facing | Meaning | Code term |
|---|---|---|
| The Orchard | the ecosystem | `orchard` |
| $JUICE | the reward token (Chia CAT, fixed supply 100,000,000, single issuance) | `juice` |
| Tree | a node (an ESP32 sensor device) | `node` / `node_id` |
| Grove | a cluster of Trees | `grove` |
| Season | a reward cycle (~24h) | `season` |
| Harvest | data collection | `readings` |
| Keeper | a validator | `keeper` |
| Orchard View | the analytics dashboard | `dashboard` |
| Orchard Pass | the ownership NFT (on Chia) | `pass` |

Node IDs look like **ORCH-00427**. The first Pass is **ORCH-0001**.

## Brand essence (full spec in `docs/brand/`)

- Dark, premium, organic-meets-hi-tech. Background near-black green (`#070b09` / `#0a1410`).
- Greens `#4ade80` / `#a3e635`, cyan `#2bd4d4`, purple `#b14aef`, **orange `#ff9f2e` = $JUICE**.
- Signature **holographic gradient**: purple → blue → cyan → green → yellow.
- Tagline in play: **GROW · CONNECT · EARN**. Voice: humble, precise, anti-hype.

## How this project is run (full manual in `AGENTS.md`)

A council of AIs works in parallel under one Lead. **Claude Code is the Lead Developer &
Integrator and the sole committer.** Advisors — **Grok (Growth & Markets)**,
**Gemini (Research & Modeling)**, **ChatGPT (Product & UX Strategy)** — produce scoped
deliverables that Richard (founder/courier) relays to the Lead for review and integration.
**You never write to the repo. You produce one deliverable per task, in your lane, grounded in
sources, with assumptions flagged. You never invent facts, data, or links.**

## Grounding sources (read when a task points you to them)

- Live v1 site — <https://theorchard.network/>
- The Orchard main repo — <https://github.com/FlipThisCrypto/the-orchard>
- Vision — <https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/VISION.md>
- This repo (canonical for v2) — <https://github.com/FlipThisCrypto/The-Orchard-Website-v2>
- $JUICE on a Chia explorer — Asset ID `285164e6af80202d2b07fa3cc6ae47ff2906029365a83c50fcab25a56b937121`

*Last updated: 2026-06-17 · maintained by the Lead.*
