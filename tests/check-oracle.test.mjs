// Tests for scripts/check-oracle.mjs — "does the live API still look like what
// this repo expects?". The network call isn't unit-testable; the judgement is,
// and the judgement is what has to be right.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkEndpoint, summarise, CONTRACT } from '../scripts/check-oracle.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NODES = CONTRACT['/nodes'];
const STATS = CONTRACT['/network/stats'];

const node = (over = {}) => ({
  node_id: 'A', sensors: [], last_seen_at: null, last_reading_at: null,
  fw_version: '0.5.1', pass_nft_id: null, geohash: null, ...over,
});
const stats = (over = {}) => ({
  trees_registered: 4, trees_active_24h: 2, readings_total: 10, readings_last_24h: 1,
  attestations_total: 0, current_season: 73, as_of_utc: '2026-08-07T11:00:00Z', ...over,
});

test('a conforming response has no problems', () => {
  assert.deepEqual(checkEndpoint([node()], NODES).problems, []);
  assert.deepEqual(checkEndpoint(stats(), STATS).problems, []);
});

test('a vanished required field is a breaking problem', () => {
  // This is the failure the checker exists for: the page reads last_seen_at,
  // and without it every node state silently becomes wrong.
  const { last_seen_at, ...without } = node();
  const { problems } = checkEndpoint([without], NODES);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].field, 'last_seen_at');
  assert.equal(problems[0].required, true);
  assert.equal(summarise([{ endpoint: '/nodes', ...checkEndpoint([without], NODES) }]).ok, false);
});

test('a vanished optional field is reported but not breaking', () => {
  const { geohash, ...without } = node();
  const r = checkEndpoint([without], NODES);
  assert.equal(r.problems[0].required, false);
  assert.equal(summarise([{ endpoint: '/nodes', ...r }]).ok, true);
});

test('a retyped field is caught even when present', () => {
  // The subtler drift: the field is still there, but the page's arithmetic
  // silently stops working.
  const r = checkEndpoint(stats({ readings_total: '216346' }), STATS);
  assert.match(r.problems[0].issue, /expected number, got string/);
  assert.equal(r.problems[0].required, true);
  const s = checkEndpoint([node({ sensors: 'ds18b20' })], NODES);
  assert.match(s.problems[0].issue, /expected array, got string/);
});

test('a nullable field accepts null and its type, but not another type', () => {
  assert.deepEqual(checkEndpoint([node({ last_reading_at: null })], NODES).problems, []);
  assert.deepEqual(checkEndpoint([node({ last_reading_at: '2026-01-01T00:00:00Z' })], NODES).problems, []);
  assert.match(checkEndpoint([node({ last_reading_at: 1735689600 })], NODES).problems[0].issue, /got number/);
});

test('the wrong response shape is caught before any field is read', () => {
  assert.match(checkEndpoint({ error: 'nope' }, NODES).problems[0].issue, /expected an array/);
  assert.match(checkEndpoint([1, 2, 3], STATS).problems[0].issue, /expected an object/);
});

test('an empty node list is valid, not a contract break', () => {
  // A network with no Trees yet is a real state, not an API failure.
  const r = checkEndpoint([], NODES);
  assert.deepEqual(r.problems, []);
  assert.equal(summarise([{ endpoint: '/nodes', ...r }]).ok, true);
});

test('newly published fields are surfaced as opportunities', () => {
  // last_seen_at was sitting unused in the response for the entire time the
  // page was rendering wrong states from a single signal.
  const r = checkEndpoint([node({ brand_new_signal: 1 })], NODES);
  assert.deepEqual(r.extras, ['brand_new_signal']);
  assert.deepEqual(r.problems, []);
});

test('wallet_address is never reported as an unused opportunity', () => {
  // Publishing an operator's wallet beside a Tree is what SECURITY.md forbids;
  // it must not be suggested as something to start using.
  const r = checkEndpoint([node({ wallet_address: 'xch1...' })], NODES);
  assert.ok(!r.extras.includes('wallet_address'));
  assert.ok(NODES.neverRead.includes('wallet_address'));
});

test('the checker never prints a privacy-sensitive field name as a suggestion', () => {
  const src = readFileSync(join(root, 'scripts/check-oracle.mjs'), 'utf8');
  assert.match(src, /neverRead/, 'there must be an explicit do-not-read list');
  assert.match(src, /wallet_address/, 'wallet_address must be on it');
});

test('every field the contract requires is one the page actually reads', () => {
  // A contract that guards fields nobody consumes fails for no reason.
  const page = readFileSync(join(root, 'worldview/orchard-data.js'), 'utf8')
    + readFileSync(join(root, 'worldview/app.js'), 'utf8');
  for (const [endpoint, c] of Object.entries(CONTRACT)) {
    for (const [field, spec] of Object.entries(c.fields)) {
      if (!spec.required) continue;
      assert.ok(page.includes(field), `${endpoint} requires ${field}, but the page never reads it`);
    }
  }
});
