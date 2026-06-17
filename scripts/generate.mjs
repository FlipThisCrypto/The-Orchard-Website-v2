// Generates tasks/TASKS.md and dashboard/data.js from tasks/tasks.json.
// The Lead runs `node scripts/generate.mjs` after every change to tasks.json.
// tasks.json is the ONLY source of truth — never hand-edit the generated files.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(join(root, 'tasks/tasks.json'), 'utf8');
const data = JSON.parse(raw);
const today = new Date().toISOString().slice(0, 10);

const tasks = data.tasks;
const isDone = (t) => t.status === 'done';
const pct = (arr) => (arr.length ? Math.round((100 * arr.filter(isDone).length) / arr.length) : 0);
const overall = pct(tasks);
const doneCount = tasks.filter(isDone).length;

// ---- dashboard/data.js (verbatim data + stamp) ----
writeFileSync(
  join(root, 'dashboard/data.js'),
  `// AUTO-GENERATED from tasks/tasks.json by scripts/generate.mjs — do not edit by hand.\n` +
    `window.TASKS = ${JSON.stringify(data, null, 2)};\n` +
    `window.TASKS_GENERATED = ${JSON.stringify(today)};\n`
);

// ---- tasks/TASKS.md ----
const emoji = { done: '✅', in_review: '🔍', changes_requested: '✏️', assigned: '⏳', ready: '▢', backlog: '💤', blocked: '⛔' };
let md = `# TASKS — The Orchard v2\n\n`;
md += `> Auto-generated from \`tasks/tasks.json\` by \`scripts/generate.mjs\`. **Do not edit by hand** —\n`;
md += `> edit the JSON and regenerate. Live view: \`dashboard/index.html\`.\n\n`;
md += `**Overall: ${overall}% complete** — ${doneCount}/${tasks.length} tasks · updated ${today}\n\n`;

md += `## By advisor\n\n| Seat | Owner | Done | Total | % |\n|---|---|---|---|---|\n`;
for (const [key, o] of Object.entries(data.owners)) {
  const own = tasks.filter((t) => t.owner === key);
  md += `| ${o.seat} | ${o.name} | ${own.filter(isDone).length} | ${own.length} | ${pct(own)}% |\n`;
}
md += `\n`;

for (const ph of data.phases) {
  const pt = tasks.filter((t) => t.phase === ph.id);
  if (!pt.length) continue;
  md += `## ${ph.title} — ${pct(pt)}%\n\n${ph.desc}\n\n`;
  md += `| ID | Task | Owner | Status | Pri | Deliverable |\n|---|---|---|---|---|---|\n`;
  for (const t of pt) {
    const owner = (data.owners[t.owner] && data.owners[t.owner].name) || t.owner;
    md += `| ${t.id} | ${t.title} | ${owner} | ${emoji[t.status] || ''} ${t.status} | ${t.priority} | \`${t.deliverable_path}\` |\n`;
  }
  md += `\n`;
}

writeFileSync(join(root, 'tasks/TASKS.md'), md);
console.log(`Generated TASKS.md + dashboard/data.js — overall ${overall}% (${doneCount}/${tasks.length}).`);
