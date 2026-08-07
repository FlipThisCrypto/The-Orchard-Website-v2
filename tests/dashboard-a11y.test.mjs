// Regression locks for the dashboard's keyboard/assistive-tech contract.
// The rendering is inline in the page, so these assert on the source: enough
// to catch a control quietly losing its keyboard support again.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'dashboard/index.html'), 'utf8');

test('the page has a main landmark', () => {
  assert.match(src, /<main>/);
  assert.match(src, /<\/main>/);
});

test('there is a polite live region for async updates', () => {
  const tag = (src.match(/<p[^>]*id="announcer"[^>]*>/) || [])[0] || '';
  assert.ok(tag, 'missing #announcer');
  assert.match(tag, /role="status"/);
  assert.match(tag, /aria-live="polite"/);
  assert.match(tag, /class="sr-only"/);
  assert.match(src, /\.sr-only\{[^}]*clip-path:inset\(50%\)/, 'sr-only must hide visually without hiding from AT');
});

test('keyboard focus is visible on the dark theme', () => {
  assert.match(src, /:focus-visible\{[^}]*outline:\s*2px solid var\(--green-bright\)/);
  assert.ok(!/outline\s*:\s*none/.test(src), 'nothing may suppress the focus ring');
});

test('the swimlane cards are real controls, not clickable divs', () => {
  // They carry block content so they can't be <button>, but they must have the
  // whole contract: reachable, labelled, state-exposing, Enter AND Space.
  assert.match(src, /el\.setAttribute\("role","button"\)/);
  assert.match(src, /el\.setAttribute\("tabindex","0"\)/);
  assert.match(src, /el\.setAttribute\("aria-pressed"/);
  assert.match(src, /el\.setAttribute\("aria-label"/);
  assert.match(src, /el\.onkeydown/);
  assert.match(src, /e\.key==="Enter"\|\|e\.key===" "\|\|e\.key==="Spacebar"/);
  assert.match(src, /e\.preventDefault\(\)/, 'Space must not scroll the page');
});

test('filter buttons expose which one is active', () => {
  assert.match(src, /b\.setAttribute\("aria-pressed"/);
  assert.match(src, /b\.type="button"/, 'a bare <button> in a form would submit it');
  assert.match(src, /role="group" aria-label="Filter tasks by seat"/);
});

test('changing the filter is announced, and announced accurately', () => {
  // One code path sets the filter, so the announcement can't drift from what
  // is actually rendered.
  assert.match(src, /function setFilter\(next, from\)/);
  assert.match(src, /announce\(`Showing \$\{shown\} task/);
  assert.match(src, /\.filter\(t=>filter==="all"\|\|t\.owner===filter\)\.length/);
});

test('focus returns to the control the visitor actually used', () => {
  assert.match(src, /from==="lane"\?"\.lane":"\.tb"/);
  assert.match(src, /setFilter\(filter===key\?"all":key, "lane"\)/);
  assert.match(src, /setFilter\(k, "button"\)/);
});

test('repository status is announced when it arrives', () => {
  assert.match(src, /announce\(`Repository status: last commit/);
});
