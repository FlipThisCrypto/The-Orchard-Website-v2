# ADR-0003: Product positioning & category (2036)

- **Status:** Accepted *(working identity — "good for now," revisitable as the project evolves)*
- **Date:** 2026-06-17
- **Deciders:** Richard (ratified); Lead. Informed by ChatGPT (ORCH-010).
- **Tasks:** ORCH-010

## Context

A decade-scale project needs a durable identity to anchor the information architecture (ORCH-012),
messaging (ORCH-030, integrated), and every page of v2 — one true to the anti-hype, hardware-first,
open-source ethos that still makes sense to an institutional buyer in 2036. ChatGPT proposed a
recommendation plus three alternates; Richard ratified.

## Decision

**Adopt this positioning and category:**

> "By 2036, The Orchard is the **community-owned environmental data infrastructure** where people
> plant privacy-preserving Trees, verify real-world conditions through open hardware and Chia-backed
> proofs, and turn local sensing into a shared data network rewarded by $JUICE."

- **Category to own:** *community-owned environmental data infrastructure.* ("Environmental DePIN"
  remains the early-adopter/ecosystem descriptor.)
- **"Data commons":** **approved** as acceptable product language.
- **Scope:** **environmental-led, but not walled off.** Broader telemetry (power, seismic,
  infrastructure) may grow under the umbrella over time, per VISION.md. The IA, data model, and
  architecture must not preclude it.

## Options considered

| Option | Verdict |
|---|---|
| Community-owned environmental data infrastructure (recommended) | **chosen** |
| Open-source environmental DePIN … real-world data, uptime rewards, citizen science | alt — strong now, "DePIN" may age/insider-code by 2036 |
| Privacy-preserving network of community-planted Trees → verifiable public infrastructure | alt — cleanest institutional line; underplays Chia/$JUICE |
| Open hardware-to-data layer for environmental sensing | alt — most architecture embedded; abstract first line |

Full text of alternates: `docs/product/positioning-2036.md`.

## Consequences

- This is the authoritative anchor for the IA (ORCH-012) and reconciles with messaging (ORCH-030).
- "Data commons" can be used in copy and docs.
- Because scope is left open, the data model and globe architecture should treat "environmental" as
  the launch focus, not a hard ceiling — design for additional telemetry classes later.
- Revisitable: ratified "for now"; revisit if the audience or product center of gravity shifts.

## Notes

All three round-1 advisors independently converged on "infrastructure first, the token supports it,
show real density not fake" — a strong coherence signal behind this decision.
