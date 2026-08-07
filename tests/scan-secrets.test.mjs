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
import { scanText, isKnownPublic, FIXTURE_MARKER } from '../scripts/scan-secrets.mjs';

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
