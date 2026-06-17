# AGENTS.md — The Orchard v2 Operating Manual

> The single source of truth for how this project is run. If any other document conflicts
> with this one, this one wins. Maintained by the Lead.
>
> **New here?** Read [`MISSION.md`](MISSION.md) first (the ground truth), then your own role
> file in [`governance/roles/`](governance/roles/), then come back for the rules.

---

## 1. Why this exists

Four AIs and one human are building a decade-scale project together. Without structure, four
AIs will happily (a) work on top of each other, (b) drift out of scope, and (c) invent
facts. This manual makes those three failure modes **structurally impossible**, not just
discouraged.

## 2. Roles & decision rights

| Seat | Who | Mandate | Writes to repo? |
|---|---|---|---|
| **Founder / Owner / Courier** | **Richard** | Owns the vision and final direction. Ground truth on hardware & Chia. Relays Task Briefs out to advisors and pastes their deliverables back to the Lead. Tests the result. | Via the Lead |
| **Lead Dev & Integrator** | **Claude Code** | **Sole committer.** Authors tasks, writes architecture and all canonical docs/code, reviews every deliverable, integrates accepted work, maintains `tasks.json` and the dashboard, keeps everyone in scope. Final say on integration. | **Yes — only seat that does** |
| **Product & UX Strategy** | **ChatGPT** | IA/sitemap, the single primary action, personas, roadmap, gamification + fruit→data spec, governance/tokenomics drafts. | No |
| **Research & Modeling** | **Gemini** | Competitor teardowns, data-buyer/use-case research, financial modeling, nonprofit/compliance research. | No |
| **Growth & Markets** | **Grok** | Positioning/narrative, messaging pillars, community & viral growth, real-time DePIN marketing pulse. | No |

Decision rights: **Richard** decides *direction* (what we're building and why).
**The Lead** decides *integration* (what enters the repo, and how). Advisors **advise** — they
produce the best possible input in their lane; they do not decide and do not build.

The advisor lanes are the **consensus** the council reached about its own strengths. Stay in
your lane. Seeing a great idea outside your lane? File it (see §6), don't build it.

## 3. The two laws

### Law 1 — Anti-collision (no working on top of each other)
- **Only the Lead writes canonical files** (`docs/`, `app/`, `dashboard/`, `tasks/`, `governance/`).
- Advisors produce **only into their own lane**: a single deliverable per task, returned as text
  to Richard, which the Lead files under `council/<agent>/submissions/` before integrating.
- **One task = one owner = one deliverable file.** Two advisors are never assigned the same file.
- Nothing reaches `main` except through the Lead's review and commit.

### Law 2 — Anti-hallucination (no invented or out-of-scope work)
Every task ships with four things, and a deliverable is **rejected** if it ignores any:
1. **Scope-in** — exactly what to produce.
2. **Scope-out** — what NOT to touch (hand back to Lead / another advisor).
3. **Grounding sources** — the URLs/files to read first. Claims must trace to a source.
4. **Definition of Done** — the checklist the deliverable is graded against.

Plus the standing rules: **cite your sources; flag every assumption and open question
explicitly; never fabricate data, statistics, quotes, or links; never silently expand scope.**
If a fact isn't in a source you can cite, label it an assumption or a question — don't assert it.

## 4. The task lifecycle (courier model)

```
  Lead authors task in tasks.json ........................ status: ready
        │
        ▼  Lead writes a Task Brief → council/<agent>/briefs/ORCH-###.md
  Richard pastes the Brief to the assigned advisor ....... status: assigned
        │
        ▼  Advisor returns a Deliverable (governance/templates/deliverable.md)
  Richard pastes the Deliverable back to the Lead ....... status: in_review
        │
        ▼  Lead grades it against the Definition of Done
        ├─ gaps found ─▶ changes_requested (specific notes) ─▶ back to advisor
        └─ passes ─▶ Lead files raw copy to council/<agent>/submissions/, integrates into the
                     canonical file, commits, regenerates dashboard ... status: done
```

- **WIP limit: one active task per advisor.** Prevents sprawl and rework. A second task is not
  assigned until the first is `done` or explicitly `blocked`.
- **Blocked** tasks must state the blocker and exactly what's needed to unblock.
- The Lead may hold tasks in `ready` until their `depends_on` tasks are `done`.

### Task states
`backlog` → `ready` → `assigned` → `in_review` → (`changes_requested` ↔ `in_review`) → `done`.
`blocked` may apply at any point. Definitions live in [`governance/workflow.md`](governance/workflow.md).

## 5. Where everything lives

```
MISSION.md            ground truth (read first)        AGENTS.md            this manual
governance/roles/     one end-to-end guide per seat    governance/workflow.md  the process in detail
governance/templates/ task-brief · deliverable · ADR   governance/decisions/   ADRs (logged decisions)
tasks/tasks.json      THE task list (source of truth)  tasks/TASKS.md          human-readable (generated)
tasks/backlog.md      parked / out-of-scope ideas      dashboard/index.html    live progress dashboard
council/<agent>/      briefs/ (instructions) + submissions/ (work back)   docs/<lane>/   integrated canonical work
```

`docs/` lanes: `product/` (ChatGPT) · `research/` (Gemini) · `growth/` (Grok) ·
`architecture/` + `brand/` (Lead).

## 6. Filing an out-of-scope idea (instead of building it)

Had a great idea outside your task's scope? **Do not build it.** End your deliverable with a
short **"Proposed follow-ups"** section: one line each, what + why. The Lead triages these into
`tasks/backlog.md`. This is how good ideas survive without breaking Law 1 or Law 2.

## 7. Quality bar / Definition of Done (global)

A deliverable is accepted only if it:
- ✅ Satisfies every item in the task's Definition of Done.
- ✅ Stays within scope-in; touches nothing in scope-out.
- ✅ Cites sources for factual claims; flags assumptions and open questions.
- ✅ Uses the authoritative lexicon (`MISSION.md`) correctly.
- ✅ Fits the specified deliverable (file, format, length).
- ✅ Contains no fabricated data, stats, quotes, or links.

Anything less comes back as `changes_requested` with specific, numbered fixes.

## 8. Cadence & courier etiquette

- The Lead keeps **`tasks.json` and the dashboard current** after every integration.
- Richard relays **one Brief at a time per advisor** and pastes deliverables back verbatim.
- Task Briefs are **self-contained** — an advisor needs no prior chat memory to execute one.
- All four seats treat `MISSION.md` as authoritative and **flag contradictions instead of
  silently resolving them.**

*Last updated: 2026-06-17 · maintained by the Lead (Claude Code).*
