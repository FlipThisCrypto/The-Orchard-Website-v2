# ADR-0001: Multi-AI coordination model

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Richard (founder), Lead (Claude Code)
- **Tasks:** ORCH-001, ORCH-006

## Context

Four AIs (Claude, Grok, Gemini, ChatGPT) plus the founder are building a decade-scale project.
Run naively, multiple AIs (a) edit the same things and clobber each other, (b) drift outside
their competence, and (c) assert invented facts. We need a coordination model that prevents all
three by construction, works with tools that **cannot all directly access a repo**, and keeps the
founder able to see progress at a glance.

## Decision

We adopt a **single-Lead, courier, sole-committer** model:

- **Claude Code is the Lead Developer & Integrator and the only seat that writes to the repo.**
  The "Claude" council seat is folded into the Lead — there is no separate Claude advisor.
- **Advisors (Grok = Growth, Gemini = Research, ChatGPT = Product/UX)** produce one scoped
  deliverable per task and never touch the repo.
- **Richard is the courier:** he relays Task Briefs out and pastes deliverables back.
- Two enforced laws: **Law 1 (anti-collision)** — only the Lead writes canonical files; one task
  = one owner = one deliverable; advisor raw output lands in `council/<agent>/submissions/`. **Law 2
  (anti-hallucination)** — every task carries scope-in, scope-out, grounding sources, and a
  Definition of Done; advisors cite sources, flag assumptions, never fabricate or expand scope.
- **The repo is public**, so advisors can be grounded against exact source-file URLs.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Courier + sole committer (chosen) | Zero collision risk; works regardless of each AI's repo access; clear accountability | Lead is a throughput bottleneck; relies on Richard relaying | **chosen** |
| Direct PRs from each AI | Git-native; parallel | Most AIs can't reliably commit; merge conflicts; harder to enforce the two laws | rejected (now) |
| Shared doc free-for-all | Low setup | Guarantees collisions and scope drift | rejected |

## Consequences

- The Lead must keep `tasks.json` and the dashboard current so the bottleneck stays transparent.
- Advisor lanes are fixed (the council's own consensus map). Cross-lane ideas go to the backlog.
- WIP limit of one active task per advisor keeps the courier loop sane.
- If an advisor later gains reliable repo access, we can add a reviewed-PR lane without changing
  the two laws (revisit then).

## Notes

The lane assignment (Grok/Gemini/ChatGPT) is exactly what all four AIs independently proposed for
each other; the only contested seat was "synthesizer," which Richard assigned to the Lead.
