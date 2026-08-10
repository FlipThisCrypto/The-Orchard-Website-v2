// The single definition of what "checked" means in this repo.
//
//   node scripts/checks.mjs --fast    what the pre-commit hook runs
//   node scripts/checks.mjs           everything hermetic (what CI runs)
//   node scripts/checks.mjs --live    the above plus production and the oracle
//
// There used to be three definitions and no two agreed: CI ran a syntax loop
// in bash, the hook ran the same loop in sh, and neither ran the secrets scan
// — which is exactly why that scan stayed broken from iteration 44 to 48 while
// SECURITY.md advertised it as the basis of a guarantee. One list, tagged by
// when it runs; CI and the hook call it instead of restating it.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';

const SPEC = {
  name: 'checks',
  path: 'scripts/checks.mjs',
  summary: 'run the repo\'s checks and report which passed',
  flags: {
    '--live': 'also check production deployment and the live oracle',
  },
  notes: [
    'The default set is exactly what the pre-commit hook and CI both run.',
    'Exit 1 if any check fails.',
  ],
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Directories whose .js/.mjs files must parse. */
const SYNTAX_DIRS = ['scripts', 'worldview', 'dashboard'];

/**
 * Directories this repo runs unit tests from.
 *
 * This used to be a bare `node --test`, which discovers test files by walking
 * the whole working directory. That quietly means "every test file anyone has
 * ever left in this folder", including work-in-progress from a separate project
 * that is not tracked by this repo at all — and when those fail, every commit
 * here is blocked for a reason that has nothing to do with this repo.
 *
 * A gate must be able to say what it covers. Naming the directories makes the
 * boundary a decision: adding a suite is one deliberate line, and nothing gets
 * swept in by virtue of sitting on the same disk.
 */
const TEST_DIRS = ['tests'];

function testFiles() {
  const out = [];
  for (const dir of TEST_DIRS) {
    for (const f of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (f.isFile() && /\.test\.(mjs|js)$/.test(f.name)) out.push(join(dir, f.name));
    }
  }
  // A test runner handed no files passes vacuously, which is the worst
  // possible outcome for a gate — it reports green having checked nothing.
  if (!out.length) throw new Error(`no test files found under ${TEST_DIRS.join(', ')}`);
  return out;
}

function scriptsToParse() {
  const out = [];
  for (const dir of SYNTAX_DIRS) {
    for (const f of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (!f.isFile() || !/\.(mjs|js)$/.test(f.name)) continue;
      out.push(join(dir, f.name));
    }
  }
  return out;
}

// tier 'always' runs in the hook AND in CI — the same gate, not two similar
// ones. 'live' reaches the network and is never automatic.
//
// There was briefly a middle tier holding the secrets scan, because at 23s it
// was too slow to put in front of every commit. That cost turned out to be
// ~385 git process spawns rather than anything inherent; batched it runs in
// under a second, the middle tier lost its only member, and a distinction
// nothing justifies is a distinction that will drift.
export const CHECKS = [
  { name: 'unit tests', tier: 'always', argv: ['--test', ...testFiles()] },
  { name: 'task board in sync', tier: 'always', argv: ['scripts/generate.mjs', '--check'] },
  { name: 'script versions stamped', tier: 'always', argv: ['scripts/stamp-assets.mjs', '--check'] },
  // A stale hash here doesn't degrade anything — the browser refuses to run
  // the page's own boot script. It has to be caught before the commit.
  { name: 'CSP covers inline script', tier: 'always', argv: ['scripts/csp.mjs', '--check'] },
  { name: 'scripts parse', tier: 'always', syntax: true },
  { name: 'no secrets (tree + history)', tier: 'always', argv: ['scripts/scan-secrets.mjs'] },
  // Reads only the committed capture date — no network, so it belongs here
  // rather than with the live checks.
  { name: 'offline snapshot is fresh', tier: 'always', argv: ['scripts/snapshot.mjs', '--check'] },
  { name: 'production matches the repo', tier: 'live', argv: ['scripts/check-deployed.mjs'] },
  { name: 'oracle contract holds', tier: 'live', argv: ['scripts/check-oracle.mjs'] },
];

export function selectChecks(tier) {
  return tier === 'live' ? CHECKS : CHECKS.filter((c) => c.tier !== 'live');
}

function run(check) {
  const started = process.hrtime.bigint();
  let ok = true, output = '';
  if (check.syntax) {
    for (const f of scriptsToParse()) {
      const r = spawnSync(process.execPath, ['--check', f], { cwd: root, encoding: 'utf8' });
      if (r.status !== 0) { ok = false; output += `${f}\n${r.stderr || ''}`; }
    }
  } else {
    const r = spawnSync(process.execPath, check.argv, { cwd: root, encoding: 'utf8' });
    ok = r.status === 0;
    output = (r.stdout || '') + (r.stderr || '');
  }
  return { ...check, ok, ms: Number((process.hrtime.bigint() - started) / 1000000n), output };
}

function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);
  const tier = flags.has('--live') ? 'live' : 'always';
  const checks = selectChecks(tier);

  console.log('');
  const results = checks.map((c) => {
    const r = run(c);
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.name.padEnd(30)} ${r.ms}ms`);
    // Only failures print output — a wall of green hides the red.
    if (!r.ok) for (const line of r.output.trim().split('\n').slice(-12)) console.log(`      ${line}`);
    return r;
  });

  const failed = results.filter((r) => !r.ok);
  const skipped = CHECKS.length - checks.length;
  if (skipped) console.log(`\n  ${skipped} network check(s) skipped — add --live to run them.`);
  console.log(failed.length
    ? `\n  ${failed.length} of ${results.length} checks failed.\n`
    : `\n  All ${results.length} checks passed.\n`);
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
