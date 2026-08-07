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
    '--fast': 'only the quick checks (what the pre-commit hook runs)',
    '--live': 'also check production deployment and the live oracle',
  },
  notes: [
    'Default runs every hermetic check — the same set CI runs.',
    'Exit 1 if any check fails.',
  ],
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Directories whose .js/.mjs files must parse. */
const SYNTAX_DIRS = ['scripts', 'worldview', 'dashboard'];

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

// tier: 'fast' runs everywhere; 'full' adds the slow hermetic checks; 'live'
// reaches the network and is never automatic.
export const CHECKS = [
  { name: 'unit tests', tier: 'fast', argv: ['--test'] },
  { name: 'task board in sync', tier: 'fast', argv: ['scripts/generate.mjs', '--check'] },
  { name: 'script versions stamped', tier: 'fast', argv: ['scripts/stamp-assets.mjs', '--check'] },
  { name: 'scripts parse', tier: 'fast', syntax: true },
  { name: 'no secrets (tree + history)', tier: 'full', argv: ['scripts/scan-secrets.mjs'] },
  { name: 'production matches the repo', tier: 'live', argv: ['scripts/check-deployed.mjs'] },
  { name: 'oracle contract holds', tier: 'live', argv: ['scripts/check-oracle.mjs'] },
];

export function selectChecks(tier) {
  if (tier === 'fast') return CHECKS.filter((c) => c.tier === 'fast');
  if (tier === 'live') return CHECKS;
  return CHECKS.filter((c) => c.tier !== 'live');
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
  if (flags.has('--fast') && flags.has('--live')) {
    console.error('\n  ✗ --fast and --live ask for opposite things.\n');
    process.exit(2);
  }
  const tier = flags.has('--fast') ? 'fast' : flags.has('--live') ? 'live' : 'full';
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
  if (skipped) console.log(`\n  ${skipped} check(s) not in the '${tier}' tier were skipped.`);
  console.log(failed.length
    ? `\n  ${failed.length} of ${results.length} checks failed.\n`
    : `\n  All ${results.length} checks passed.\n`);
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
