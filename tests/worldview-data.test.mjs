// Unit tests for worldview's pure data logic.
// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import OrchardData from '../worldview/orchard-data.js';

const { esc, isGeohash, isNftId, ghCenter, classify, fruitsFor, stateFrom, ago, STATE_COLOR,
        treeSummary, networkSummary, normalizeNodes, normalizeStats, lookup } = OrchardData;

// A real Orchard Pass id from the live network (public, on-chain).
const REAL_PASS = 'nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y';

// ---------------------------------------------------------------------------
// esc — the control that keeps device-reported strings out of the HTML parser
// ---------------------------------------------------------------------------
test('esc neutralises every character that can break out of HTML', () => {
  assert.equal(esc('<script>'), '&lt;script&gt;');
  assert.equal(esc('a & b'), 'a &amp; b');
  assert.equal(esc('" onload="x'), '&quot; onload=&quot;x');
  assert.equal(esc("' onerror='x"), '&#39; onerror=&#39;x');
  assert.equal(esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('esc handles null/undefined/non-strings without throwing', () => {
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
  assert.equal(esc(0), '0');
  assert.equal(esc(false), 'false');
  assert.equal(esc({}), '[object Object]');
});

test('esc leaves ordinary text (including emoji) untouched', () => {
  assert.equal(esc('🍊 Temperature'), '🍊 Temperature');
  assert.equal(esc('cell dn6q'), 'cell dn6q');
});

// Regression lock for the iteration-2 XSS: these are the exact payloads a
// malicious node could report. Escaped output must contain no live markup.
test('device-reported payloads cannot produce a tag or an event handler', () => {
  const payloads = [
    '<img src=x onerror="window.pwned=1">',
    '"><script>window.pwned=1</script>',
    "'><svg/onload=alert(1)>",
    '<iframe src=javascript:alert(1)>',
  ];
  for (const p of payloads) {
    const out = esc(p);
    assert.ok(!out.includes('<'), `raw < survived escaping: ${out}`);
    assert.ok(!out.includes('>'), `raw > survived escaping: ${out}`);
    assert.ok(!/["']/.test(out), `raw quote survived escaping: ${out}`);
  }
});

// ---------------------------------------------------------------------------
// isNftId — decides whether a device-reported string becomes a live link
// ---------------------------------------------------------------------------
test('isNftId accepts a genuine Chia Pass id', () => {
  assert.equal(isNftId(REAL_PASS), true);
});

test('isNftId rejects anything that is not a bech32m nft1 id', () => {
  const bad = [
    'javascript:alert(1)',                      // the attack this control exists for
    'javascript:void(0)',
    'https://evil.example/nft1',
    'nft1',                                      // prefix only
    'nft1' + 'q'.repeat(20),                     // too short
    'nft1' + 'q'.repeat(200),                    // too long
    'nft1' + 'b'.repeat(58),                     // 'b' is not in the bech32 charset
    'nft1' + 'i'.repeat(58),                     // nor 'i'
    'nft1' + 'o'.repeat(58),                     // nor 'o'
    'NFT1' + 'q'.repeat(58),                     // wrong case prefix
    REAL_PASS + '"><img src=x onerror=alert(1)>', // appended markup
    REAL_PASS.replace('nft1', 'did1'),           // wrong hrp
    '', null, undefined, 42, {}, [],
  ];
  for (const v of bad) assert.equal(isNftId(v), false, `should reject: ${String(v).slice(0, 40)}`);
});

// ---------------------------------------------------------------------------
// isGeohash / ghCenter — a bad cell must never place a Tree somewhere real
// ---------------------------------------------------------------------------
test('isGeohash accepts valid cells and rejects out-of-alphabet input', () => {
  for (const g of ['d', 'dn6q', 'dn6qwertyu12', 'DN6Q']) assert.equal(isGeohash(g), true, g);
  for (const g of ['dn6a', 'dn6i', 'dn6l', 'dn6o']) assert.equal(isGeohash(g), false, `a/i/l/o not in alphabet: ${g}`);
  for (const g of ['', ' ', 'dn 6q', 'dn6q!', '"><img src=x>', 'x'.repeat(13), null, undefined, 42, {}])
    assert.equal(isGeohash(g), false, `should reject: ${String(g).slice(0, 20)}`);
});

test('ghCenter decodes a cell to its centre', () => {
  const c = ghCenter('dn6q');
  assert.ok(Math.abs(c.lat - 36.299) < 0.01, `lat ${c.lat}`);
  assert.ok(Math.abs(c.lng + 86.660) < 0.01, `lng ${c.lng}`);
});

test('ghCenter precision tightens as the cell gets longer', () => {
  // A well-known fixture: "ezs42" is the canonical geohash example cell.
  const c = ghCenter('ezs42');
  assert.ok(Math.abs(c.lat - 42.6) < 0.1, `lat ${c.lat}`);
  assert.ok(Math.abs(c.lng + 5.6) < 0.1, `lng ${c.lng}`);
  // A single character covers a huge area; five characters do not.
  const coarse = ghCenter('e');
  assert.ok(Math.abs(coarse.lat - c.lat) > 1 || Math.abs(coarse.lng - c.lng) > 1);
});

test('ghCenter returns null rather than a wrong position for bad input', () => {
  for (const g of ['', null, undefined, 'dn6a', 'dn6!', '<img src=x>', 42])
    assert.equal(ghCenter(g), null, `should not decode: ${String(g)}`);
});

// ---------------------------------------------------------------------------
// classify / fruitsFor — sensor key -> fruit (the product's core metaphor)
// ---------------------------------------------------------------------------
test('classify maps each known sensor family to its fruit', () => {
  const cases = [
    ['ds18b20', 'Temperature'], ['temp_c', 'Temperature'],
    ['dht22', 'Humidity'], ['sht31', 'Humidity'], ['humidity', 'Humidity'],
    ['mq135', 'Air quality'], ['co2', 'Air quality'], ['aqi', 'Air quality'],
    ['pms5003', 'Particulates'], ['pm25', 'Particulates'],
    ['bme280', 'Pressure'], ['bmp180', 'Pressure'], ['barometer', 'Pressure'],
    ['soil_moisture', 'Soil'],
  ];
  for (const [key, type] of cases) assert.equal(classify(key).type, type, key);
});

test('classify is case-insensitive', () => {
  assert.equal(classify('DS18B20').type, 'Temperature');
  assert.equal(classify('BME280').type, 'Pressure');
});

test('classify treats gps as location metadata, not a fruit', () => {
  assert.equal(classify('gps'), null);
  assert.equal(classify('GPS'), null);
});

test('classify passes an unknown sensor through as its own label', () => {
  // Deliberate: unknown hardware still shows up. It is also why every render
  // path escapes f.type — this is untrusted, device-supplied text.
  const f = classify('lightning_detector');
  assert.equal(f.type, 'lightning_detector');
  assert.equal(f.emoji, '🌿');
});

test('classify handles empty/missing keys without throwing', () => {
  assert.equal(classify('').type, '');
  assert.equal(classify(null).type, null);
  assert.equal(classify(undefined).type, undefined);
});

test('fruitsFor de-duplicates data classes and drops gps', () => {
  const fruits = fruitsFor(['ds18b20', 'temp_probe', 'gps', 'bme280']);
  assert.deepEqual(fruits.map((f) => f.type), ['Temperature', 'Pressure']);
});

test('fruitsFor tolerates missing or empty sensor lists', () => {
  assert.deepEqual(fruitsFor([]), []);
  assert.deepEqual(fruitsFor(null), []);
  assert.deepEqual(fruitsFor(undefined), []);
});

test('every fruit colour is a hex value safe to inline in a style attribute', () => {
  const keys = ['ds18b20', 'dht22', 'mq135', 'pms5003', 'bme280', 'soil', 'unknown_thing'];
  for (const k of keys) assert.match(classify(k).color, /^#[0-9a-f]{6}$/i, k);
  for (const c of Object.values(STATE_COLOR)) assert.match(c, /^#[0-9a-f]{6}$/i, c);
});

// ---------------------------------------------------------------------------
// stateFrom / ago — freshness thresholds
// ---------------------------------------------------------------------------
const NOW = Date.parse('2026-08-06T12:00:00Z');
const hoursAgo = (h) => new Date(NOW - h * 3600000).toISOString();

test('stateFrom applies the 2h / 26h freshness thresholds', () => {
  assert.equal(stateFrom({ last_reading_at: hoursAgo(0) }, NOW), 'healthy');
  assert.equal(stateFrom({ last_reading_at: hoursAgo(1.9) }, NOW), 'healthy');
  assert.equal(stateFrom({ last_reading_at: hoursAgo(2.1) }, NOW), 'idle');
  assert.equal(stateFrom({ last_reading_at: hoursAgo(25.9) }, NOW), 'idle');
  assert.equal(stateFrom({ last_reading_at: hoursAgo(26.1) }, NOW), 'offline');
  assert.equal(stateFrom({ last_reading_at: hoursAgo(24 * 30) }, NOW), 'offline');
});

test('stateFrom degrades safely on missing or unparseable timestamps', () => {
  assert.equal(stateFrom({ last_reading_at: null }, NOW), 'healthy');
  assert.equal(stateFrom({}, NOW), 'healthy');
  assert.equal(stateFrom(null, NOW), 'healthy');
  assert.equal(stateFrom({ last_reading_at: 'not-a-date' }, NOW), 'healthy');
});

test('every state stateFrom can return has a colour', () => {
  const states = ['healthy', 'idle', 'offline'];
  for (const s of states) assert.ok(STATE_COLOR[s], `no colour for ${s}`);
});

test('ago renders human-readable ages', () => {
  assert.equal(ago(hoursAgo(0), NOW), 'just now');
  assert.equal(ago(new Date(NOW - 90 * 1000).toISOString(), NOW), '1m ago');
  assert.equal(ago(hoursAgo(5), NOW), '5h ago');
  assert.equal(ago(hoursAgo(50), NOW), '2d ago');
  assert.equal(ago(null, NOW), 'recently');
  assert.equal(ago('not-a-date', NOW), 'recently');
});

// ---------------------------------------------------------------------------
// treeSummary / networkSummary — what a screen reader is given in place of the
// canvas. If these go empty or wrong, the page has no accessible content.
// ---------------------------------------------------------------------------
const TREE = {
  short: '0C59BF4E', region: 'Shepherdsville, KY (approx.)', state: 'healthy',
  fruits: [{ type: 'Temperature', emoji: '🍊' }, { type: 'Pressure', emoji: '🍐' }],
};

test('treeSummary names the Tree, where it is, how it is, and what it senses', () => {
  assert.equal(
    treeSummary(TREE),
    '0C59BF4E… · Shepherdsville, KY (approx.) · healthy · 🍊 Temperature · 🍐 Pressure'
  );
});

test('treeSummary says something useful for a Tree with no sensors', () => {
  assert.equal(
    treeSummary({ ...TREE, fruits: [] }),
    '0C59BF4E… · Shepherdsville, KY (approx.) · healthy · online · no sensors yet'
  );
});

test('treeSummary never returns an empty label', () => {
  for (const p of [{}, { fruits: null }, { short: '', region: '', state: '' }]) {
    assert.ok(treeSummary(p).trim().length > 0, `empty label for ${JSON.stringify(p)}`);
  }
});

test('networkSummary reads as a sentence and distinguishes live from snapshot', () => {
  assert.equal(
    networkSummary({ trees_registered: 4, readings_total: 11605 }, 4, true),
    '4 Trees, 11,605 harvested readings, 4 shown on the map. Data is live.'
  );
  assert.match(networkSummary({ trees_registered: 4, readings_total: 0 }, 2, false), /snapshot\.$/);
});

test('networkSummary falls back to the placed count when stats are missing', () => {
  // Missing counts read as unknown — claiming "0 harvested readings" when the
  // oracle never said so would be a confident falsehood.
  assert.equal(networkSummary(null, 3, true), '3 Trees, an unknown number of harvested readings, 3 shown on the map. Data is live.');
  assert.equal(networkSummary({}, 0, false), '0 Trees, an unknown number of harvested readings, 0 shown on the map. Data is from a snapshot.');
});

// ---------------------------------------------------------------------------
// Response shape validation — HTTP 200 is not a promise about the body.
// These are the payloads that used to throw inside the refresh loop while the
// page carried on claiming to be live.
// ---------------------------------------------------------------------------
test('normalizeNodes rejects anything that is not a list of nodes', () => {
  const notLists = [
    { error: 'database unavailable' },      // an oracle error with HTTP 200
    { nodes: [] },                          // a shape change
    '<!doctype html><title>Login</title>',  // a captive portal / proxy
    'null', null, undefined, 42, true, () => {},
  ];
  for (const v of notLists) assert.equal(normalizeNodes(v), null, `should reject ${String(v).slice(0, 30)}`);
});

test('normalizeNodes keeps well-formed nodes and drops junk entries', () => {
  const out = normalizeNodes([
    { node_id: 'A', sensors: ['ds18b20', 42, null], fw_version: '0.5.1', pass_nft_id: 'nft1x', geohash: 'dn6q', last_reading_at: '2026-08-06T00:00:00Z' },
    { node_id: 'B' },                       // sparse but addressable
    { sensors: ['x'] },                     // no id -> not addressable
    null, 'nope', 42, [],                   // junk
    { node_id: 7 },                         // wrong id type
  ]);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0].sensors, ['ds18b20']);   // non-strings dropped
  assert.deepEqual(out[1], { node_id: 'B', sensors: [], fw_version: null, pass_nft_id: null, geohash: null, last_reading_at: null });
});

test('normalizeNodes coerces every field to a known type', () => {
  const [n] = normalizeNodes([{ node_id: 'A', sensors: 'ds18b20', fw_version: 5, pass_nft_id: {}, geohash: 12, last_reading_at: 99 }]);
  assert.deepEqual(n.sensors, []);          // a string is not a sensor list
  assert.equal(n.fw_version, null);
  assert.equal(n.pass_nft_id, null);
  assert.equal(n.geohash, null);
  assert.equal(n.last_reading_at, null);
});

test('normalizeNodes accepts an empty network', () => {
  assert.deepEqual(normalizeNodes([]), []);   // [] is valid and live — not a failure
});

test('normalizeStats returns null rather than inventing numbers', () => {
  for (const v of [null, undefined, [], 'x', 42, {}, { trees_registered: 'four' }, { readings_total: NaN }, { readings_total: -1 }, { readings_total: Infinity }]) {
    assert.equal(normalizeStats(v), null, `should reject ${JSON.stringify(v)}`);
  }
});

test('normalizeStats keeps the counts it can trust and nulls the rest', () => {
  assert.deepEqual(normalizeStats({ trees_registered: 4, readings_total: 11605 }), { trees_registered: 4, readings_total: 11605 });
  assert.deepEqual(normalizeStats({ trees_registered: 4, readings_total: 'lots' }), { trees_registered: 4, readings_total: null });
  assert.deepEqual(normalizeStats({ readings_total: 10.9 }), { trees_registered: null, readings_total: 10 });
});

test('an unknown reading count is reported as unknown, not as zero', () => {
  assert.match(networkSummary({ trees_registered: 4, readings_total: null }, 4, true), /unknown number of harvested readings/);
  assert.match(networkSummary(null, 3, false), /unknown number of harvested readings/);
  assert.match(networkSummary({ trees_registered: 4, readings_total: 0 }, 4, true), /0 harvested readings/);
});

test('lookup cannot be walked into Object.prototype', () => {
  const map = { REAL: { lat: 1, lng: 2 } };
  assert.deepEqual(lookup(map, 'REAL'), { lat: 1, lng: 2 });
  for (const key of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
    assert.equal(lookup(map, key), null, `${key} must not resolve`);
  }
  assert.equal(lookup(map, 'MISSING'), null);
  assert.equal(lookup(map, 42), null);
});

// ---------------------------------------------------------------------------
// listView — bounding the Tree list. MISSION.md commits to 100,000 Trees
// "without a redesign"; an unbounded list is ~6 DOM nodes each, rebuilt every
// refresh. The cap must never be silent.
// ---------------------------------------------------------------------------
const { listView, matchesQuery, LIST_CAP } = OrchardData;

const tree = (i, over = {}) => ({
  id: 'NODE' + String(i).padStart(4, '0'),
  short: 'NODE' + String(i).padStart(4, '0'),
  region: i % 2 ? 'Shepherdsville, KY (approx.)' : 'cell dn6q',
  state: i % 3 === 0 ? 'offline' : 'healthy',
  fw: '0.5.1',
  sensors: i % 2 ? ['ds18b20'] : ['bme280'],
  fruits: i % 2 ? [{ type: 'Temperature', emoji: '🍊' }] : [{ type: 'Pressure', emoji: '🍐' }],
  ...over,
});
const many = (n) => Array.from({ length: n }, (_, i) => tree(i));

test('the rendered slice is bounded however many Trees exist', () => {
  for (const n of [0, 1, 99, 100, 101, 5000, 100000]) {
    const v = listView(many(n));
    assert.ok(v.shown.length <= LIST_CAP, `${n} Trees rendered ${v.shown.length}`);
    assert.equal(v.total, n);
  }
});

test('a truncated list always says so, with the real totals', () => {
  const v = listView(many(5000));
  assert.equal(v.truncated, true);
  assert.match(v.note, /Showing the first 100 of 5,000/);
  assert.match(v.note, /search to narrow it down/);
});

test('a complete list says it is complete rather than staying silent', () => {
  const v = listView(many(4));
  assert.equal(v.truncated, false);
  assert.equal(v.note, 'All 4 Trees.');
  assert.equal(listView(many(1)).note, 'All 1 Tree.');
  assert.equal(listView([]).note, 'No Trees are reporting a location yet.');
});

test('search reaches Trees past the cap', () => {
  const trees = many(5000);
  const v = listView(trees, 'node4999');
  assert.equal(v.matched, 1);
  assert.equal(v.shown[0].id, 'NODE4999');   // the 5000th Tree, never rendered unsearched
  assert.match(v.note, /1 Tree match/);
});

test('search matches on id, region, state and fruit', () => {
  const trees = many(60);
  assert.ok(listView(trees, 'offline').matched > 0);
  assert.ok(listView(trees, 'temperature').matched > 0);
  assert.ok(listView(trees, 'shepherdsville').matched > 0);
  assert.ok(listView(trees, 'dn6q').matched > 0);
  assert.ok(listView(trees, 'ds18b20').matched > 0);
});

test('all search terms must match, and matching is case-insensitive', () => {
  const trees = [tree(0), tree(1)];                              // offline+Pressure, healthy+Temperature
  assert.equal(listView(trees, 'HEALTHY temperature').matched, 1);
  assert.equal(listView(trees, 'healthy pressure').matched, 0);  // no Tree is both
  assert.equal(listView(trees, '   ').matched, 2);               // blank shows everything
});

test('a search that finds nothing says which search found nothing', () => {
  const v = listView(many(10), 'zzz-nothing');
  assert.equal(v.matched, 0);
  assert.deepEqual(v.shown, []);
  assert.match(v.note, /No Trees match “zzz-nothing”/);
});

test('matchesQuery tolerates sparse Trees and odd queries', () => {
  assert.equal(matchesQuery({}, ''), true);
  assert.equal(matchesQuery({}, 'x'), false);
  assert.equal(matchesQuery({ id: 'A' }, null), true);
  assert.equal(matchesQuery({ id: 'A', fruits: null, sensors: null }, 'a'), true);
});

test('listView tolerates a non-array input', () => {
  for (const v of [null, undefined, 'x', 42, {}]) {
    const out = listView(v);
    assert.deepEqual(out.shown, []);
    assert.equal(out.total, 0);
  }
});

// ---------------------------------------------------------------------------
// ringSet — the globe's degradation ladder. Every Tree keeps its point; only
// the per-Tree-per-frame pulse is bounded, and the cap is never silent.
// ---------------------------------------------------------------------------
const { ringSet, RING_CAP } = OrchardData;

test('the animated layer is bounded however many Trees exist', () => {
  for (const n of [0, 1, RING_CAP - 1, RING_CAP, RING_CAP + 1, 20000, 100000]) {
    const { rings } = ringSet(many(n));
    assert.ok(rings.length <= RING_CAP, `${n} Trees produced ${rings.length} rings`);
    assert.equal(rings.length, Math.min(n, RING_CAP));
  }
});

test('below the cap nothing is dropped and nothing is claimed', () => {
  const { rings, capped, note } = ringSet(many(4));
  assert.equal(rings.length, 4);
  assert.equal(capped, false);
  assert.equal(note, '');
});

test('above the cap it says so, with both real numbers', () => {
  const { capped, note } = ringSet(many(20000));
  assert.equal(capped, true);
  assert.match(note, /Every Tree is on the globe/);
  assert.match(note, /250 of 20,000/);
});

test('liveness survives the cap: healthy Trees pulse before offline ones', () => {
  const trees = [
    ...Array.from({ length: 300 }, (_, i) => tree(i, { state: 'offline', id: 'OFF' + i })),
    ...Array.from({ length: 10 }, (_, i) => tree(i, { state: 'healthy', id: 'OK' + i })),
    ...Array.from({ length: 10 }, (_, i) => tree(i, { state: 'idle', id: 'IDLE' + i })),
  ];
  const { rings } = ringSet(trees);
  assert.equal(rings.length, RING_CAP);
  assert.equal(rings.filter((p) => p.state === 'healthy').length, 10, 'every healthy Tree should pulse');
  assert.equal(rings.filter((p) => p.state === 'idle').length, 10, 'idle Trees come next');
  assert.ok(rings.slice(0, 10).every((p) => p.state === 'healthy'));
});

test('ring selection is stable, so a refresh does not reshuffle the pulses', () => {
  const trees = many(1000);
  const a = ringSet(trees).rings.map((p) => p.id);
  const b = ringSet(trees).rings.map((p) => p.id);
  assert.deepEqual(a, b);
});

test('ringSet never mutates the input order', () => {
  const trees = many(500);
  const ids = trees.map((t) => t.id);
  ringSet(trees);
  assert.deepEqual(trees.map((t) => t.id), ids);
});

test('ringSet tolerates junk input and an unknown state', () => {
  for (const v of [null, undefined, 'x', 42, {}]) assert.deepEqual(ringSet(v).rings, []);
  const odd = Array.from({ length: 300 }, (_, i) => tree(i, { state: i ? 'who-knows' : 'healthy' }));
  const { rings } = ringSet(odd);
  assert.equal(rings.length, RING_CAP);
  assert.equal(rings[0].state, 'healthy');    // known-live still wins over unknown
});

// ---------------------------------------------------------------------------
// Fruit legend: code and canonical doc must agree, in both directions.
// They drifted once already — the globe rendered 🍎 and 🌿 with no legend
// entry, and the doc's ⭐/🟣 classes were unreachable from any sensor key.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs';
import { fileURLToPath as toPath } from 'node:url';
import { dirname as dirOf, join as joinPath } from 'node:path';
const { FRUITS, legendRows } = OrchardData;
const legendDoc = readFileSync(
  joinPath(dirOf(toPath(import.meta.url)), '..', 'docs/product/fruit-data-legend.md'), 'utf8');

test('every data class in the canonical doc is reachable from a sensor key', () => {
  // Column 1 of the canonical legend table, e.g. "| 🍊 Orange | ... |"
  const docEmoji = [...legendDoc.matchAll(/^\| (\S+) \w+ \|/gmu)].map((m) => m[1]);
  assert.ok(docEmoji.length >= 8, `expected the canonical table, found ${docEmoji.length} rows`);
  const codeEmoji = new Set(FRUITS.map((f) => f.emoji));
  for (const e of docEmoji) {
    assert.ok(codeEmoji.has(e), `${e} is in the canonical legend but classify() can never produce it`);
  }
});

test('the assigned-colour table in the doc matches the code exactly', () => {
  const rows = [...legendDoc.matchAll(/^\| (\S+) \| ([^|]+?) \| `(#[0-9a-f]{6})` \|/gmiu)]
    .map(([, emoji, cls, hex]) => ({ emoji, cls: cls.trim(), hex }));
  assert.ok(rows.length >= 9, `expected the colour table, found ${rows.length} rows`);
  for (const r of rows) {
    if (/other/i.test(r.cls)) { assert.equal(classify('totally_unknown_sensor').color, r.hex); continue; }
    const f = FRUITS.find((x) => x.type === r.cls);
    assert.ok(f, `doc lists "${r.cls}" but the code has no such class`);
    assert.equal(f.color, r.hex, `${r.cls}: doc says ${r.hex}, code says ${f.color}`);
    assert.equal(f.emoji, r.emoji, `${r.cls}: doc says ${r.emoji}, code says ${f.emoji}`);
  }
});

test('no two data classes share a colour', () => {
  // "A lemon must never look like an apple" — the spec's own rule.
  const colors = FRUITS.map((f) => f.color).concat(classify('unknown_thing').color);
  assert.equal(new Set(colors).size, colors.length, `duplicate colour among ${colors.join(', ')}`);
});

test('no fruit the globe can render is missing from the legend', () => {
  const legend = legendRows();
  const legendEmoji = new Set(legend.map((r) => r.emoji));
  for (const f of FRUITS) assert.ok(legendEmoji.has(f.emoji), `${f.type} (${f.emoji}) has no legend row`);
  assert.ok(legendEmoji.has('🌿'), 'the unclassified fruit needs a legend row — it is renderable');
  assert.ok(legendEmoji.has('🌱'), 'a Tree with no sensors needs a legend row');
  for (const r of legend) {
    assert.match(r.color, /^#[0-9a-f]{6}$/i);
    assert.ok(r.label && r.hint, `legend row ${r.emoji} needs a label and a hint`);
  }
});

test('the new classes are actually reachable from plausible sensor keys', () => {
  assert.equal(classify('ina226_power').type, 'Energy');
  assert.equal(classify('solar_v').type, 'Energy');
  assert.equal(classify('geophone').type, 'Seismic');
  assert.equal(classify('seismometer').type, 'Seismic');
  assert.equal(classify('soil_moisture').type, 'Soil');
  assert.equal(classify('dust_pm1').type, 'Particulates');
  assert.equal(classify('gas_voc').type, 'Air quality');
});

test('the four live Trees still classify exactly as before', () => {
  // Regression lock against the real sensors the network reports today.
  assert.deepEqual(fruitsFor(['ds18b20', 'gps']).map((f) => f.type + f.emoji), ['Temperature🍊']);
  assert.deepEqual(fruitsFor([]), []);
  assert.equal(classify('ds18b20').color, '#ff9f2e');
});
