# ADR-0004: Legal posture — The Orchard is independent of Richard's 501(c)(3)

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Richard
- **Tasks:** ORCH-023 (motivated this)

## Context

ORCH-023 (nonprofit/compliance research) surfaced serious tensions with running token + commercial
data activity through a 501(c)(3): UBIT on commercial data sales, private-inurement risk from
$JUICE allocation, and the buy-and-burn mechanic transferring charity value to private token
holders (a red flag). Richard clarified that he **has** an existing 501(c)(3), **but it will not be
linked to The Orchard.**

## Decision

**The Orchard is operated independently of Richard's existing 501(c)(3). That nonprofit is not the
project's legal vehicle.** The 501(c)(3)-specific constraints in ORCH-023 therefore **do not bind**
The Orchard. The project's own entity structure is a separate, future decision (TBD) — but it is
**not** that charity.

## Consequences

- **Tokenomics is unconstrained by charity rules.** The financial model's mechanics (burn-and-mint,
  operator rewards, $JUICE allocation to founders/operators) are **not** subject to
  private-inurement / UBIT limits, because no 501(c)(3) is involved.
- **ORCH-023 becomes reference-only** (`docs/research/nonprofit-compliance.md`) — relevant only if a
  charitable entity is ever introduced later.
- **No "tandem structure to protect a charity" is needed.** The token + commercial data business can
  live in one standard (for-profit) entity.
- **Standard for-profit/token legal & tax considerations still apply** (entity choice, securities
  posture for $JUICE, data-licensing contracts, sales tax) — a future task, separate from charity law.
- Keep the project's messaging clear that "community-owned" / "data commons" refers to the
  **network and data model**, not a charitable tax status.

## Notes

This does not specify The Orchard's own structure (LLC, C-Corp, foundation, etc.) — that remains an
open future decision to make with counsel. It only removes the existing 501(c)(3) from the picture.
