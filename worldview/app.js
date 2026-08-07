// The Orchard — worldview page script.
//
// Extracted from index.html so it can be cached separately (the HTML is
// deliberately max-age=0), syntax-checked in CI, and — the reason that
// mattered — so a strict script-src CSP becomes possible at all. An inline
// block would force 'unsafe-inline', which defeats the policy.
//
// Load order matters: orchard-data.js defines window.OrchardData, this file
// consumes it, and the wallet widget loads after. The boot error boundary
// stays inline in the page because it must run before anything it guards.
const ORACLE = "https://oracle.theorchard.network";
  const REGION = "Shepherdsville, KY (approx.)";
  // Operator-declared COARSE locations (the operator's Trees are around
  // Shepherdsville, KY). Never precise GPS. Used until a node reports a live
  // geohash from the oracle (which then takes precedence).
  const LOCATIONS = {
    "0C59BF4E1F5B815E08AC3D7669593A5E": { lat:37.990, lng:-85.715 },
    "7DD309EE736A19EA19E6ABF9C5172528": { lat:38.012, lng:-85.700 },
    "D65F96E44E0EB1CB21F2C01B8C7C89D4": { lat:37.974, lng:-85.736 },
    "F04EC2E3B76077374BE9142CF91D2CE9": { lat:38.001, lng:-85.690 }
  };
  // Real-data snapshot, captured from the live oracle on 2026-08-07 — used only
  // when the live fetch
  // is blocked (e.g., previewing off an *.theorchard.network origin / offline).
  const SNAPSHOT_NODES = [
    {"node_id":"7DD309EE736A19EA19E6ABF9C5172528","sensors":[],"fw_version":"0.5.1","pass_nft_id":"nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y","last_seen_at":"2026-07-26T23:47:51.359575","last_reading_at":"2026-07-26T23:47:51.359575"},
    {"node_id":"0C59BF4E1F5B815E08AC3D7669593A5E","sensors":["ds18b20","gps"],"fw_version":"0.5.1","pass_nft_id":"nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y","last_seen_at":"2026-07-26T13:46:01.121846","last_reading_at":"2026-07-26T13:46:01.121846"},
    {"node_id":"D65F96E44E0EB1CB21F2C01B8C7C89D4","sensors":[],"fw_version":"0.5.1","pass_nft_id":"nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y","last_seen_at":"2026-08-07T11:31:46.816691","last_reading_at":"2026-08-07T11:31:46.816691"},
    {"node_id":"F04EC2E3B76077374BE9142CF91D2CE9","sensors":[],"fw_version":"0.5.1","pass_nft_id":"nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y","last_seen_at":"2026-08-07T11:31:45.260403","last_reading_at":"2026-08-07T11:31:45.260403"}
  ];
  const SNAPSHOT_STATS = {"trees_registered":4,"trees_active_24h":2,"readings_total":216350,"readings_last_24h":2839,"attestations_total":0,"current_season":73,"as_of_utc":"2026-08-07T11:32:41.533962+00:00"};
  // Live, not latched: someone who turns the preference on mid-session should
  // get a still globe from the next refresh, not on their next visit.
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = motionQuery.matches;
  motionQuery.addEventListener("change", (e)=>{
    reduce = e.matches;
    if(!world) return;
    if(reduce) world.ringsData([]);        // stop the pulses immediately
    else if(TREES.length) world.ringsData(applyRingCap(TREES));
  });

  // Pure data logic (classification, node state, geohash, escaping, id checks)
  // lives in orchard-data.js so it can be unit-tested — see tests/.
  const { esc, isGeohash, isNftId, ghCenter, fruitsFor, stateFrom, ago, STATE_COLOR,
          networkSummary, treeSummary, normalizeNodes, normalizeStats, lookup,
          listView, ringSet, legendRows, abortAfter, withDeadline, shapeFor,
          composition, referenceNow, showCount, passEvidence, plantedFor } = window.OrchardData;
  let ORACLE_NOW = Date.now();   // replaced by the oracle's as_of_utc each refresh
  let TREES = [];   // the Trees currently shown, in list order

  function webglOK(){ try{ const c=document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl")||c.getContext("experimental-webgl"))); }catch(e){ return false; } }
  const $=(id)=>document.getElementById(id);
  let world=null;      // the ONE Globe instance — built once, then only fed new data
  let loading=false;   // guards against overlapping refreshes on a slow network

  // Deadlines, both well under the 60s refresh interval. A request that
  // connects and never answers used to latch the in-flight guard forever —
  // the loop then stayed dead even after the oracle recovered.
  const REQUEST_TIMEOUT_MS = 8000;
  const REFRESH_CEILING_MS = 20000;

  async function getJSON(path){
    const { signal, done } = abortAfter(REQUEST_TIMEOUT_MS);
    try {
      const r = await fetch(ORACLE+path,{cache:"no-store", signal});
      if(!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { done(); }
  }

  async function load(){
    if(loading) return;          // a refresh is already in flight
    loading=true;
    // Nothing the oracle can return — or fail to return — may break the loop.
    // The ceiling is the backstop: whatever happens inside, the guard is
    // released and the next tick gets its chance.
    try { await withDeadline(refresh(), REFRESH_CEILING_MS); dataNote(""); }
    catch(e){ dataNote("Couldn't read the network just now — showing the last known data."); }
    finally { loading=false; }
  }

  async function refresh(){
    // HTTP 200 is not a promise about the body: an oracle answering
    // {"error": "..."} or a proxy answering HTML must degrade to the snapshot,
    // exactly like a failed fetch would.
    let nodes = null, stats = null;
    try { nodes = normalizeNodes(await getJSON("/nodes")); } catch(e){ nodes = null; }
    try { stats = normalizeStats(await getJSON("/network/stats")); } catch(e){ stats = null; }
    const live = nodes !== null;
    if(!live) nodes = normalizeNodes(SNAPSHOT_NODES);
    if(!stats && !live) stats = normalizeStats(SNAPSHOT_STATS);

    // Judge freshness against the oracle's clock, not the visitor's.
    const oracleNow = referenceNow(stats);
    ORACLE_NOW = oracleNow;
    const pts=[];
    for(const n of nodes){
      const gh = isGeohash(n.geohash) ? n.geohash.toLowerCase() : null;
      const loc = (gh && ghCenter(gh)) || lookup(LOCATIONS, n.node_id) || null;
      const fruits = fruitsFor(n.sensors);
      const state = stateFrom(n, oracleNow);
      const placed = !!loc;
      const node = { id:n.node_id, short:(n.node_id||"").slice(0,8),
        lat: loc?loc.lat:null, lng: loc?loc.lng:null,
        region: gh ? ("cell "+gh) : REGION,
        fruits, state, fw:n.fw_version, pass:n.pass_nft_id, last:n.last_reading_at,
        passVerifiedAt:n.pass_verified_at, registeredAt:n.registered_at,
        sensors:(n.sensors||[]).filter(s=>s!=="gps"),
        color: fruits[0] ? fruits[0].color : STATE_COLOR[state] };
      if(placed) pts.push(node);
    }

    // Unknown is shown as unknown — never as a confident zero. Activity
    // leads; the lifetime totals sit underneath as context.
    const S = stats || {};
    $("s-active").textContent   = showCount(S.trees_active_24h);
    $("s-trees").textContent    = "of " + showCount(S.trees_registered != null ? S.trees_registered : nodes.length) + " planted";
    $("s-today").textContent    = showCount(S.readings_last_24h);
    $("s-readings").textContent = showCount(S.readings_total) + " all time";
    $("s-season").textContent   = S.current_season != null ? "#" + S.current_season : "—";
    $("s-attest").textContent   = showCount(S.attestations_total) + " attestations";
    $("s-located").textContent = pts.length;
    $("livedot").className = "dot" + (live?" on":"");
    $("livetxt").textContent = live ? "live" : "snapshot";
    // Health and data composition, shown separately — never blended.
    const comp = composition(pts);
    $("comp-health").innerHTML = pts.length
      ? comp.byState.map(s=>`<i class="cdot" style="background:${esc(s.color)}"></i><b>${s.count}</b> ${esc(s.label)}`).join(" · ")
      : esc(comp.health);
    $("comp-sensing").innerHTML = comp.byClass.length
      ? "Sensing: " + comp.byClass.map(c=>`${esc(c.emoji)} ${esc(c.type)} <b>${c.count}</b>`).join(" · ")
      : esc(comp.sensing);
    $("comp").hidden = false;

    // Announce the update to screen readers (politely, only when it changes).
    const summary = networkSummary(stats, pts.length, live) + " " + comp.health + " " + comp.sensing;
    if($("a11y-status").textContent !== summary) $("a11y-status").textContent = summary;

    TREES = pts;
    $("browse").textContent = `🌳 Browse Trees (${pts.length.toLocaleString()})`;
    renderTreeList($("tl-items"), pts);

    // The page is useful now — stats and the Tree list are painted above. The
    // globe is a bonus layer that arrives when (and if) the engine does.
    if(!webglOK()){ showWithoutGlobe(); return; }      // genuinely no WebGL — not "engine still loading"
    if(contextLost) return;                            // don't feed data into a dead GPU context
    if(world) updateGlobe(pts); else if(typeof Globe!=="undefined") renderGlobe(pts);
  }

  // The one Tree list. Every value is device-reported, so everything goes
  // through esc(). There used to be a second, non-interactive rendering for
  // the no-WebGL path; that path now uses this one, because nothing here
  // needed a GPU in the first place.
  function renderTreeList(host, pts){
    // Bounded by construction: at the 100,000-Tree design target an unbounded
    // list would be ~600k DOM nodes rebuilt every refresh. The cap is stated
    // on screen and search reaches everything beyond it.
    const view = listView(pts, $("tl-q").value);
    setNote("tl-count", view.note);
    const items = view.shown;
    const html = !items.length
      ? `<li class="tl-empty">${esc(view.note)}</li>`
      : items.map((p,i)=>{
          const dot = `<i class="tl-dot" style="background:${esc(STATE_COLOR[p.state]||"#76907f")}"></i>`;
          const body = `<span class="tl-txt"><span class="tl-id">${esc(p.short)}…</span>
            <span class="tl-meta">${esc(p.region)} · ${esc(shapeFor(p.state).label)} · ${esc((p.fruits||[]).map(f=>f.emoji+" "+f.type).join(" · "))||"no sensors reporting"}</span></span>`;
          return `<li><button type="button" data-i="${i}" aria-label="${esc(treeSummary(p))}">${dot}${body}</button></li>`;
        }).join("");

    // A 60s refresh must not disturb someone using the list: skip the re-render
    // when nothing changed, and put focus back on the same row when it did.
    if(host.__html === html) return;
    const focused = host.contains(document.activeElement) ? document.activeElement.dataset.i : null;
    host.innerHTML = html;
    host.__html = html;
    host.querySelectorAll("button[data-i]").forEach(b=>{ b.onclick=()=>selectTree(items[+b.dataset.i], b); });
    if(focused!=null){
      const again = host.querySelector(`button[data-i="${CSS.escape(focused)}"]`);
      if(again) again.focus({preventScroll:true});
    }
  }

  // No WebGL: drop the canvas, keep everything else. The stats, legend,
  // privacy note, search, Tree list and detail panels are all plain DOM and
  // never needed a GPU — the old fallback hid them along with the globe,
  // which left these visitors with strictly less than the page can give them.
  function showWithoutGlobe(){
    $("globe").style.display = "none";
    note("Your browser can’t render the 3D globe, so this is the same network as a list.");
    if(!$("treelist").classList.contains("show")) openDialog("treelist", null, {focus:false});
  }

  // Refresh path: feed new data into the EXISTING globe. Never re-create it —
  // a second Globe() on the same element leaves the old WebGL context alive and
  // undisposed (the browser starts evicting them — "Context Lost" — after a
  // dozen or so) and it snaps the camera back, throwing away wherever the
  // visitor has dragged/zoomed to. The camera is deliberately untouched here.
  function updateGlobe(pts){
    world.pointsData(pts);
    if(!reduce) world.ringsData(applyRingCap(pts));
  }

  // Every Tree keeps its point; only the per-Tree-per-frame pulse is bounded.
  function applyRingCap(pts){
    const { rings, capped, note } = ringSet(pts);
    setNote("ring-note", capped ? note : "");
    return rings;
  }

  function renderGlobe(pts, restoreTo){
    world = Globe()($("globe"))
      .globeImageUrl("vendor/earth-night.jpg").backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true).atmosphereColor("#2bd4d4").atmosphereAltitude(0.2)
      // Colour carries the data class; size and height carry the state, so a
      // quiet Tree is distinguishable with no animation at all.
      .pointsData(pts).pointLat("lat").pointLng("lng").pointColor("color")
      .pointAltitude(p=>shapeFor(p.state).altitude).pointRadius(p=>shapeFor(p.state).radius).pointResolution(18)
      .pointLabel(p=>`<div style="font:13px ui-sans-serif;background:rgba(10,20,16,.93);border:1px solid rgba(120,230,200,.25);border-radius:10px;padding:8px 11px;color:#ecfbf3"><b>${esc(p.short)}…</b><br><span style="color:#a3bcb0">${esc(p.region)} · ${esc(shapeFor(p.state).label)}</span><br>${esc(p.fruits.map(f=>f.emoji+" "+f.type).join(" · "))||"no sensors reporting"}</div>`)
      .onPointClick(p=>showPanel(p));   // globe.gl passes (point, event) — don't leak the event in as an opener
    if(!reduce){ world.ringsData(applyRingCap(pts)).ringLat("lat").ringLng("lng").ringColor(p=>p.color).ringMaxRadius(4).ringPropagationSpeed(1.7).ringRepeatPeriod(1600); }
    const c=world.controls(); c.autoRotate=false; c.enableDamping=true; c.enableZoom=true;
    if(!resizeBound){ addEventListener("resize",()=>world && world.width(innerWidth).height(innerHeight)); resizeBound=true; }
    watchContextLoss();
    if(restoreTo){                       // rebuilt after a GPU context loss
      world.pointOfView(restoreTo, 0);   // put the visitor back where they were
      return;
    }
    world.pointOfView({lat:30,lng:-85,altitude:2.3},0);
    if(!reduce) setTimeout(()=>world.pointOfView({lat:38,lng:-85.7,altitude:1.4},2600),900);
  }

  // ---- GPU context loss ----------------------------------------------------
  // A lost WebGL context is ordinary: a backgrounded mobile tab under memory
  // pressure, a driver reset, a laptop switching GPUs. Before this the globe
  // simply went black forever while the page carried on reporting "live".
  let resizeBound = false, contextLost = false, tearingDown = false;
  function watchContextLoss(){
    const canvas = $("globe").querySelector("canvas");
    if(!canvas || canvas.__orchardWatched) return;
    canvas.__orchardWatched = true;
    canvas.addEventListener("webglcontextlost", ()=>{
      // Ignore the loss we cause ourselves: teardown calls forceContextLoss(),
      // and an old, detached canvas must not re-flag a freshly rebuilt globe.
      if(tearingDown || canvas !== $("globe").querySelector("canvas")) return;
      contextLost = true;
      note("The browser dropped the 3D view (this happens on low memory). Every Tree is still listed — or reload the globe.");
      $("loadglobe").textContent = "🌍 Reload the globe";
      $("loadglobe").hidden = false;
      $("loadglobe").onclick = ()=>rebuildGlobe();
    });
    // Browsers restore the context when they can; three.js already calls
    // preventDefault() on the loss, which is what makes that possible.
    canvas.addEventListener("webglcontextrestored", ()=>{ if(contextLost) rebuildGlobe(); });
  }

  function rebuildGlobe(){
    const pov = (()=>{ try { return world && world.pointOfView(); } catch(e){ return null; } })();
    teardownGlobe();
    contextLost = false;
    note("");
    $("loadglobe").hidden = true;
    if(webglOK() && typeof Globe!=="undefined") renderGlobe(TREES, pov);
    else note("The 3D globe can't start again in this browser — every Tree is still listed above.");
  }

  // Dispose properly: an orphaned renderer keeps its context alive, which is
  // the very thing that causes the browser to start evicting them.
  function teardownGlobe(){
    tearingDown = true;
    try { if(world && world.renderer){ const r = world.renderer(); r.dispose && r.dispose(); r.forceContextLoss && r.forceContextLoss(); } } catch(e){}
    try { if(world && world._destructor) world._destructor(); } catch(e){}
    world = null;
    $("globe").innerHTML = "";
    tearingDown = false;
  }

  function showPanel(p, opener){
    $("p-id").textContent = p.id;
    $("p-title").textContent = "Tree";
    $("p-reg").textContent = "📍 " + p.region;
    const sc = STATE_COLOR[p.state]||"#76907f";
    $("p-state").innerHTML = `<i style="background:${sc};box-shadow:0 0 8px ${sc}"></i>${esc(shapeFor(p.state).label)}`;
    $("p-fw").textContent = p.fw || "—";
    $("p-last").textContent = ago(p.last, ORACLE_NOW);
    $("p-fruits").innerHTML = p.fruits.length
      ? p.fruits.map(f=>`<span class="fruit"><i class="fsw" style="background:${esc(f.color)}"></i>${esc(f.emoji)} ${esc(f.type)}</span>`).join("")
      : `<span class="fruit">🌱 no sensors reporting</span>`;
    // Raw device-reported keys, distinct from the classes they map to.
    $("p-sensors").textContent = (p.sensors && p.sensors.length) ? p.sensors.join(", ") : "none reported";
    // Only a well-formed Chia NFT id becomes a link; anything else is inert text.
    const passLink = isNftId(p.pass)
      ? `<a href="https://mintgarden.io/nfts/${encodeURIComponent(p.pass)}" target="_blank" rel="noopener">${esc(p.pass.slice(0,14))}… ↗</a>`
      : (p.pass ? `<span title="unrecognised Pass id">${esc(String(p.pass).slice(0,24))}</span>` : "<span>not published for this Tree</span>");
    // The tick has to carry its own evidence: the oracle publishes when the
    // Pass was verified on chain, so an unqualified "✓" was a claim the page
    // could support and wasn't.
    const ev = passEvidence({pass_verified_at:p.passVerifiedAt}, ORACLE_NOW);
    const tick = ev.verified ? `<span class="verify">✓ Orchard Pass</span>` : `<span>Orchard Pass</span>`;
    $("p-proof").innerHTML = `🔒 Coarse region only — never precise GPS.<br>${tick} ${passLink}<br>${esc(ev.text)}.`;
    const planted = plantedFor({registered_at:p.registeredAt}, ORACLE_NOW);
    $("p-planted").textContent = planted || "unknown";
    // Name what the oracle doesn't publish, rather than leaving a visitor to
    // guess whether the Tree has no record or the page just doesn't show it.
    $("p-limits").innerHTML = `<b>Not published by the oracle yet:</b> Season uptime · device health · $JUICE rewards · DataLayer proof link.`;
    openDialog("panel", opener);
  }

  // ---- Dialogs (detail panel + Tree list) ---------------------------------
  // Both are non-modal panels, but they still need real dialog behaviour:
  // focus moves in, Escape closes, focus returns to whatever opened them, and
  // while closed they are `inert` so keyboard users never land on a hidden
  // control. (Before this, the closed panel's ✕ was still in the tab order.)
  let openerOf = {};
  function openDialog(id, opener, opts){
    const el = $(id);
    openerOf[id] = opener || document.activeElement;
    el.removeAttribute("inert");
    el.classList.add("show");
    if(id==="treelist") $("browse").setAttribute("aria-expanded","true");
    if(opts && opts.focus === false) return;   // opened by the page, not by the visitor
    // The list opens on its search box: with 4 Trees you Tab once, with 4,000
    // you type. Either way the first thing focused is the thing that helps.
    (el.querySelector("input[type=search]") || el.querySelector("button[data-i]") || el).focus({preventScroll:true});
  }
  function closeDialog(id){
    const el = $(id);
    if(!el.classList.contains("show")) return;
    el.classList.remove("show");
    if(el.contains(document.activeElement)) document.activeElement.blur();
    el.setAttribute("inert","");
    if(id==="treelist") $("browse").setAttribute("aria-expanded","false");
    const back = openerOf[id];
    if(back && document.contains(back) && back.offsetParent !== null) back.focus({preventScroll:true});
    openerOf[id] = null;
  }
  function selectTree(p, opener){
    // Fly the globe to the Tree so the visual and the list stay in step.
    if(world && p.lat!=null) world.pointOfView({lat:p.lat, lng:p.lng, altitude:0.75}, reduce?0:900);
    showPanel(p, opener);
  }

  $("px").onclick = ()=>closeDialog("panel");
  $("tlx").onclick = ()=>closeDialog("treelist");
  // Typing re-renders from the full set, so search reaches past the cap.
  $("tl-q").addEventListener("input", ()=>renderTreeList($("tl-items"), TREES));
  $("browse").onclick = ()=>{
    if($("treelist").classList.contains("show")) closeDialog("treelist");
    else openDialog("treelist", $("browse"));
  };
  document.addEventListener("keydown",(e)=>{
    if(e.key!=="Escape") return;
    if($("panel").classList.contains("show")) closeDialog("panel");
    else if($("treelist").classList.contains("show")) closeDialog("treelist");
  });

  // Poll the oracle each minute, but only while the tab is visible — a hidden
  // tab has nothing to render, and we catch up the moment it comes back.
  const REFRESH_MS = 60000;
  let refreshTimer = null;
  function startRefresh(){ if(refreshTimer===null) refreshTimer=setInterval(load, REFRESH_MS); }
  function stopRefresh(){ if(refreshTimer!==null){ clearInterval(refreshTimer); refreshTimer=null; } }
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden) stopRefresh(); else { load(); startRefresh(); }
  });

  // ---- The 3D engine, loaded on demand ------------------------------------
  // performance-budget.md, hard rule: "the heavy 3D never blocks first paint",
  // and "always keep the page useful before the globe loads". globe.gl is
  // 490 KB gzip (1.75 MB raw) plus a 597 KB texture, so it is never a
  // parser-blocking <script>: the overlay, the stats and the Tree list render
  // and the oracle fetch starts first; the globe layers in when it arrives.
  const conn = navigator.connection || {};
  const LOW_MODE =
    new URLSearchParams(location.search).get("low") === "1" ||   // force light mode (also how it's tested)
    !!conn.saveData ||
    (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 1) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2);

  let enginePromise = null;
  function loadEngine(){
    if(enginePromise) return enginePromise;
    enginePromise = new Promise((resolve,reject)=>{
      const s = document.createElement("script");
      s.src = "vendor/globe.gl.min.js";
      s.async = true;
      s.onload = ()=> (typeof Globe!=="undefined") ? resolve() : reject(new Error("engine loaded but Globe is missing"));
      s.onerror = ()=> reject(new Error("could not download the globe engine"));
      document.head.appendChild(s);
    });
    return enginePromise;
  }

  function startGlobe(){
    note("Loading the globe…");
    return loadEngine().then(()=>{
      note("");
      if(webglOK() && !world && TREES.length) renderGlobe(TREES);
    }).catch(()=>{
      note("The 3D globe couldn't load — every Tree is still listed above.");
    });
  }

  function note(msg){ setNote("globe-note", msg); }
  function dataNote(msg){ setNote("data-note", msg); }
  function setNote(id, msg){
    const el = $(id);
    if(el.textContent === (msg || "")) return;   // don't re-announce the same thing
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function offerGlobe(){
    // Documented degradation ladder: on Save-Data / low-memory / low-core
    // devices, start light and let the visitor opt in to the heavy layer.
    const btn = $("loadglobe");
    btn.hidden = false;
    btn.onclick = ()=>{ btn.hidden = true; startGlobe(); };
    note("Data-saver or low-power device detected — the globe is a ~2 MB download.");
  }

  // The legend is generated from the classifier's own table, not hand-written —
  // the two lists drifted before, leaving rendered fruit with no key entry.
  $("legend-rows").innerHTML = legendRows().map(r=>
    `<div class="row" title="${esc(r.hint)}"><i class="sw" style="background:${esc(r.color)}"></i> ${esc(r.emoji)} ${esc(r.label)}</div>`
  ).join("");

  window.__orchardStarted = true;          // tells the boot boundary the app is alive
  load();                                  // data first: stats + Tree list, no engine needed
  if(!document.hidden) startRefresh();
  if(!webglOK()) { /* showWithoutGlobe() runs from refresh(), once data exists */ }
  else if(LOW_MODE) offerGlobe();
  else startGlobe();
