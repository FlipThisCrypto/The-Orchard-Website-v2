// Tests for scripts/scenarios.mjs and the local oracle stub.
//
// These fixtures are the only way the page's live path gets exercised outside
// production, so a fixture that lies is worse than no fixture: it would train
// the page against data the real oracle never sends, and — if it broke the
// privacy contract — teach it to render something it must never render.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCENARIOS, largeNetwork, committedSnapshot, assertPrivacySafe } from '../scripts/scenarios.mjs';
import { oracleHandler, takeValues, parseHeaders, headersFor } from '../scripts/serve.mjs';
import OrchardData from '../worldview/orchard-data.js';

const { normalizeNodes, normalizeStats, stateFrom, DECLARED_PRECISION, cellsFrom, isGeohash } = OrchardData;

test('every scenario builds and survives the page’s own normalizer', () => {
  // A fixture the page would reject is a fixture that tests nothing.
  for (const [name, s] of Object.entries(SCENARIOS)) {
    const built = s.build();
    if (!built.nodes) continue;                     // down/malformed answer with raw bodies
    assert.ok(normalizeNodes(built.nodes), `${name}: nodes rejected by normalizeNodes`);
    assert.ok(normalizeStats(built.stats), `${name}: stats rejected by normalizeStats`);
    assert.ok(s.summary && s.summary.length > 10, `${name} needs a summary`);
  }
});

test('no scenario can serve a wallet address or a fine geohash', () => {
  for (const [name, s] of Object.entries(SCENARIOS)) {
    const built = s.build();
    if (!built.nodes) continue;
    assert.doesNotThrow(() => assertPrivacySafe(built.nodes), `${name} breaks the privacy contract`);
  }
});

test('the privacy guard actually catches both violations', () => {
  // A guard nobody has seen fail is a guard nobody knows works.
  assert.throws(() => assertPrivacySafe([{ node_id: 'A', wallet_address: 'xch1abc' }]), /wallet_address/);
  assert.throws(
    () => assertPrivacySafe([{ node_id: 'B', geohash: 'a'.repeat(DECLARED_PRECISION + 1) }]),
    /geohash/,
  );
});

test('all-states produces every node state the page can render', () => {
  // The live network has four Trees and has never shown stale or ahead, so
  // until this fixture existed those branches were only ever reached by unit
  // tests on synthetic objects — never through fetch → normalize → render.
  const { nodes, stats } = SCENARIOS['all-states'].build();
  const now = Date.parse(stats.as_of_utc);
  const states = new Set(normalizeNodes(nodes).map((n) => stateFrom(n, now)));
  for (const want of ['healthy', 'idle', 'stale', 'offline', 'new', 'ahead']) {
    assert.ok(states.has(want), `all-states never produces "${want}"`);
  }
});

test('largeNetwork is deterministic', () => {
  // A scale measurement against a random network means nothing next month.
  const at = Date.parse('2026-08-07T12:00:00Z');
  assert.deepEqual(largeNetwork(50, at), largeNetwork(50, at));
});

test('largeNetwork has a realistic mix, not 10,000 identical Trees', () => {
  const at = Date.parse('2026-08-07T12:00:00Z');
  const { nodes, stats } = largeNetwork(1000, at);
  assert.equal(nodes.length, 1000);
  const states = normalizeNodes(nodes).map((n) => stateFrom(n, at));
  const counts = {};
  for (const s of states) counts[s] = (counts[s] || 0) + 1;
  assert.ok(Object.keys(counts).length >= 3, `only produced ${Object.keys(counts)}`);
  assert.ok(counts.healthy > 0 && counts.healthy < 1000, 'a network where everything is healthy tests nothing');
  assert.equal(stats.trees_registered, 1000);
  assert.ok(stats.trees_active_24h > 0 && stats.trees_active_24h < 1000);
});

test('largeNetwork places Trees in contract-compliant cells that actually cluster', () => {
  const { nodes } = largeNetwork(800, Date.parse('2026-08-07T12:00:00Z'));
  for (const n of nodes) {
    assert.ok(isGeohash(n.geohash), `${n.node_id} has a bad geohash`);
    assert.ok(n.geohash.length <= DECLARED_PRECISION);
  }
  // The point of the scale fixture: many Trees, few markers.
  const cells = cellsFrom(normalizeNodes(nodes).map((n) => ({ ...n, cell: n.geohash, lat: 1, lng: 1, state: 'healthy' })));
  assert.ok(cells.length < 20, 'the scale fixture should collapse into a handful of cells');
});

test('the committed snapshot is readable straight out of app.js', () => {
  // One source of truth — the "live" scenario replays exactly what ships as
  // the fallback, so the two can never drift apart.
  const { nodes, stats } = committedSnapshot();
  assert.ok(Array.isArray(nodes) && nodes.length > 0);
  assert.ok(stats.as_of_utc);
});

test('committedSnapshot fails loudly rather than returning nothing', () => {
  assert.throws(() => committedSnapshot('const nothing = 1;'), /could not read the snapshot/);
});

// --- the stub itself -------------------------------------------------------
test('the stub answers both endpoints with the right half of the fixture', () => {
  const handler = oracleHandler('all-states');
  const nodes = JSON.parse(handler('/nodes').body);
  const stats = JSON.parse(handler('/network/stats').body);
  assert.ok(Array.isArray(nodes));
  assert.equal(typeof stats.trees_registered, 'number');
});

test('the down scenario really returns an error status', () => {
  // If this quietly returned 200 with an empty body, the "outage" test would
  // be testing the malformed path instead.
  const answer = oracleHandler('down')('/nodes');
  assert.ok(answer.status >= 500, `expected a server error, got ${answer.status}`);
});

test('the malformed scenario returns HTTP 200 with a body the page must reject', () => {
  const answer = oracleHandler('malformed')('/nodes');
  assert.equal(answer.status, 200);
  assert.equal(normalizeNodes(JSON.parse(answer.body)), null, 'the page must refuse this body');
});

test('--port and --scenario values are taken before flag parsing', () => {
  const { values, rest } = takeValues(['--port', '8080', '--oracle', '--scenario', 'huge'], ['--port', '--scenario']);
  assert.equal(values['--port'], '8080');
  assert.equal(values['--scenario'], 'huge');
  assert.deepEqual(rest, ['--oracle'], 'only bare flags may reach parseArgs');
});

test('the stub does not weaken the production headers it serves alongside', () => {
  // The stub adds CORS to its own two endpoints only. The page itself is still
  // served under the real _headers — otherwise local verification would be
  // testing a site that doesn't exist.
  const rules = parseHeaders(readFileSync(new URL('../worldview/_headers', import.meta.url), 'utf8'));
  assert.match(headersFor(rules, '/index.html')['Content-Security-Policy'], /script-src/);
});
