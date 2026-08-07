// Is production actually running what's in this repo?
//
//   node scripts/check-deployed.mjs            check worldview
//   node scripts/check-deployed.mjs --json     machine-readable
//
// This exists because the answer is not obvious and getting it wrong is
// expensive. The Cloudflare Pages project is DIRECT-UPLOAD: a git push, a
// merged PR and a green CI run all deploy exactly nothing. Twenty commits of
// security and reliability work once sat unshipped while every signal in the
// repo said "done". One command should be able to tell you that.
//
// Compares SHA-256 of the bytes, not sizes: the served text differs from the
// file's byte length purely because JS string length counts UTF-16 units and
// the page is full of emoji and en-dashes.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';

export const SITES = {
  worldview: {
    origin: 'https://worldview.theorchard.network',
    dir: 'worldview',
    // Files served verbatim. index.html is the page itself; the rest are the
    // assets it depends on, which is where "the HTML landed but the siblings
    // didn't" hides.
    files: ['index.html', 'orchard-data.js', 'app.js', 'favicon.svg'],
    // Rules from worldview/_headers that must be observable on the response.
    // Uploading _headers is not the same as it being applied.
    requiredHeaders: {
      'x-frame-options': /^SAMEORIGIN$/i,
      'content-security-policy': /frame-ancestors[^;]*theorchard\.network/i,
      'x-content-type-options': /^nosniff$/i,
      'referrer-policy': /^strict-origin-when-cross-origin$/i,
      'permissions-policy': /geolocation=\(\)/i,
      'cross-origin-opener-policy': /^same-origin-allow-popups$/i,
    },
  },
};

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** Which files match, which differ, which are missing. Pure. */
export function diffManifest(local, remote) {
  const rows = [];
  for (const [name, localHash] of Object.entries(local)) {
    const r = remote[name];
    if (!r || r.error) rows.push({ name, status: 'unreachable', detail: (r && r.error) || 'no response' });
    else if (r.hash === localHash) rows.push({ name, status: 'match' });
    else rows.push({ name, status: 'stale', detail: `repo ${localHash.slice(0, 12)} vs live ${r.hash.slice(0, 12)}` });
  }
  return rows;
}

/** Which required headers are absent or wrong. Pure. */
export function checkHeaders(headers, required) {
  const problems = [];
  for (const [name, pattern] of Object.entries(required)) {
    const value = headers[name.toLowerCase()];
    if (value == null) problems.push({ header: name, status: 'missing' });
    else if (!pattern.test(value)) problems.push({ header: name, status: 'unexpected', value });
  }
  return problems;
}

export function summarise(rows, headerProblems) {
  const stale = rows.filter((r) => r.status !== 'match');
  return {
    ok: stale.length === 0 && headerProblems.length === 0,
    filesChecked: rows.length,
    stale,
    headerProblems,
  };
}

// ---------------------------------------------------------------------------
const SPEC = {
  name: 'check-deployed',
  path: 'scripts/check-deployed.mjs',
  summary: 'is production actually running this repo? (byte hashes + security headers)',
  flags: { '--json': 'machine-readable output' },
  notes: ['Pages is direct-upload: a git push deploys nothing.', 'Exit 1 means production is stale.'],
};
async function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);

  const asJson = flags.has('--json');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const site = SITES.worldview;

  const local = {};
  for (const f of site.files) local[f] = sha256(readFileSync(join(root, site.dir, f)));

  const remote = {};
  let headers = {};
  for (const f of site.files) {
    const url = `${site.origin}/${f === 'index.html' ? '' : f}?_=${Date.now()}`;
    try {
      const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
      if (!res.ok) { remote[f] = { error: `HTTP ${res.status}` }; continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      remote[f] = { hash: sha256(buf), bytes: buf.length, type: res.headers.get('content-type') };
      if (f === 'index.html') res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      // Pages serves index.html for unknown paths, so an asset that comes back
      // as HTML is missing, not present.
      if (f !== 'index.html' && /text\/html/.test(remote[f].type || '')) {
        remote[f] = { error: 'served the index.html fallback — file is not deployed' };
      }
    } catch (e) {
      remote[f] = { error: e.message };
    }
  }

  const rows = diffManifest(local, remote);
  const headerProblems = checkHeaders(headers, site.requiredHeaders);
  const result = summarise(rows, headerProblems);

  if (asJson) { console.log(JSON.stringify({ origin: site.origin, ...result, rows }, null, 2)); }
  else {
    console.log(`\n  ${site.origin}\n`);
    for (const r of rows) {
      const mark = r.status === 'match' ? '✓' : '✗';
      console.log(`  ${mark} ${r.name.padEnd(18)} ${r.status}${r.detail ? ' — ' + r.detail : ''}`);
    }
    for (const p of headerProblems) {
      console.log(`  ✗ header ${p.header} ${p.status}${p.value ? ' — ' + p.value : ''}`);
    }
    console.log(result.ok
      ? `\n  Production matches the repo.\n`
      : `\n  Production is NOT running this repo. Deploy it — see worldview/README.md.\n`);
  }
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
