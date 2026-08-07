// scan-secrets:contains-fake-credentials
//
// The xch1… address below is invented, and has to LOOK real for the test to
// mean anything — a short fake wouldn't prove the whitelist strips a genuine
// wallet. The marker above is how this file declares that to the scanner, in
// its own text rather than by a path rule. (The scanner found it immediately,
// which is the system working.)
//
// Tests for scripts/snapshot.mjs — the offline fallback the page shows when
// the oracle is unreachable.
//
// Two things make this worth testing hard. It is COMMITTED, so a privacy
// mistake is permanent and public. And it is what a visitor sees exactly when
// everything else has failed, which is the worst moment to be showing stale
// numbers as though they were current.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  sanitizeNodes, sanitizeStats, applySnapshot, ageInDays,
  NODE_FIELDS, STATS_FIELDS, MAX_AGE_DAYS,
} from '../scripts/snapshot.mjs';

const app = readFileSync(new URL('../worldview/app.js', import.meta.url), 'utf8');

// A node exactly as the live oracle sends it — wallet_address included,
// because it really is in every response.
const oracleNode = {
  node_id: 'ABC123', label: null, fw_version: '0.5.1',
  registered_at: '2026-06-16T09:05:36.198748', last_seen_at: '2026-08-07T15:17:20.192656',
  last_reading_at: '2026-08-07T15:17:20.192656', geohash: null, sensors: ['ds18b20'],
  wallet_address: 'xch1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzzzzz',
  pass_nft_id: 'nft1abc', pass_verified_at: '2026-06-16T09:05:36.780324',
};

test('wallet_address never reaches the snapshot', () => {
  // The one thing SECURITY.md flatly forbids, and the snapshot is a committed
  // copy of a response that contains it. Without the whitelist, refreshing the
  // fallback would have published every operator's wallet beside their Tree —
  // permanently, in git history, and to every visitor.
  const [node] = sanitizeNodes([oracleNode]);
  assert.equal('wallet_address' in node, false);
  assert.doesNotMatch(JSON.stringify(node), /xch1/);
});

test('the committed snapshot carries no wallet address', () => {
  assert.doesNotMatch(app, /wallet_address/);
});

test('only contract fields survive', () => {
  const [node] = sanitizeNodes([{ ...oracleNode, secret_internal_flag: true, ip: '10.0.0.4' }]);
  for (const k of Object.keys(node)) assert.ok(NODE_FIELDS.includes(k), `${k} should not be captured`);
  assert.equal('ip' in node, false);
  assert.equal('secret_internal_flag' in node, false);
  // …and the ones the page needs are all there.
  for (const f of ['node_id', 'sensors', 'last_seen_at', 'last_reading_at']) assert.ok(f in node);
});

test('a geohash finer than the privacy contract is refused, not truncated', () => {
  // Truncating would silently "fix" it and hide that the oracle started
  // publishing fine positions. A committed snapshot is permanent — this must
  // stop and be looked at.
  assert.throws(
    () => sanitizeNodes([{ ...oracleNode, geohash: 'dng01ez9' }]),
    /allows at most/,
  );
  // The contract-compliant case is fine.
  assert.equal(sanitizeNodes([{ ...oracleNode, geohash: 'dng01' }])[0].geohash, 'dng01');
});

test('stats are filtered to the contract too', () => {
  const stats = sanitizeStats({ trees_registered: 4, as_of_utc: 'x', internal_debug: 'nope' });
  for (const k of Object.keys(stats)) assert.ok(STATS_FIELDS.includes(k));
  assert.equal('internal_debug' in stats, false);
});

test('malformed oracle responses throw rather than committing junk', () => {
  assert.throws(() => sanitizeNodes({ nodes: [] }), /did not return an array/);
  assert.throws(() => sanitizeStats([1, 2]), /did not return an object/);
  assert.throws(() => sanitizeStats(null), /did not return an object/);
});

// --- rewriting app.js ------------------------------------------------------
test('applying a snapshot replaces the block and stays idempotent', () => {
  const payload = {
    capturedAt: '2026-08-07T12:00:00.000Z',
    nodes: [{ node_id: 'A', sensors: [] }],
    stats: { trees_registered: 1 },
  };
  const once = applySnapshot(app, payload);
  const twice = applySnapshot(once, payload);
  assert.equal(once, twice, 'writing the same capture twice must not change the file again');
  assert.equal((once.match(/const SNAPSHOT_CAPTURED_AT/g) || []).length, 1);
  assert.equal((once.match(/const SNAPSHOT_NODES/g) || []).length, 1);
  assert.match(once, /"node_id":"A"/);
});

test('applying a snapshot leaves the rest of the file alone', () => {
  const out = applySnapshot(app, { capturedAt: '2026-08-07T12:00:00.000Z', nodes: [], stats: {} });
  for (const marker of ['DECLARED_CELLS', 'function refresh', 'cellsFrom', 'const ORACLE']) {
    assert.ok(out.includes(marker), `${marker} must survive a snapshot refresh`);
  }
});

test('a file with no snapshot block fails loudly', () => {
  assert.throws(() => applySnapshot('const x = 1;\n', { capturedAt: 'x', nodes: [], stats: {} }),
    /no snapshot block/);
});

// --- staleness -------------------------------------------------------------
test('the committed snapshot knows how old it is', () => {
  const age = ageInDays(app);
  assert.ok(age !== null, 'app.js must carry a readable SNAPSHOT_CAPTURED_AT');
  assert.ok(age >= 0, 'a capture date in the future is wrong');
  assert.ok(age <= MAX_AGE_DAYS, `the committed snapshot is ${age?.toFixed(1)} days old`);
});

test('age is measured, not guessed', () => {
  const src = 'const SNAPSHOT_CAPTURED_AT = "2026-08-01T00:00:00.000Z";';
  assert.equal(ageInDays(src, Date.parse('2026-08-11T00:00:00Z')), 10);
  assert.equal(ageInDays('no date here'), null);
  assert.equal(ageInDays('const SNAPSHOT_CAPTURED_AT = "not a date";'), null);
});

test('the page shows the snapshot age, not a bare label', () => {
  // "snapshot" printed beside 216,725 all-time readings invites reading a
  // stored number as a current one.
  assert.match(app, /snapshot · " \+ ago\(SNAPSHOT_CAPTURED_AT/);
});
