# inbox — raw advisor submissions

When an advisor returns a deliverable, **the Lead** files the raw text here before integrating the
accepted version into `docs/`. Naming: `inbox/<agent>/ORCH-###-vN.md` (bump the version on each
`changes_requested` round).

Why it exists:
- **Audit trail** — every version an advisor sent is preserved.
- **Law 1 (anti-collision)** — advisors never write to the repo; only the Lead does, here and in
  `docs/`. The integrated, reviewed version is what lands in `docs/<lane>/`.

Lanes: `grok/` · `gemini/` · `chatgpt/`.
