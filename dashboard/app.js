// The Orchard v2 — Mission Control page script.
//
// External so `node --check` can see it. While this lived inline in the HTML
// it was the largest shipped file in the repo that neither CI nor the
// pre-commit hook could check: a syntax error here passed both gates and
// shipped, and the only thing that would notice was the boot error boundary
// telling a visitor the board was broken after it was already live.
//
// Load order: data.js (embedded board) -> board-data.js (validation and
// escaping) -> this. The boot error boundary stays inline in the page,
// because it has to run before the scripts it guards.
const REPO = "FlipThisCrypto/The-Orchard-Website-v2";
  const REPO_URL = "https://github.com/"+REPO+"/";
  const { normalizeBoard, esc, safeColor, isRepoPath, abortAfter } = window.BoardData;
  const REQUEST_TIMEOUT_MS = 8000;   // no request may outlive its usefulness
  // "No data" and "no work" look identical on a progress board and mean
  // opposite things. Track which one this is so the page never reports 0%
  // as though it had measured something.
  const EMBEDDED = normalizeBoard(window.TASKS);
  let haveData = !!EMBEDDED;
  let DATA = EMBEDDED || {tasks:[],phases:[],owners:{}};
  let filter = "all";
  const $ = (id) => document.getElementById(id);
  const isDone = (t) => t.status === "done";
  const pct = (a) => (a.length ? Math.round((100*a.filter(isDone).length)/a.length) : 0);
  const ago = (d) => { const s=(Date.now()-new Date(d))/1000; const u=[[31536e3,"y"],[2592e3,"mo"],[86400,"d"],[3600,"h"],[60,"m"]]; for(const[n,l]of u){if(s>=n)return Math.floor(s/n)+l+" ago";} return "just now"; };

  function render(){
    const tasks = DATA.tasks||[];
    $("repo").textContent = DATA.repo || REPO;
    // The date the task DATA was last updated (from tasks.json) — not when the
    // file happened to be regenerated, which says nothing about freshness.
    $("gen").textContent = DATA.updated || window.TASKS_UPDATED || "—";
    // Overall progress is over the tasks that have been AUTHORED — phases with
    // no tasks yet are future work, not completed work. Say so, rather than
    // letting "100%" imply the project is finished.
    // With no data at all, "0%" would be a measurement we never made.
    if(!haveData){
      $("pct").textContent = "—"; $("barfill").style.width = "0%";
      $("cnt").textContent = "no task data loaded";
      $("done-v").innerHTML = "—";
      $("lanes").innerHTML = `<div class="lane" style="cursor:default">Task data unavailable.</div>`;
      $("filters").innerHTML = ""; $("phases").innerHTML = "";
      return;
    }
    const o = pct(tasks); $("pct").textContent = o+"%"; $("barfill").style.width=o+"%";
    const planned = (DATA.phases||[]).filter(ph=>!tasks.some(t=>t.phase===ph.id));
    $("cnt").textContent = tasks.filter(isDone).length+" / "+tasks.length+" authored tasks done"
      + (planned.length ? ` · ${planned.length} later phase${planned.length>1?"s":""} not yet planned` : "");
    $("done-v").innerHTML = tasks.filter(isDone).length+" <small>/ "+tasks.length+"</small>";

    // swimlanes
    const lanes = $("lanes"); lanes.innerHTML="";
    for(const [key,ow] of Object.entries(DATA.owners||{})){
      const own = tasks.filter(t=>t.owner===key); const p=pct(own);
      const byStatus={}; own.forEach(t=>byStatus[t.status]=(byStatus[t.status]||0)+1);
      const br = Object.entries(byStatus).map(([s,n])=>`<span>${n} ${esc(s.replace(/_/g,' '))}</span>`).join("");
      const accent = safeColor(ow.color);
      // The card carries block content, so it can't be a <button>; give it the
      // full button contract instead — reachable, toggleable with Enter AND
      // Space, and with its on/off state exposed, not just coloured in.
      const el=document.createElement("div"); el.className="lane"+(filter===key?" active":"");
      el.style.setProperty("--accent",accent);
      el.setAttribute("role","button");
      el.setAttribute("tabindex","0");
      el.setAttribute("aria-pressed", String(filter===key));
      el.setAttribute("aria-label", `${ow.name} — ${ow.seat}. ${own.filter(isDone).length} of ${own.length} tasks done. Filter the board to this seat.`);
      el.innerHTML=`<div class="lpct" style="color:${accent}">${p}%</div>
        <div class="who"><span class="seatdot" style="background:${accent}"></span><b>${esc(ow.name)}</b></div>
        <div class="seat">${esc(ow.seat)}</div>
        <div class="minibar"><i style="width:${p}%;background:${accent}"></i></div>
        <div class="br">${br||"<span>no tasks</span>"}</div>`;
      el.dataset.filter=key;
      const toggle=()=>setFilter(filter===key?"all":key, "lane");
      el.onclick=toggle;
      el.onkeydown=(e)=>{
        if(e.key==="Enter"||e.key===" "||e.key==="Spacebar"){ e.preventDefault(); toggle(); }
      };
      lanes.appendChild(el);
    }
    drawFilters(); drawPhases();
  }

  // One place that changes the filter, so the announcement can't drift from
  // what's actually shown, and focus survives the re-render.
  function setFilter(next, from){
    filter = next;
    draw();                                   // re-renders both control sets
    const shown = (DATA.tasks||[]).filter(t=>filter==="all"||t.owner===filter).length;
    const who = filter==="all" ? "all seats" : ((DATA.owners||{})[filter]||{}).name || filter;
    announce(`Showing ${shown} task${shown===1?"":"s"} for ${who}.`);
    // draw() replaced the element the user was standing on. Put them back on
    // the same control they used — not the other set, which is disorienting.
    const sel = `${from==="lane"?".lane":".tb"}[data-filter="${CSS.escape(filter)}"]`;
    const again = document.querySelector(sel) || document.querySelector(`.tb[data-filter="${CSS.escape(filter)}"]`);
    if(again) again.focus({preventScroll:true});
  }

  function announce(msg){
    const el=$("announcer");
    if(el.textContent===msg) return;
    el.textContent=msg;
  }

  function drawFilters(){
    const f=$("filters"); f.innerHTML="";
    const opts=[["all","All"]].concat(Object.entries(DATA.owners||{}).map(([k,o])=>[k,o.name]));
    for(const [k,label] of opts){
      const b=document.createElement("button"); b.className="tb"+(filter===k?" on":""); b.textContent=label;
      b.type="button";
      b.setAttribute("aria-pressed", String(filter===k));   // which filter is on, not just which looks on
      b.dataset.filter=k;
      b.onclick=()=>setFilter(k, "button"); f.appendChild(b);
    }
  }

  function drawPhases(){
    const tasks=DATA.tasks||[]; const host=$("phases"); host.innerHTML="";
    for(const ph of (DATA.phases||[])){
      const all=tasks.filter(t=>t.phase===ph.id);
      const sec=document.createElement("div"); sec.className="phase";
      // A phase with no tasks is NOT complete — it hasn't been planned. Show it
      // as such instead of hiding it, which read as "nothing left to do".
      if(!all.length){
        sec.innerHTML=`<div class="phase-head"><h3>${esc(ph.title)}</h3><span class="pp pp-todo">not started · no tasks authored yet</span></div>
          <p class="phase-desc">${esc(ph.desc||"")}</p>`;
        host.appendChild(sec); continue;
      }
      const shown=all.filter(t=>filter==="all"||t.owner===filter);
      const p=pct(all);
      sec.innerHTML=`<div class="phase-head"><h3>${esc(ph.title)}</h3><span class="pp">${p}% · ${all.filter(isDone).length}/${all.length}<span class="mini2"><i style="width:${p}%"></i></span></span></div>
        <p class="phase-desc">${esc(ph.desc||"")}</p>`;
      const rows=document.createElement("div"); rows.className="rows";
      if(!shown.length){ rows.innerHTML=`<div class="row"><div class="ti" style="color:var(--muted2)">No tasks for this filter.</div></div>`; }
      for(const t of shown){
        const ow=(DATA.owners||{})[t.owner]||{name:t.owner,color:"#888"};
        const r=document.createElement("div"); r.className="row";
        // A deliverable becomes a link only if it looks like a repo path —
        // otherwise it's shown as text, so a crafted path can't build a URL.
        const dp=!t.deliverable_path ? ""
          : (t.status==='done' && isRepoPath(t.deliverable_path)
            ?`<a class="dp" href="${esc(REPO_URL+(t.deliverable_path.endsWith('/')?'tree':'blob')+'/main/'+encodeURI(t.deliverable_path))}" target="_blank" rel="noopener">${esc(t.deliverable_path)} ↗</a>`
            :`<span class="dp">${esc(t.deliverable_path)}</span>`);
        // s-${status} is a class name, so it must not carry spaces or quotes.
        const statusClass = String(t.status).replace(/[^a-z0-9_-]/gi,"") || "backlog";
        r.innerHTML=`<div class="id">${esc(t.id)}</div>
          <div class="ti">${esc(t.title)}${dp}</div>
          <div class="own"><span class="seatdot" style="background:${safeColor(ow.color)}"></span>${esc(ow.name)}</div>
          <div class="pri">${esc(t.priority||"")}</div>
          <div class="pill s-${statusClass}">${esc(String(t.status).replace(/_/g,' '))}</div>`;
        rows.appendChild(r);
      }
      sec.appendChild(rows); host.appendChild(sec);
    }
  }
  function draw(){ render(); }

  // ---- live GitHub status ---------------------------------------------------
  // GitHub allows 60 unauthenticated requests per hour PER IP (X-RateLimit-Limit),
  // shared with every other site the visitor has open. This panel needs 3 calls a
  // round, so a 60s poll would burn 180/hour: throttled inside ~20 minutes, with
  // the whole budget spent. Poll every 10 minutes (18/hour), pause when the tab
  // is hidden, and stop entirely until the documented reset once GitHub says the
  // budget is gone.
  const GH_POLL_MS = 600000;
  let ghTimer = null, ghBlockedUntil = 0, ghRemaining = null;

  async function gh(path){
    const { signal, done } = abortAfter(REQUEST_TIMEOUT_MS);
    let r;
    try { r = await fetch("https://api.github.com/repos/"+REPO+path, {headers:{Accept:"application/vnd.github+json"}, signal}); }
    finally { done(); }
    const rem = r.headers.get("X-RateLimit-Remaining");
    if(rem !== null) ghRemaining = Number(rem);
    if(r.status === 403 || r.status === 429){
      const reset = Number(r.headers.get("X-RateLimit-Reset")||0)*1000;
      ghBlockedUntil = reset > Date.now() ? reset : Date.now()+GH_POLL_MS;
      const err = new Error("rate-limited"); err.rateLimited = true; throw err;
    }
    if(!r.ok){ const err = new Error("HTTP "+r.status); err.status = r.status; throw err; }
    return r;
  }

  // Never claim a state we haven't observed: say what actually happened.
  function ghFail(id, e){
    const el = $(id);
    if(e && e.rateLimited) el.innerHTML = '<small>GitHub rate limit — retrying later</small>';
    else if(e && e.status === 404) el.innerHTML = '<small>repo not reachable</small>';
    else el.innerHTML = '<small>couldn’t reach GitHub</small>';
  }

  async function ghStatus(){
    if(Date.now() < ghBlockedUntil){
      $("freshness").textContent = "GitHub rate limit — retrying "+new Date(ghBlockedUntil).toLocaleTimeString();
      return;
    }
    try{
      const j = await (await gh("/commits?per_page=1")).json();
      if(j.length){ $("ci-v").textContent = ago(j[0].commit.author.date); $("ci-dot").className="dot ok"; }
      else { $("ci-v").textContent = "no commits"; $("ci-dot").className="dot warn"; }
    // Rate-limited is a local budget condition, not a broken repo — warn, don't alarm.
    }catch(e){ ghFail("ci-v", e); $("ci-dot").className = e && e.rateLimited ? "dot warn" : "dot bad"; }

    if(Date.now() < ghBlockedUntil){ ghNote(); return; }   // don't spend calls we know will fail
    try{ const j = await (await gh("/pulls?state=open&per_page=100")).json(); $("pr-v").textContent = Array.isArray(j) ? j.length : "—"; }
    catch(e){ ghFail("pr-v", e); }

    if(Date.now() < ghBlockedUntil){ ghNote(); return; }
    try{ const j = await (await gh("/tags?per_page=1")).json(); $("rel-v").textContent = (j && j.length) ? j[0].name : "none"; }
    catch(e){ ghFail("rel-v", e); }

    ghNote();
  }

  function ghNote(){
    const budget = ghRemaining === null ? "" : ` · ${ghRemaining} GitHub calls left this hour`;
    $("freshness").textContent = "status checked "+new Date().toLocaleTimeString()+budget;
    // The chips fill in asynchronously; without this a screen-reader user never
    // learns the repo status arrived at all.
    announce(`Repository status: last commit ${$("ci-v").textContent.trim()}, `
      + `${$("pr-v").textContent.trim()} open pull requests, latest tag ${$("rel-v").textContent.trim()}.`);
  }

  function startGh(){ if(ghTimer===null) ghTimer = setInterval(ghStatus, GH_POLL_MS); }
  function stopGh(){ if(ghTimer!==null){ clearInterval(ghTimer); ghTimer = null; } }

  // ---- live task refresh: try tasks.json (served over http/Pages), else embedded data.js ----
  // tasks.json changes when the Lead integrates work, not second to second.
  const TASKS_POLL_MS = 120000;
  let tasksTimer = null;
  // The page already painted from the copy baked into data.js. A live file is
  // only an upgrade if it really is a board: anything else keeps what's on
  // screen rather than replacing a correct board with nothing.
  async function refresh(){
    let next = null, answered = false;
    try{
      const { signal, done } = abortAfter(REQUEST_TIMEOUT_MS);
      let r;
      try { r = await fetch("../tasks/tasks.json?_="+Date.now(),{cache:"no-store", signal}); } finally { done(); }
      if(r.ok){ answered = true; next = normalizeBoard(await r.json()); }
    }catch(e){ /* offline, timed out, or opened from file:// — the embedded copy is expected */ }
    if(next){ DATA = next; haveData = true; boardNote(""); }
    else if(!haveData) boardNote("Couldn’t load the task list — this board is empty because there’s no data, not because there’s no work.");
    else if(answered) boardNote("Live task list looked wrong — showing the copy built into this page.");
    else boardNote("");            // unreachable is normal off a server; don't nag
    draw();
  }

  function boardNote(msg){
    const el = $("board-note");
    if(el.textContent === (msg||"")) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }
  function startTasks(){ if(tasksTimer===null) tasksTimer = setInterval(refresh, TASKS_POLL_MS); }
  function stopTasks(){ if(tasksTimer!==null){ clearInterval(tasksTimer); tasksTimer = null; } }

  // A hidden tab shows nobody anything — don't spend anyone's rate limit on it.
  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden){ stopGh(); stopTasks(); }
    else { refresh(); ghStatus(); startGh(); startTasks(); }
  });

  window.__boardStarted = true;   // tells the boot boundary the board is alive
  draw();                 // immediate paint from embedded data.js
  refresh();              // upgrade to live tasks.json if reachable
  ghStatus();             // live repo status
  if(!document.hidden){ startGh(); startTasks(); }
