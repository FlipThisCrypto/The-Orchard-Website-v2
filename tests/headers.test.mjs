// Tests for worldview/_headers — the response headers Cloudflare Pages serves.
// A config file nothing executes is a config file nothing checks, so these
// assert both the format Pages expects and the security properties we rely on.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(join(root, 'worldview/_headers'), 'utf8');

/** Parse the Cloudflare Pages _headers format into { pattern: {header: value} }. */
function parseHeaders(text) {
  const rules = {};
  let current = null;
  for (const line of text.split('\n')) {
    const stripped = line.replace(/^\s*#.*$/, '');
    if (!stripped.trim()) continue;
    if (!/^\s/.test(stripped)) {                 // unindented => a path pattern
      current = stripped.trim();
      rules[current] = rules[current] || {};
    } else {
      const m = stripped.match(/^\s+([A-Za-z0-9-]+):\s*(.+?)\s*$/);
      if (!m) continue;
      assert.ok(current, `header line before any path pattern: ${line}`);
      rules[current][m[1]] = m[2];
    }
  }
  return rules;
}

const rules = parseHeaders(raw);
const all = rules['/*'] || {};

test('every non-comment line is either a path pattern or an indented header', () => {
  for (const line of raw.split('\n')) {
    const stripped = line.replace(/^\s*#.*$/, '');
    if (!stripped.trim()) continue;
    const isPattern = /^\//.test(stripped);
    const isHeader = /^\s+[A-Za-z0-9-]+:\s*\S/.test(stripped);
    assert.ok(isPattern || isHeader, `unparseable line: ${JSON.stringify(line)}`);
  }
});

test('there is a catch-all rule so no path is left unprotected', () => {
  assert.ok(rules['/*'], '_headers must contain a /* rule');
});

test('the page cannot be framed by a third party (wallet clickjacking)', () => {
  assert.equal(all['X-Frame-Options'], 'SAMEORIGIN');
  const csp = all['Content-Security-Policy'] || '';
  const fa = csp.match(/frame-ancestors ([^;]+)/);
  assert.ok(fa, 'CSP must set frame-ancestors');
  assert.match(fa[1], /'self'/);
  assert.ok(!/\*(?!\.theorchard\.network)/.test(fa[1]), `frame-ancestors must not be open: ${fa[1]}`);
  assert.ok(!/'unsafe-inline'|\bhttps:\s|\*\s/.test(fa[1]), `frame-ancestors too permissive: ${fa[1]}`);
});

test('CSP blocks the classic XSS amplifiers even without a script-src', () => {
  const csp = all['Content-Security-Policy'] || '';
  assert.match(csp, /object-src 'none'/);   // no plugin/embed execution
  assert.match(csp, /base-uri 'self'/);     // no <base> hijack of relative URLs
  assert.match(csp, /form-action 'none'/);  // no form exfiltration
});

test('CSP never weakens itself with unsafe keywords', () => {
  const csp = all['Content-Security-Policy'] || '';
  assert.ok(!/unsafe-eval/.test(csp), 'unsafe-eval must not appear');
  assert.ok(!/data:/.test(csp), 'data: URIs must not be blanket-allowed');
});

test('sniffing and referrer leakage are closed off', () => {
  assert.equal(all['X-Content-Type-Options'], 'nosniff');
  assert.match(all['Referrer-Policy'] || '', /^(strict-origin-when-cross-origin|no-referrer|same-origin|strict-origin)$/);
});

test('the privacy contract is enforced by the browser, not just by code', () => {
  const pp = all['Permissions-Policy'] || '';
  // Public location is a coarse geohash cell; this page must never be able to
  // ask for a precise one. See docs/architecture/atlas-data-privacy-contract.md.
  assert.match(pp, /geolocation=\(\)/);
  for (const feature of ['camera', 'microphone', 'payment', 'usb']) {
    assert.match(pp, new RegExp(`${feature}=\\(\\)`), `${feature} should be denied`);
  }
});

test('opener isolation keeps wallet popups working', () => {
  // 'same-origin' would sever window.opener and can break wallet connect flows.
  assert.equal(all['Cross-Origin-Opener-Policy'], 'same-origin-allow-popups');
});

test('the heavy vendored assets are cached, but never beyond reach of an update', () => {
  const cc = rules['/vendor/*']?.['Cache-Control'] || '';
  const maxAge = Number((cc.match(/max-age=(\d+)/) || [])[1]);
  assert.ok(maxAge >= 86400, `vendored assets should be cached for at least a day (got ${cc})`);
  // No content hash in these filenames, so a cached client can never be told
  // about a new build. Cap the blast radius of a bad or outdated vendor file.
  assert.ok(maxAge <= 2592000, `no-hash assets must not be cached beyond 30 days (got ${cc})`);
  assert.ok(!/immutable/.test(cc), 'immutable is unsafe without content-hashed filenames');
});

test('the page and its own scripts are never served stale after a deploy', () => {
  for (const p of ['/', '/index.html', '/orchard-data.js']) {
    assert.match(rules[p]?.['Cache-Control'] || '', /max-age=0/, `${p} must not be cached stale`);
    assert.ok(!/immutable/.test(rules[p]?.['Cache-Control'] || ''), `${p} must not be immutable`);
  }
});

test('every path pattern the file declares actually exists in worldview/', () => {
  // Catches a rule that silently protects nothing because of a typo'd path.
  const known = new Set(['/*', '/', '/index.html', '/orchard-data.js', '/vendor/*']);
  for (const pattern of Object.keys(rules)) {
    assert.ok(known.has(pattern), `unexpected path pattern ${pattern} — add it here and to worldview/ if real`);
  }
});
