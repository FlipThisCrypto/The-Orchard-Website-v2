/**
 * Mission Control — board data validation.
 *
 * The dashboard paints immediately from the copy of tasks.json baked into
 * data.js, then tries to upgrade to the live file. That upgrade is the risk:
 * a body that parses but isn't a board used to be adopted wholesale, blanking
 * a correct board to "0%", and wrong types threw inside the refresh loop.
 * Nothing here touches the DOM, so it can be unit-tested — see tests/.
 *
 *   browser  <script src="board-data.js">  ->  window.BoardData
 *   node     import BoardData from '../dashboard/board-data.js'
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BoardData = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const str = (v) => (typeof v === 'string' ? v : null);

  /**
   * Returns a board safe to render, or null if `raw` isn't a board at all.
   * Null means "keep what you already have" — never "show nothing".
   */
  function normalizeBoard(raw) {
    if (!isPlainObject(raw)) return null;
    if (!Array.isArray(raw.tasks)) return null;      // the one field the whole page is about
    if (raw.phases !== undefined && !Array.isArray(raw.phases)) return null;
    if (raw.owners !== undefined && !isPlainObject(raw.owners)) return null;

    const tasks = [];
    for (const t of raw.tasks) {
      if (!isPlainObject(t)) continue;
      const id = str(t.id);
      if (!id) continue;                             // a task with no id can't be shown or linked
      tasks.push({
        ...t,
        id,
        title: str(t.title) || id,
        owner: str(t.owner) || '',
        status: str(t.status) || 'backlog',
        priority: str(t.priority) || '',
        phase: str(t.phase) || '',
        deliverable_path: str(t.deliverable_path) || '',
      });
    }

    const phases = [];
    for (const p of raw.phases || []) {
      if (!isPlainObject(p)) continue;
      const id = str(p.id);
      if (!id) continue;
      phases.push({ ...p, id, title: str(p.title) || id, desc: str(p.desc) || '' });
    }

    const owners = {};
    for (const [key, o] of Object.entries(raw.owners || {})) {
      if (!isPlainObject(o)) continue;
      owners[key] = { ...o, name: str(o.name) || key, seat: str(o.seat) || '', color: str(o.color) || '#888' };
    }

    return { ...raw, tasks, phases, owners, repo: str(raw.repo) || null, updated: str(raw.updated) || null };
  }

  return { normalizeBoard, isPlainObject };
});
