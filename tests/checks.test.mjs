import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHECKS, selectChecks } from '../scripts/checks.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('every check declares a valid tier and something to run', () => {
  for (const c of CHECKS) {
    assert.ok(['always', 'live'].includes(c.tier), `${c.name} has tier ${c.tier}`);
    assert.ok(c.argv || c.syntax, `${c.name} must have argv or be the syntax check`);
    assert.ok(c.name && c.name.length < 32, `${c.name} needs a short name for the report line`);
  }
});

test('--live is a superset of the default gate', () => {
  const names = (t) => selectChecks(t).map((c) => c.name);
  const dflt = names(), live = names('live');
  for (const n of dflt) assert.ok(live.includes(n), `${n} is in the gate but not in --live`);
  assert.equal(live.length, CHECKS.length, '--live runs everything');
});

test('the network checks are never automatic', () => {
  // check-deployed and check-oracle hit the internet. If either leaked into
  // the default gate, every commit would depend on Cloudflare and the oracle
  // being up — and CI would fail on the true statement that a direct-upload
  // deploy hasn't happened yet.
  for (const c of selectChecks()) {
    assert.ok(!/check-deployed|check-oracle/.test((c.argv || []).join(' ')),
      `${c.name} reaches the network but runs by default`);
  }
});

test('the secrets scan is in the automatic gate', () => {
  // SECURITY.md's no-secrets guarantee rests on this scan. It was broken from
  // iteration 44 to 48 because nothing ran it automatically. Moving it out of
  // the gate would silently restore that hole.
  const auto = selectChecks().map((c) => (c.argv || []).join(' '));
  assert.ok(auto.some((a) => a.includes('scan-secrets')), 'the gate must run the secrets scan');
});

test('the hook and CI run the identical gate, and delegate to it', () => {
  // Both used to spell out their own list; they diverged from each other and
  // from the runner, and the check none of them shared is the one that broke.
  const ci = read('.github/workflows/ci.yml');
  const hook = read('scripts/hooks/pre-commit');

  assert.match(ci, /node scripts\/checks\.mjs\s*$/m, 'CI must invoke the runner with no tier flag');
  assert.match(hook, /node scripts\/checks\.mjs\s*\|\|/, 'the hook must invoke the same runner');

  // Neither may reach past the runner to a specific check — that is exactly
  // how the previous three-way drift started.
  for (const [name, text] of [['CI', ci], ['the hook', hook]]) {
    const direct = [...text.matchAll(/node (?:--test|--check|scripts\/(?!checks\.mjs)\S+)/g)]
      .map((m) => m[0]);
    assert.deepEqual(direct, [], `${name} still runs checks directly: ${direct.join(', ')}`);
  }
});

test('CI fetches full history, or the secrets scan refuses to run', () => {
  // actions/checkout defaults to a depth-1 clone. The scan now exits 1 on a
  // shallow repository rather than passing blind, so without this CI is red —
  // which is correct, but the intent should be recorded where it's set.
  assert.match(read('.github/workflows/ci.yml'), /fetch-depth:\s*0/,
    'CI must check out full history for the history scan');
});
