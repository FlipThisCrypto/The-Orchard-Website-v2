// Tests for scripts/stamp-assets.mjs — the cache-busting version must be
// derived from content, never remembered. A number a human bumps by hand looks
// like protection right up until someone forgets.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stamp, versionOf, STAMPED_PAGES } from '../scripts/stamp-assets.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (contents) => (f) => {
  if (!(f in contents)) throw new Error('missing');
  return Buffer.from(contents[f]);
};

test('a same-origin script gets its content hash', () => {
  const { html } = stamp('<script src="app.js"></script>', read({ 'app.js': 'hello' }));
  assert.equal(html, `<script src="app.js?v=${versionOf(Buffer.from('hello'))}"></script>`);
});

test('a changed file changes only its own version', () => {
  const page = '<script src="a.js"></script><script src="b.js"></script>';
  const before = stamp(page, read({ 'a.js': '1', 'b.js': '2' })).html;
  const after = stamp(page, read({ 'a.js': 'CHANGED', 'b.js': '2' })).html;
  const v = (h, f) => h.match(new RegExp(f.replace('.', '[.]') + '[?]v=([0-9a-f]+)'))[1];
  assert.notEqual(v(before, 'a.js'), v(after, 'a.js'), "a.js's version must move");
  assert.equal(v(before, 'b.js'), v(after, 'b.js'), "b.js's cache must not be invalidated");
});

test('stamping is idempotent and replaces any existing version', () => {
  const once = stamp('<script src="app.js"></script>', read({ 'app.js': 'x' })).html;
  const twice = stamp(once, read({ 'app.js': 'x' })).html;
  assert.equal(once, twice);
  const hand = stamp('<script src="app.js?v=46"></script>', read({ 'app.js': 'x' })).html;
  assert.equal(hand, once, 'a hand-typed version is replaced by the derived one');
});

test('cross-origin scripts are left alone', () => {
  const page = '<script src="https://oracle.theorchard.network/connect.js"></script>';
  assert.equal(stamp(page, read({})).html, page, 'we cannot hash a file we do not own');
});

test('a referenced script that does not exist is reported, not silently skipped', () => {
  const { missing, html } = stamp('<script src="gone.js"></script>', read({}));
  assert.deepEqual(missing, ['gone.js']);
  assert.equal(html, '<script src="gone.js"></script>');
});

test('every stamped page in the repo is currently up to date', () => {
  // The same assertion CI and the pre-commit hook make.
  for (const { page, dir } of STAMPED_PAGES) {
    const current = readFileSync(join(root, page), 'utf8');
    const { html, missing } = stamp(current, (f) => readFileSync(join(root, dir, f)));
    assert.deepEqual(missing, [], `${page} references a script that does not exist`);
    assert.equal(html, current, `${page} has a stale script version — run node scripts/stamp-assets.mjs`);
  }
});

test('versions are short enough to read and long enough not to collide', () => {
  const v = versionOf(Buffer.from('anything'));
  assert.match(v, /^[0-9a-f]{8}$/);
});
