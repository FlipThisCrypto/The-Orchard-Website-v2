// Generates tasks/TASKS.md and dashboard/data.js from tasks/tasks.json.
// The Lead runs `node scripts/generate.mjs` after every change to tasks.json.
// tasks.json is the ONLY source of truth — never hand-edit the generated files.
//
//   node scripts/generate.mjs           write the generated files
//   node scripts/generate.mjs --check   fail if they are out of date (CI)
//
// Output is a pure function of tasks.json: no clock, no environment. That is
// what makes --check possible, and it stops the board claiming it was updated
// on a day when nothing about the tasks changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';

export const isDone = (t) => t.status === 'done';
export const pct = (arr) => (arr.length ? Math.round((100 * arr.filter(isDone).length) / arr.length) : 0);

const STATUS_EMOJI = {
  done: '✅', in_review: '🔍', changes_requested: '✏️', assigned: '⏳',
  ready: '▢', backlog: '💤', blocked: '⛔',
};

/** The date the task data itself says it was last updated — never the clock. */
export function sourceDate(data) {
  const d = data && data.updated;
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    throw new Error('tasks.json needs an "updated" field in YYYY-MM-DD form (got: ' + JSON.stringify(d) + ')');
  }
  return d;
}

/** Phases that exist in the plan but hold no tasks yet — future work, not done work. */
export function unplannedPhases(data) {
  const tasks = data.tasks || [];
  return (data.phases || []).filter((ph) => !tasks.some((t) => t.phase === ph.id));
}

export function buildDataJs(data) {
  return (
    `// AUTO-GENERATED from tasks/tasks.json by scripts/generate.mjs — do not edit by hand.\n` +
    `window.TASKS = ${JSON.stringify(data, null, 2)};\n` +
    `window.TASKS_UPDATED = ${JSON.stringify(sourceDate(data))};\n`
  );
}

export function buildTasksMd(data) {
  const tasks = data.tasks || [];
  const done = tasks.filter(isDone).length;
  const unplanned = unplannedPhases(data);

  let md = `# TASKS — The Orchard v2\n\n`;
  md += `> Auto-generated from \`tasks/tasks.json\` by \`scripts/generate.mjs\`. **Do not edit by hand** —\n`;
  md += `> edit the JSON and regenerate. Live view: \`dashboard/index.html\`.\n\n`;
  // Percentages here are "of the work that has been planned so far" — saying
  // "100% complete" while whole phases have no tasks would be untrue.
  md += `**${done}/${tasks.length} authored tasks done** (${pct(tasks)}% of the work planned so far)`;
  if (unplanned.length) {
    md += ` · ${unplanned.length} later phase${unplanned.length > 1 ? 's' : ''} not yet planned`;
  }
  md += ` · task data updated ${sourceDate(data)}\n\n`;

  md += `## By advisor\n\n| Seat | Owner | Done | Total | % |\n|---|---|---|---|---|\n`;
  for (const [key, o] of Object.entries(data.owners || {})) {
    const own = tasks.filter((t) => t.owner === key);
    md += `| ${o.seat} | ${o.name} | ${own.filter(isDone).length} | ${own.length} | ${pct(own)}% |\n`;
  }
  md += `\n`;

  for (const ph of data.phases || []) {
    const pt = tasks.filter((t) => t.phase === ph.id);
    if (!pt.length) {
      md += `## ${ph.title} — not started\n\n${ph.desc}\n\n_No tasks authored yet._\n\n`;
      continue;
    }
    md += `## ${ph.title} — ${pct(pt)}%\n\n${ph.desc}\n\n`;
    md += `| ID | Task | Owner | Status | Pri | Deliverable |\n|---|---|---|---|---|---|\n`;
    for (const t of pt) {
      const owner = (data.owners[t.owner] && data.owners[t.owner].name) || t.owner;
      md += `| ${t.id} | ${t.title} | ${owner} | ${STATUS_EMOJI[t.status] || ''} ${t.status} | ${t.priority} | \`${t.deliverable_path}\` |\n`;
    }
    md += `\n`;
  }
  return md;
}

// ---------------------------------------------------------------------------
const SPEC = {
  name: 'generate',
  path: 'scripts/generate.mjs',
  summary: 'rebuild tasks/TASKS.md and dashboard/data.js from tasks/tasks.json',
  flags: { '--check': 'verify the generated files are current; write nothing' },
  notes: ['Output is a pure function of tasks.json, so --check is meaningful.'],
};
function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const data = JSON.parse(readFileSync(join(root, 'tasks/tasks.json'), 'utf8'));
  const outputs = [
    { path: join(root, 'dashboard/data.js'), rel: 'dashboard/data.js', content: buildDataJs(data) },
    { path: join(root, 'tasks/TASKS.md'), rel: 'tasks/TASKS.md', content: buildTasksMd(data) },
  ];

  if (flags.has('--check')) {
    const stale = outputs.filter((o) => {
      let current = null;
      try { current = readFileSync(o.path, 'utf8'); } catch { /* missing counts as stale */ }
      return current !== o.content;
    });
    if (stale.length) {
      console.error(
        `✗ Generated files are out of date with tasks/tasks.json:\n` +
        stale.map((o) => `    ${o.rel}`).join('\n') +
        `\n  Run: node scripts/generate.mjs\n`
      );
      process.exit(1);
    }
    console.log('✓ tasks/TASKS.md and dashboard/data.js are in sync with tasks.json.');
    return;
  }

  for (const o of outputs) writeFileSync(o.path, o.content);
  const tasks = data.tasks || [];
  console.log(
    `Generated TASKS.md + dashboard/data.js — ${tasks.filter(isDone).length}/${tasks.length} authored tasks done` +
    `, ${unplannedPhases(data).length} phase(s) not yet planned (source updated ${sourceDate(data)}).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
