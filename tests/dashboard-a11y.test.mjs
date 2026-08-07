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
// The page's markup and its script now live in separate files; these locks
// are about the contract between them, so read both.
const html = readFileSync(join(root, 'dashboard/index.html'), 'utf8');
const app = readFileSync(join(root, 'dashboard/app.js'), 'utf8');
const src = html + app;

test('the page has a main landmark', () => {
  assert.match(html, /<main>/);
  assert.match(html, /<\/main>/);
});

test('the page script is external so the syntax check can see it', () => {
  // While it was inline it was the largest shipped file neither CI nor the
  // pre-commit hook could check.
  assert.match(html, /<script src="app\.js"><\/script>/);
  assert.ok(app.length > 5000, 'dashboard/app.js should hold the page script');
  // The boot boundary must stay inline: it guards the scripts that follow it.
  assert.match(html, /__boardBootFailed/);
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
