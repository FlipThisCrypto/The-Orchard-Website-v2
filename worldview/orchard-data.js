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
    const readings = stats && stats.readings_total != null ? stats.readings_total : 0;
    return `${trees} Trees, ${Number(readings).toLocaleString('en-US')} harvested readings, ` +
      `${placed} shown on the map. Data is ${live ? 'live' : 'from a snapshot'}.`;
  }

  return {
    esc, GH, isGeohash, isNftId, ghCenter, classify, fruitsFor,
    STATE_COLOR, stateFrom, ago, treeSummary, networkSummary,
  };
});
