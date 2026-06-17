# Financial Model v0

> Canonical research. Integrated by the Lead from Gemini's **ORCH-022**
> (`council/gemini/submissions/ORCH-022-v1.md`). Date: 2026-06-17.
> **All figures are illustrative v0 planning estimates, not forecasts.** Built on ORCH-021 pricing
> and ORCH-020 reward mechanics.

> ⚠️ **Tokenomics numbers below (40M reward pool, 10M builder reserve, 30% burn) are Gemini's
> MODELING ASSUMPTIONS, not ratified tokenomics.** Actual $JUICE allocation/issuance is a future
> Richard + Lead decision — do not treat these as decided.

## Node-growth assumptions
| Horizon | Active nodes | Method |
|---|---|---|
| Year 1 (Seed) | 500 | enthusiast adoption (early-WeatherXM-style), builder bounties |
| Year 3 (Growth) | 5,000 | "Targeted Rollouts" (WeatherXM) into high-demand B2B regions |
| Year 10 (Mature) | 50,000 | dense global network for enterprise + municipal use |

## Revenue
**Hardware kits** (pre-flashed ESP32-S3, $99/kit):
| Horizon | Kits/yr | Revenue |
|---|---|---|
| Y1 | 500 | $49,500 |
| Y3 | 2,250 | $222,750 |
| Y10 | 10,000 | $990,000 |

**Data / API** (tiers from ORCH-021: Standard $500/mo, Enterprise $19,900/mo; 12–18mo B2B sales cycle):
| Horizon | Standard | Enterprise | Annual revenue |
|---|---|---|---|
| Y1 | 5 (pilots) | 0 | $30,000 |
| Y3 | 50 | 2 | $777,600 |
| Y10 | 200 | 15 | $4,782,000 |

**Community (Orchard Pass mint, ~$20/node):** Y1 $10,000 · Y3 $45,000 · Y10 $200,000.

**Total gross revenue (fiat, est.):** **Y1 ~$89,500 · Y3 ~$1,045,350 · Y10 ~$5,972,000.**

## Costs
| Line | Year 1 | Year 3 | Year 10 |
|---|---|---|---|
| Hardware COGS | $40/kit → $20,000 | $25/kit → $56,250 | $20/kit → $200,000 |
| Infra (cloud/blockchain) | $500/mo → $6,000 | $3,000/mo → $36,000 | $15,000/mo → $180,000 |
| Ops / team | 2 founders (sweat) → $40,000 | 4–5 FTE → $450,000 | 15+ FTE → $1,800,000 |
| Marketing | $20,000 | $150,000 | $500,000 |

## Reward-model integration ($JUICE flows) — *modeling assumptions*
- **DIMO dual-issuance:** **baseline** $JUICE for proven uptime/calibration (prevents Y1 churn while B2B is low) + **marketplace** multiplier for nodes in a Grove whose data is actually being purchased.
- **Helium burn-and-mint:** B2B clients pay fiat (Stripe); the Foundation uses a % of fiat revenue (modeled at 30%) to buy $JUICE on a DEX and **burn** it — deflation tied to real data sales.

## Assumptions, gaps & uncertainty
- **Hardware saturation:** kit sales can't carry Y10; **revenue must pivot to B2B data APIs by ~Y5** to stay solvent.
- **Token-price abstraction:** model is fiat-only; assumes $JUICE price is a secondary operator benefit, not the Foundation's operating capital.
- **Competitor underpricing:** token-subsidized rivals (e.g., WeatherXM) could undercut the $500/mo API estimate and pressure conversion.

## Takeaways for The Orchard (Lead synthesis)
- The model's spine is sound: **fiat from kits + data, with the token deflation-linked to real sales** — consistent with our anti-hype ethos.
- The **Y5 pivot to data revenue** is the key strategic inflection to design toward.
- Treat all $JUICE allocation numbers as inputs to a future tokenomics decision, not commitments.

## Proposed follow-ups (triaged to backlog)
- Exact $JUICE emission-decay curve over 520 weeks (ensure the reward pool lasts to Y10).
- Whether Y3 API margin supports selling kits at/below cost to capture share.

*Source: Gemini, ORCH-022.*
