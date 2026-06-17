# Nonprofit / Compliance Research

> Canonical research. Integrated by the Lead from Gemini's **ORCH-023**
> (`council/gemini/submissions/ORCH-023-v1.md`). Date: 2026-06-17.

> 🔸 **Status — REFERENCE ONLY (ADR-0004, 2026-06-17):** Richard's existing 501(c)(3) will **not** be
> linked to The Orchard, so the charity-specific constraints below (UBIT, private inurement,
> charitable solicitation) **do not bind this project.** Retained for reference only — relevant
> solely if a charitable entity is ever introduced.

> ⚠️ **This is research, NOT legal or tax advice.** The intersection of DePIN, crypto, and
> tax-exempt law is volatile and fact-dependent. **Consult a qualified attorney + a CPA who
> specialize in both Web3 and exempt organizations** before forming entities, issuing tokens, or
> signing data-licensing deals. US-centric; state rules vary.

## The headline finding (Lead synthesis)
**The token + commercial data business probably cannot live inside the same 501(c)(3) that takes
charitable donations.** Using Foundation revenue to buy-and-burn $JUICE (per the ORCH-022 model)
transfers value to private token holders — a private-benefit/inurement red flag for a charity. The
standard fix is a **tandem structure** (a nonprofit for mission/open-source + a for-profit sub for
token + commercial sales). **This is a Richard + counsel decision.**

## Commercial B2B data sales vs. the public good
- **Public-good mandate:** to hold 501(c)(3) "scientific/educational" status, results/data generally must be available to the public non-discriminatorily (a true "data commons"/open-data model).
- **Tension:** ORCH-022 leans on B2B API subscriptions ($500–$19,900/mo). The IRS scrutinizes exempt entities competing with for-profits.
- **UBIT risk:** commercial data subscriptions "regularly carried on" and not "substantially related" to the exempt purpose → **Unrelated Business Income Tax (21%).**
- **Exemption threat:** if commercial sales become "substantial" (~20–50%+ of gross), the IRS can **revoke** exempt status.
- **Royalty exception (IRC §512(b)(2)):** licensing *can* be tax-free **only if the nonprofit is strictly passive.** If it maintains the API / cleans data / services clients, the IRS may reclassify it as active (taxable). ⚠️ *Counsel must structure the agreements; a "blocker" for-profit subsidiary may be needed.*

## Token issuance, NFTs & smart contracts
- **Private inurement:** allocating a large share of the 100M $JUICE to founders/devs/early operators can be seen as impermissible private benefit → loss of status + excise taxes.
- **Burn-and-mint:** routing Foundation commercial success to token holders is a "massive red flag" — strongly suggests **token mechanics must be divorced from the tax-exempt entity.**
- **DAO governance:** a 501(c)(3) board **cannot** abdicate fiduciary duties (care, loyalty) to an algorithm or token vote. Wyoming has wrappers (DAO LLC, DUNA) but a traditional 501(c)(3)-via-smart-contract creates fiduciary problems. ⚠️ *A Web3 attorney must evaluate the whole tokenomic flow; the token-issuing/operator-paying entity likely can't be the donation-accepting 501(c)(3).*

## Charitable solicitation & crypto donations
- **State registration:** solicitation is state-governed — asking the public (fiat or crypto) on a nationwide site generally requires registering with **~40 states'** AGs; failure → fines/cease-and-desist.
- **Crypto = property:** donating BTC/ETH/XCH is non-taxable for the donor (avoids cap-gains, FMV deduction), but the Foundation needs **Gift Acceptance Policies**, AML checks on large anonymous wallets, and **IRS Form 8283** handling for property gifts > $5,000. ⚠️ *A compliance firm/CPA must run multi-state registration + crypto accounting protocols.*

## Assumptions & uncertainty
- **Assumes** US federal **501(c)(3) public charity** intent — not 501(c)(4), nor a foreign foundation (Swiss Stiftung, Cayman) which have very different commercial/token rules.
- **Uncertainty:** no definitive IRS ruling on whether a DePIN burn-and-mint model run by a 501(c)(3) violates the private-benefit doctrine.

## Proposed follow-ups (triaged to backlog)
- **Tandem structure** research (501(c)(3) + for-profit C-Corp/LLC sub — the standard Web3 split).
- **Wyoming DUNA** (Decentralized Unincorporated Nonprofit Association) as an alternative wrapper.

## Sources
- IRS — Unrelated Business Income Tax. https://www.irs.gov/charities-non-profits/unrelated-business-income-tax
- IRS — Exemption Requirements, 501(c)(3). https://www.irs.gov/charities-non-profits/charitable-organizations/exemption-requirements-501c3-organizations
- American Bar Association — UBIT overview (cited by advisor).
- Adler & Colvin — Revenue-Generating Activities of Charitable Organizations (cited by advisor).
- Astraea Counsel — Wyoming DUNA setup guide (cited by advisor).

*Source: Gemini, ORCH-023.*
