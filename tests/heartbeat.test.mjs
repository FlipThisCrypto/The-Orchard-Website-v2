// Tests for scripts/heartbeat.mjs — the only thing that will notice production
// breaking. These drive the real probe code against a local origin serving
// deliberately broken responses, because the interesting question is not "does
// it pass when everything is fine" but "does it fail for the right reasons and
// stay quiet for the wrong ones".
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { SITES } from '../scripts/check-deployed.mjs';
import {
  probePage, probeOracle, probeDeployDrift, verdict, clockDriftMinutes,
  ORACLE_CLOCK_TOLERANCE_MIN,
} from '../scripts/heartbeat.mjs';

const HEADERS = {
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy': "frame-ancestors 'self' https://theorchard.network",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'geolocation=(), camera=()',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
};

const goodPage = '<html><main id="main">' + 'x'.repeat(3000) + '</main></html>';

const goodNodes = [{
  node_id: 'n1', sensors: ['temp'], last_seen_at: '2026-08-07T12:00:00',
  last_reading_at: '2026-08-07T12:00:00', fw_version: '1.0', pass_nft_id: null,
  geohash: 'dn5b', pass_verified_at: null, registered_at: '2026-01-01T00:00:00', label: 'One',
}];
const goodStats = (over = {}) => ({
  trees_registered: 4, trees_active_24h: 2, readings_total: 10, readings_last_24h: 5,
  attestations_total: 0, current_season: 73,
  as_of_utc: new Date().toISOString().replace('Z', '+00:00'),
  ...over,
});

/** Start a throwaway origin. `routes` maps a path to [status, body, headers]. */
async function origin(routes) {
  const server = createServer((req, res) => {
    const path = req.url.split('?')[0];
    const r = routes[path];
    if (!r) { res.writeHead(404).end('nope'); return; }
    const [status, body, headers] = r;
    res.writeHead(status, headers || {});
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}

const siteAt = (base) => ({ ...SITES.worldview, origin: base });
const by = (probes, id) => probes.find((p) => p.id === id);

// --- the page -------------------------------------------------------------
test('a healthy page passes every page probe', async () => {
  const o = await origin({ '/': [200, goodPage, HEADERS] });
  const probes = await probePage(siteAt(o.base));
  await o.close();
  assert.ok(probes.every((p) => p.ok), JSON.stringify(probes, null, 2));
  assert.equal(verdict(probes).healthy, true);
});

test('a 503 fails, and says so as a failure not a note', async () => {
  const o = await origin({ '/': [503, 'down', HEADERS] });
  const probes = await probePage(siteAt(o.base));
  await o.close();
  assert.equal(by(probes, 'page-reachable').ok, false);
  assert.equal(verdict(probes).healthy, false);
  assert.ok(verdict(probes).failed.includes('page-reachable'));
});

test('HTTP 200 serving an error shell still counts as down', async () => {
  // The failure mode that motivates this probe: a deploy that lands an empty
  // or placeholder index.html. Status codes alone would call that healthy.
  const o = await origin({ '/': [200, '<html>Error</html>', HEADERS] });
  const probes = await probePage(siteAt(o.base));
  await o.close();
  assert.equal(by(probes, 'page-reachable').ok, true);
  assert.equal(by(probes, 'page-has-content').ok, false);
  assert.equal(verdict(probes).healthy, false);
});

test('a dropped security header fails and names the header', async () => {
  // _headers can be uploaded and still not applied; that is invisible in the
  // page body, so only a response-header check finds it.
  const { 'x-frame-options': _drop, ...missing } = HEADERS;
  const o = await origin({ '/': [200, goodPage, missing] });
  const probes = await probePage(siteAt(o.base));
  await o.close();
  const h = by(probes, 'security-headers');
  assert.equal(h.ok, false);
  assert.match(h.detail, /x-frame-options missing/);
});

// --- the oracle -----------------------------------------------------------
test('a healthy oracle passes, and reports activity as informational', async () => {
  const o = await origin({
    '/nodes': [200, goodNodes], '/network/stats': [200, goodStats()],
  });
  const probes = await probeOracle(o.base);
  await o.close();
  assert.ok(probes.every((p) => p.ok), JSON.stringify(probes, null, 2));
  assert.equal(by(probes, 'network-active').severity, 'info');
});

test('an unreachable oracle fails', async () => {
  const o = await origin({});
  const base = o.base;
  await o.close();                       // nothing is listening now
  const probes = await probeOracle(base);
  assert.equal(by(probes, 'oracle-reachable').ok, false);
  assert.equal(verdict(probes).healthy, false);
});

test('a missing REQUIRED field breaks the contract', async () => {
  const { last_seen_at: _gone, ...broken } = goodNodes[0];
  const o = await origin({
    '/nodes': [200, [broken]], '/network/stats': [200, goodStats()],
  });
  const probes = await probeOracle(o.base);
  await o.close();
  const c = by(probes, 'oracle-contract');
  assert.equal(c.ok, false);
  assert.match(c.detail, /last_seen_at/);
});

test('a missing OPTIONAL field does not break the contract', async () => {
  // The page already treats these as absent. Failing here would page someone
  // over a change that costs the page nothing — the fastest way to teach
  // everyone to ignore the alert.
  const { label: _l, fw_version: _f, ...lean } = goodNodes[0];
  const o = await origin({
    '/nodes': [200, [lean]], '/network/stats': [200, goodStats()],
  });
  const probes = await probeOracle(o.base);
  await o.close();
  assert.equal(by(probes, 'oracle-contract').ok, true);
});

test('a frozen oracle clock fails even though every endpoint returns 200', async () => {
  // The subtlest real outage: the oracle answers, the shape is perfect, and
  // the data stopped moving hours ago. Nothing else in this repo detects it.
  const stale = new Date(Date.now() - (ORACLE_CLOCK_TOLERANCE_MIN + 45) * 60000)
    .toISOString().replace('Z', '+00:00');
  const o = await origin({
    '/nodes': [200, goodNodes], '/network/stats': [200, goodStats({ as_of_utc: stale })],
  });
  const probes = await probeOracle(o.base);
  await o.close();
  const p = by(probes, 'oracle-publishing');
  assert.equal(p.ok, false);
  assert.match(p.detail, /min from now/);
  assert.equal(verdict(probes).healthy, false);
});

test('a QUIET network is reported but never unhealthy', async () => {
  // The whole reason severities exist. An orchard where nothing reported for a
  // day is a real fact worth surfacing and NOT a site outage — winter, flat
  // batteries, a quiet season. Alerting on it would destroy the alert.
  const o = await origin({
    '/nodes': [200, goodNodes],
    '/network/stats': [200, goodStats({ trees_active_24h: 0, readings_last_24h: 0 })],
  });
  const probes = await probeOracle(o.base);
  await o.close();
  const v = verdict(probes);
  assert.equal(by(probes, 'network-active').ok, false);
  assert.equal(v.healthy, true, 'a quiet network must not be an outage');
  assert.deepEqual(v.notes, ['network-active']);
});

// --- deploy drift ---------------------------------------------------------
test('deploy drift is reported but never unhealthy', async () => {
  // Pages is direct-upload: production lags the repo from the moment a commit
  // lands until someone deploys. Failing on that would fire after every commit.
  const routes = {};
  for (const f of SITES.worldview.files) routes[`/${f}`] = [200, 'not what the repo has'];
  const o = await origin(routes);
  const probes = await probeDeployDrift(siteAt(o.base));
  await o.close();
  assert.equal(probes[0].ok, false);
  assert.equal(probes[0].severity, 'info');
  assert.equal(verdict(probes).healthy, true, 'awaiting a deploy is not an outage');
  assert.match(probes[0].detail, /awaiting deploy/);
});

// --- clock parsing --------------------------------------------------------
test('an offset-less oracle timestamp is read as UTC, not local time', () => {
  // Reading these as local time is the bug that had me publicly blaming the
  // oracle for a four-hour skew that was mine. The monitor must not reinvent
  // it — it uses the page's own parser.
  const now = Date.UTC(2026, 7, 7, 12, 0, 0);
  assert.equal(clockDriftMinutes('2026-08-07T12:00:00', now), 0);
  assert.equal(clockDriftMinutes('2026-08-07T12:00:00+00:00', now), 0);
  assert.equal(clockDriftMinutes('2026-08-07T11:30:00Z', now), 30);
});

test('an unparseable timestamp is null, not silently zero', () => {
  assert.equal(clockDriftMinutes('not a time'), null);
  assert.equal(clockDriftMinutes(null), null);
});
