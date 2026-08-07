import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHECKS, selectChecks } from '../scripts/checks.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('every check declares a valid tier and something to run', () => {
  for (const c of CHECKS) {
    assert.ok(['fast', 'full', 'live'].includes(c.tier), `${c.name} has tier ${c.tier}`);
    assert.ok(c.argv || c.syntax, `${c.name} must have argv or be the syntax check`);
    assert.ok(c.name && c.name.length < 32, `${c.name} needs a short name for the report line`);
  }
});

test('tiers nest: fast ⊆ default ⊆ live', () => {
  const names = (t) => selectChecks(t).map((c) => c.name);
  const fast = names('fast'), full = names(), live = names('live');
  for (const n of fast) assert.ok(full.includes(n), `${n} is in fast but not the default set`);
  for (const n of full) assert.ok(live.includes(n), `${n} is in the default set but not live`);
  assert.equal(live.length, CHECKS.length, '--live runs everything');
  assert.ok(fast.length < full.length, 'the fast tier must actually be smaller, or it is not fast');
});

test('the network checks are never automatic', () => {
  // check-deployed and check-oracle hit the internet. If either leaked into a
  // tier the hook or CI runs, every commit would depend on Cloudflare and the
  // oracle being up — and CI would fail on the true statement that a
  // direct-upload deploy hasn't happened yet.
  for (const c of selectChecks()) {
    assert.ok(!/check-deployed|check-oracle/.test((c.argv || []).join(' ')),
      `${c.name} reaches the network but runs by default`);
  }
});

test('the secrets scan runs somewhere automatic', () => {
  // SECURITY.md's no-secrets guarantee rests on this scan. It was broken from
  // iteration 44 to 48 because nothing ran it automatically. Moving it out of
  // an automated tier would silently restore that hole.
  const auto = selectChecks().map((c) => (c.argv || []).join(' '));
  assert.ok(auto.some((a) => a.includes('scan-secrets')), 'no automated tier runs the secrets scan');
});

test('CI and the hook delegate to checks.mjs rather than restating it', () => {
  // The point of this iteration. Both gates used to spell out their own list;
  // they diverged from each other and from the runner, and the check none of
  // them shared is the one that broke.
  const ci = read('.github/workflows/ci.yml');
  const hook = read('scripts/hooks/pre-commit');

  assert.match(ci, /node scripts\/checks\.mjs/, 'CI must invoke the shared runner');
  assert.match(hook, /node scripts\/checks\.mjs --fast/, 'the hook must invoke the fast tier');

  // Neither may reach past the runner to a specific check — that is exactly
  // how the previous three-way drift started.
  for (const [name, text] of [['CI', ci], ['the hook', hook]]) {
    const direct = [...text.matchAll(/node (?:--test|--check|scripts\/(?!checks\.mjs)\S+)/g)]
      .map((m) => m[0]);
    assert.deepEqual(direct, [], `${name} still runs checks directly: ${direct.join(', ')}`);
  }
});

test('CI fetches full history, or the secrets scan is blind', () => {
  // actions/checkout defaults to a depth-1 clone. `git rev-list --all` would
  // then see one commit, and the scan would pass having read almost nothing —
  // a green check that proves less than it claims.
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /fetch-depth:\s*0/, 'CI must check out full history for the history scan');
});
