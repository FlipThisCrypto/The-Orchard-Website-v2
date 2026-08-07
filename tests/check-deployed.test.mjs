// Tests for scripts/check-deployed.mjs — the answer to "is production actually
// running this repo?". The network part isn't unit-testable; the judgement is,
// and the judgement is what has to be right.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { diffManifest, checkHeaders, summarise, sha256, SITES } from '../scripts/check-deployed.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('identical content is reported as a match', () => {
  const rows = diffManifest({ 'a.js': 'abc123' }, { 'a.js': { hash: 'abc123' } });
  assert.deepEqual(rows, [{ name: 'a.js', status: 'match' }]);
});

test('different content is reported as stale, with both hashes', () => {
  const [row] = diffManifest({ 'a.js': 'a'.repeat(64) }, { 'a.js': { hash: 'b'.repeat(64) } });
  assert.equal(row.status, 'stale');
  assert.match(row.detail, /repo aaaaaaaaaaaa vs live bbbbbbbbbbbb/);
});

test('a file production never returned is unreachable, not a match', () => {
  // The dangerous failure mode is silently treating "no answer" as "fine".
  const rows = diffManifest({ 'a.js': 'x', 'b.js': 'y' }, { 'a.js': { error: 'HTTP 404' } });
  assert.deepEqual(rows.map((r) => r.status), ['unreachable', 'unreachable']);
  assert.equal(rows[0].detail, 'HTTP 404');
  assert.equal(rows[1].detail, 'no response');
});

test('summarise is only ok when everything matched and every header held', () => {
  const good = diffManifest({ 'a.js': 'x' }, { 'a.js': { hash: 'x' } });
  assert.equal(summarise(good, []).ok, true);
  assert.equal(summarise(good, [{ header: 'x', status: 'missing' }]).ok, false);
  const bad = diffManifest({ 'a.js': 'x' }, { 'a.js': { hash: 'y' } });
  assert.equal(summarise(bad, []).ok, false);
  assert.equal(summarise(bad, []).stale.length, 1);
});

test('missing and wrong headers are both caught', () => {
  const required = { 'x-frame-options': /^SAMEORIGIN$/i, 'referrer-policy': /^no-referrer$/i };
  const problems = checkHeaders({ 'referrer-policy': 'unsafe-url' }, required);
  assert.deepEqual(problems, [
    { header: 'x-frame-options', status: 'missing' },
    { header: 'referrer-policy', status: 'unexpected', value: 'unsafe-url' },
  ]);
  assert.deepEqual(checkHeaders({ 'x-frame-options': 'SAMEORIGIN', 'referrer-policy': 'no-referrer' }, required), []);
});

test('header lookup is case-insensitive, as HTTP headers are', () => {
  assert.deepEqual(checkHeaders({ 'x-frame-options': 'SAMEORIGIN' }, { 'X-Frame-Options': /SAMEORIGIN/ }), []);
});

test('the checked files are real files in the repo', () => {
  // A typo'd filename would make the check silently prove nothing.
  for (const f of SITES.worldview.files) {
    assert.ok(readFileSync(join(root, SITES.worldview.dir, f)).length > 0, `${f} is missing or empty`);
  }
});

test('the required headers mirror what worldview/_headers actually sets', () => {
  // If someone removes a rule from _headers, this check must stop asserting it
  // — otherwise it fails forever and gets ignored.
  const headersFile = readFileSync(join(root, 'worldview/_headers'), 'utf8').toLowerCase();
  for (const name of Object.keys(SITES.worldview.requiredHeaders)) {
    assert.ok(headersFile.includes(name.toLowerCase() + ':'), `_headers no longer sets ${name}`);
  }
});

test('sha256 distinguishes content that differs by one byte', () => {
  assert.notEqual(sha256(Buffer.from('a')), sha256(Buffer.from('b')));
  assert.equal(sha256(Buffer.from('same')), sha256(Buffer.from('same')));
  // Byte-exact, not length-based: these differ in bytes but not UTF-16 length.
  assert.notEqual(sha256(Buffer.from('é')), sha256(Buffer.from('e')));
});
