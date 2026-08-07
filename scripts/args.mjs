// Shared argument handling for the maintenance scripts.
//
// Every one of them used to treat an unknown flag as "proceed with the default
// action", so `node scripts/generate.mjs --help` rewrote the task board and
// `stamp-assets.mjs --help` rewrote both published pages. Probing a tool by
// the most standard convention there is mutated the repo and printed no help.
//
// Exit codes: 0 help shown, 2 bad usage. A script's own failure stays 1, so a
// caller can tell "you invoked it wrong" from "the check failed".
export const EXIT_USAGE = 2;

/**
 * Parse argv against a declared set of flags.
 * Returns { help, flags } or exits with usage.
 */
export function parseArgs(argv, spec) {
  const known = new Set(Object.keys(spec.flags || {}));
  const flags = new Set();
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') return { help: true, flags };
    if (!arg.startsWith('-')) { usage(spec, `unexpected argument: ${arg}`); }
    if (!known.has(arg)) { usage(spec, `unknown flag: ${arg}`); }
    flags.add(arg);
  }
  return { help: false, flags };
}

export function renderUsage(spec) {
  const lines = [];
  lines.push('');
  lines.push(`  ${spec.name} — ${spec.summary}`);
  lines.push('');
  lines.push(`  Usage: node ${spec.path}${Object.keys(spec.flags || {}).length ? ' [flags]' : ''}`);
  if (Object.keys(spec.flags || {}).length) {
    lines.push('');
    for (const [flag, desc] of Object.entries(spec.flags)) {
      lines.push(`    ${flag.padEnd(12)} ${desc}`);
    }
  }
  lines.push(`    ${'--help'.padEnd(12)} show this and do nothing`);
  if (spec.notes) { lines.push(''); for (const n of spec.notes) lines.push(`  ${n}`); }
  lines.push('');
  return lines.join('\n');
}

function usage(spec, problem) {
  console.error(renderUsage(spec));
  console.error(`  ✗ ${problem}\n`);
  process.exit(EXIT_USAGE);
}

/** Print help and exit 0 — used when parseArgs reports help. */
export function showHelp(spec) {
  console.log(renderUsage(spec));
  process.exit(0);
}
