# Security Policy

The Orchard is built in the open, but **safety of operators, their data, and their keys comes first.**
This document covers how to report issues, what we guarantee, and the hardening checklist for maintainers.

## Reporting a vulnerability

**Please do not open a public issue for security problems.** Instead:

1. Open a **private GitHub Security Advisory**: repo → **Security → Advisories → Report a vulnerability**, or
2. Reach the maintainer privately via X DM **[@FiendStudios](https://x.com/FiendStudios)**.

Include what you found, how to reproduce it, and the potential impact. We'll acknowledge, investigate,
and credit you if you'd like. This is a pre-alpha, community project — please be kind and give us time.

## What this repository does and doesn't contain

- ✅ **No secrets.** There are no private keys, mnemonics, API tokens, passwords, or wallet files in
  this repo. It was scanned on 2026-06-17 and `.gitignore` is hardened against committing them.
- ✅ **No precise locations.** Tree positions are shown only as **coarse (~5 km) regions / geohash
  cells**, never precise GPS. The PoC's sample coordinates are region-level and representative.
- ✅ **No privileged endpoints or internals** that would aid an attack. Public service URLs
  referenced here are the same ones already linked from the live site.

## Privacy model (operator safety)

Trees often live in people's homes and yards. The published data model enforces:

- **Public location = coarse geohash (~5 km) only.** Precise GPS is **owner-only** and scrubbed
  server-side; it must never enter any public path. Full contract:
  [`docs/architecture/atlas-data-privacy-contract.md`](docs/architecture/atlas-data-privacy-contract.md).
- **No client-side reverse-geocoding** — precise coordinates are never sent to the browser.
- **No operator identity / wallet** is published with a Tree.

If you ever see precise location or owner identity exposed anywhere, treat it as a **security bug** and
report it via the process above.

## Handling secrets (contributors)

- Never paste a private key, mnemonic, seed phrase, wallet file, or API token into a file, a Task
  Brief, a deliverable, or a commit. The courier flow (`AGENTS.md`) means content can pass through
  several hands — keep secrets out of it entirely.
- Local secrets belong in untracked `.env` files (already git-ignored). Use a `.env.example` with
  blank placeholders to document required variables.

## Maintainer hardening checklist (GitHub settings)

These can't be set from the codebase — enable them in the repo's GitHub settings:

- [ ] **Branch protection** on `main`: block force-pushes and deletion. (Lead-only commits already,
      but this prevents accidents and hijacks.)
- [ ] **Secret scanning + push protection**: Settings → Code security → enable both (free for public
      repos). Stops a key from ever being pushed.
- [ ] **Dependabot alerts** (and security updates): Settings → Code security.
- [ ] **Actions permissions**: Settings → Actions → General → Workflow permissions = **Read
      repository contents** (the Pages workflow already declares least-privilege scopes).
- [ ] **Require 2FA** on the GitHub account; prefer a hardware key or authenticator.
- [ ] **Commit-email privacy**: Settings → Emails → "Keep my email address private," then set
      `git config user.email <id>+<user>@users.noreply.github.com` so your personal email isn't in
      commit history going forward.
- [ ] **Confirm the Pages source** (Settings → Pages). If it's "Deploy from a branch," the
      `deploy-pages.yml` workflow is redundant and can be removed; if "GitHub Actions," keep it.

## Scope

In scope: this repository, the published dashboard/PoC, and the documented data/privacy model.
Out of scope: third-party libraries bundled under `prototypes/globe-poc/vendor/`, and the separate
main project / live services (report those through the main project's channels).

*Last reviewed: 2026-06-17.*
