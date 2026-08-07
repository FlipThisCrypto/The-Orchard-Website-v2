// Scan the working tree AND full git history for secrets.
//
//   node scripts/scan-secrets.mjs
//
// SECURITY.md's first guarantee is "No secrets", with a scan date. A dated
// claim is honest but rots; this keeps it refreshable. Exit 0 = clean.
//
// Patterns are deliberately specific (key formats, not the word "key"):
// a scanner that cries wolf gets ignored, which is worse than no scanner.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';

export const PATTERNS = [
  // Chia / crypto material
  { name: 'Chia private key / master sk', re: /xprv[0-9a-z]{20,}/gi },
  { name: 'BIP39 mnemonic run', re: /\b(?:[a-z]+ ){11,23}[a-z]+\b/g, filter: mnemonicLike },
  { name: 'Chia wallet address', re: /\bxch1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{50,}/g },
  // Platform tokens
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/g },
  { name: 'Cloudflare API token', re: /\b[A-Za-z0-9_-]{40}\b/g, filter: (s, ctx) => /cloudflare|CF_|CLOUDFLARE/i.test(ctx) },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Generic bearer/api assignment', re: /\b(?:api[_-]?key|token|secret|passw(?:or)?d)\s*[:=]\s*['"][A-Za-z0-9+/_-]{16,}['"]/gi, filter: notPlaceholder },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
];

// English prose trips the 12-word run constantly; a mnemonic has no stopwords
// like "the/and/to" repeated and its words are all in the BIP39 length band.
function mnemonicLike(match) {
  const words = match.trim().split(/\s+/);
  const stop = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it', 'on', 'for', 'with', 'as', 'at', 'by', 'that', 'this', 'be', 'are', 'was', 'so', 'we', 'you', 'not', 'but', 'from', 'its', 'has', 'have', 'had', 'do', 'does', 'their', 'there', 'they', 'than', 'then', 'when', 'what', 'which', 'who', 'how', 'all', 'any', 'can', 'her', 'his', 'him', 'she', 'he', 'our', 'out', 'up', 'no', 'if', 'my', 'me', 'us', 'am', 'were', 'been', 'being', 'over', 'under', 'into', 'onto', 'per', 'via', 'one', 'two', 'never', 'every', 'each', 'more', 'most', 'some', 'such', 'own', 'same', 'both', 'very', 'just', 'only', 'still', 'also', 'too']);
  const stopCount = words.filter((w) => stop.has(w)).length;
  return stopCount === 0 && words.every((w) => w.length >= 3 && w.length <= 8);
}

function notPlaceholder(match) {
  return !/xxx|placeholder|example|your[_-]|<[^>]+>|redacted|dummy|sample|changeme/i.test(match);
}

// A file may opt out by containing this marker, and only a file that says so
// in its own text. Deliberately not a path rule like "ignore tests/": a
// blanket exclusion is how a real credential ends up in an ignored directory.
// The scanner's own fixtures are fake credentials by construction, and it
// reported them as findings from the moment they were written — which is why
// this check was silently failing until the aggregate runner surfaced it.
export const FIXTURE_MARKER = 'scan-secrets:contains-fake-credentials';

export function scanText(text, source) {
  if (text.includes(FIXTURE_MARKER)) return [];
  const findings = [];
  for (const p of PATTERNS) {
    for (const m of text.matchAll(p.re)) {
      const ctx = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60);
      if (p.filter && !p.filter(m[0], ctx)) continue;
      findings.push({ pattern: p.name, source, sample: m[0].slice(0, 24) + (m[0].length > 24 ? '…' : '') });
    }
  }
  return findings;
}

// Public, on-chain identifiers this repo cites on purpose. An allowlist of
// specific values, never of patterns.
const KNOWN_PUBLIC = [
  'nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y', // the Orchard Pass, linked from the page
  '285164e6af80202d2b07fa3cc6ae47ff2906029365a83c50fcab25a56b937121', // $JUICE asset id, in MISSION.md
];
export const isKnownPublic = (f) => KNOWN_PUBLIC.some((k) => k.startsWith(f.sample.replace('…', '')));

/** A blob larger than this is a build artefact or asset, not a leaked key. */
const MAX_BLOB = 2 * 1024 * 1024;

/**
 * Read many blobs through ONE `git cat-file --batch` process.
 * Returns [{ text, path }] for text blobs only — binaries and oversized
 * objects are skipped, as are trees (the object list includes directories).
 */
export function batchRead(entries, run = execSync) {
  const byHash = new Map();
  for (const e of entries) if (!byHash.has(e.hash)) byHash.set(e.hash, e.path);
  if (!byHash.size) return [];

  // No encoding: a Buffer, because blob bodies are byte-counted and may be
  // binary. Decoding the whole stream as utf8 would desynchronise the parser.
  const buf = run('git cat-file --batch', {
    input: [...byHash.keys()].join('\n'),
    maxBuffer: 512 * 1024 * 1024,
  });

  const out = [];
  let i = 0;
  while (i < buf.length) {
    const nl = buf.indexOf(0x0a, i);
    if (nl < 0) break;
    const [oid, type, size] = buf.toString('utf8', i, nl).split(' ');
    i = nl + 1;
    if (type === 'missing') continue;
    const bytes = Number(size);
    const body = buf.subarray(i, i + bytes);
    i += bytes + 1; // git writes a trailing LF after each body
    if (type !== 'blob' || bytes > MAX_BLOB || body.includes(0)) continue;
    out.push({ text: body.toString('utf8'), path: byHash.get(oid) });
  }
  return out;
}

/** A shallow clone can't support a claim about "all of git history". */
function assertFullHistory(opts) {
  if (execSync('git rev-parse --is-shallow-repository', opts).trim() !== 'true') return;
  console.error(
    '\n  ✗ This is a SHALLOW clone, so most of history is not present.\n' +
    "    Scanning it would read almost nothing and report 'No secrets found',\n" +
    '    which is worse than not running at all.\n' +
    '    Fetch full history first:  git fetch --unshallow\n' +
    '    In GitHub Actions:         actions/checkout with fetch-depth: 0\n'
  );
  process.exit(1);
}

const SPEC = {
  name: 'scan-secrets',
  path: 'scripts/scan-secrets.mjs',
  summary: "re-verify SECURITY.md's no-secrets guarantee over the tree and all history",
  flags: {},
  notes: [
    'Scans every file that could reach a commit and every historical blob.',
    'Exit 1 on a finding, or on a shallow clone it cannot honestly scan.',
  ],
};
function main(argv) {
  const { help } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);

  const opts = { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 };
  let findings = [];

  // 1. Every file that could reach a commit, as it is ON DISK — not whatever
  //    happens to be staged. (Reading the staged blob meant a fix in the
  //    working tree couldn't clear the scan until it was staged.)
  //
  //    --others includes files git hasn't been told about yet, which is the
  //    state EVERY new file passes through. Plain `git ls-files` missed them
  //    entirely: a fresh file holding a live token scanned clean, and the
  //    check that exists to catch exactly that reported "no secrets found".
  //    --exclude-standard still honours .gitignore, so ignored working files
  //    aren't scanned — they can't be committed either.
  const files = execSync('git ls-files --cached --others --exclude-standard', opts)
    .trim().split('\n')
    .filter((f) => f && !/vendor\/|\.jpg$|\.min\.js$/.test(f));
  const declaredFixtures = new Set();
  let unreadable = 0;
  for (const f of files) {
    let text;
    try {
      text = readFileSync(join(process.cwd(), f), 'utf8');
    } catch (e) {
      // Only tolerate a file that genuinely can't be read as text. A bare
      // `catch { continue }` here silently skipped EVERY file when a helper
      // wasn't imported, and the scan reported the tree clean.
      if (e && (e.code === 'ENOENT' || e.code === 'EISDIR')) { unreadable++; continue; }
      throw e;
    }
    if (text.includes(FIXTURE_MARKER)) declaredFixtures.add(f);
    findings.push(...scanText(text, f));
  }

  // 2. Refuse to scan history this clone doesn't have. `git rev-list --all` on
  //    a shallow clone returns the tip and nothing else, so the scan would read
  //    almost nothing and print "No secrets found" with total confidence — a
  //    green check proving the opposite of what it claims. CI needed
  //    fetch-depth: 0 for exactly this reason; a check shouldn't depend on
  //    every caller remembering that.
  assertFullHistory(opts);

  // 3. Every blob ever committed — a secret deleted later is still exposed.
  //    A path whose CURRENT version declares itself a fixture file has a
  //    fixture history too. History is immutable, so without that the check
  //    could never pass again once fake credentials were committed.
  //
  //    Two processes, not one per blob. This used to spawn `git ls-tree` per
  //    commit and `git cat-file` per blob — ~385 processes, ~19s of pure spawn
  //    overhead on Windows. That cost was the only reason the strongest check
  //    in the repo ran at push time instead of at every commit.
  const commits = execSync('git rev-list --all', opts).trim().split('\n').filter(Boolean);
  const objects = execSync('git rev-list --all --objects', opts).split('\n');
  const wanted = [];
  for (const line of objects) {
    const sp = line.indexOf(' ');
    if (sp < 0) continue;                       // commits and the root tree carry no path
    const hash = line.slice(0, sp), path = line.slice(sp + 1);
    if (!path || /vendor\/|\.jpg$|\.min\.js$/.test(path)) continue;
    if (declaredFixtures.has(path)) continue;
    wanted.push({ hash, path });
  }
  // Count what was actually READ, not what was asked for: `wanted` holds one
  // entry per (object, path) pair and includes directory trees, so reporting
  // its length would overstate the scan by ~2x.
  const blobs = batchRead(wanted);
  for (const { text, path } of blobs) findings.push(...scanText(text, `history:${path}`));

  const real = findings.filter((f) => !isKnownPublic(f));
  const publicRefs = findings.length - real.length;

  console.log(`\n  Scanned ${files.length - unreadable} working-tree files (tracked and not-yet-added) and ${blobs.length} historical text blobs across ${commits.length} commits.`);
  if (declaredFixtures.size) {
    console.log(`  Skipped ${declaredFixtures.size} file(s) declaring they hold fake credentials: ${[...declaredFixtures].join(', ')}`);
  }
  if (publicRefs) console.log(`  ${publicRefs} matches were known public on-chain identifiers (the Pass NFT, the $JUICE asset id).`);
  if (real.length === 0) {
    console.log('  ✓ No secrets found.\n');
    process.exit(0);
  }

  console.log(`\n  ✗ ${real.length} potential secrets:`);
  for (const f of real) {
    console.log(`     ${f.pattern} in ${f.source} — "${f.sample}"`);
    // Attribution costs a process per finding, so it's paid only when there IS
    // one. Batch reading gives the path but not the commits that carried it,
    // and "which commits do I have to rewrite?" is the first question asked.
    if (f.source.startsWith('history:')) {
      const path = f.source.slice('history:'.length);
      try {
        const log = execSync(`git log --all --format=%h --max-count=8 -- "${path}"`, opts).trim();
        if (log) console.log(`        carried by commits: ${log.split('\n').join(', ')}`);
      } catch { /* path may predate a rename; the path alone is still actionable */ }
    }
  }
  console.log('');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
