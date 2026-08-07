// Stamp each same-origin script URL with a version derived from its content.
//
//   node scripts/stamp-assets.mjs           rewrite the URLs
//   node scripts/stamp-assets.mjs --check   fail if any is stale (hook + CI)
//
// Why derived rather than typed: iteration 46 added a hand-written "?v=46" to
// defeat heuristic caching, which is a real problem — stale scripts fooled me
// four times in one round. But a number a human has to remember to bump is
// worse than nothing once it exists: it looks like cache-busting right up
// until someone edits app.js and doesn't touch it, which is the exact failure
// it was added to prevent. A hash cannot be forgotten.
//
// Only the changed file's version moves, so an edit to app.js does not
// invalidate a visitor's cached orchard-data.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

/** Pages whose same-origin <script src> URLs get stamped. */
export const STAMPED_PAGES = [
  { page: 'worldview/index.html', dir: 'worldview' },
  { page: 'dashboard/index.html', dir: 'dashboard' },
];

export const versionOf = (bytes) => createHash('sha256').update(bytes).digest('hex').slice(0, 8);

/**
 * Rewrite every same-origin script URL in `html` to carry its file's hash.
 * `read` maps a bare filename to its bytes. Pure.
 */
export function stamp(html, read) {
  const missing = [];
  const out = html.replace(
    /(<script src=")(?!https?:)([^"?]+)(?:\?v=[^"]*)?(")/g,
    (whole, pre, file, post) => {
      let bytes;
      try { bytes = read(file); } catch { missing.push(file); return whole; }
      return `${pre}${file}?v=${versionOf(bytes)}${post}`;
    }
  );
  return { html: out, missing };
}

// ---------------------------------------------------------------------------
function main(argv) {
  const check = argv.includes('--check');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const stale = [];
  let stampedCount = 0;

  for (const { page, dir } of STAMPED_PAGES) {
    const path = join(root, page);
    const current = readFileSync(path, 'utf8');
    const { html, missing } = stamp(current, (f) => readFileSync(join(root, dir, f)));
    if (missing.length) {
      console.error(`✗ ${page} references scripts that don't exist: ${missing.join(', ')}`);
      process.exit(1);
    }
    stampedCount += (html.match(/<script src="(?!https?:)[^"]+\?v=/g) || []).length;
    if (html !== current) {
      if (check) stale.push(page);
      else writeFileSync(path, html);
    }
  }

  if (check) {
    if (stale.length) {
      console.error(
        `✗ Script versions are stale in:\n` + stale.map((p) => `    ${p}`).join('\n') +
        `\n  A script changed without its URL version moving — cached browsers would keep the old one.` +
        `\n  Run: node scripts/stamp-assets.mjs\n`
      );
      process.exit(1);
    }
    console.log(`✓ All ${stampedCount} script URLs carry their file's current hash.`);
    return;
  }
  console.log(`Stamped ${stampedCount} script URLs across ${STAMPED_PAGES.length} pages.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
