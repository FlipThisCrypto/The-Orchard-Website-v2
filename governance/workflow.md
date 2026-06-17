# Workflow — the process in detail

> Expands [`AGENTS.md`](../AGENTS.md) §4. This is the mechanical, step-by-step procedure.

## Task states (precise definitions)

| State | Meaning | Who sets it | Requires |
|---|---|---|---|
| `backlog` | Captured but not ready to work (unscoped or blocked by direction). | Lead | — |
| `ready` | Fully scoped; all `depends_on` are `done`; a Brief can be written. | Lead | scope-in/out, sources, DoD filled in |
| `assigned` | Brief handed to Richard and pasted to the advisor; work in progress. | Lead | a Task Brief exists |
| `in_review` | Deliverable returned and pasted back to the Lead. | Lead | a Deliverable exists |
| `changes_requested` | Reviewed; specific fixes needed. Bounces back to the advisor. | Lead | numbered fix list |
| `done` | Passed the gate; raw copy filed to `council/<agent>/submissions/`, integrated into canonical file, committed. | Lead | integration commit |
| `blocked` | Cannot proceed. | Lead | blocker + what unblocks it |

## The loop, step by step

1. **Author** — Lead adds/edits the task object in `tasks/tasks.json`, fills scope-in,
   scope-out, `inputs` (grounding URLs), and `definition_of_done`; sets `status: ready`.
2. **Brief** — Lead fills [`templates/task-brief.md`](templates/task-brief.md) and saves it to
   `council/<agent>/briefs/ORCH-###.md` (a stable public URL the advisor can read directly).
   The Brief is **self-contained**: an advisor with zero prior context can execute it.
3. **Dispatch** — Richard pastes the Brief into the assigned advisor's chat. Lead sets
   `status: assigned`, regenerates the dashboard.
4. **Produce** — the advisor returns exactly one Deliverable using
   [`templates/deliverable.md`](templates/deliverable.md). One task, one deliverable, in lane.
5. **Return** — Richard pastes the Deliverable back to the Lead verbatim. Lead sets
   `status: in_review`.
6. **Gate** — Lead grades against the Definition of Done and the global quality bar
   (`AGENTS.md` §7).
   - **Fail** → Lead writes a numbered fix list, sets `changes_requested`, and the advisor
     revises (a new version of the same deliverable — see versioning below). Back to step 5.
   - **Pass** → step 7.
7. **Integrate** — Lead saves the raw deliverable to `council/<agent>/submissions/ORCH-###-vN.md`, then
   writes/updates the canonical file at `deliverable_path`, citing the source. Commit message:
   `ORCH-###: <title> (integrate <agent> deliverable)`.
8. **Close** — Lead sets `status: done`, bumps `updated`, regenerates `TASKS.md` and the
   dashboard `data.js`, commits. The dashboard percentage moves.

## Review gate checklist (what the Lead checks)

```
[ ] Every Definition-of-Done item satisfied
[ ] Stayed in scope-in; nothing touched from scope-out
[ ] Claims cite sources; assumptions & open questions are flagged, not hidden
[ ] Lexicon used correctly (MISSION.md)
[ ] Matches the specified deliverable file / format / length
[ ] No fabricated data, stats, quotes, or links
[ ] "Proposed follow-ups" (if any) triaged into tasks/backlog.md
```

## Deliverable versioning

On `changes_requested`, the advisor returns a **new version of the same deliverable**, not a
diff. The Lead files versions as `council/<agent>/submissions/ORCH-###-v1.md`, `-v2.md`, … so the history is
auditable. Only the final accepted version is integrated into `docs/`.

## Escalation & conflicts

- **Advisor disagrees with `MISSION.md` or a Brief** → state it in the Deliverable's
  "Assumptions & open questions"; do not silently override. The Lead resolves, escalating to
  Richard if it's a direction question.
- **Two deliverables conflict** (e.g., Grok's narrative vs. ChatGPT's IA) → the Lead reconciles
  during integration; if the conflict is strategic, it becomes an ADR
  (`governance/decisions/`) and Richard decides.
- **Scope dispute** ("is this mine?") → the Lead arbitrates per the lane definitions in
  `AGENTS.md` §2.

## How "real-time" progress works

The Lead is the sole committer, so the repo always reflects reality. After every integration the
Lead regenerates `dashboard/data.js` from `tasks.json` and pushes. The dashboard
(`dashboard/index.html`) re-polls on an interval and also reads live repo status (last commit,
open PRs, latest tag) via the GitHub API — so a tab left open updates on its own.

*Last updated: 2026-06-17 · maintained by the Lead.*
