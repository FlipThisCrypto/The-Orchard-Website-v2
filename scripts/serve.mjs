// Serve worldview/ locally the way Cloudflare Pages serves it — _headers and
// all.
//
//   node scripts/serve.mjs            http://127.0.0.1:5075
//   node scripts/serve.mjs --port 8080
//
// Every local check until now used `python -m http.server`, which sends none
// of the response headers this site depends on. That was survivable while the
// headers were advisory. It stopped being survivable the moment script-src
// became enforced: a policy that blocks the page's own boot script looks
// perfect in the repo, passes every test, and only fails in front of a
// visitor. Now the thing you verify locally is the thing that ships.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, normalize } from 'node:path';
import { parseArgs, showHelp, EXIT_USAGE } from './args.mjs';
import { SCENARIOS, assertPrivacySafe } from './scenarios.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};

/**
 * Parse Cloudflare's _headers format: an unindented path pattern, then
 * indented `Name: value` lines. `#` is a comment. Pure.
 */
export function parseHeaders(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line || line.trim().startsWith('#')) continue;
    if (/^\S/.test(line)) {
      current = { pattern: line.trim(), headers: {} };
      rules.push(current);
      continue;
    }
    if (!current) continue;
    const at = line.indexOf(':');
    if (at < 0) continue;
    current.headers[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return rules;
}

/** Cloudflare matches `*` as "any characters", and later rules win. */
export function headersFor(rules, path) {
  const out = {};
  for (const rule of rules) {
    const re = new RegExp('^' + rule.pattern.split('*').map(escapeRe).join('.*') + '$');
    if (re.test(path)) Object.assign(out, rule.headers);
  }
  return out;
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function createStaticServer(root, rules, oracle = null) {
  return createServer((req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0]);

    // The oracle stub, when one is running. app.js fetches same-origin on
    // localhost precisely so this can answer — it is the only way to exercise
    // the page's LIVE path outside production.
    if (oracle && (path === '/nodes' || path === '/network/stats')) {
      const answer = oracle(path);
      res.writeHead(answer.status, {
        'content-type': answer.contentType || 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      });
      res.end(answer.body);
      return;
    }

    if (path.endsWith('/')) path += 'index.html';
    // Never serve outside the root, however the path is spelled.
    const file = join(root, normalize(path).replace(/^([/\\])+/, ''));
    if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }

    let body;
    try {
      if (statSync(file).isDirectory()) throw new Error('directory');
      body = readFileSync(file);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
      return;
    }
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, {
      'content-type': TYPES[ext] || 'application/octet-stream',
      ...headersFor(rules, path),
    });
    res.end(body);
  });
}

/**
 * Build the stub handler for a scenario. Returns null for no stub.
 * Pure apart from the scenario's own clock.
 */
export function oracleHandler(name) {
  const scenario = SCENARIOS[name];
  if (!scenario) {
    console.error(`\n  ✗ unknown scenario: ${name}\n\n  Available:\n` +
      Object.entries(SCENARIOS).map(([k, v]) => `    ${k.padEnd(14)} ${v.summary}`).join('\n') + '\n');
    process.exit(EXIT_USAGE);
  }
  const built = scenario.build();
  if (built.nodes) assertPrivacySafe(built.nodes);
  return (path) => {
    if (built.status && built.status >= 400) {
      return { status: built.status, body: built.body || 'error', contentType: 'text/plain' };
    }
    if (built.body !== undefined) return { status: 200, body: built.body };
    return { status: 200, body: JSON.stringify(path === '/nodes' ? built.nodes : built.stats) };
  };
}

const SPEC = {
  name: 'serve',
  path: 'scripts/serve.mjs',
  summary: 'serve worldview/ locally with its production response headers',
  flags: {
    '--port': 'port to listen on (default 5075)',
    '--oracle': 'also answer /nodes and /network/stats, so the LIVE path runs locally',
    '--scenario': `which oracle to pretend to be (default live): ${Object.keys(SCENARIOS).join(', ')}`,
  },
  notes: [
    'Applies worldview/_headers, so an enforced CSP is testable before it ships.',
    'Without --oracle the page falls back to its snapshot, as it does today.',
  ],
};
/** Pull `--flag value` pairs out of argv so parseArgs sees only bare flags. */
export function takeValues(argv, names) {
  const values = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (names.includes(argv[i])) { values[argv[i]] = argv[i + 1]; i++; continue; }
    rest.push(argv[i]);
  }
  return { values, rest };
}

function main(argv) {
  const { values, rest } = takeValues(argv, ['--port', '--scenario']);
  const { help, flags } = parseArgs(rest, SPEC);
  if (help) showHelp(SPEC);

  const port = values['--port'] === undefined ? 5075 : Number(values['--port']);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`\n  ✗ --port needs a port number, got: ${values['--port']}\n`);
    process.exit(EXIT_USAGE);
  }
  const scenario = values['--scenario'] || 'live';
  const wantsOracle = flags.has('--oracle') || values['--scenario'] !== undefined;

  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'worldview');
  const rules = parseHeaders(readFileSync(join(root, '_headers'), 'utf8'));
  const oracle = wantsOracle ? oracleHandler(scenario) : null;

  createStaticServer(root, rules, oracle).listen(port, '127.0.0.1', () => {
    console.log(`\n  worldview/ with production headers — http://127.0.0.1:${port}\n`);
    for (const r of rules) console.log(`    ${r.pattern.padEnd(16)} ${Object.keys(r.headers).length} header(s)`);
    console.log(oracle
      ? `\n  Oracle stub: ${scenario} — ${SCENARIOS[scenario].summary}\n  The page runs its LIVE path.\n`
      : `\n  No oracle stub — the page will fall back to its snapshot. Add --oracle.\n`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
