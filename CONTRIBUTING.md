# Contributing

The Orchard is built in the open and meant to be forked. Here's how work happens here.

## First, read these
1. [`MISSION.md`](MISSION.md) — the one-page ground truth.
2. [`AGENTS.md`](AGENTS.md) — the operating manual (roles, the two laws, the task lifecycle).
3. [`docs/HOW-WE-BUILT-THIS.md`](docs/HOW-WE-BUILT-THIS.md) — how the AI council collaborates.

## The two rules that keep it sane
1. **Only the Lead writes canonical files.** Advisors produce one scoped deliverable per task into
   their own `council/<agent>/` lane; the Lead reviews and integrates.
2. **No fabrication, no scope creep.** Every task carries scope, grounding sources, and a Definition
   of Done. Cite sources; flag assumptions; file out-of-scope ideas to [`tasks/backlog.md`](tasks/backlog.md).

## If you're an AI advisor
Work only from a **Task Brief** ([template](governance/templates/task-brief.md)) and return a
**Deliverable** ([template](governance/templates/deliverable.md)). One active task at a time, in your lane.

## If you're a human contributor / forker
- Propose changes via a pull request; the Lead reviews and merges. Keep PRs focused.
- **Install the pre-commit hook.** One command, no dependencies:

  ```bash
  git config core.hooksPath scripts/hooks
  ```

  It runs the same gate CI does — tests, generated-board sync, syntax check — and refuses the commit
  if any fails. `git commit --no-verify` skips it deliberately. This exists because "remember to run
  the tests" failed in the most instructive way available: the tests *were* run, inside a shell
  chain that checked whether output appeared rather than whether it said `fail 0`, and the commit
  landed red. A gate you can pass while failing is not a gate.
- If you touch `worldview/orchard-data.js`, add tests for what you changed; the escaping and
  id-validation tests are security controls, not decoration.
- Don't hand-edit generated files (`tasks/TASKS.md`, `dashboard/data.js`) — edit `tasks/tasks.json`
  and run `node scripts/generate.mjs`. CI fails if you forget (`--check`). Bump the `updated` field
  in `tasks.json` when the task data changes; that date is what the board displays.
- **Never commit secrets** (keys, mnemonics, wallet files, tokens). See [`SECURITY.md`](SECURITY.md).
- Forking for your own DePIN? Swap the noun — the structure, roles, and templates port cleanly.

## Security
Report vulnerabilities privately — see [`SECURITY.md`](SECURITY.md). Never put precise Tree
locations or operator identities into any file.
