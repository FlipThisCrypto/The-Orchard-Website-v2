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
import { pathToFileURL } from 'node:url';

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

export function scanText(text, source) {
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

function main() {
  const opts = { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 };
  let findings = [];

  // 1. Every tracked file in the working tree.
  const files = execSync('git ls-files', opts).trim().split('\n')
    .filter((f) => !/vendor\/|\.jpg$|\.min\.js$/.test(f));
  for (const f of files) {
    try { findings.push(...scanText(execSync(`git show :"${f}"`, opts), f)); } catch { /* binary */ }
  }

  // 2. Every blob ever committed — a secret deleted later is still exposed.
  const history = execSync('git rev-list --all', opts).trim().split('\n');
  const seen = new Set();
  for (const rev of history) {
    const tree = execSync(`git ls-tree -r ${rev}`, opts).trim().split('\n');
    for (const line of tree) {
      const [meta, path] = line.split('\t');
      if (!path || /vendor\/|\.jpg$|\.min\.js$/.test(path)) continue;
      const hash = meta.split(' ')[2];
      if (seen.has(hash)) continue;
      seen.add(hash);
      try { findings.push(...scanText(execSync(`git cat-file blob ${hash}`, opts), `${rev.slice(0, 8)}:${path}`)); } catch { /* binary */ }
    }
  }

  const real = findings.filter((f) => !isKnownPublic(f));
  const publicRefs = findings.length - real.length;

  console.log(`\n  Scanned ${files.length} tracked files and ${seen.size} historical blobs across ${history.length} commits.`);
  if (publicRefs) console.log(`  ${publicRefs} matches were known public on-chain identifiers (the Pass NFT, the $JUICE asset id).`);
  if (real.length === 0) {
    console.log('  ✓ No secrets found.\n');
    process.exit(0);
  }
  console.log(`\n  ✗ ${real.length} potential secrets:`);
  for (const f of real) console.log(`     ${f.pattern} in ${f.source} — "${f.sample}"`);
  console.log('');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
