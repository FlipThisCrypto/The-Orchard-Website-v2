// Unit tests for worldview's pure data logic.
// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import OrchardData from '../worldview/orchard-data.js';

const { esc, isGeohash, isNftId, ghCenter, classify, fruitsFor, stateFrom, ago, STATE_COLOR } = OrchardData;

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
