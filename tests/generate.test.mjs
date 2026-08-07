// Unit tests for the task-board generator (scripts/generate.mjs).
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTasksMd, buildDataJs, sourceDate, unplannedPhases, pct, isDone } from '../scripts/generate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const real = JSON.parse(readFileSync(join(root, 'tasks/tasks.json'), 'utf8'));

const fixture = () => ({
  updated: '2026-01-02',
  phases: [
    { id: 'a', title: 'Phase A', desc: 'first' },
    { id: 'b', title: 'Phase B', desc: 'second' },
    { id: 'c', title: 'Phase C', desc: 'later' },   // no tasks
  ],
  owners: { lead: { name: 'Lead', seat: 'Lead Seat', color: '#fff' } },
  tasks: [
    { id: 'X-1', title: 'One', owner: 'lead', status: 'done', priority: 'P0', phase: 'a', deliverable_path: 'a.md' },
    { id: 'X-2', title: 'Two', owner: 'lead', status: 'ready', priority: 'P1', phase: 'b', deliverable_path: 'b.md' },
  ],
});

// ---------------------------------------------------------------------------
// Determinism — the property that makes `--check` meaningful
// ---------------------------------------------------------------------------
test('output depends only on the input, not on the clock', () => {
  const d = fixture();
  assert.equal(buildTasksMd(d), buildTasksMd(d));
  assert.equal(buildDataJs(d), buildDataJs(d));
});

test('no generated file carries a wall-clock timestamp', () => {
  const md = buildTasksMd(real);
  const js = buildDataJs(real);
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(!md.includes(today) || real.updated === today, 'TASKS.md embedded today\'s date');
  assert.ok(!js.includes(today) || real.updated === today, 'data.js embedded today\'s date');
  assert.ok(md.includes(real.updated), 'TASKS.md should carry the source updated date');
});

test('sourceDate reads tasks.json and refuses anything that is not a date', () => {
  assert.equal(sourceDate({ updated: '2026-06-17' }), '2026-06-17');
  for (const bad of [{}, { updated: '' }, { updated: 'yesterday' }, { updated: 20260617 }, { updated: '2026-6-1' }, null]) {
    assert.throws(() => sourceDate(bad), /updated/, `should reject ${JSON.stringify(bad)}`);
  }
});

// ---------------------------------------------------------------------------
// Honest progress reporting — must match what the dashboard says
// ---------------------------------------------------------------------------
test('unplannedPhases finds phases that hold no tasks', () => {
  assert.deepEqual(unplannedPhases(fixture()).map((p) => p.id), ['c']);
  assert.deepEqual(unplannedPhases({ phases: [], tasks: [] }), []);
});

test('TASKS.md never claims completion for phases with no tasks', () => {
  const md = buildTasksMd(fixture());
  assert.match(md, /## Phase C — not started/);
  assert.match(md, /_No tasks authored yet\._/);
  assert.ok(!/## Phase C — 0%/.test(md) && !/## Phase C — 100%/.test(md));
});

test('the headline counts authored work and flags what is unplanned', () => {
  const md = buildTasksMd(fixture());
  assert.match(md, /\*\*1\/2 authored tasks done\*\* \(50% of the work planned so far\)/);
  assert.match(md, /1 later phase not yet planned/);
  assert.match(md, /task data updated 2026-01-02/);
});

test('the real board reports 23/23 authored with 2 phases unplanned', () => {
  const md = buildTasksMd(real);
  assert.match(md, /\*\*23\/23 authored tasks done\*\*/);
  assert.match(md, /2 later phases not yet planned/);
  assert.match(md, /## Phase 3 — Build — not started/);
  assert.match(md, /## Phase 4 — Migrate — not started/);
});

test('a fully unplanned board does not read as 0% of nothing complete', () => {
  const md = buildTasksMd({ updated: '2026-01-02', phases: [{ id: 'a', title: 'Phase A', desc: 'x' }], owners: {}, tasks: [] });
  assert.match(md, /\*\*0\/0 authored tasks done\*\*/);
  assert.match(md, /## Phase A — not started/);
});

// ---------------------------------------------------------------------------
// data.js — what the dashboard actually loads
// ---------------------------------------------------------------------------
test('data.js embeds the task data verbatim and the source date', () => {
  const js = buildDataJs(fixture());
  assert.match(js, /^\/\/ AUTO-GENERATED/);
  assert.match(js, /window\.TASKS = \{/);
  assert.match(js, /window\.TASKS_UPDATED = "2026-01-02";\n$/);
  const parsed = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('};') + 1));
  assert.deepEqual(parsed, fixture());
});

// ---------------------------------------------------------------------------
// Committed files must match a fresh generation (the CI check, as a test)
// ---------------------------------------------------------------------------
test('committed TASKS.md and data.js are in sync with tasks.json', () => {
  assert.equal(readFileSync(join(root, 'tasks/TASKS.md'), 'utf8'), buildTasksMd(real),
    'tasks/TASKS.md is stale — run: node scripts/generate.mjs');
  assert.equal(readFileSync(join(root, 'dashboard/data.js'), 'utf8'), buildDataJs(real),
    'dashboard/data.js is stale — run: node scripts/generate.mjs');
});

test('pct and isDone behave at the edges', () => {
  assert.equal(pct([]), 0);
  assert.equal(pct([{ status: 'done' }, { status: 'ready' }]), 50);
  assert.equal(pct([{ status: 'done' }]), 100);
  assert.equal(isDone({ status: 'done' }), true);
  assert.equal(isDone({ status: 'in_review' }), false);
});
