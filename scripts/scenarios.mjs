// Oracle scenarios for local development.
//
// The live network has four Trees, all in one town, all healthy or quiet. It
// cannot produce a frozen oracle clock, a malformed response, a Tree that has
// been offline for a week, or ten thousand Trees — so none of those were ever
// exercised through the real fetch-render loop. They existed only in unit
// tests against synthetic objects, which is not the same thing: the whole
// point of the states below is what the PAGE does with them.
//
// Served by `node scripts/serve.mjs --oracle --scenario <name>`.
//
// Everything here honours the same privacy contract as production data: no
// wallet_address, and no geohash finer than DECLARED_PRECISION. A fixture that
// quietly breaks the contract would train the page to render something it must
// never render.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import OrchardData from '../worldview/orchard-data.js';

const { DECLARED_PRECISION } = OrchardData;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The committed snapshot, read straight out of app.js — one source of truth. */
export function committedSnapshot(src = readFileSync(join(root, 'worldview/app.js'), 'utf8')) {
  const nodes = src.match(/const SNAPSHOT_NODES = (\[[\s\S]*?\n {2}\]);/);
  const stats = src.match(/const SNAPSHOT_STATS = (\{.*\});/);
  if (!nodes || !stats) throw new Error('could not read the snapshot out of worldview/app.js');
  return { nodes: JSON.parse(nodes[1]), stats: JSON.parse(stats[1]) };
}

const iso = (ms) => new Date(ms).toISOString().replace('Z', '+00:00');

// Geohash cells near the seeded region, all at the contract's precision.
const CELLS = ['dng01', 'dng04', 'dng03', 'dng06', 'dng0d', 'dng0f', 'dng1p', 'dng4b'];

/**
 * A network of `count` Trees spread over the cells above, with a realistic mix
 * of states. Deterministic: same count, same network, so a measurement taken
 * against it means something later.
 */
export function largeNetwork(count, now = Date.now()) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    // Fixed proportions rather than randomness — 70% reporting, 15% quiet,
    // 10% stopped, 5% never reported.
    const bucket = i % 20;
    const lastSeen =
      bucket < 14 ? now - (i % 90) * 60000            // minutes ago: reporting
      : bucket < 17 ? now - (3 + (i % 20)) * 3600000  // hours ago: quiet
      : bucket < 19 ? now - (30 + (i % 200)) * 3600000 // days ago: stopped
      : null;                                          // never reported
    nodes.push({
      node_id: `SIM${String(i).padStart(29, '0')}`,
      sensors: [['ds18b20'], ['ds18b20', 'bme280'], [], ['sds011', 'gps']][i % 4],
      fw_version: ['0.5.1', '0.5.0', '0.4.9'][i % 3],
      pass_nft_id: i % 3 === 0 ? null : 'nft1dqvx2acr658krs0tmxhvjl4apz420gku2lmcyefgdcxm48jt5d9sutp32y',
      geohash: CELLS[i % CELLS.length],
      last_seen_at: lastSeen === null ? null : iso(lastSeen),
      last_reading_at: lastSeen === null ? null : iso(lastSeen),
      pass_verified_at: i % 6 === 0 ? iso(now - 40 * 86400000) : null,
      registered_at: iso(now - (30 + (i % 300)) * 86400000),
      label: i % 7 === 0 ? `Grove ${i}` : null,
    });
  }
  const active = nodes.filter((n) => n.last_seen_at && now - Date.parse(n.last_seen_at) < 86400000).length;
  return {
    nodes,
    stats: {
      trees_registered: count, trees_active_24h: active,
      readings_total: count * 54000, readings_last_24h: active * 700,
      attestations_total: 0, current_season: 73, as_of_utc: iso(now),
    },
  };
}

/**
 * Every scenario. Each returns { status, nodes, stats } or a raw body — what
 * the stub should actually answer with, including the wrong answers.
 */
export const SCENARIOS = {
  live: {
    summary: 'the committed snapshot, served as if the oracle were up',
    build: () => {
      const { nodes, stats } = committedSnapshot();
      // Re-stamp the clock so the page sees fresh data rather than judging
      // every Tree against a capture time that recedes.
      return { nodes, stats: { ...stats, as_of_utc: iso(Date.now()) } };
    },
  },
  down: {
    summary: 'the oracle is unreachable — the page must fall back and say so',
    build: () => ({ status: 503, body: 'upstream unavailable' }),
  },
  malformed: {
    summary: 'HTTP 200 with a body that is not what the page expects',
    build: () => ({ body: JSON.stringify({ error: 'internal' }) }),
  },
  'frozen-clock': {
    summary: 'every endpoint answers perfectly, and the data stopped moving 9 hours ago',
    build: () => {
      const { nodes, stats } = committedSnapshot();
      return { nodes, stats: { ...stats, as_of_utc: iso(Date.now() - 9 * 3600000) } };
    },
  },
  'all-states': {
    summary: 'one Tree in each node state, including the ones the real network never shows',
    build: (now = Date.now()) => {
      const base = (over) => ({
        node_id: '', sensors: ['ds18b20'], fw_version: '0.5.1', pass_nft_id: null,
        geohash: 'dng01', last_seen_at: null, last_reading_at: null,
        pass_verified_at: null, registered_at: iso(now - 86400000 * 100), label: null, ...over,
      });
      const nodes = [
        base({ node_id: 'STATE_HEALTHY'.padEnd(32, '0'), last_seen_at: iso(now - 60000), last_reading_at: iso(now - 60000) }),
        base({ node_id: 'STATE_IDLE'.padEnd(32, '0'), last_seen_at: iso(now - 5 * 3600000), last_reading_at: iso(now - 5 * 3600000) }),
        base({ node_id: 'STATE_STALE'.padEnd(32, '0'), last_seen_at: iso(now - 60000), last_reading_at: iso(now - 40 * 3600000) }),
        base({ node_id: 'STATE_OFFLINE'.padEnd(32, '0'), last_seen_at: iso(now - 80 * 3600000), last_reading_at: iso(now - 80 * 3600000) }),
        base({ node_id: 'STATE_NEW'.padEnd(32, '0'), geohash: 'dng04' }),
        base({ node_id: 'STATE_AHEAD'.padEnd(32, '0'), last_seen_at: iso(now + 6 * 3600000), last_reading_at: iso(now + 6 * 3600000) }),
      ];
      return {
        nodes,
        stats: {
          trees_registered: nodes.length, trees_active_24h: 3, readings_total: 12345,
          readings_last_24h: 400, attestations_total: 0, current_season: 73, as_of_utc: iso(now),
        },
      };
    },
  },
  huge: {
    summary: '10,000 Trees — what the caps, the globe and the list actually do at scale',
    build: () => largeNetwork(10000),
  },
};

/** Refuse to serve a fixture that breaks the rules production data must follow. */
export function assertPrivacySafe(nodes) {
  for (const n of nodes || []) {
    if ('wallet_address' in n) throw new Error(`${n.node_id} carries wallet_address`);
    if (typeof n.geohash === 'string' && n.geohash.length > DECLARED_PRECISION) {
      throw new Error(`${n.node_id} has a ${n.geohash.length}-character geohash`);
    }
  }
  return nodes;
}
