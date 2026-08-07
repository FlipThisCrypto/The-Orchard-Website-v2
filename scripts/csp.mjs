// Keep the enforced script-src policy in step with the page's inline scripts.
//
//   node scripts/csp.mjs           rewrite the script-src directive
//   node scripts/csp.mjs --check   fail if it is stale (hook + CI)
//
// script-src used to live in Content-Security-Policy-Report-Only with
// 'unsafe-inline', which is a policy that does nothing: report-only blocks
// nothing, no reporting endpoint was ever configured so nothing was collected
// either, and 'unsafe-inline' is precisely the permission that makes CSP
// useless against injected script. This page shares an origin zone with the
// wallet session and has already had one stored-XSS hole closed. It should be
// the browser enforcing that, not my care.
//
// Static hosting can't mint a per-request nonce, so inline script is allowed by
// HASH — and a hash is stale the moment the script changes. That is the same
// trap hand-written cache versions set, so it gets the same answer: derived,
// never typed, and checked by the same gate that runs everything else.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';

export const PAGE = 'worldview/index.html';
export const HEADERS = 'worldview/_headers';

/**
 * Origins allowed to supply script, each one justified.
 * Deliberately no 'unsafe-inline': a hash in the policy makes browsers ignore
 * it anyway, and it is the permission that would make all of this pointless.
 */
export const SCRIPT_SRC_ORIGINS = [
  "'self'",
  // The Connect Wallet widget, served by the oracle.
  'https://oracle.theorchard.network',
  // connect.js dynamically imports @walletconnect/sign-client and
  // @walletconnect/modal from esm.sh at click time. Verified by reading the
  // deployed widget — remove this the day that stops being true, and not
  // before, because dropping it silently breaks connecting a wallet.
  'https://esm.sh',
];

/** sha256-base64 of every inline <script> in the page, in document order. */
export function inlineScriptHashes(html) {
  const hashes = [];
  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.push(`'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
  }
  return hashes;
}

export const buildScriptSrc = (html) =>
  ['script-src', ...SCRIPT_SRC_ORIGINS, ...inlineScriptHashes(html)].join(' ');

/**
 * Put `scriptSrc` into the ENFORCED Content-Security-Policy line, replacing any
 * script-src already there. Pure. Only touches that one directive so the
 * frame-ancestors / object-src / base-uri reasoning stays where it is
 * explained.
 */
export function applyScriptSrc(headers, scriptSrc) {
  const line = /^([ \t]*Content-Security-Policy:[ \t]*)(.+)$/m;
  const m = headers.match(line);
  if (!m) throw new Error(`${HEADERS} has no enforced Content-Security-Policy line`);
  const directives = m[2].split(';').map((d) => d.trim()).filter(Boolean)
    .filter((d) => !/^script-src\b/.test(d));
  directives.push(scriptSrc);
  return headers.replace(line, `${m[1]}${directives.join('; ')}`);
}

// ---------------------------------------------------------------------------
const SPEC = {
  name: 'csp',
  path: 'scripts/csp.mjs',
  summary: "stamp the page's inline-script hashes into the enforced CSP",
  flags: { '--check': 'fail if the policy is stale; write nothing' },
  notes: [
    'Run after editing any inline <script> in worldview/index.html.',
    'A stale hash means the browser blocks the page\'s own boot script.',
  ],
};
function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const html = readFileSync(join(root, PAGE), 'utf8');
  const headersPath = join(root, HEADERS);
  const current = readFileSync(headersPath, 'utf8');

  const scriptSrc = buildScriptSrc(html);
  const updated = applyScriptSrc(current, scriptSrc);
  const inlineCount = inlineScriptHashes(html).length;

  if (flags.has('--check')) {
    if (updated !== current) {
      console.error(
        `✗ The enforced script-src in ${HEADERS} is stale.\n` +
        `  An inline script in ${PAGE} changed without its hash moving, so the\n` +
        `  browser would block the page's own script.\n` +
        `  Run: node scripts/csp.mjs\n`
      );
      process.exit(1);
    }
    console.log(`✓ script-src is enforced and covers ${inlineCount} inline script(s).`);
    return;
  }

  writeFileSync(headersPath, updated);
  console.log(`Stamped ${inlineCount} inline-script hash(es) into the enforced script-src.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
