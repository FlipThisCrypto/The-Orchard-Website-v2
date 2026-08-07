# worldview — the live Trees globe

The real-data globe for **`worldview.theorchard.network`**: a dark Earth where every point is a live
Orchard Tree, pulling **real** node data from the oracle. This is **Path 🅰** (interim) of the
worldview integration — see the integration notes below.

## What it shows
- **Live data** from `https://oracle.theorchard.network/nodes` + `/network/stats` — node count,
  harvested-readings total, sensors, firmware, status, and each Tree's **Orchard Pass** (linked to
  MintGarden, on-chain verifiable).
- **Fruit = data class** from each node's `sensors` (🍊 temp · 🍋 air quality · 🫐 humidity · 🍐 pressure ·
  🍇 particulates; nodes with no sensors yet show as 🌱 online).
- **Coarse, operator-declared locations** (the Trees are around **Shepherdsville, KY**). Precise GPS
  is never used or shown. If a node ever reports a live `geohash` from the oracle, that takes
  precedence over the declared location automatically.
- Drag to rotate (no auto-spin), click a Tree for its Explorer panel. Honors `prefers-reduced-motion`
  and falls back to a 2D list with no WebGL.
- **Keyboard and screen-reader accessible.** The globe is a canvas and can't describe itself, so
  **Browse Trees** opens the same Trees as a focusable list — choose one and the globe flies to it
  and opens the same panel. Both panels are labelled dialogs: focus moves in, `Esc` closes, focus
  returns to what opened them, and while closed they're `inert` (out of the tab order). Stat updates
  are announced through a polite live region. A refresh never steals focus or re-renders the list
  unless the data actually changed.
- **Refreshes every 60s in place** — new oracle data is fed into the existing globe, so your camera
  position is never disturbed. Polling pauses while the tab is hidden and catches up on return.

## Important: must be served from an `*.theorchard.network` origin for LIVE data
The oracle's CORS allows `*.theorchard.network` only. So:
- On **`worldview.theorchard.network`** → live data. ✅
- Anywhere else (a `*.pages.dev` preview, `localhost`, `github.io`) → the cross-origin fetch is
  blocked, so it **falls back to a baked real-data snapshot** (still shows the network, marked
  "snapshot" instead of "live").

## Deploy (Cloudflare Pages → worldview.theorchard.network)

> ⚠️ **A git push does not deploy this page.** The Pages project is **direct-upload**
> (`Git Provider: No`) — merging a PR and a green CI run both deploy exactly nothing. Someone has to
> run the command below. Twenty commits of security and reliability work once sat unshipped for a
> week while every signal in the repo said "done".

```bash
cd worldview && npx --yes wrangler pages deploy . --project-name orchard-worldview --branch main --commit-dirty=true
```

- Deploy **from inside `worldview/`** and deploy `.`, so paths land at the site root.
- `--branch main` targets production rather than a preview. The `*.pages.dev` URL wrangler prints is
  a preview of that upload — **it is not proof production updated**.
- If it fails with `Authentication error [code: 10000]` even though `wrangler whoami` works, set
  `CLOUDFLARE_ACCOUNT_ID` explicitly (`wrangler whoami` prints it) and retry.
- Right after a deploy the first load can serve the new HTML before its sibling assets propagate, so
  the page looks broken. Reload once before diagnosing.

Then confirm production is actually running this repo — byte-exact, plus the security headers:

```bash
node scripts/check-deployed.mjs
```

The custom domain must be on the `theorchard.network` zone so the oracle's CORS and the shared
session cookie work. No server and no build step: a static page plus a vendored library.

The live v1 site is untouched; this is a separate page on its own subdomain.

## Operator-declared locations
`LOCATIONS` (in `index.html`) maps each `node_id` → a coarse lat/lng around Shepherdsville. Update it
when Trees move or new ones come online — **or** finish **Path 🅱** so locations live in the oracle:

## Path 🅱 (the proper wiring, follow-up)
Add an owner-set coarse location to the oracle (a `geohash` the operator sets per Tree; public sees
only the ~5 km cell). Then this page reads location from the API like everything else and the
`LOCATIONS` map can be retired. Live GPS already auto-fills `geohash` if a Tree ever gets a fix.

## Loading behaviour
The 3D engine (`globe.gl` — 490 KB gzip, plus a 597 KB texture) is **never a blocking script**. The
page paints, fetches the oracle and fills the stats and Tree list first; the engine is then injected
`async` and the globe layers in when it arrives. If it never arrives, the page says so and stays
fully usable. On `Save-Data`, `deviceMemory ≤ 1` or `hardwareConcurrency ≤ 2` — or with `?low=1` —
nothing heavy is downloaded at all until you press **Load the globe**. With no WebGL the engine is
never requested. See [`docs/architecture/performance-budget.md`](../docs/architecture/performance-budget.md).

## Files
- `index.html` — the page: layout, globe rendering, panels, the refresh loop.
- `orchard-data.js` — the pure data logic (fruit classification, node state, geohash decoding,
  escaping and id validation). No DOM, so it's unit-tested in `tests/` — run `node --test`.
- `vendor/` — `globe.gl.min.js` (includes three.js) + `earth-night.jpg`. Self-contained, no CDN.
- `_headers` — response headers Cloudflare Pages serves: anti-framing (this page has a wallet
  button), `nosniff`, referrer policy, a `Permissions-Policy` that denies geolocation outright, and
  caching. Checked by `tests/headers.test.mjs`. See [`SECURITY.md`](../SECURITY.md).
