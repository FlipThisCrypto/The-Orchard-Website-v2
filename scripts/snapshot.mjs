// Refresh the offline snapshot the page falls back to, from the live oracle.
//
//   node scripts/snapshot.mjs           capture now and rewrite the constants
//   node scripts/snapshot.mjs --check   fail if the committed snapshot has rotted
//
// This is what a visitor sees when the oracle is unreachable — the moment the
// page most needs to be trustworthy — and it was a blob someone remembered to
// paste into app.js. It showed "2,839 harvested today" labelled only
// "snapshot", with nothing to tell anyone whether that day was this morning or
// last winter. Stale numbers presented as current is the failure mode this
// whole repo keeps designing against, sitting on the least-watched path.
//
// So: captured by this script, stamped with the capture time the page displays,
// and gated — a snapshot older than MAX_AGE_DAYS fails the same check that runs
// the tests, because a fallback nobody refreshes is a fallback that lies.
//
// Privacy is enforced HERE, not trusted: only contract fields are kept, and
// wallet_address is dropped even though it is in every oracle response.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';
import { ORACLE } from './check-oracle.mjs';
import OrchardData from '../worldview/orchard-data.js';

const { DECLARED_PRECISION } = OrchardData;

export const APP = 'worldview/app.js';

/** How stale the committed fallback may get before the gate fails. */
export const MAX_AGE_DAYS = 45;

/**
 * Fields the snapshot may carry — the page's contract, nothing else.
 * wallet_address is deliberately absent: publishing an operator's wallet beside
 * a Tree is the one thing SECURITY.md flatly forbids, and a snapshot is a
 * COMMITTED copy of an oracle response, so a mistake here is permanent.
 */
export const NODE_FIELDS = [
  'node_id', 'sensors', 'fw_version', 'pass_nft_id', 'geohash',
  'last_seen_at', 'last_reading_at', 'pass_verified_at', 'registered_at', 'label',
];
export const STATS_FIELDS = [
  'trees_registered', 'trees_active_24h', 'readings_total', 'readings_last_24h',
  'attestations_total', 'current_season', 'as_of_utc',
];

const pick = (obj, fields) => {
  const out = {};
  for (const f of fields) if (obj && obj[f] !== undefined) out[f] = obj[f];
  return out;
};

/**
 * Strip a raw oracle response down to what may be committed. Pure.
 * Throws rather than truncating if a geohash is finer than the privacy
 * contract allows — a snapshot is permanent, so this must never "fix" quietly.
 */
export function sanitizeNodes(raw) {
  if (!Array.isArray(raw)) throw new Error('/nodes did not return an array');
  return raw.map((n) => {
    const node = pick(n, NODE_FIELDS);
    if (typeof node.geohash === 'string' && node.geohash.length > DECLARED_PRECISION) {
      throw new Error(
        `${node.node_id} publishes a ${node.geohash.length}-character geohash; ` +
        `the privacy contract allows at most ${DECLARED_PRECISION}. Refusing to commit it.`
      );
    }
    return node;
  });
}

export const sanitizeStats = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('/network/stats did not return an object');
  return pick(raw, STATS_FIELDS);
};

/** Replace the three snapshot constants in app.js. Pure. */
export function applySnapshot(src, { capturedAt, nodes, stats }) {
  const lines = [
    `  const SNAPSHOT_CAPTURED_AT = ${JSON.stringify(capturedAt)};`,
    `  const SNAPSHOT_NODES = [`,
    ...nodes.map((n, i) => `    ${JSON.stringify(n)}${i === nodes.length - 1 ? '' : ','}`),
    `  ];`,
    `  const SNAPSHOT_STATS = ${JSON.stringify(stats)};`,
  ].join('\n');

  const block = /^ {2}const SNAPSHOT_CAPTURED_AT = [\s\S]*?^ {2}const SNAPSHOT_STATS = .*$/m;
  if (!block.test(src)) throw new Error(`${APP} has no snapshot block to replace`);
  return src.replace(block, lines);
}

/** How old the committed snapshot is, in days. */
export function ageInDays(src, now = Date.now()) {
  const m = src.match(/const SNAPSHOT_CAPTURED_AT = "([^"]+)"/);
  if (!m) return null;
  const t = Date.parse(m[1]);
  return Number.isFinite(t) ? (now - t) / 86400000 : null;
}

// ---------------------------------------------------------------------------
const SPEC = {
  name: 'snapshot',
  path: 'scripts/snapshot.mjs',
  summary: 'refresh the offline fallback the page shows when the oracle is down',
  flags: { '--check': `fail if the committed snapshot is older than ${MAX_AGE_DAYS} days` },
  notes: [
    'Keeps only contract fields — never wallet_address, never a fine geohash.',
    'The page displays the capture time, so a stale fallback says so.',
  ],
};

async function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const path = join(root, APP);
  const src = readFileSync(path, 'utf8');

  if (flags.has('--check')) {
    const age = ageInDays(src);
    if (age === null) {
      console.error(`✗ ${APP} has no readable SNAPSHOT_CAPTURED_AT.\n  Run: node scripts/snapshot.mjs\n`);
      process.exit(1);
    }
    if (age > MAX_AGE_DAYS) {
      console.error(
        `✗ The offline snapshot is ${age.toFixed(0)} days old (limit ${MAX_AGE_DAYS}).\n` +
        `  It is what visitors see when the oracle is unreachable, and it would\n` +
        `  show them numbers from ${age.toFixed(0)} days ago.\n` +
        `  Run: node scripts/snapshot.mjs\n`
      );
      process.exit(1);
    }
    console.log(`✓ Offline snapshot is ${age.toFixed(1)} days old (limit ${MAX_AGE_DAYS}).`);
    return;
  }

  console.log(`\n  Capturing from ${ORACLE} …`);
  const [nodesRes, statsRes] = await Promise.all([
    fetch(`${ORACLE}/nodes`, { signal: AbortSignal.timeout(15000) }),
    fetch(`${ORACLE}/network/stats`, { signal: AbortSignal.timeout(15000) }),
  ]);
  if (!nodesRes.ok || !statsRes.ok) {
    console.error(`  ✗ oracle returned /nodes ${nodesRes.status}, /network/stats ${statsRes.status}\n`);
    process.exit(1);
  }
  const nodes = sanitizeNodes(await nodesRes.json());
  const stats = sanitizeStats(await statsRes.json());
  const capturedAt = new Date().toISOString();

  writeFileSync(path, applySnapshot(src, { capturedAt, nodes, stats }));
  console.log(`  Captured ${nodes.length} Trees and ${Object.keys(stats).length} stats at ${capturedAt}.`);
  console.log(`  Remember: node scripts/stamp-assets.mjs\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
