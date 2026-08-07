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
import { parseArgs, showHelp } from './args.mjs';

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

export function createStaticServer(root, rules) {
  return createServer((req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0]);
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

const SPEC = {
  name: 'serve',
  path: 'scripts/serve.mjs',
  summary: 'serve worldview/ locally with its production response headers',
  flags: { '--port': 'port to listen on (default 5075)' },
  notes: ['Applies worldview/_headers, so an enforced CSP is testable before it ships.'],
};
function main(argv) {
  // --port takes a value, which parseArgs doesn't model; pull it out first.
  const rest = [], portIdx = argv.indexOf('--port');
  let port = 5075;
  for (let i = 0; i < argv.length; i++) {
    if (i === portIdx) { port = Number(argv[i + 1]); i++; continue; }
    rest.push(argv[i]);
  }
  const { help } = parseArgs(rest, SPEC);
  if (help) showHelp(SPEC);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`\n  ✗ --port needs a port number, got: ${argv[portIdx + 1]}\n`);
    process.exit(2);
  }

  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'worldview');
  const rules = parseHeaders(readFileSync(join(root, '_headers'), 'utf8'));
  createStaticServer(root, rules).listen(port, '127.0.0.1', () => {
    console.log(`\n  worldview/ with production headers — http://127.0.0.1:${port}\n`);
    for (const r of rules) console.log(`    ${r.pattern.padEnd(16)} ${Object.keys(r.headers).length} header(s)`);
    console.log('');
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
