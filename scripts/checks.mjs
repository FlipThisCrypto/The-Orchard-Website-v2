// Run every check this repo knows how to make, and say which passed.
//
//   node scripts/checks.mjs            the local gate (no network)
//   node scripts/checks.mjs --live     also check production and the oracle
//
// There are six maintenance scripts now, scattered across three README
// sections and a git hook. "What should I run before shipping?" deserves one
// answer. Local checks are hermetic and always run; the two that reach the
// network are opt-in, because a plane or a flaky DNS is not a repo problem.
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, showHelp } from './args.mjs';
import { dirname, join } from 'node:path';

const SPEC = {
  name: 'checks',
  path: 'scripts/checks.mjs',
  summary: 'run every check in the repo and report which passed',
  flags: { '--live': 'also check production deployment and the live oracle' },
  notes: [
    'Local checks are the same ones the pre-commit hook and CI run.',
    'Exit 1 if any check fails.',
  ],
};

export const LOCAL_CHECKS = [
  { name: 'unit tests', argv: ['--test'], node: true },
  { name: 'task board in sync', argv: ['scripts/generate.mjs', '--check'] },
  { name: 'script versions stamped', argv: ['scripts/stamp-assets.mjs', '--check'] },
  { name: 'no secrets (tree + history)', argv: ['scripts/scan-secrets.mjs'] },
];

export const LIVE_CHECKS = [
  { name: 'production matches the repo', argv: ['scripts/check-deployed.mjs'] },
  { name: 'oracle contract holds', argv: ['scripts/check-oracle.mjs'] },
];

function run(check, root) {
  const started = process.hrtime.bigint();
  const res = spawnSync(process.execPath, check.argv, { cwd: root, encoding: 'utf8' });
  const ms = Number((process.hrtime.bigint() - started) / 1000000n);
  return { ...check, ok: res.status === 0, status: res.status, ms, output: (res.stdout || '') + (res.stderr || '') };
}

function main(argv) {
  const { help, flags } = parseArgs(argv, SPEC);
  if (help) showHelp(SPEC);
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const checks = flags.has('--live') ? [...LOCAL_CHECKS, ...LIVE_CHECKS] : LOCAL_CHECKS;

  console.log('');
  const results = [];
  for (const c of checks) {
    const r = run(c, root);
    results.push(r);
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.name.padEnd(30)} ${r.ms}ms`);
    if (!r.ok) {
      // Only failures get their output — a wall of green text hides the red.
      for (const line of r.output.trim().split('\n').slice(-12)) console.log(`      ${line}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  if (!flags.has('--live')) {
    console.log(`\n  ${LIVE_CHECKS.length} network checks skipped — add --live to include them.`);
  }
  console.log(failed.length
    ? `\n  ${failed.length} of ${results.length} checks failed.\n`
    : `\n  All ${results.length} checks passed.\n`);
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
