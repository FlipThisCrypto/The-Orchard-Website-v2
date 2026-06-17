# DePIN Competitor Teardown

> Canonical research. Integrated by the Lead from Gemini's deliverable **ORCH-020**
> (`council/gemini/submissions/ORCH-020-v1.md`). Date: 2026-06-17.
> Every traction figure is cited (see Sources); estimates are labeled as such.

Sourced teardown of six DePIN projects to inform v2 information architecture, gamification, and
tokenomics — what to **borrow**, and what to **avoid**.

## Teardowns

### Hivemapper (HONEY)
- **Model:** decentralized mapping; users buy dashcams ("Drive-to-Earn"); the foundation sells map
  data APIs to B2B (autonomous vehicles, logistics).
- **Traction:** 700M+ km mapped (~37% of global roads, 100+ countries); ~165,000 contributors. [1][2][3]
- **Tokenomics:** 10B HONEY max (Solana); 40% to contributor rewards; burn-and-mint for API access.
- **Data products:** Map Image API, Map Features API, Change Detection.
- **Borrow:** the transparent contributor **Explorer** map — shows operators the value of their geographic data.
- **Avoid:** proprietary-dashcam supply bottlenecks (often sold out for months). Keep hardware open/accessible (ESP32).

### GEODNET (GEOD)
- **Model:** the largest RTK network; users deploy geodetic-grade GNSS antennas for mm-level location correction.
- **Traction:** 22,000+ base stations; customers (ag, drones, AVs) spending $11M+ annualized. [4]
- **Tokenomics:** 1B supply; Proof-of-Accuracy + Proof-of-Location; rewards halve annually.
- **Data products:** real-time RTK correction streams.
- **Borrow:** the **"SuperHex"** targeting system — token multipliers for high-value, underserved regions. [5] (Fits our critical-ecological-zone scarcity goal.)
- **Avoid:** highly technical onboarding that caps the market to power users.

### WeatherXM (WXM)
- **Model:** decentralized weather network; custom hardware → hyperlocal weather intelligence for insurance, ag, Web3.
- **Traction:** ~10,000 active stations across 81 countries; goal 17,000 in 24 months via "Targeted Rollouts." [6][7]
- **Tokenomics:** 100M supply (Arbitrum); 55% to station rewards over a 10-year curve, by data quality + uptime. [8]
- **Data products:** WeatherXM Pro (REST API), forecast-accuracy tracking, raw observations.
- **Borrow:** the **10-year emission schedule** + the shift from grassroots to **targeted rollouts** (pay for data where B2B demand exists).
- **Avoid:** launching hardware before a finalized reward mechanism (beta-reward friction).

### Helium (HNT / IOT / MOBILE)
- **Model:** decentralized wireless — LoRaWAN (IoT) and 5G cellular.
- **Traction:** peaked >950,000 LoRaWAN hotspots; now focused on MOBILE with telco offload (T-Mobile, Telefónica). *Estimate:* active IoT nodes fell with reward dilution; MOBILE scaling. [9]
- **Tokenomics:** SubDAO model — HNT primary (burn-and-mint); IOT/MOBILE sub-tokens backed by HNT.
- **Data products:** IoT packet transfer, 5G offload.
- **Borrow:** **Burn-and-Mint Equilibrium (BME)** — a sound way to link fiat data revenue to token deflation.
- **Avoid:** the multi-token SubDAO structure — it fragmented community attention. **Keep ONE token ($JUICE).**

### Render (RENDER)
- **Model:** decentralized GPU rendering / AI compute matching idle GPUs to demand.
- **Traction:** migrated to Solana for throughput; strong enterprise adoption on the AI compute shortage. *Estimate:* node counts obfuscated by dynamic job allocation; utilization at highs.
- **Tokenomics:** Burn-and-Mint Equilibrium; operators earn RENDER.
- **Data products:** 3D rendering jobs, AI compute.
- **Borrow:** **fiat abstraction on the demand side** (studios pay via Stripe; protocol burns RENDER) — crucial for B2B data sales.
- **Avoid:** an abstract network map. **We keep a grounded, geographic 3D visualization (Trees/fruit).**

### DIMO (DIMO)
- **Model:** open connected-vehicle platform; OBD2 dongles stream telemetry; users earn.
- **Traction:** 100,000+ connected cars.
- **Tokenomics:** **dual-issuance** — baseline (just being connected over time) + marketplace (selling data to a third party).
- **Data products:** aggregated mobility data, vehicle health, insurance/maintenance marketplace.
- **Borrow:** the **Baseline + Marketplace** mechanic — rewards uptime *and* high-demand data.
- **Avoid:** compatibility fragmentation (OBD2 varies by make/model). **Keep ESP32-S3 universal regardless of sensor payload.**

## Comparison matrix

| Project | Primary hardware | Token | Main data product | Borrow | Avoid |
|---|---|---|---|---|---|
| Hivemapper | Proprietary dashcam | HONEY | Map Image / Feature APIs | Transparent Explorer UI | Proprietary supply delays |
| GEODNET | GNSS / RTK antenna | GEOD | RTK correction data | "SuperHex" targeted multipliers | Complex UX / onboarding |
| WeatherXM | WXM weather station | WXM | Hyperlocal weather API | 10-yr emission / targeted rollouts | Launching before reward logic |
| Helium | LoRaWAN / 5G radios | HNT/IOT/MOBILE | Wireless connectivity | Burn-and-Mint Equilibrium | SubDAO multi-token fragmentation |
| Render | User GPUs | RENDER | Compute / 3D rendering | Fiat abstraction for B2B | Visually abstract network map |
| DIMO | OBD2 dongle | DIMO | Mobility / vehicle telemetry | Baseline + Marketplace rewards | Hardware compatibility fragmentation |

## Assumptions & uncertainty
- **"Deployed" vs "active":** Helium/WeatherXM cite total deployed; active per-epoch is lower (churn, failures, offline).
- **Revenue:** private B2B licensing (Hivemapper, Render) is under NDA; GEODNET's $11M annualized is from its VC (Multicoin), assumed accurate as of June 2026.
- **Render:** no persistent physical node map; traction inferred from job volume + market cap.

## Takeaways for The Orchard (Lead synthesis)
- A transparent, geographic **Explorer is table stakes** — and on-brand (our living globe).
- **Geographic reward multipliers** for underserved/critical ecological zones (GEODNET SuperHex) fit our scarcity goals → informs reward design.
- **One token only** ($JUICE) — Helium's multi-token model is the cautionary tale.
- Plan a **10-year emission curve + targeted rollouts** (WeatherXM) once real B2B demand exists.
- **Baseline + Marketplace** issuance (DIMO) + **BME** (Helium/Render) are the references for the financial model (ORCH-022), and **fiat-abstracted B2B buying** (Render) is a Phase-3+ backlog item.

## Sources
1. Hivemapper Foundation — Total KM Mapped & Coverage (retrieved 2026-06-17). https://www.hivemapperfoundation.org/
2. Startup Intros — Hivemapper: Funding, Team & Investors (Apr 2026). https://startupintros.com/orgs/hivemapper
3. Hilary H. Brown (Medium) — Reimagining Maps through Blockchain Incentives (Oct 2025). https://medium.com/@hilary.h.brown/case-study-reimagining-maps-through-blockchain-incentives-the-hivemapper-story-9c31753287d1
4. Kyle Samani (Multicoin) — The Rails For Physical AI (2026-06-12). https://kylesamani.com/posts/the-rails-for-physical-ai/
5. GEODNET Docs — Tokenomics & SuperHex (retrieved 2026-06-17). https://docs.geodnet.com/geod-token/tokenomics
6. WeatherXM Blog — Targeted Rollouts and the Economics of Real-World Weather (Oct 2025). https://blog.weatherxm.com/targeted-rollouts-and-the-economics-of-real-world-weather-c2f4dbc46432
7. CoinMarketCap — WeatherXM (WXM) Overview (retrieved 2026-06-17). https://coinmarketcap.com/currencies/weatherxm/
8. WeatherXM Docs — $WXM Token Allocation (retrieved 2026-06-17). https://docs.weatherxm.com/tokenomics
9. ION Navigation — GEODNET / GNSS network (historical context for Helium's 950k benchmark). https://navi.ion.org/content/70/4/navi.605
