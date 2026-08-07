// Every published page must be shareable and findable: a real description, a
// canonical URL, a card that unfurls, and a favicon. These pages are static
// HTML with no build step, so nothing else would catch a page shipping bare.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Every page this repo publishes. Adding a page here is the point: a new
// surface has to declare its canonical URL and favicon path to pass.
const PAGES = [
  { file: 'worldview/index.html',            canonical: 'https://worldview.theorchard.network/',                                       icon: 'favicon.svg' },
  { file: 'dashboard/index.html',            canonical: 'https://flipthiscrypto.github.io/The-Orchard-Website-v2/dashboard/',          icon: '../favicon.svg' },
  { file: 'prototypes/globe-poc/index.html', canonical: 'https://flipthiscrypto.github.io/The-Orchard-Website-v2/prototypes/globe-poc/', icon: '../../favicon.svg' },
];

const html = Object.fromEntries(PAGES.map((p) => [p.file, readFileSync(join(root, p.file), 'utf8')]));

// Attribute values may legitimately contain an apostrophe ("The Orchard's
// network"), so capture up to the matching quote character, not up to either.
const attrValue = (tag, attr) => {
  const m = tag.match(new RegExp(`\\b${attr}=(["'])([\\s\\S]*?)\\1`, 'i'));
  return m ? m[2] : null;
};
const tags = (src, kind) => src.match(new RegExp(`<${kind}\\b[^>]*>`, 'gi')) || [];
const meta = (src, attr, name) => {
  const tag = tags(src, 'meta').find((t) => attrValue(t, attr) === name);
  return tag ? attrValue(tag, 'content') : null;
};
const link = (src, rel) => {
  const tag = tags(src, 'link').find((t) => (attrValue(t, 'rel') || '').split(/\s+/).includes(rel));
  return tag ? attrValue(tag, 'href') : null;
};

for (const page of PAGES) {
  const src = html[page.file];

  test(`${page.file}: has a title and a description that says something`, () => {
    const title = (src.match(/<title>([^<]+)<\/title>/) || [])[1];
    assert.ok(title && title.trim().length > 8, 'needs a real <title>');
    const desc = meta(src, 'name', 'description');
    assert.ok(desc, 'missing <meta name="description">');
    assert.ok(desc.length >= 60 && desc.length <= 320, `description should be 60–320 chars (is ${desc.length})`);
    assert.ok(/orchard/i.test(desc), 'description should name the project');
  });

  test(`${page.file}: declares where it canonically lives`, () => {
    assert.equal(link(src, 'canonical'), page.canonical);
  });

  test(`${page.file}: unfurls as a card`, () => {
    for (const prop of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:image:alt', 'og:site_name']) {
      assert.ok(meta(src, 'property', prop), `missing ${prop}`);
    }
    assert.equal(meta(src, 'property', 'og:url'), page.canonical, 'og:url must match the canonical URL');
    assert.equal(meta(src, 'name', 'twitter:card'), 'summary_large_image');
    for (const n of ['twitter:title', 'twitter:description', 'twitter:image']) {
      assert.ok(meta(src, 'name', n), `missing ${n}`);
    }
  });

  test(`${page.file}: card images are absolute and real brand assets`, () => {
    // A relative og:image silently produces a card with no picture.
    for (const [attr, name] of [['property', 'og:image'], ['name', 'twitter:image']]) {
      const v = meta(src, attr, name);
      assert.match(v, /^https:\/\//, `${name} must be an absolute https URL (got ${v})`);
      assert.match(v, /^https:\/\/theorchard\.network\//, `${name} should use the project's own hosted asset`);
    }
    // Declared dimensions must match the real banner (1942x809), or crops go wrong.
    assert.equal(meta(src, 'property', 'og:image:width'), '1942');
    assert.equal(meta(src, 'property', 'og:image:height'), '809');
  });

  test(`${page.file}: has a favicon and a theme colour`, () => {
    assert.equal(link(src, 'icon'), page.icon);
    assert.match(meta(src, 'name', 'theme-color') || '', /^#[0-9a-f]{6}$/i);
  });
}

test('the two favicon copies never drift apart', () => {
  // worldview/ deploys as its own site root, so it needs its own copy.
  const a = readFileSync(join(root, 'favicon.svg'), 'utf8');
  const b = readFileSync(join(root, 'worldview/favicon.svg'), 'utf8');
  assert.equal(a, b, 'worldview/favicon.svg has drifted from the root favicon.svg — copy it again');
  assert.match(a, /<svg[^>]*viewBox=/, 'favicon must be a real SVG with a viewBox so it scales');
});

test('each published page describes itself distinctly', () => {
  // Copy-pasted descriptions make three pages compete for the same search result.
  const descs = PAGES.map((p) => meta(html[p.file], 'name', 'description'));
  assert.equal(new Set(descs).size, descs.length, 'two pages share a description');
  const titles = PAGES.map((p) => (html[p.file].match(/<title>([^<]+)<\/title>/) || [])[1]);
  assert.equal(new Set(titles).size, titles.length, 'two pages share a title');
});

test('the prototype does not present itself as live data', () => {
  // It renders representative sample Trees; saying so is the anti-fabrication rule.
  const src = html['prototypes/globe-poc/index.html'];
  assert.match(meta(src, 'name', 'description'), /sample data|not live|proof-of-concept|prototype/i);
  assert.match(meta(src, 'property', 'og:description'), /worldview\.theorchard\.network/,
    'the prototype should point at the real-data globe');
});
