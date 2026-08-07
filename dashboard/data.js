// AUTO-GENERATED from tasks/tasks.json by scripts/generate.mjs — do not edit by hand.
window.TASKS = {
  "project": "The Orchard v2 — Website",
  "repo": "FlipThisCrypto/The-Orchard-Website-v2",
  "updated": "2026-08-07",
  "note": "Canonical source of truth for all tasks. TASKS.md and dashboard/data.js are generated from this file. Only the Lead edits it.",
  "phases": [
    {
      "id": "0-foundation",
      "title": "Phase 0 — Foundation",
      "desc": "The coordination system: manual, roles, templates, task board, dashboard, brand & architecture grounding."
    },
    {
      "id": "1-direction",
      "title": "Phase 1 — Direction",
      "desc": "Advisors answer the big strategic questions in their lanes; Lead synthesizes into locked decisions (ADRs)."
    },
    {
      "id": "2-design",
      "title": "Phase 2 — Design",
      "desc": "Wireframes, design tokens, globe proof-of-concept."
    },
    {
      "id": "3-build",
      "title": "Phase 3 — Build",
      "desc": "Astro shell + globe island + Atlas API on Cloudflare."
    },
    {
      "id": "4-migrate",
      "title": "Phase 4 — Migrate",
      "desc": "Cut over from v1 when at parity."
    }
  ],
  "owners": {
    "lead": {
      "name": "Claude Code",
      "seat": "Lead Dev & Integrator",
      "color": "#a3e635"
    },
    "chatgpt": {
      "name": "ChatGPT",
      "seat": "Product & UX Strategy",
      "color": "#2bd4d4"
    },
    "gemini": {
      "name": "Gemini",
      "seat": "Research & Modeling",
      "color": "#b14aef"
    },
    "grok": {
      "name": "Grok",
      "seat": "Growth & Markets",
      "color": "#ff9f2e"
    }
  },
  "statuses": [
    "backlog",
    "ready",
    "assigned",
    "in_review",
    "changes_requested",
    "done",
    "blocked"
  ],
  "tasks": [
    {
      "id": "ORCH-001",
      "title": "Repo structure + AGENTS.md operating manual",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "0-foundation",
      "depends_on": [],
      "inputs": [],
      "scope_in": "Create the full repo directory tree and AGENTS.md (roles, the two laws, the task lifecycle, where everything lives).",
      "scope_out": "Advisor content; the website build.",
      "definition_of_done": [
        "Directory tree exists",
        "AGENTS.md complete and internally consistent",
        "Links resolve"
      ],
      "deliverable_path": "AGENTS.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-002",
      "title": "Task system (tasks.json + TASKS.md generator)",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-001"
      ],
      "inputs": [],
      "scope_in": "Define tasks.json schema and seed all Phase 0/1 tasks; generate human-readable TASKS.md and dashboard data from it.",
      "scope_out": "Advisor work itself.",
      "definition_of_done": [
        "tasks.json validates",
        "All seed tasks fully scoped",
        "TASKS.md generated from it"
      ],
      "deliverable_path": "tasks/tasks.json",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-003",
      "title": "Live progress dashboard",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-002"
      ],
      "inputs": [],
      "scope_in": "Self-contained dashboard/index.html (brand-styled): overall %, per-phase and per-advisor swimlanes, status pills, live GitHub status strip, auto-refresh.",
      "scope_out": "Backend services.",
      "definition_of_done": [
        "Renders all tasks from data.js",
        "Overall + per-advisor progress correct",
        "Works opened locally",
        "GitHub status strip wired"
      ],
      "deliverable_path": "dashboard/index.html",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-004",
      "title": "MISSION.md grounding pack",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "0-foundation",
      "depends_on": [],
      "inputs": [
        "https://theorchard.network/",
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/VISION.md"
      ],
      "scope_in": "One-page ground truth every advisor reads first: what The Orchard is, what v2 is, constraints, lexicon, brand essence, grounding URLs.",
      "scope_out": "Detailed brand spec (separate task).",
      "definition_of_done": [
        "Accurate to VISION.md and live site",
        "Lexicon table present",
        "Constraints + cold-start stated"
      ],
      "deliverable_path": "MISSION.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-005",
      "title": "Brand & voice reference",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://theorchard.network/"
      ],
      "scope_in": "Port v1 design tokens (colors, gradient, radii, type) and codify the voice (anti-hype) + visual language into docs/brand/.",
      "scope_out": "New visual design / mockups (Phase 2).",
      "definition_of_done": [
        "All v1 tokens captured",
        "Voice guide with do/don't",
        "Usable by advisors and the build"
      ],
      "deliverable_path": "docs/brand/brand-and-voice.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-006",
      "title": "Advisor guides + templates",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-001"
      ],
      "inputs": [],
      "scope_in": "End-to-end guide per advisor (Grok/Gemini/ChatGPT) + the Lead role; Task Brief, Deliverable, and ADR templates.",
      "scope_out": "Assigning actual tasks (that's the seed backlog).",
      "definition_of_done": [
        "Three advisor guides + lead role",
        "Three templates",
        "Lanes match AGENTS.md"
      ],
      "deliverable_path": "governance/roles/",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-007",
      "title": "Globe/Atlas architecture brief (ADR)",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/datalayer/SPEC.md",
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/decisions/0003-datalayer-verifiable-dataset.md"
      ],
      "scope_in": "Document the staged globe architecture: rendering (deck.gl+MapLibre, three.js deep), LOD across 4 zoom levels, Cloudflare data tiling, performance budget summary, cold-start, privacy, staged build path.",
      "scope_out": "Writing the actual globe code (Phase 2/3).",
      "definition_of_done": [
        "Covers rendering, data, perf, cold-start, privacy, migration",
        "Maps to existing SPEC/ADR-0003",
        "De-risking order stated"
      ],
      "deliverable_path": "docs/architecture/0001-atlas-globe.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-008",
      "title": "Decision log seeded (ADR 0001, 0002)",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "0-foundation",
      "depends_on": [
        "ORCH-006"
      ],
      "inputs": [],
      "scope_in": "Record the coordination model (ADR-0001, Accepted) and the tech-stack working assumption (ADR-0002, Proposed).",
      "scope_out": "Decisions not yet made.",
      "definition_of_done": [
        "ADR-0001 Accepted",
        "ADR-0002 Proposed with options table",
        "Both follow the template"
      ],
      "deliverable_path": "governance/decisions/",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-010",
      "title": "'The Orchard in 2036' positioning + category",
      "owner": "chatgpt",
      "status": "done",
      "priority": "P0",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md",
        "https://theorchard.network/"
      ],
      "scope_in": "One-sentence positioning for 2036 + the category we own; 2-3 alternates with trade-offs; lead with a recommendation.",
      "scope_out": "Visual design; marketing taglines (Grok); market data (Gemini).",
      "definition_of_done": [
        "One recommended sentence + rationale",
        "2-3 alternates",
        "Names the category",
        "Consistent with anti-hype ethos"
      ],
      "deliverable_path": "docs/product/positioning-2036.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-011",
      "title": "Persona ranking + the single 60-second action",
      "owner": "chatgpt",
      "status": "done",
      "priority": "P0",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "Rank the audiences (now vs. later); pick the primary persona; define the single most important action a first-time visitor should take in 60 seconds and why.",
      "scope_out": "Full IA (separate task); growth channels (Grok).",
      "definition_of_done": [
        "Ranked personas with reasoning",
        "One primary persona",
        "One primary action, justified",
        "Addresses both crypto-native-now and enterprise-later"
      ],
      "deliverable_path": "docs/product/personas-and-primary-action.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-012",
      "title": "Information architecture / sitemap + progressive disclosure",
      "owner": "chatgpt",
      "status": "done",
      "priority": "P1",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-010",
        "ORCH-011"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md",
        "https://theorchard.network/"
      ],
      "scope_in": "Sitemap + navigation for v2; how the cinematic globe coexists with a fast functional site; how a buyer, an operator, and a researcher each get where they need; progressive disclosure rules.",
      "scope_out": "Visual/layout design; copy.",
      "definition_of_done": [
        "Sitemap with routes/sections",
        "Globe-vs-site relationship defined",
        "Paths for 3 key personas",
        "Respects performance/SEO constraints"
      ],
      "deliverable_path": "docs/product/information-architecture.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-013",
      "title": "Fruit -> data-class legend",
      "owner": "chatgpt",
      "status": "done",
      "priority": "P1",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md",
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/VISION.md"
      ],
      "scope_in": "The legend mapping fruit types to sensor/data classes; how size/color/freshness encode real metrics; rules that keep it legible (not cluttered) and scalable from 3 to 100k Trees.",
      "scope_out": "3D rendering implementation (Lead); exact color hex (defer to brand).",
      "definition_of_done": [
        "Fruit->data-class table",
        "Encoding rules for size/color/freshness",
        "Legibility + scale rules",
        "Maps only to plausible sensor types, assumptions flagged"
      ],
      "deliverable_path": "docs/product/fruit-data-legend.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-014",
      "title": "Node-state & gamification model",
      "owner": "chatgpt",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-013"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "What a Tree looks/does across states (healthy, idle, offline, failed, withered, new growth); honest gamification that motivates uptime without hype or fake density.",
      "scope_out": "Reward math (Gemini/ChatGPT-design separate); rendering (Lead).",
      "definition_of_done": [
        "State -> visual mapping",
        "Ties to real signals (uptime/heartbeat)",
        "No mechanics that misrepresent the network",
        "Reduced-motion friendly"
      ],
      "deliverable_path": "docs/product/node-states-gamification.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-020",
      "title": "DePIN competitor teardown",
      "owner": "gemini",
      "status": "done",
      "priority": "P1",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md",
        "https://hivemapper.com",
        "https://geodnet.com",
        "https://weatherxm.com",
        "https://www.helium.com",
        "https://rendernetwork.com",
        "https://dimo.org"
      ],
      "scope_in": "Sourced teardown of 6 DePIN projects (model, traction, tokenomics, data products); one thing to borrow + one to avoid per project; a comparison table.",
      "scope_out": "Our own positioning/copy (Grok); our financial model (separate task).",
      "definition_of_done": [
        "All 6 covered",
        "Every traction figure cited",
        "Borrow + avoid per project",
        "Comparison table",
        "Assumptions/uncertainty flagged"
      ],
      "deliverable_path": "docs/research/competitors.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-021",
      "title": "Data-buyer & use-case research",
      "owner": "gemini",
      "status": "done",
      "priority": "P1",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "Who buys environmental sensor data, for what, at what rough price, via what channels; rank use cases (academic, municipal, insurance, agtech, climate) by fit for The Orchard.",
      "scope_out": "Sales copy; IA.",
      "definition_of_done": [
        "Buyer segments with sources",
        "Use cases ranked by fit + reasoning",
        "Price/channel notes where sourced",
        "Gaps labeled, not invented"
      ],
      "deliverable_path": "docs/research/data-buyers-and-use-cases.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-022",
      "title": "Financial model v0",
      "owner": "gemini",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-020",
        "ORCH-021"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "A v0 model of revenue streams across 1/3/10-year horizons (hardware, data/API, community, services, licensing, sponsorship), rough cost structure, and marketing spend; all assumptions explicit.",
      "scope_out": "Tokenomics math/issuance design; legal/tax advice.",
      "definition_of_done": [
        "Streams across 3 horizons",
        "Cost + marketing lines",
        "Every assumption stated + method shown",
        "Clearly labeled v0/estimate"
      ],
      "deliverable_path": "docs/research/financial-model-v0.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-023",
      "title": "Nonprofit / compliance research",
      "owner": "gemini",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "Research how a 501(c)(3) interacts with token/NFT/crypto activity: UBIT, charitable solicitation, data-as-public-good vs. commercial use; summarize considerations and where a professional is required.",
      "scope_out": "Giving legal advice; choosing a structure (that's Richard's call with counsel).",
      "definition_of_done": [
        "Key considerations with sources",
        "Explicit 'consult a professional' flags",
        "No claim presented as legal advice"
      ],
      "deliverable_path": "docs/research/nonprofit-compliance.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-030",
      "title": "Positioning & messaging pillars",
      "owner": "grok",
      "status": "done",
      "priority": "P1",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md",
        "https://theorchard.network/"
      ],
      "scope_in": "3-4 messaging pillars; a headline/subhead system; tagline options building on GROW · CONNECT · EARN; how we sound against other DePIN projects — all anti-hype.",
      "scope_out": "IA/UX (ChatGPT); the 2036 category sentence (ChatGPT); hard market data (Gemini).",
      "definition_of_done": [
        "3-4 pillars",
        "Headline system + tagline options",
        "Honest/anti-hype voice",
        "Differentiation noted with sources"
      ],
      "deliverable_path": "docs/growth/positioning-and-messaging.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-031",
      "title": "Community & growth plan",
      "owner": "grok",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-030"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "Channel strategy (X, Discord, Reddit, Chia + maker communities), content cadence, referral/quest/ambassador mechanics, and 2-3 launch hooks for the v2 globe.",
      "scope_out": "Paid budget modeling (Gemini); product features (ChatGPT).",
      "definition_of_done": [
        "Channels with rationale",
        "Cadence + mechanics",
        "2-3 concrete launch hooks",
        "Realistic for a solo founder + small community"
      ],
      "deliverable_path": "docs/growth/community-and-growth-plan.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-032",
      "title": "Real-time DePIN market pulse",
      "owner": "grok",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-004"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/MISSION.md"
      ],
      "scope_in": "What narratives/launch tactics are landing in DePIN right now and what we should borrow or avoid; cite the actual posts/threads/articles.",
      "scope_out": "Rigorous competitor teardown with traction numbers (Gemini owns that).",
      "definition_of_done": [
        "Current tactics with linked sources",
        "Borrow/avoid for The Orchard",
        "Dated (pulse is time-sensitive)",
        "No fabricated metrics"
      ],
      "deliverable_path": "docs/growth/depin-market-pulse.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-040",
      "title": "Globe proof-of-concept (3 real Trees)",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "2-design",
      "depends_on": [
        "ORCH-007"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/0001-atlas-globe.md"
      ],
      "scope_in": "A throwaway dark-globe prototype with the 3 real Trees, auto-rotation, one pulse arc, brand tokens, and a 2D/reduced-motion fallback — to validate look and performance budget. GATED on Richard's go.",
      "scope_out": "Production code; backend.",
      "definition_of_done": [
        "Dark globe renders 3 real Trees",
        "Within initial bundle budget",
        "Reduced-motion fallback",
        "Runs on mid-range mobile"
      ],
      "deliverable_path": "prototypes/globe-poc/",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-041",
      "title": "Performance budget + device targets",
      "owner": "lead",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-007"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/0001-atlas-globe.md"
      ],
      "scope_in": "Concrete budgets: landing-shell JS, lazy globe bundle, FPS floors, memory, device/browser targets, and the techniques to hold them.",
      "scope_out": "Implementation.",
      "definition_of_done": [
        "Numeric budgets per surface",
        "Device/browser matrix",
        "Techniques listed",
        "Fallback thresholds defined"
      ],
      "deliverable_path": "docs/architecture/performance-budget.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-042",
      "title": "Atlas data & privacy contract mapping",
      "owner": "lead",
      "status": "done",
      "priority": "P2",
      "phase": "1-direction",
      "depends_on": [
        "ORCH-007"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/datalayer/SPEC.md",
        "https://github.com/FlipThisCrypto/the-orchard/blob/main/docs/decisions/0003-datalayer-verifiable-dataset.md"
      ],
      "scope_in": "Map the public Atlas endpoints (tiles/nodes/node) to the frozen SPEC fields and the geohash privacy model; define what is public vs. owner-only.",
      "scope_out": "Building the endpoints (Phase 3).",
      "definition_of_done": [
        "Endpoint -> SPEC field map",
        "Public vs owner-only delineated",
        "Honors GPS-scrubbing precedent",
        "No precise GPS in any public path"
      ],
      "deliverable_path": "docs/architecture/atlas-data-privacy-contract.md",
      "created": "2026-06-17",
      "updated": "2026-06-17"
    },
    {
      "id": "ORCH-050",
      "title": "Worldview: live-Trees globe on real oracle data",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-040"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Ship the interim (Path A) real-data globe at worldview.theorchard.network: live /nodes and /network/stats from the oracle, fruit per sensor class, coarse operator-declared locations, Orchard Pass links, snapshot fallback off-origin.",
      "scope_out": "The Astro production shell; the Atlas tile API; precise GPS of any kind.",
      "definition_of_done": [
        "Reads live oracle data on the theorchard.network origin",
        "Falls back to a real-data snapshot elsewhere",
        "Coarse regions only — never precise GPS",
        "Deployed on its own subdomain without touching v1"
      ],
      "deliverable_path": "worldview/",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-051",
      "title": "Worldview reliability: in-place refresh, response validation, GPU recovery",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-050"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Make the page survivable while left open: refresh data into the existing globe instead of rebuilding it, validate oracle response shape so an HTTP-200 error body degrades to the snapshot, and detect/recover from a lost WebGL context with the camera preserved.",
      "scope_out": "Server-side changes; the oracle API itself.",
      "definition_of_done": [
        "One WebGL context regardless of uptime",
        "Camera position survives every refresh",
        "No response body can throw out of the refresh loop",
        "Context loss is explained and recovered"
      ],
      "deliverable_path": "worldview/index.html",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-052",
      "title": "Untrusted-input boundary + response headers",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-050"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Treat every device-reported field as untrusted: escape at each HTML sink, shape-check the Orchard Pass id and geohash, and serve anti-framing, nosniff, referrer and Permissions-Policy headers on the wallet-adjacent origin.",
      "scope_out": "A strict script-src (needs the inline scripts extracted and the WalletConnect origins enumerated against a real wallet).",
      "definition_of_done": [
        "No device string reaches HTML unescaped",
        "A javascript: Pass id never becomes a link",
        "Page cannot be framed by a third party",
        "geolocation denied at the header level"
      ],
      "deliverable_path": "worldview/_headers",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-053",
      "title": "Worldview: keyboard and screen-reader access to the network",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-050"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Give the canvas-only data a real DOM path: a focusable, searchable Tree list that opens the same detail panel, dialog semantics with focus management, and a polite live region for status.",
      "scope_out": "A full WCAG 2.1 AA audit of every page (backlog).",
      "definition_of_done": [
        "Every Tree reachable and openable by keyboard",
        "Panels are labelled dialogs, inert when closed",
        "Focus returns to the opener",
        "Status changes are announced"
      ],
      "deliverable_path": "worldview/index.html",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-054",
      "title": "Worldview performance: lazy engine, bounded list, bounded pulses",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "3-build",
      "depends_on": [
        "ORCH-041",
        "ORCH-050"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Hold the documented performance budget: load the 3D engine off the critical path with a Save-Data/low-memory opt-in, cap the Tree list with search, and cap the animated ring layer liveness-first — disclosing every cap.",
      "scope_out": "The deck.gl/MapLibre rebuild and tiled server-side aggregation (Phase 3 proper).",
      "definition_of_done": [
        "3D never blocks first paint",
        "Page useful with no engine at all",
        "List DOM flat from 100 to 5,000 Trees",
        "Under the 300 MB budget at 20,000 Trees",
        "Every cap stated on screen"
      ],
      "deliverable_path": "docs/architecture/performance-budget.md",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-055",
      "title": "Automated tests, CI, and a deterministic task-board generator",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-002"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Give the repo verification it never had: unit tests over the pure data logic and security controls, GitHub Actions running them plus a syntax check, and a generator whose output is a pure function of tasks.json so drift can be detected.",
      "scope_out": "End-to-end browser tests (no runner in a zero-dependency repo).",
      "definition_of_done": [
        "node --test runs with no install step",
        "CI runs on every push and PR",
        "Generated board files verified in sync",
        "Security controls covered by tests that fail when removed"
      ],
      "deliverable_path": "tests/",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-056",
      "title": "Mission Control: truthful, resilient, accessible",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "3-build",
      "depends_on": [
        "ORCH-003"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Stop the dashboard misreporting: stay inside GitHub rate limits and say what actually happened, show unplanned phases as unplanned, keep the embedded board when the live file is unusable, escape every rendered field, and make the swimlane filters keyboard-operable.",
      "scope_out": "Redesign of the dashboard; new metrics.",
      "definition_of_done": [
        "Sustained API use inside the 60/hour budget",
        "No state described that was not observed",
        "A bad tasks.json cannot blank the board",
        "Every control operable by keyboard with state exposed"
      ],
      "deliverable_path": "dashboard/",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-057",
      "title": "Share metadata and favicon across the published pages",
      "owner": "lead",
      "status": "done",
      "priority": "P2",
      "phase": "3-build",
      "depends_on": [
        "ORCH-006"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Bring the published v2 pages up to the metadata convention the live v1 site already uses: page-specific description, canonical URL, Open Graph and Twitter cards on the project brand banner, theme colour, and an SVG favicon.",
      "scope_out": "A bespoke per-page social image; analytics.",
      "definition_of_done": [
        "Every published page unfurls with a card",
        "Card images absolute and real",
        "No two pages share a title or description",
        "Favicon renders on every surface"
      ],
      "deliverable_path": "favicon.svg",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-058",
      "title": "Fruit legend: one source of truth for classes and colours",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "3-build",
      "depends_on": [
        "ORCH-013"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/architecture/performance-budget.md"
      ],
      "scope_in": "Drive classification, colours and the on-screen legend from one table, extend it to the canonical energy and seismic classes, remove the colour collision with node state, and lock code and the canonical doc to each other with tests.",
      "scope_out": "Grove-level fruit aggregation and LOD (Phase 3 proper).",
      "definition_of_done": [
        "Every canonical class reachable from a sensor key",
        "No two classes share a colour",
        "Nothing renderable missing from the legend",
        "Doc and code verified against each other"
      ],
      "deliverable_path": "docs/product/fruit-data-legend.md",
      "created": "2026-08-06",
      "updated": "2026-08-06"
    },
    {
      "id": "ORCH-059",
      "title": "Ship worldview to production, with drift detection",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-050"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Deploy the built page to worldview.theorchard.network (direct-upload Pages), correct the deploy docs that implied git-connected builds, and add scripts/check-deployed.mjs so \"is production running this repo?\" is answerable by hash.",
      "scope_out": "Changing the Pages project type; the other Orchard properties.",
      "definition_of_done": [
        "Production byte-identical to the repo on every deployable file",
        "_headers observably applied",
        "Docs lead with the direct-upload warning",
        "Induced drift detected with both hashes shown"
      ],
      "deliverable_path": "scripts/check-deployed.mjs",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-060",
      "title": "Failure honesty: boot boundaries, empty states, isolated globe failures",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-051"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Catch the failures the pages could not report: a script that never starts shows a banner instead of \"connecting…\" forever; a board with no data says so instead of \"0%\"; a globe that cannot build reports as a globe problem, not a data problem, and stops retrying blindly.",
      "scope_out": "Server-side monitoring.",
      "definition_of_done": [
        "Boot failure visible on both pages with a reload path",
        "\"No data\" never renders as a measured zero",
        "Globe construction failure isolated from the data path with a single retry offer"
      ],
      "deliverable_path": "worldview/app.js",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-061",
      "title": "Honest time: oracle clock, heartbeat states, UTC parsing",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-051"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Judge freshness against the oracle's as_of_utc rather than the visitor's clock; parse its offset-less timestamps as UTC (they were being read in local time, making node state a function of geography); use last_seen_at to implement the canonical Stale-data vs Offline precedence; never call a never-reported Tree healthy or \"recent\".",
      "scope_out": "Oracle-side changes.",
      "definition_of_done": [
        "Same payload yields the same state in every timezone",
        "States match the oracle's own trees_active_24h",
        "never-reported renders as new growth with \"never\"",
        "Corrections to earlier wrong claims logged in the canonical doc"
      ],
      "deliverable_path": "worldview/orchard-data.js",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-062",
      "title": "Show the network as it is: activity-first stats, composition, Explorer evidence",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "3-build",
      "depends_on": [
        "ORCH-061"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Headline trees_active_24h and readings_last_24h over lifetime totals; show health and data composition unblended per the node-state model; complete the Tree Explorer with the sensor list, planted date, Pass verification evidence, and a named list of what the oracle does not publish.",
      "scope_out": "New oracle endpoints.",
      "definition_of_done": [
        "Activity figures lead the stat tiles",
        "Composition shown as two separate lines, never a blended score",
        "Pass tick only with on-chain evidence",
        "Unpublished fields named, not omitted"
      ],
      "deliverable_path": "worldview/app.js",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-063",
      "title": "Structural accessibility as a contract across every page",
      "owner": "lead",
      "status": "done",
      "priority": "P1",
      "phase": "3-build",
      "depends_on": [
        "ORCH-053"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Landmarks, single-h1 outlines, skip links, decorative canvas markers and reduced-motion state shapes — then encode the whole set as tests over every published page so the next page cannot ship without them.",
      "scope_out": "A formal WCAG audit.",
      "definition_of_done": [
        "Contract enforced by tests that failed red on the drifted page first",
        "State distinguishable by shape and label with zero animation",
        "Every page routes visibly to the live network"
      ],
      "deliverable_path": "tests/page-structure.test.mjs",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-064",
      "title": "Guard the gates: pre-commit hook, extracted scripts, contract checks",
      "owner": "lead",
      "status": "done",
      "priority": "P0",
      "phase": "3-build",
      "depends_on": [
        "ORCH-055"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Make the CI gate run before a commit can exist; extract both pages' inline scripts so node --check covers them (and a strict script-src becomes possible — shipped report-only pending a real wallet test); add scripts/check-oracle.mjs for API drift and scripts/scan-secrets.mjs re-verifying the no-secrets guarantee over the tree and full history.",
      "scope_out": "Enforcing the script CSP before the wallet flow is exercised.",
      "definition_of_done": [
        "A red tree cannot be committed by accident",
        "Every shipped script parse-checked",
        "API contract verified against the live oracle",
        "History-wide secrets scan clean and repeatable"
      ],
      "deliverable_path": "scripts/hooks/pre-commit",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    },
    {
      "id": "ORCH-065",
      "title": "Documentation that cannot silently rot",
      "owner": "lead",
      "status": "done",
      "priority": "P2",
      "phase": "3-build",
      "depends_on": [
        "ORCH-058"
      ],
      "inputs": [
        "https://github.com/FlipThisCrypto/The-Orchard-Website-v2/blob/main/docs/HOW-WE-BUILT-THIS.md"
      ],
      "scope_in": "Update the collaboration tutorial with the build phase and its failures; date and source MISSION.md's network figures with drift detection against the live oracle; log corrections where earlier claims were wrong rather than editing them away.",
      "scope_out": "Rewriting history or advisor deliverables.",
      "definition_of_done": [
        "Tutorial covers what an AI Lead gets wrong unsupervised",
        "Network figures carry an as-of date and a live source",
        "check-oracle reports documented-vs-actual drift"
      ],
      "deliverable_path": "docs/HOW-WE-BUILT-THIS.md",
      "created": "2026-08-07",
      "updated": "2026-08-07"
    }
  ]
};
window.TASKS_UPDATED = "2026-08-07";
