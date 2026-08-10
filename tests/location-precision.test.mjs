// The privacy contract, enforced by the test suite rather than by care.
//
// SECURITY.md and the page both promise "coarse (~5 km) regions — never
// precise GPS". That promise used to rest on a hand-typed table of latitudes
// and longitudes at three decimal places (~110 m) which nobody checked, and
// which drew four separately-placed dots for Trees that are two cells apart at
// the promised resolution.
//
// Storing cells instead makes over-precision unrepresentable. These tests stop
// coordinates coming back.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import OrchardData from '../worldview/orchard-data.js';

const { cellsFrom, ghCenter, isGeohash, DECLARED_PRECISION, CLUSTER_COLOR } = OrchardData;
const app = readFileSync(new URL('../worldview/app.js', import.meta.url), 'utf8');

/** The declared-cells table as it is actually written in the page script. */
function declaredCells() {
  const block = app.match(/const DECLARED_CELLS = \{([\s\S]*?)\};/);
  assert.ok(block, 'worldview/app.js must declare DECLARED_CELLS');
  const cells = {};
  for (const m of block[1].matchAll(/"([0-9A-Fa-f]+)"\s*:\s*"([^"]*)"/g)) cells[m[1]] = m[2];
  return cells;
}

test('no location is hand-written into the page script', () => {
  // This assertion used to be the opposite — "expected at least one declared
  // location" — because the table was the only thing that could place a Tree,
  // and an empty one meant someone had deleted the map by accident.
  //
  // It became the wrong guarantee. Every entry was a node_id typed in by hand,
  // and by the time the ghost Trees were retired all four named Trees that no
  // longer existed, while the one live Tree was absent and therefore drawn
  // nowhere. The table did not fail; it succeeded at showing the wrong thing.
  //
  // Locations come from the oracle now — a wallet-signed assertion by the Tree's
  // owner, or the Tree's own GPS — so an empty table is the correct state and a
  // populated one is a regression toward maintaining hardware positions by
  // editing JavaScript.
  const cells = declaredCells();
  assert.equal(Object.keys(cells).length, 0,
    `worldview must not hand-place Trees; the oracle publishes locations. Found: ${JSON.stringify(cells)}`);
});

test('any location that IS hand-written is still a legal cell', () => {
  // The table is empty and should stay empty, but the entry-level guarantees
  // outlive that decision: if a future emergency puts a cell back, it must
  // still be a real geohash, not a coordinate pair wearing a string.
  for (const [node, gh] of Object.entries(declaredCells())) {
    assert.ok(isGeohash(gh), `${node} declares "${gh}", which is not a geohash`);
  }
});

test('no declared location is finer than the promised ~5 km', () => {
  // A longer geohash is a smaller cell. 6 characters is ~1.2 km × 0.6 km,
  // which would quietly break the contract while still "being a geohash".
  for (const [node, gh] of Object.entries(declaredCells())) {
    assert.ok(gh.length <= DECLARED_PRECISION,
      `${node} declares a ${gh.length}-character cell; the contract allows at most ${DECLARED_PRECISION}`);
  }
});

test('no latitude/longitude literals survive in the location code', () => {
  // The specific shape that was there before: a decimal-degree pair. Catching
  // it by pattern means re-introducing one fails the gate, not review.
  const block = app.slice(0, app.indexOf('SNAPSHOT_NODES'));
  assert.doesNotMatch(block, /lat\s*:\s*-?\d+\.\d+/, 'a latitude literal is back in the location code');
  assert.doesNotMatch(block, /lng\s*:\s*-?\d+\.\d+/, 'a longitude literal is back in the location code');
});

test('a cell centre is the same point for every Tree in it', () => {
  // The property that makes the whole approach honest: the coordinate belongs
  // to the cell, so it reveals nothing about where in the cell a Tree is.
  const a = ghCenter('dng01'), b = ghCenter('dng01');
  assert.deepEqual(a, b);
  assert.notDeepEqual(ghCenter('dng01'), ghCenter('dng04'));
});

// --- grouping ------------------------------------------------------------
const tree = (id, cell, over = {}) => ({
  id, short: id.slice(0, 8), cell, region: `~5 km cell ${cell}`,
  ...ghCenter(cell), state: 'healthy', color: '#4ade80', fruits: [], label: null, ...over,
});

test('Trees in one cell become one marker carrying the count', () => {
  const cells = cellsFrom([tree('AAAA1111', 'dng01'), tree('BBBB2222', 'dng01'), tree('CCCC3333', 'dng04')]);
  assert.equal(cells.length, 2, 'three Trees in two cells is two markers');
  const big = cells.find((c) => c.count === 2);
  assert.equal(big.cell, 'dng01');
  assert.equal(big.trees.length, 2);
  assert.equal(big.color, CLUSTER_COLOR, 'a multi-Tree cell gets the cluster colour, not one Tree’s');
});

test('a lone Tree in a cell still looks exactly like a Tree', () => {
  // Clustering must not cost the single-Tree case its identity.
  const [only] = cellsFrom([tree('DDDD4444', 'dng04', { color: '#ff9f2e', label: 'Orchard One' })]);
  assert.equal(only.count, 1);
  assert.equal(only.color, '#ff9f2e');
  assert.equal(only.label, 'Orchard One');
  assert.equal(only.short, 'DDDD4444');
});

test('a cell speaks with its most alive state', () => {
  // A cell with one reporting Tree and two offline ones is reporting. Taking
  // the first Tree's state instead would make liveness depend on array order.
  const cells = cellsFrom([
    tree('AAAA1111', 'dng01', { state: 'offline' }),
    tree('BBBB2222', 'dng01', { state: 'healthy' }),
    tree('CCCC3333', 'dng01', { state: 'offline' }),
  ]);
  assert.equal(cells[0].state, 'healthy');
});

test('unplaced Trees are grouped into nothing, not into a phantom cell', () => {
  const cells = cellsFrom([{ id: 'X', lat: null, lng: null, state: 'new' }, tree('AAAA1111', 'dng01')]);
  assert.equal(cells.length, 1);
  assert.equal(cells[0].count, 1);
});

test('cellsFrom tolerates junk without throwing', () => {
  assert.deepEqual(cellsFrom(null), []);
  assert.deepEqual(cellsFrom([null, undefined]), []);
});
