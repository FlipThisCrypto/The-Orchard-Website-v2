// A structural contract every published page must satisfy.
//
// These same fixes were hand-applied to three pages in three separate
// iterations, and the pages were still inconsistent afterwards — because each
// was found by auditing one page at a time, which is how the drift started.
// Everything here is mechanically checkable from the HTML, so it belongs in a
// test rather than in my memory.
// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  { file: 'worldview/index.html', hasNav: true, hasCanvas: true },
  { file: 'dashboard/index.html', hasNav: false, hasCanvas: false },
  { file: 'prototypes/globe-poc/index.html', hasNav: false, hasCanvas: true },
];

const src = Object.fromEntries(PAGES.map((p) => [p.file, readFileSync(join(root, p.file), 'utf8')]));

/** Heading levels in document order, ignoring anything inside an inert dialog. */
function outline(html) {
  // Strip inert containers: their headings are not part of the visible outline.
  const visible = html.replace(/<(div|section)\b[^>]*\binert\b[^>]*>[\s\S]*?<\/\1>/g, '');
  return [...visible.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
}

for (const page of PAGES) {
  const html = src[page.file];

  test(`${page.file}: has exactly one top-level heading`, () => {
    const h1s = (html.match(/<h1\b/g) || []).length;
    assert.equal(h1s, 1, `found ${h1s} <h1> elements — a page has one title`);
  });

  test(`${page.file}: heading levels never skip`, () => {
    const levels = outline(html);
    assert.ok(levels.length > 0, 'a page with no headings has no structure');
    assert.equal(levels[0], 1, `the outline should open at h1, opened at h${levels[0]}`);
    let deepest = levels[0];
    for (const l of levels) {
      assert.ok(l <= deepest + 1, `jumped from h${deepest} to h${l} — screen readers read that as a missing section`);
      deepest = Math.max(deepest, l);
    }
  });

  test(`${page.file}: has a main landmark`, () => {
    assert.match(html, /<main[\s>]/, 'no <main> — there is no way to jump to the content');
    assert.equal((html.match(/<main[\s>]/g) || []).length, 1, 'exactly one main landmark');
    assert.match(html, /<\/main>/);
  });

  if (page.hasCanvas) {
    test(`${page.file}: the globe canvas is marked decorative`, () => {
      // Everything the canvas shows is available as text in the Tree list, so
      // announcing it as an empty graphics region is noise.
      assert.match(html, /id="globe"[^>]*aria-hidden="true"/,
        'the globe container should be aria-hidden — its content is duplicated as text');
    });
  }

  if (page.hasNav) {
    test(`${page.file}: a skip link precedes the navigation`, () => {
      const skipAt = html.indexOf('class="skip"');
      const navAt = html.search(/<nav[\s>]|class="on-nav"/);
      assert.ok(skipAt > -1, 'no skip link, but this page has a nav before its content');
      assert.ok(skipAt < navAt, 'the skip link must come before the nav it skips');
      assert.match(html, /<a class="skip" href="#([\w-]+)"/);
      const target = html.match(/<a class="skip" href="#([\w-]+)"/)[1];
      assert.ok(html.includes(`id="${target}"`), `skip link points at #${target}, which does not exist`);
    });
  }
}

test('every page that renders a canvas also offers the same data as text', () => {
  // The rule behind aria-hidden on the canvas: it is only decorative because
  // something else carries the information.
  for (const page of PAGES.filter((p) => p.hasCanvas)) {
    assert.match(src[page.file], /id="tl-items"/,
      `${page.file} hides its canvas from assistive tech but has no Tree list to replace it`);
  }
});
