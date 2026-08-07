// Tests for scripts/csp.mjs and scripts/serve.mjs.
//
// The enforced script-src is the one policy where being wrong is worse than
// being absent: a stale hash doesn't weaken the page, it stops the page's own
// boot script from running at all. So the interesting assertions are about
// staleness and about never silently readmitting 'unsafe-inline'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inlineScriptHashes, buildScriptSrc, applyScriptSrc, SCRIPT_SRC_ORIGINS } from '../scripts/csp.mjs';
import { parseHeaders, headersFor } from '../scripts/serve.mjs';

const headers = readFileSync(new URL('../worldview/_headers', import.meta.url), 'utf8');
const page = readFileSync(new URL('../worldview/index.html', import.meta.url), 'utf8');
const enforced = headers.match(/^[ \t]*Content-Security-Policy:[ \t]*(.+)$/m)[1];

test('script-src is enforced, not report-only', () => {
  // It sat in Content-Security-Policy-Report-Only for several iterations,
  // where it blocked nothing and — with no reporting endpoint — collected
  // nothing either. Verified against production: an injected inline script
  // ran there and is blocked under this policy.
  assert.match(enforced, /script-src/, 'script-src must be on the enforced header');
  assert.doesNotMatch(headers, /Content-Security-Policy-Report-Only:.*script-src/,
    'script-src must not also live on a report-only header');
});

test("the enforced policy never contains 'unsafe-inline'", () => {
  // The single permission that makes script-src pointless against injection.
  assert.doesNotMatch(enforced, /'unsafe-inline'/);
});

test('every inline script in the page is covered by a hash', () => {
  const hashes = inlineScriptHashes(page);
  assert.ok(hashes.length > 0, 'the page has at least one inline script (the boot boundary)');
  for (const h of hashes) assert.ok(enforced.includes(h), `policy is missing ${h}`);
});

test('inline hashes are of the script body only, and change with it', () => {
  const a = inlineScriptHashes('<script>alert(1)</script>');
  const b = inlineScriptHashes('<script>alert(2)</script>');
  assert.equal(a.length, 1);
  assert.notEqual(a[0], b[0], 'a changed script must produce a different hash');
  assert.match(a[0], /^'sha256-[A-Za-z0-9+/]+=*'$/);
});

test('scripts with a src are not hashed', () => {
  // Hashing an external script's (empty) body would add a meaningless token
  // and, worse, suggest coverage that isn't there.
  assert.deepEqual(inlineScriptHashes('<script src="app.js?v=1"></script>'), []);
  assert.equal(inlineScriptHashes('<script src="a.js"></script><script>x()</script>').length, 1);
});

test('a changed inline script makes the committed policy stale', () => {
  // This is the whole point of --check: without it the failure appears in a
  // browser, after deploy, as a blank page.
  const tampered = page.replace(/(<script(?![^>]*\ssrc=)[^>]*>)/, '$1/* edited */');
  assert.notEqual(buildScriptSrc(tampered), buildScriptSrc(page));
  assert.notEqual(applyScriptSrc(headers, buildScriptSrc(tampered)), headers);
});

test('applying script-src replaces rather than accumulates', () => {
  const once = applyScriptSrc(headers, buildScriptSrc(page));
  const twice = applyScriptSrc(once, buildScriptSrc(page));
  assert.equal(once, twice, 'running the stamper twice must be a no-op');
  // Count within the policy line — the surrounding comments talk about
  // script-src too, and a whole-file count would be measuring the prose.
  const policy = once.match(/^[ \t]*Content-Security-Policy:[ \t]*(.+)$/m)[1];
  assert.equal((policy.match(/script-src/g) || []).length, 1);
});

test('applying script-src leaves the other directives alone', () => {
  const out = applyScriptSrc(headers, buildScriptSrc(page));
  for (const d of ['frame-ancestors', 'object-src', 'base-uri', 'form-action']) {
    assert.match(out, new RegExp(d), `${d} must survive stamping`);
  }
});

test('esm.sh is allowed, deliberately and only for the wallet widget', () => {
  // connect.js dynamically imports @walletconnect/sign-client and /modal from
  // esm.sh at click time. If this assertion ever fails because someone tidied
  // the origin away, connecting a wallet breaks — check the widget first.
  assert.ok(SCRIPT_SRC_ORIGINS.includes('https://esm.sh'));
  assert.ok(SCRIPT_SRC_ORIGINS.includes('https://oracle.theorchard.network'));
});

// --- the local server that makes any of this verifiable --------------------
test('_headers parses into rules, comments ignored', () => {
  const rules = parseHeaders(headers);
  assert.ok(rules.length >= 2);
  assert.ok(rules.some((r) => r.pattern === '/*'));
  for (const r of rules) {
    for (const k of Object.keys(r.headers)) assert.doesNotMatch(k, /^#/, 'comments must not become headers');
  }
});

test('the local server would send the same CSP production does', () => {
  // Serving worldview/ with `python -m http.server` sends none of these, which
  // is why an enforced policy could previously only be tested by shipping it.
  const applied = headersFor(parseHeaders(headers), '/index.html');
  assert.equal(applied['Content-Security-Policy'], enforced);
  assert.equal(applied['X-Frame-Options'], 'SAMEORIGIN');
});

test('later _headers rules win, as Cloudflare does it', () => {
  const rules = parseHeaders('/*\n  Cache-Control: a\n\n/index.html\n  Cache-Control: b\n');
  assert.equal(headersFor(rules, '/index.html')['Cache-Control'], 'b');
  assert.equal(headersFor(rules, '/other.js')['Cache-Control'], 'a');
});
