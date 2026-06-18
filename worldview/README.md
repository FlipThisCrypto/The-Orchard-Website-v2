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

## Important: must be served from an `*.theorchard.network` origin for LIVE data
The oracle's CORS allows `*.theorchard.network` only. So:
- On **`worldview.theorchard.network`** → live data. ✅
- Anywhere else (a `*.pages.dev` preview, `localhost`, `github.io`) → the cross-origin fetch is
  blocked, so it **falls back to a baked real-data snapshot** (still shows the network, marked
  "snapshot" instead of "live").

## Deploy (Cloudflare Pages → worldview.theorchard.network)
1. Create a Pages project whose output is **this `worldview/` folder** (connect this repo and set the
   output dir, or drag-drop the folder).
2. Add the **custom domain `worldview.theorchard.network`** to that Pages project (it must be the
   `theorchard.network` zone so CORS + the shared session cookie work).
3. Done — it reads the live oracle. No server, no build step; it's a static page + vendored library.

The live v1 site is untouched; this is a separate page on its own subdomain.

## Operator-declared locations
`LOCATIONS` (in `index.html`) maps each `node_id` → a coarse lat/lng around Shepherdsville. Update it
when Trees move or new ones come online — **or** finish **Path 🅱** so locations live in the oracle:

## Path 🅱 (the proper wiring, follow-up)
Add an owner-set coarse location to the oracle (a `geohash` the operator sets per Tree; public sees
only the ~5 km cell). Then this page reads location from the API like everything else and the
`LOCATIONS` map can be retired. Live GPS already auto-fills `geohash` if a Tree ever gets a fix.

## Vendored (`vendor/`)
`globe.gl.min.js` (includes three.js) + `earth-night.jpg` — self-contained, no CDN.
