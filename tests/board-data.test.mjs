// Tests for dashboard/board-data.js — the boundary between the live tasks.json
// and the board on screen. These are the payloads that used to throw inside the
// refresh loop, or (worse) get adopted and blank a correct board to "0%".
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import BoardData from '../dashboard/board-data.js';

const { normalizeBoard } = BoardData;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const real = JSON.parse(readFileSync(join(root, 'tasks/tasks.json'), 'utf8'));

test('the real tasks.json passes through intact', () => {
  const out = normalizeBoard(real);
  assert.ok(out);
  assert.equal(out.tasks.length, real.tasks.length);
  assert.equal(out.phases.length, real.phases.length);
  assert.deepEqual(Object.keys(out.owners), Object.keys(real.owners));
  assert.equal(out.repo, real.repo);
  assert.equal(out.updated, real.updated);
  // Fields the board renders must survive untouched.
  assert.deepEqual(out.tasks[0], { ...real.tasks[0] });
});

test('a payload that is not a board is rejected, never adopted', () => {
  // Rejection means "keep the copy already on screen". Adopting any of these
  // silently wiped the board — the bug this module exists to stop.
  const notBoards = [
    null, undefined, 42, 'nope', true, () => {},
    [1, 2, 3],                       // an array parses fine and blanked the board
    [],
    {},                              // no tasks at all
    { tasks: 'not-an-array' },       // threw: a.filter is not a function
    { tasks: null },
    { tasks: [], phases: 'x' },
    { tasks: [], owners: [] },       // owners must be a map, not a list
  ];
  for (const v of notBoards) {
    assert.equal(normalizeBoard(v), null, `should reject ${JSON.stringify(v)?.slice(0, 30)}`);
  }
});

test('an empty but well-formed board is valid', () => {
  const out = normalizeBoard({ tasks: [], phases: [], owners: {} });
  assert.deepEqual(out.tasks, []);
  assert.deepEqual(out.phases, []);
});

test('junk entries are dropped rather than rendered as blanks', () => {
  const out = normalizeBoard({
    tasks: [
      { id: 'A', title: 'Real', owner: 'lead', status: 'done', priority: 'P0', phase: 'p1', deliverable_path: 'a.md' },
      { title: 'no id' }, null, 'nope', 42, [],
    ],
    phases: [{ id: 'p1', title: 'One', desc: 'x' }, { title: 'no id' }, null],
    owners: { lead: { name: 'Lead', seat: 'Seat', color: '#fff' }, broken: 'not-an-object' },
  });
  assert.deepEqual(out.tasks.map((t) => t.id), ['A']);
  assert.deepEqual(out.phases.map((p) => p.id), ['p1']);
  assert.deepEqual(Object.keys(out.owners), ['lead']);
});

test('missing or wrongly-typed task fields get safe defaults', () => {
  const [t] = normalizeBoard({ tasks: [{ id: 'X', title: 42, owner: null, status: {}, priority: [], phase: 7, deliverable_path: false }] }).tasks;
  assert.equal(t.title, 'X');          // falls back to the id, never renders "42"
  assert.equal(t.owner, '');
  assert.equal(t.status, 'backlog');   // an unknown status must still get a pill class
  assert.equal(t.priority, '');
  assert.equal(t.phase, '');
  assert.equal(t.deliverable_path, '');
});

test('owners always have a name and a colour to render with', () => {
  const out = normalizeBoard({ tasks: [], owners: { grok: {}, gemini: { name: 'Gemini' } } });
  assert.equal(out.owners.grok.name, 'grok');
  assert.equal(out.owners.grok.color, '#888');
  assert.equal(out.owners.gemini.name, 'Gemini');
});

test('a status the page has no styling for still normalizes to something renderable', () => {
  const [t] = normalizeBoard({ tasks: [{ id: 'X', status: 'invented_status' }] }).tasks;
  assert.equal(t.status, 'invented_status');   // preserved — the board shows what it is
  assert.equal(typeof t.status, 'string');
});

test('normalizeBoard never mutates its input', () => {
  const input = { tasks: [{ id: 'A' }], phases: [{ id: 'p' }], owners: { l: { name: 'L' } } };
  const copy = JSON.parse(JSON.stringify(input));
  normalizeBoard(input);
  assert.deepEqual(input, copy);
});

// ---------------------------------------------------------------------------
// Render-time escaping. tasks.json carries text written by external advisors
// and relayed by hand — seven of the current titles already contain "&".
// ---------------------------------------------------------------------------
const { esc, safeColor, isRepoPath } = BoardData;

test('esc neutralises everything that can break out of HTML', () => {
  assert.equal(esc('Brand & voice reference'), 'Brand &amp; voice reference');
  assert.equal(esc('Lead Dev & Integrator'), 'Lead Dev &amp; Integrator');
  assert.equal(esc('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(esc('" onmouseover="x'), '&quot; onmouseover=&quot;x');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
});

test('an authored ampersand survives as an ampersand, not an entity', () => {
  // The failure this prevents is silent: "&amp;" in a title used to render as
  // "&", quietly changing what the board says a task is called.
  assert.equal(esc('R&D and &amp; both'), 'R&amp;D and &amp;amp; both');
});

test('every real task title and owner name escapes to something renderable', () => {
  for (const t of real.tasks) {
    const out = esc(t.title);
    assert.ok(!/[<>]/.test(out), `${t.id} title escaped badly: ${out}`);
  }
  for (const o of Object.values(real.owners)) {
    assert.ok(!/[<>]/.test(esc(o.name) + esc(o.seat)));
  }
});

test('safeColor only ever yields a colour', () => {
  assert.equal(safeColor('#a3e635'), '#a3e635');
  assert.equal(safeColor('#FFF'), '#FFF');
  assert.equal(safeColor('  #2bd4d4  '), '#2bd4d4');
  for (const bad of ['red', 'rgb(1,2,3)', 'url(evil)', '#fff;background:url(x)', '"><img src=x>', '#12345', '', null, 42, {}]) {
    assert.equal(safeColor(bad), '#888888', `should reject ${String(bad)}`);
  }
  assert.equal(safeColor(null, '#000000'), '#000000');
});

test('every owner colour in the real board is a usable colour', () => {
  for (const [key, o] of Object.entries(real.owners)) {
    assert.equal(safeColor(o.color), o.color, `${key} colour was rejected: ${o.color}`);
  }
});

test('isRepoPath accepts real deliverable paths and rejects link injection', () => {
  for (const t of real.tasks) {
    assert.equal(isRepoPath(t.deliverable_path), true, `${t.id}: ${t.deliverable_path}`);
  }
  const bad = [
    'javascript:alert(1)',
    'https://evil.example/x',
    '//evil.example/x',
    '/etc/passwd',
    '../../secrets.env',
    'docs/a b.md',                    // a space would break the attribute
    'docs/x.md" onmouseover="y',
    'x'.repeat(201),
    '', null, undefined, 42,
  ];
  for (const v of bad) assert.equal(isRepoPath(v), false, `should reject ${String(v).slice(0, 30)}`);
});
