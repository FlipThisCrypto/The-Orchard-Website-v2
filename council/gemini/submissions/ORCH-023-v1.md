DELIVERABLE: ORCH-023

To: The Lead / Claude (Main Dev)
From: Gemini (Research & Modeling Advisor)
Date: June 17, 2026
Subject: Nonprofit / Compliance Research (501(c)(3), UBIT, & Crypto Considerations)

⚠️ IMPORTANT DISCLAIMER:
This document constitutes academic and regulatory research, not legal or tax advice. The intersection of decentralized networks, cryptocurrency, and tax-exempt law is highly volatile and fact-dependent. The Orchard must consult a qualified attorney and a CPA specializing in both Web3 and exempt organizations before forming any entities, issuing tokens, or executing data licensing agreements.

1. Executive Summary

If The Orchard operates a 501(c)(3) Foundation alongside its DePIN network, it must navigate profound legal tensions. U.S. tax-exempt law requires an organization to operate exclusively for exempt purposes (e.g., environmental protection, scientific research). Blending public-good data provision with commercial B2B data licensing, token issuance, and NFT mechanics introduces severe risks regarding Unrelated Business Income Tax (UBIT), private inurement, and state-by-state charitable solicitation laws.

2. Commercial B2B Data Sales vs. The Public Good

The core friction for a 501(c)(3) operating a DePIN is how it treats its primary asset: data.

The Public Good Mandate:
To justify 501(c)(3) status under a "scientific" or "educational" purpose, research results and data generally must be made available to the public on a non-discriminatory basis (often referred to as a "Data Commons" or open data model).

The Tension with Commercial Licensing:
The v0 Financial Model (ORCH-022) relies heavily on B2B API subscriptions (e.g., charging Agtech firms $500/month or Enterprise clients $19,900/month). The IRS strictly scrutinizes tax-exempt entities competing with for-profit businesses.

The UBIT Risk: If a 501(c)(3) sells data subscriptions to commercial entities, and this activity is "regularly carried on" and not "substantially related" to its exempt purpose, the revenue is subject to Unrelated Business Income Tax (UBIT) at the federal corporate rate (21%).

The Exemption Threat: If commercial data sales become a "substantial" part of the Foundation's activities (e.g., exceeding 20-50% of gross revenue), the IRS can revoke the 501(c)(3) status entirely, arguing the organization is operating as a commercial enterprise rather than a charity.

The Royalty Exception: Some nonprofits structure data licensing to fall under the "royalty exclusion" (IRC Section 512(b)(2)), making the income tax-free. However, the IRS insists the nonprofit must play a strictly passive role. If the Foundation actively maintains the API, cleans the data, or services the B2B clients, the IRS may reclassify the revenue from a passive royalty to an active (taxable) commercial service.

⚠️ Professional Consultation Required: A qualified tax attorney must structure the B2B API agreements to determine if they trigger UBIT or if they can be safely structured as passive royalties. They must also determine if a for-profit subsidiary (a "blocker" corporation) is necessary to shield the 501(c)(3) from excessive commercial activity.

3. Token Issuance, NFTs, & Smart Contracts

Integrating $JUICE tokens and "Orchard Pass" NFTs into a 501(c)(3) framework requires navigating regulatory voids. The IRS has designated cryptocurrency as "property," but guidance on the issuance of tokens by nonprofits remains sparse.

Private Inurement & Benefit:
A 501(c)(3) cannot allow its assets to unfairly benefit private individuals (insiders) or provide substantial private benefits to third parties.

Token Allocation: If the Foundation mints the 100M $JUICE supply and allocates a large percentage to the founders, developers, or early node operators, the IRS could view this as "private inurement" or impermissible private benefit, leading to immediate loss of tax-exempt status and massive excise taxes.

The Burn-and-Mint Mechanic: Using Foundation fiat revenue to buy back and burn $JUICE tokens (as modeled in ORCH-022) essentially transfers the value of the Foundation's commercial success to private token holders. This is a massive red flag for a 501(c)(3) and strongly suggests the token mechanics must be completely divorced from the tax-exempt entity.

Smart Contracts & DAO Governance:
While some states (like Wyoming) have created legal wrappers for DAOs (e.g., Wyoming DAO LLCs or Decentralized Unincorporated Nonprofit Associations), operating a traditional 501(c)(3) via smart contracts creates fiduciary complications. A 501(c)(3) Board of Directors cannot abdicate its fiduciary duties (Duty of Care, Duty of Loyalty) to an automated algorithm or a decentralized token-voting mechanism without violating state nonprofit corporate laws.

⚠️ Professional Consultation Required: A Web3-specialized attorney must evaluate the entire tokenomic flow. It is highly probable that the entity issuing the token and paying the node operators cannot be the same 501(c)(3) entity that accepts charitable donations.

4. Charitable Solicitation & Crypto Donations

If The Orchard 501(c)(3) accepts donations to subsidize hardware or fund environmental research, it faces strict state-level compliance.

State Registration:
Charitable solicitation is governed at the state level, not the federal level. Before asking the public for donations (fiat or crypto) on a website accessible nationwide, a 501(c)(3) generally must register with the Attorney General in roughly 40 different states. Failure to register can result in fines and cease-and-desist orders.

Crypto as Property:
Because the IRS treats crypto as property, donating Bitcoin, Ethereum, or XCH to a 501(c)(3) is a non-taxable event for the donor (they avoid capital gains tax and get a fair market value deduction). However, the Foundation must have strict Gift Acceptance Policies to handle crypto volatility, perform Anti-Money Laundering (AML) checks on large anonymous wallets, and manage the complex IRS Form 8283 reporting requirements for property donations exceeding $5,000.

⚠️ Professional Consultation Required: A compliance firm or specialized CPA must manage the multi-state charitable solicitation registrations and establish the accounting protocols for receiving, liquidating, and acknowledging cryptocurrency donations.

5. Assumptions & Uncertainty

Assumption: The research assumes The Orchard intends to pursue federal 501(c)(3) public charity status in the United States, rather than a 501(c)(4) social welfare organization or a foreign foundation (e.g., Swiss Stiftung or Cayman Foundation), which have drastically different rules regarding commercial activity and token issuance.

Uncertainty: There is currently no definitive IRS Revenue Ruling explicitly addressing whether a DePIN "Burn-and-Mint" token model administered by a 501(c)(3) violates the private benefit doctrine.

6. Proposed Follow-Ups (Out of Scope)

Dual-Entity Structuring: Research the "Tandem Structure" (a 501(c)(3) paired with a for-profit C-Corp or LLC subsidiary). This is the standard Web3 maneuver where the non-profit handles the open-source code/mission, and the for-profit handles the token issuance and commercial data sales.

Wyoming DUNA: Research the newly established Wyoming Decentralized Unincorporated Nonprofit Association (DUNA) legal wrapper as a potential alternative to a traditional 501(c)(3).

Sources

IRS.gov. Unrelated Business Income Tax. https://www.irs.gov/charities-non-profits/unrelated-business-income-tax

American Bar Association. Unrelated Business Income Tax (UBIT): A Comprehensive Overview for Nonprofits.

IRS.gov. Exemption Requirements - 501(c)(3) Organizations. https://www.irs.gov/charities-non-profits/charitable-organizations/exemption-requirements-501c3-organizations

Adler & Colvin. Revenue-Generating Activities of Charitable Organizations: Legal Issues.

Astraea Counsel. DAO LLC Formation Guide: Step-by-Step Wyoming DUNA Setup.