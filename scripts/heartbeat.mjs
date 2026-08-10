// Is production actually alive right now?
//
//   node scripts/heartbeat.mjs           human-readable
//   node scripts/heartbeat.mjs --json    machine-readable
//
// Everything else in this repo is checked when a person types a command. The
// two things most likely to break are the two nobody watches: Cloudflare Pages
// is direct-upload (a push deploys nothing) and the oracle runs on a box this
// repo doesn't control. Without this, the first to notice an outage is a
// visitor.
//
// The hard part is not detecting failure, it's NOT crying wolf — an alert that
// fires on healthy states gets muted, and a muted alert is worse than none.
// So this deliberately separates three different things that all "look wrong":
//
//   FAIL   the site or the oracle is broken. A human should act.
//   DRIFT  production doesn't match the repo. Legitimate and expected between
//          manual deploys — reported every time, never an alert.
//   QUIET  the network has little activity. That is a property of an orchard,
//          not a fault. Trees sleep, batteries die, seasons change. Reporting
//          this as an outage would train everyone to ignore the alert.
//
// It reads only public endpoints and never prints wallet_address.
import { pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { SITES, sha256, checkHeaders } from './check-deployed.mjs';
import { ORACLE, CONTRACT, checkEndpoint } from './check-oracle.mjs';
import OrchardData from '../worldview/orchard-data.js';

const { parseOracleTime } = OrchardData;

/** The oracle stamps as_of_utc per request, so a stale one means it is serving
 *  cached or frozen data. Generous enough to absorb clock skew on either end. */
export const ORACLE_CLOCK_TOLERANCE_MIN = 20;

const TIMEOUT_MS = 15000;

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' });
  return res;
}

/**
 * Judge how far the oracle's own clock is from ours, in minutes.
 * Uses the page's parser, not a second implementation: offset-less timestamps
 * are UTC, and getting that wrong is what made me blame the oracle for a
 * four-hour skew that was mine (iteration 34).
 */
export function clockDriftMinutes(asOfUtc, now = Date.now()) {
  const t = parseOracleTime(asOfUtc);
  if (!Number.isFinite(t)) return null;
  return (now - t) / 60000;
}

/** Turn probe results into a verdict. Pure, so the severity rules are testable. */
export function verdict(probes) {
  const failed = probes.filter((p) => p.severity === 'fail' && !p.ok);
  return {
    healthy: failed.length === 0,
    failed: failed.map((p) => p.id),
    notes: probes.filter((p) => p.severity !== 'fail' && !p.ok).map((p) => p.id),
  };
}

export async function probePage(site) {
  const probes = [];
  let res = null, body = null;
  try {
    res = await get(site.origin + '/');
    body = Buffer.from(await res.arrayBuffer());
  } catch (e) {
    return [{ id: 'page-reachable', severity: 'fail', ok: false, detail: String(e.message || e) }];
  }
  probes.push({
    id: 'page-reachable', severity: 'fail', ok: res.status === 200,
    detail: `HTTP ${res.status}, ${body.length} bytes`,
  });
  // A page that returns 200 but is empty or an error shell is still down.
  probes.push({
    id: 'page-has-content', severity: 'fail', ok: body.length > 2000 && body.includes('<main'),
    detail: `${body.length} bytes`,
  });
  const headers = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  const headerProblems = checkHeaders(headers, site.requiredHeaders);
  probes.push({
    id: 'security-headers', severity: 'fail', ok: headerProblems.length === 0,
    detail: headerProblems.length
      ? headerProblems.map((p) => `${p.header} ${p.status}`).join('; ')
      : `${Object.keys(site.requiredHeaders).length} present`,
  });
  return probes;
}

export async function probeOracle(base = ORACLE) {
  const probes = [];
  let stats = null, nodes = null;
  try {
    const [s, n] = await Promise.all([get(`${base}/network/stats`), get(`${base}/nodes`)]);
    probes.push({
      id: 'oracle-reachable', severity: 'fail', ok: s.status === 200 && n.status === 200,
      detail: `stats HTTP ${s.status}, nodes HTTP ${n.status}`,
    });
    if (s.status === 200) stats = await s.json();
    if (n.status === 200) nodes = await n.json();
  } catch (e) {
    return [{ id: 'oracle-reachable', severity: 'fail', ok: false, detail: String(e.message || e) }];
  }

  if (stats && nodes) {
    // The whole array — the contract's shape is array-of-objects and it picks
    // its own sample. Passing nodes[0] would make it report "expected an
    // array, got object" against a perfectly healthy oracle.
    const problems = [
      ...checkEndpoint(nodes, CONTRACT['/nodes']).problems,
      ...checkEndpoint(stats, CONTRACT['/network/stats']).problems,
    ]
      // A missing OPTIONAL field is a thing to know, not a broken contract.
      // Alerting on it would page someone because the oracle stopped sending a
      // field the page already treats as absent.
      .filter((p) => p.required);
    probes.push({
      id: 'oracle-contract', severity: 'fail', ok: problems.length === 0,
      detail: problems.length
        ? problems.map((p) => `${p.field}: ${p.issue}`).join('; ')
        : 'fields the page reads are present and typed',
    });

    const drift = clockDriftMinutes(stats.as_of_utc);
    probes.push({
      id: 'oracle-publishing', severity: 'fail',
      ok: drift !== null && Math.abs(drift) < ORACLE_CLOCK_TOLERANCE_MIN,
      detail: drift === null ? `unparseable as_of_utc: ${stats.as_of_utc}` : `as_of_utc is ${drift.toFixed(1)} min from now`,
    });

    // Readings loud, chain quiet: the one pipeline failure that used to be
    // invisible from outside. Exit codes and ops journals live on the
    // operator's box, so a DataLayer writer that had been refusing for a week
    // looked identical to a healthy quiet one. The oracle now publishes
    // last_attestation_at / last_reading_at precisely so this probe can
    // exist: warn when Trees are posting but nothing has reached the chain
    // for over two days (attestation is daily, so one missed day is slack,
    // two is a stall). Absent fields skip the probe — an older oracle is not
    // a stalled pipeline.
    const lastAtt = Date.parse(stats.last_attestation_at ?? '');
    const lastRead = Date.parse(stats.last_reading_at ?? '');
    if (Number.isFinite(lastRead) && Number.isFinite(lastAtt)) {
      const readFresh = Date.now() - lastRead < 24 * 3600 * 1000;
      const chainStale = Date.now() - lastAtt > 48 * 3600 * 1000;
      probes.push({
        id: 'chain-pipeline', severity: 'warn',
        ok: !(readFresh && chainStale),
        detail: readFresh && chainStale
          ? `readings flowing but last attestation ${((Date.now() - lastAtt) / 86400000).toFixed(1)}d ago — the writer is stalled or refusing`
          : `last attestation ${Number.isFinite(lastAtt) ? ((Date.now() - lastAtt) / 3600000).toFixed(1) + 'h ago' : 'never'}`,
      });
    }

    // QUIET, not FAIL. An orchard with nothing reporting is a real condition
    // worth seeing, but it is a fact about the network, not a fault in the
    // site — and paging someone because trees are asleep is how alerts die.
    const active = Number(stats.trees_active_24h);
    probes.push({
      id: 'network-active', severity: 'info', ok: active > 0,
      detail: `${active}/${stats.trees_registered} Trees reported in 24h, ${stats.readings_last_24h} readings`,
    });
  }
  return probes;
}

export async function probeDeployDrift(site) {
  // DRIFT, not FAIL. Pages is direct-upload, so production legitimately lags
  // the repo from the moment a commit lands until someone deploys. Alerting on
  // that would fire after every single commit.
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const differing = [];
  for (const file of site.files) {
    try {
      const local = sha256(readFileSync(join(root, site.dir, file)));
      const res = await get(`${site.origin}/${file}`);
      const remote = sha256(Buffer.from(await res.arrayBuffer()));
      if (local !== remote) differing.push(file);
    } catch (e) {
      differing.push(`${file} (${e.message || e})`);
    }
  }
  return [{
    id: 'deployed-matches-repo', severity: 'info', ok: differing.length === 0,
    detail: differing.length ? `awaiting deploy: ${differing.join(', ')}` : 'production is serving this commit',
  }];
}

const SPEC = {
  name: 'heartbeat',
  path: 'scripts/heartbeat.mjs',
  summary: 'check whether production is alive right now',
  flags: { '--json': 'machine-readable result' },
  notes: [
    'Exit 1 only when the site or the oracle is actually broken.',
    'Deploy drift and a quiet network are reported, never alerted on.',
  ],
};

async function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);
  const site = SITES.worldview;

  const probes = [
    ...(await probePage(site)),
    ...(await probeOracle()),
    ...(await probeDeployDrift(site)),
  ];
  const v = verdict(probes);
  const checkedAt = new Date().toISOString();

  if (flags.has('--json')) {
    console.log(JSON.stringify({ checked_at: checkedAt, origin: site.origin, ...v, probes }, null, 2));
    process.exit(v.healthy ? 0 : 1);
  }

  console.log(`\n  ${site.origin}  ·  ${checkedAt}\n`);
  for (const p of probes) {
    const mark = p.ok ? '✓' : p.severity === 'fail' ? '✗' : '·';
    console.log(`  ${mark} ${p.id.padEnd(22)} ${p.detail}`);
  }
  if (v.healthy) {
    console.log('\n  Production is healthy.');
    if (v.notes.length) console.log(`  (informational, not a fault: ${v.notes.join(', ')})`);
    console.log('');
    process.exit(0);
  }
  console.log(`\n  ✗ Production is UNHEALTHY: ${v.failed.join(', ')}\n`);
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
