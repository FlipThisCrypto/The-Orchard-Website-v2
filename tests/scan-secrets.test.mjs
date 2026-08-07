// scan-secrets:contains-fake-credentials
//
// Every credential-shaped string below is invented for testing. The marker
// above is what tells the scanner so — it excludes this file by its own
// declaration, not by living under tests/.
//
// Tests for scripts/scan-secrets.mjs — the scanner behind SECURITY.md's
// "No secrets" guarantee. A scanner that misses real key formats, or that
// cries wolf on prose, is worse than none.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { scanText, isKnownPublic, FIXTURE_MARKER, batchRead } from '../scripts/scan-secrets.mjs';

test('detects each class of secret it claims to cover', () => {
  const secrets = [
    ['ghp_aB3dEfGhIjKlMnOpQrStUvWxYz0123456789', 'GitHub token'],
    ['AKIAIOSFODNN7EXAMPLE', 'AWS access key'],
    ['-----BEGIN RSA PRIVATE KEY-----', 'Private key block'],
    ['-----BEGIN OPENSSH PRIVATE KEY-----', 'Private key block'],
    ['password = "hunter2hunter2hunter2"', 'Generic bearer/api assignment'],
    ['abandon ability able about above absent absorb abstract absurd abuse access accident', 'BIP39 mnemonic run'],
    ['xch1qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0s3jn54khce6m', 'Chia wallet address'],
  ];
  for (const [text, expected] of secrets) {
    const hits = scanText(text, 't');
    assert.ok(hits.some((h) => h.pattern === expected), `missed ${expected}: ${text.slice(0, 40)}`);
  }
});

test('does not fire on placeholders or ordinary prose', () => {
  const noise = [
    'api_key: "YOUR_API_KEY_GOES_HERE_XXXX"',
    'token = "<paste your token here>"',
    'the quick brown fox jumps over the lazy dog and then runs away home tonight',
    'every task carries scope grounding sources and a definition of done for the advisors',
    'secret: "example_placeholder_value"',
  ];
  for (const text of noise) {
    assert.deepEqual(scanText(text, 't'), [], `false positive on: ${text.slice(0, 50)}`);
  }
});

test('the known-public allowlist matches values, never patterns', () => {
  assert.equal(isKnownPublic({ sample: 'nft1dqvx2acr658krs0tmxhv…' }), true);
  assert.equal(isKnownPublic({ sample: '285164e6af80202d2b07fa3c…' }), true);
  assert.equal(isKnownPublic({ sample: 'nft1SOMEOTHERPASSABCDEF…' }), false);
  assert.equal(isKnownPublic({ sample: 'ghp_aB3dEfGhIjKlMnOpQrSt…' }), false);
});

test('a finding reports its source and a truncated sample, never the whole value', () => {
  const [hit] = scanText('ghp_aB3dEfGhIjKlMnOpQrStUvWxYz0123456789', 'some/file.js');
  assert.equal(hit.source, 'some/file.js');
  assert.ok(hit.sample.length <= 25, 'the report itself must not disclose the full secret');
});

test('a file only opts out by declaring it in its own text', () => {
  // Not a path rule: "ignore tests/" is how a real credential ends up in an
  // ignored directory. This file excludes itself by carrying the marker.
  const real = 'ghp_aB3dEfGhIjKlMnOpQrStUvWxYz0123456789';
  assert.equal(scanText(real, 'somewhere.js').length, 1, 'a file without the marker is scanned');
  assert.deepEqual(scanText(`// ${FIXTURE_MARKER}\n${real}`, 'fixtures.js'), [],
    'a file that declares its fixtures is skipped');
});

test('this test file is excluded, and says why', () => {
  const src = readFileSync(new URL('./scan-secrets.test.mjs', import.meta.url), 'utf8');
  assert.ok(src.includes(FIXTURE_MARKER), 'the fixtures file must declare itself');
  assert.deepEqual(scanText(src, 'tests/scan-secrets.test.mjs'), []);
});

test('the tree scan covers files git has not been told about yet', () => {
  // `git ls-files` alone lists only TRACKED files, so a brand-new file holding
  // a live token scanned clean — the exact case this check exists for. Every
  // new file passes through the untracked state, and a fault-injected token in
  // one was reported "no secrets found" until --others was added.
  const src = readFileSync(new URL('../scripts/scan-secrets.mjs', import.meta.url), 'utf8');
  const cmd = src.match(/execSync\('(git ls-files[^']*)'/);
  assert.ok(cmd, 'expected a git ls-files invocation');
  assert.match(cmd[1], /--others/, 'untracked files must be scanned');
  assert.match(cmd[1], /--exclude-standard/, 'but .gitignore must still be honoured');
});

// --- batchRead: one process for every blob, so the parser must not lose sync ---
const LF = Buffer.from([0x0a]);
const obj = (oid, type, body) =>
  Buffer.concat([Buffer.from(`${oid} ${type} ${body.length}`), LF, body, LF]);
const fakeGit = (buf) => () => buf;

test('batchRead returns each blob with the path it was requested under', () => {
  const buf = Buffer.concat([
    obj('a'.repeat(40), 'blob', Buffer.from('first')),
    obj('b'.repeat(40), 'blob', Buffer.from('second')),
  ]);
  const out = batchRead(
    [{ hash: 'a'.repeat(40), path: 'one.txt' }, { hash: 'b'.repeat(40), path: 'two.txt' }],
    fakeGit(buf)
  );
  assert.deepEqual(out, [
    { text: 'first', path: 'one.txt' },
    { text: 'second', path: 'two.txt' },
  ]);
});

test('batchRead skips trees, binaries and missing objects without desyncing', () => {
  // Every skipped object still has to advance the cursor by its byte count.
  // Getting that wrong doesn't drop one object — it garbles every object
  // after it, and the scan silently stops matching anything.
  const buf = Buffer.concat([
    obj('a'.repeat(40), 'tree', Buffer.from('tree-bytes-here')),
    obj('b'.repeat(40), 'blob', Buffer.from([0x00, 0x01, 0x02])),
    Buffer.concat([Buffer.from(`${'c'.repeat(40)} missing`), LF]),
    obj('d'.repeat(40), 'blob', Buffer.from('survivor')),
  ]);
  const out = batchRead(
    ['a', 'b', 'c', 'd'].map((c) => ({ hash: c.repeat(40), path: `${c}.txt` })),
    fakeGit(buf)
  );
  assert.deepEqual(out, [{ text: 'survivor', path: 'd.txt' }]);
});

test('batchRead asks git for each object exactly once', () => {
  // The object list names a blob once per path it ever had; without deduping,
  // an unchanged file costs one read per commit that touched its directory.
  let input = null;
  const spy = (_cmd, opts) => { input = opts.input; return obj('a'.repeat(40), 'blob', Buffer.from('x')); };
  batchRead([
    { hash: 'a'.repeat(40), path: 'now.txt' },
    { hash: 'a'.repeat(40), path: 'renamed-from.txt' },
  ], spy);
  assert.deepEqual(input.split(LF.toString()), ['a'.repeat(40)]);
});

test('batchRead handles an empty request without spawning git', () => {
  let called = false;
  assert.deepEqual(batchRead([], () => { called = true; return Buffer.alloc(0); }), []);
  assert.equal(called, false);
});
