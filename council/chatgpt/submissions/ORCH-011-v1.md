**THE ORCHARD v2 - DELIVERABLE**

- **Task ID:** ORCH-011
- **Title:** Persona ranking + the single 60-second action
- **Author:** ChatGPT
- **Version:** v1
- **Date:** 2026-06-17

### Sources used
1. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md - ground truth for the project, lexicon, privacy model, cold-start constraint, audiences, and v2 website direction.
2. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/governance/roles/advisor-chatgpt.md - ChatGPT advisor scope and Product/UX responsibilities.
3. https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/product/positioning-2036.md - accepted 2036 positioning and category: "community-owned environmental data infrastructure."
4. https://theorchard.network/ - current v1 public messaging, live get-started flow, open-source emphasis, and pre-alpha framing.

### Assumptions & open questions
- **Assumption:** For launch, "first-time visitor" primarily means a motivated technical visitor arriving from Chia, DePIN, GitHub, X, or Richard's direct community, not a cold enterprise buyer.
- **Assumption:** A "Tree readiness" action can include choosing a path such as flash firmware, claim a Tree, read the build requirements, or join the tester queue; the exact implementation belongs to the Lead.
- **Open question for the Lead/Richard:** Should launch prioritize people who can plant Trees immediately, or should it also capture interested non-technical supporters who cannot run hardware yet?
- **Open question for the Lead/Richard:** Is Orchard Pass ownership required for the primary launch action, or should the website first qualify hardware readiness before introducing Pass requirements?

### Deliverable

## Recommendation

The launch primary persona should be the **crypto-native operator-builder**: a technically curious Chia/DePIN participant who can understand wallets, open-source repos, ESP32 hardware, pre-alpha rough edges, and the idea of earning $JUICE for keeping real infrastructure online.

This persona should come first because The Orchard's current bottleneck is not institutional demand; it is credible network growth from roughly 3 Trees toward enough live Trees and Groves to make Orchard View, the living globe, and the future data commons meaningful. The project is hardware-first and infrastructure-first, so the launch site should convert the rare visitor who can actually plant, test, break, report, and improve a Tree. Later audiences matter, but they need proof: signed Harvests, uptime history across Seasons, privacy-preserving public locations, device health, and enough coverage to evaluate.

## Ranked Personas

1. **Crypto-native operator-builder - primary for launch.**  
   Wants to plant a Tree, verify that the system works, earn $JUICE, and participate early. This group tolerates pre-alpha language if the path is honest and concrete. They are most likely to help solve the cold-start problem.

2. **Open-source hardware / citizen-science tester.**  
   Wants a meaningful project to build, fork, teach, or deploy locally. This persona may care less about $JUICE but can contribute sensor drivers, documentation, field testing, and educational use. They should feel welcomed by the same primary path, as long as token language does not dominate the experience.

3. **Curious explorer / community observer.**  
   Wants to understand what the living globe shows, what Trees and Groves are, and whether this is real. This persona may not plant today, but can become a follower, contributor, or future operator if the site makes the network legible in under a minute.

4. **Research, university, city, farm, insurer, environmental group - later buyer/evaluator.**  
   Wants trustworthy environmental data, provenance, privacy posture, coverage, exportability, and governance clarity. They should not be forced through crypto-native language, but at launch they are secondary because the network does not yet have the scale or maturity they will need.

## Single 60-Second Action

**Primary action:**  
**Start a Tree readiness check.**

Within 60 seconds, a first-time visitor should be able to answer: "Can I plant a Tree, and what is my next step?" The action should route them into a lightweight checklist: hardware on hand, supported board, sensors, wallet/Orchard Pass status, comfort with pre-alpha testing, and the next concrete path such as flash firmware, claim a Tree, read build docs, or follow/join for later.

This is stronger than "View the globe," "Read the docs," or "Buy/earn $JUICE" as the primary action. The globe is the proof surface and emotional hook, but the network needs more Trees. Docs are necessary, but too passive. $JUICE is important, but MISSION.md is clear that the token supports the ecosystem instead of being the ecosystem. A readiness check keeps the funnel hardware-first, honest, and useful to both current operators and later evaluators.

## High-Level Journeys

**Journey 1: Operator-builder.**  
Lands on the globe, sees that The Orchard is live but early, opens a Tree or Grove example, then chooses "Start Tree readiness check." They confirm hardware/wallet readiness, flash or claim if ready, or get a precise missing-step list if not. Success is not just a click; it is one more credible path toward a live Tree.

**Journey 2: Data evaluator.**  
Lands on the globe, inspects public Tree/Grove data at coarse location resolution, checks uptime, sensors, history, DataLayer proof, and device health in the Explorer panel. Their next step is not procurement; it is "watch the network mature" or "request/export sample data" later. The site should signal that enterprise/research use is welcome without pretending the network is already scaled.

**Journey 3: Curious explorer.**  
Arrives with no Chia or hardware context, explores the living globe, learns that fruit represents sensor data classes, and understands the basic loop: plant Trees, Harvest readings, prove uptime, earn $JUICE. Their next step can be follow, star the repo, or save the build path for later, but the visible primary action remains Tree readiness.

### Self-check against the Definition of Done
- [x] Ranked personas with reasoning (now vs. later) - met
- [x] One primary persona named - met
- [x] One primary 60-second action, justified - met
- [x] 2-3 high-level journeys - met
- [x] Serves both crypto-native-now and enterprise/research-later without alienating either - met
- [x] Sources cited; assumptions & open questions flagged; lexicon correct - met

### Proposed follow-ups
- ORCH-012 should translate "Start a Tree readiness check" into the site IA without making the whole homepage feel like a setup wizard.
- Gemini should later validate which institutional evaluator fields matter most before any "request/export sample data" path is designed.
