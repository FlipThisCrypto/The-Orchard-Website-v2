// Does the live oracle still look like what worldview/ expects?
//
//   node scripts/check-oracle.mjs            check the contract
//   node scripts/check-oracle.mjs --json     machine-readable
//
// This exists because the gap between "what the API publishes" and "what the
// page reads" is silent in both directions, and both directions have already
// bitten:
//   - the page dropped last_seen_at from its own whitelist, and rendered
//     confidently wrong node states while CI stayed green (iteration 31);
//   - the page ignored trees_active_24h and headlined counts that could only
//     ever go up (iteration 32).
// If the oracle renames or retypes a field, iteration 10's validation quietly
// falls back to the baked snapshot — the page keeps working and nobody learns
// why the data stopped moving.
//
// It reads only public endpoints and never prints wallet_address or any other
// operator-identifying field.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ORACLE = 'https://oracle.theorchard.network';

// What the page actually consumes. `required` means the page's behaviour
// changes materially without it.
export const CONTRACT = {
  '/nodes': {
    shape: 'array-of-objects',
    fields: {
      node_id: { type: 'string', required: true },
      sensors: { type: 'array', required: true },
      last_seen_at: { type: 'string|null', required: true },   // heartbeat
      last_reading_at: { type: 'string|null', required: true }, // Harvest recency
      fw_version: { type: 'string|null', required: false },
      pass_nft_id: { type: 'string|null', required: false },
      geohash: { type: 'string|null', required: false },
      pass_verified_at: { type: 'string|null', required: false },  // evidence for the Pass tick
      registered_at: { type: 'string|null', required: false },     // the planted date
    },
    // Present in the response and deliberately NOT read: publishing an
    // operator's wallet beside a Tree is exactly what SECURITY.md forbids.
    neverRead: ['wallet_address'],
  },
  '/network/stats': {
    shape: 'object',
    fields: {
      trees_registered: { type: 'number', required: true },
      trees_active_24h: { type: 'number', required: true },
      readings_total: { type: 'number', required: true },
      readings_last_24h: { type: 'number', required: true },
      attestations_total: { type: 'number', required: false },
      current_season: { type: 'number', required: false },
      as_of_utc: { type: 'string', required: true },            // the reference clock
    },
    neverRead: [],
  },
};

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const typeOk = (v, spec) => spec.split('|').includes(typeOf(v));

/**
 * Compare one endpoint's sample against its contract. Pure.
 * Returns problems (contract broken) and extras (fields we could be using).
 */
export function checkEndpoint(sample, contract) {
  const problems = [], extras = [];
  if (sample == null) return { problems: [{ field: '(response)', issue: 'no usable sample' }], extras };

  const record = contract.shape === 'array-of-objects'
    ? (Array.isArray(sample) ? sample[0] : null)
    : sample;

  if (contract.shape === 'array-of-objects' && !Array.isArray(sample)) {
    return { problems: [{ field: '(response)', issue: `expected an array, got ${typeOf(sample)}` }], extras };
  }
  if (contract.shape === 'object' && typeOf(sample) !== 'object') {
    return { problems: [{ field: '(response)', issue: `expected an object, got ${typeOf(sample)}` }], extras };
  }
  if (!record) return { problems: [], extras };   // an empty list is valid, just uninformative

  for (const [field, spec] of Object.entries(contract.fields)) {
    if (!(field in record)) {
      problems.push({ field, issue: spec.required ? 'missing (required)' : 'missing (optional)', required: !!spec.required });
      continue;
    }
    if (!typeOk(record[field], spec.type)) {
      problems.push({ field, issue: `expected ${spec.type}, got ${typeOf(record[field])}`, required: !!spec.required });
    }
  }
  for (const field of Object.keys(record)) {
    if (field in contract.fields) continue;
    if ((contract.neverRead || []).includes(field)) continue;   // known and deliberately unread
    extras.push(field);
  }
  return { problems, extras };
}

// Prose goes stale silently. MISSION.md is read by every advisor before every
// task and states the network size as a bare fact; it was already wrong by the
// time anyone noticed. These are the documented claims worth checking against
// what the oracle actually says.
export const DOCUMENTED_CLAIMS = [
  { file: 'MISSION.md', field: 'trees_registered', pattern: /\*\*(\d+) Trees registered/ },
  { file: 'MISSION.md', field: 'trees_active_24h', pattern: /(\d+) reporting in the last 24 ?h|(\d+) reporting in the last 24 h/ },
  { file: 'MISSION.md', field: 'current_season', pattern: /\(Season (\d+)\)/ },
];

/** Which documented numbers no longer match the live ones. Pure. */
export function checkClaims(docs, stats) {
  const drift = [];
  for (const claim of DOCUMENTED_CLAIMS) {
    const text = docs[claim.file];
    if (text == null) { drift.push({ ...claim, issue: 'file not found' }); continue; }
    const m = text.match(claim.pattern);
    if (!m) { drift.push({ ...claim, issue: 'claim no longer present — pattern did not match' }); continue; }
    const documented = Number(m.slice(1).find((x) => x != null));
    const actual = stats ? stats[claim.field] : null;
    if (actual == null) continue;                       // the oracle didn't say; nothing to compare
    if (documented !== actual) {
      drift.push({ ...claim, issue: `documents ${documented}, oracle says ${actual}`, documented, actual });
    }
  }
  return drift;
}

export function summarise(results) {
  const breaking = results.flatMap((r) => r.problems.filter((p) => p.required).map((p) => ({ endpoint: r.endpoint, ...p })));
  const soft = results.flatMap((r) => r.problems.filter((p) => !p.required).map((p) => ({ endpoint: r.endpoint, ...p })));
  return { ok: breaking.length === 0, breaking, soft, results };
}

// ---------------------------------------------------------------------------
async function main(argv) {
  const asJson = argv.includes('--json');
  const results = [];
  for (const [path, contract] of Object.entries(CONTRACT)) {
    let sample = null, error = null;
    try {
      const res = await fetch(ORACLE + path, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) error = `HTTP ${res.status}`;
      else sample = await res.json();
    } catch (e) { error = e.message; }
    const { problems, extras } = error
      ? { problems: [{ field: '(request)', issue: error, required: true }], extras: [] }
      : checkEndpoint(sample, contract);
    results.push({ endpoint: path, problems, extras });
  }
  const result = summarise(results);

  // Documented-vs-actual. Not fatal: prose drifting is worth knowing about,
  // not worth failing a check that also guards the API contract.
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const docs = {};
  for (const c of DOCUMENTED_CLAIMS) {
    if (c.file in docs) continue;
    try { docs[c.file] = readFileSync(join(root, c.file), 'utf8'); } catch { docs[c.file] = null; }
  }
  const statsSample = results.find((r) => r.endpoint === '/network/stats');
  let liveStats = null;
  try {
    const res = await fetch(ORACLE + '/network/stats', { signal: AbortSignal.timeout(15000) });
    if (res.ok) liveStats = await res.json();
  } catch { /* the endpoint check above already reported this */ }
  const drift = checkClaims(docs, liveStats);
  result.documentedDrift = drift;

  if (asJson) { console.log(JSON.stringify(result, null, 2)); }
  else {
    console.log(`\n  ${ORACLE}\n`);
    for (const r of results) {
      const mark = r.problems.some((p) => p.required) ? '✗' : '✓';
      console.log(`  ${mark} ${r.endpoint}`);
      for (const p of r.problems) console.log(`      ${p.required ? '✗' : '·'} ${p.field}: ${p.issue}`);
      if (r.extras.length) console.log(`      + publishes, unused by the page: ${r.extras.join(', ')}`);
    }
    if (drift.length) {
      console.log('\n  Documented numbers that have drifted:');
      for (const d of drift) console.log(`      · ${d.file} ${d.field}: ${d.issue}`);
    }
    console.log(result.ok
      ? `\n  The oracle still matches what worldview/ expects.\n`
      : `\n  CONTRACT BROKEN — worldview/ will degrade to its snapshot.\n`);
  }
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
