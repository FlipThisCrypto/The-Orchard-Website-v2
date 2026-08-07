/**
 * Orchard worldview — pure data logic.
 *
 * Everything here is deliberately free of the DOM so it can be unit-tested in
 * Node (`node --test tests/`) as well as loaded by the page. Anything that
 * touches the document lives in index.html.
 *
 * Loads two ways:
 *   browser  <script src="orchard-data.js">  ->  window.OrchardData
 *   node     import OrchardData from '../worldview/orchard-data.js'
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OrchardData = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // ---- Untrusted input boundary -------------------------------------------
  // node_id, geohash, sensor names, fw_version and pass_nft_id are all
  // SELF-REPORTED BY DEVICES. The page is served from the theorchard.network
  // zone (shared session cookie) and loads the wallet widget, so anything
  // injected there would run beside it. Nothing from the API reaches HTML
  // without going through esc(); identifiers are shape-checked before use.
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  const GH = '0123456789bcdefghjkmnpqrstuvwxyz'; // geohash alphabet (no a/i/l/o)
  const isGeohash = (g) =>
    typeof g === 'string' && g.length > 0 && g.length <= 12 &&
    [...g.toLowerCase()].every((c) => GH.includes(c));

  // Chia NFT id: bech32m "nft1" + payload over the bech32 charset.
  const isNftId = (v) =>
    typeof v === 'string' && /^nft1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{50,110}$/.test(v);

  // ---- Geohash ------------------------------------------------------------
  // geohash -> cell-centre {lat,lng}. Returns null for anything unparseable,
  // so an invalid cell can never place a Tree somewhere arbitrary.
  function ghCenter(gh) {
    if (!gh || typeof gh !== 'string') return null;
    let even = true, latlo = -90, lathi = 90, lonlo = -180, lonhi = 180;
    for (const c of gh.toLowerCase()) {
      const cd = GH.indexOf(c);
      if (cd < 0) return null;
      for (let b = 4; b >= 0; b--) {
        const bit = (cd >> b) & 1;
        if (even) { const m = (lonlo + lonhi) / 2; if (bit) lonlo = m; else lonhi = m; }
        else { const m = (latlo + lathi) / 2; if (bit) latlo = m; else lathi = m; }
        even = !even;
      }
    }
    return { lat: (latlo + lathi) / 2, lng: (lonlo + lonhi) / 2 };
  }

  // ---- Fruit = data class -------------------------------------------------
  // sensor key -> data-class fruit (gps is location metadata, not a fruit).
  // An unrecognised key passes through as its own label — which is exactly why
  // every render path escapes it.
  function classify(key) {
    const k = (key || '').toLowerCase();
    if (k === 'gps') return null;
    if (/ds18|temp/.test(k)) return { type: 'Temperature', emoji: '🍊', color: '#ff9f2e' };
    if (/hum|dht|sht/.test(k)) return { type: 'Humidity', emoji: '🫐', color: '#4f7bff' };
    if (/mq13|voc|co2|aqi|air/.test(k)) return { type: 'Air quality', emoji: '🍋', color: '#f4d23c' };
    if (/pms|pm25|pm10|particul/.test(k)) return { type: 'Particulates', emoji: '🍇', color: '#b14aef' };
    if (/bmp|bme|press|baro/.test(k)) return { type: 'Pressure', emoji: '🍐', color: '#a3e635' };
    if (/soil/.test(k)) return { type: 'Soil', emoji: '🍎', color: '#4ade80' };
    return { type: key, emoji: '🌿', color: '#2bd4d4' };
  }

  function fruitsFor(sensors) {
    const out = [], seen = new Set();
    for (const s of sensors || []) {
      const f = classify(s);
      if (f && !seen.has(f.type)) { seen.add(f.type); out.push(f); }
    }
    return out;
  }

  // ---- Node state ---------------------------------------------------------
  const STATE_COLOR = { healthy: '#4ade80', idle: '#2bd4d4', offline: '#76907f' };

  function stateFrom(n, now = Date.now()) {
    if (!n || !n.last_reading_at) return 'healthy'; // listed but never reported
    const age = (now - new Date(n.last_reading_at)) / 3600000;
    if (!Number.isFinite(age)) return 'healthy';
    if (age < 2) return 'healthy';
    if (age < 26) return 'idle';
    return 'offline';
  }

  function ago(d, now = Date.now()) {
    if (!d) return 'recently';
    const s = (now - new Date(d)) / 1000;
    if (!Number.isFinite(s)) return 'recently';
    for (const [n, l] of [[86400, 'd'], [3600, 'h'], [60, 'm']]) {
      if (s >= n) return Math.floor(s / n) + l + ' ago';
    }
    return 'just now';
  }

  // ---- Response shape validation ------------------------------------------
  // HTTP 200 is not a promise about the body. An oracle that answers
  // {"error": "..."} , a proxy that answers HTML, or a field that changes type
  // must all degrade to the snapshot — not throw inside the refresh loop and
  // leave the page showing old numbers while still claiming to be live.
  // These return null for "this is not the thing I asked for".
  function normalizeNodes(raw) {
    if (!Array.isArray(raw)) return null;
    const out = [];
    for (const n of raw) {
      if (!n || typeof n !== 'object' || Array.isArray(n)) continue;
      const id = typeof n.node_id === 'string' ? n.node_id : null;
      if (!id) continue;                                  // a Tree with no id is not addressable
      out.push({
        node_id: id,
        sensors: Array.isArray(n.sensors) ? n.sensors.filter((s) => typeof s === 'string') : [],
        fw_version: typeof n.fw_version === 'string' ? n.fw_version : null,
        pass_nft_id: typeof n.pass_nft_id === 'string' ? n.pass_nft_id : null,
        geohash: typeof n.geohash === 'string' ? n.geohash : null,
        last_reading_at: typeof n.last_reading_at === 'string' ? n.last_reading_at : null,
      });
    }
    return out;
  }

  /** Counts only. A missing/!finite count stays null so the UI can say "unknown". */
  function normalizeStats(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);
    const trees = num(raw.trees_registered);
    const readings = num(raw.readings_total);
    if (trees === null && readings === null) return null;   // nothing usable in here
    return { trees_registered: trees, readings_total: readings };
  }

  /** Own-property lookup: a node_id of "__proto__" must not reach Object.prototype. */
  function lookup(map, key) {
    return typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
  }

  // ---- Searching and capping the Tree list --------------------------------
  // MISSION.md commits to scaling toward 100,000 Trees without a redesign. An
  // unbounded list is ~6 DOM nodes per Tree rebuilt on every refresh, so the
  // list is capped and searchable instead — and the cap is always disclosed,
  // never silent.
  const LIST_CAP = 100;

  /** Free-text match over the fields a visitor can actually see. */
  function matchesQuery(p, query) {
    const q = String(query ?? '').trim().toLowerCase();
    if (!q) return true;
    const hay = [
      p.id, p.short, p.region, p.state, p.fw,
      ...(p.fruits || []).map((f) => f.type),
      ...(p.sensors || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).every((term) => hay.includes(term));
  }

  /**
   * What the list should show: the matches, the slice actually rendered, and
   * the sentence explaining any difference between the two.
   */
  function listView(trees, query, cap = LIST_CAP) {
    const all = Array.isArray(trees) ? trees : [];
    const matched = all.filter((p) => matchesQuery(p, query));
    const shown = matched.slice(0, cap);
    const q = String(query ?? '').trim();
    let note;
    if (!all.length) note = 'No Trees are reporting a location yet.';
    else if (!matched.length) note = `No Trees match “${q}”.`;
    else if (matched.length > shown.length) {
      note = `Showing the first ${shown.length} of ${matched.length.toLocaleString('en-US')}` +
        (q ? ` matching “${q}”` : ' Trees') + ' — search to narrow it down.';
    } else if (q) {
      note = `${matched.length} Tree${matched.length === 1 ? '' : 's'} match “${q}”.`;
    } else {
      note = `All ${matched.length} Tree${matched.length === 1 ? '' : 's'}.`;
    }
    return { shown, matched: matched.length, total: all.length, truncated: matched.length > shown.length, note };
  }

  // ---- Globe degradation ladder -------------------------------------------
  // performance-budget.md: cap the visible instanced/animated count and shed
  // the pulses first. Every Tree still gets a point — only the animated ring
  // layer is bounded, because that is the part whose cost is per-Tree per-frame.
  const RING_CAP = 250;

  /**
   * Which Trees pulse. Liveness first (healthy, then idle, then offline) so the
   * signal the pulse carries — "this network is alive" — survives the cap.
   */
  function ringSet(trees, cap = RING_CAP) {
    const all = Array.isArray(trees) ? trees : [];
    if (all.length <= cap) return { rings: all, capped: false, note: '' };
    // One pass into liveness buckets rather than sorting the whole network:
    // this runs on every refresh, and at 20,000 Trees a sort cost ~30 ms of
    // main thread for an answer that only needs the first `cap` entries.
    const healthy = [], idle = [], rest = [];
    for (const p of all) {
      const bucket = p && p.state === 'healthy' ? healthy : (p && p.state === 'idle' ? idle : rest);
      if (bucket.length < cap) bucket.push(p);           // never collect more than we can use
      if (healthy.length >= cap) break;                  // healthy alone already fills it
    }
    const rings = healthy.concat(idle, rest).slice(0, cap);   // input order within each bucket
    return {
      rings,
      capped: true,
      note: `Every Tree is on the globe; the pulse is shown for ${cap.toLocaleString('en-US')} of ` +
        `${all.length.toLocaleString('en-US')} to keep it smooth.`,
    };
  }

  // ---- Text for assistive tech --------------------------------------------
  // The globe is a canvas: it cannot describe itself. These build the text
  // that the Tree list, the no-WebGL fallback and the live region all use, so
  // a screen reader gets exactly what a sighted visitor sees. Returned as
  // plain text — callers still escape before it reaches HTML.
  function treeSummary(p) {
    const fruits = (p.fruits || []).map((f) => f.emoji + ' ' + f.type).join(' · ');
    return [
      (p.short || '') + '…',
      p.region,
      p.state,
      fruits || 'online · no sensors yet',
    ].filter(Boolean).join(' · ');
  }

  function networkSummary(stats, placed, live) {
    const trees = stats && stats.trees_registered != null ? stats.trees_registered : placed;
    // An unknown count is reported as unknown. Saying "0 harvested readings"
    // when the oracle didn't tell us would be a confident falsehood.
    const readings = stats && stats.readings_total != null
      ? Number(stats.readings_total).toLocaleString('en-US') + ' harvested readings'
      : 'an unknown number of harvested readings';
    return `${trees} Trees, ${readings}, ` +
      `${placed} shown on the map. Data is ${live ? 'live' : 'from a snapshot'}.`;
  }

  return {
    esc, GH, isGeohash, isNftId, ghCenter, classify, fruitsFor,
    STATE_COLOR, stateFrom, ago, treeSummary, networkSummary,
    normalizeNodes, normalizeStats, lookup,
    LIST_CAP, matchesQuery, listView,
    RING_CAP, ringSet,
  };
});
