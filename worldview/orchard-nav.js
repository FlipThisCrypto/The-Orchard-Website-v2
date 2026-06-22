/* The Orchard — shared navigation + brand chrome.
 * Single source of truth for cross-page nav + look. Drop into ANY Orchard page with:
 *   <script src="https://<host>/orchard-nav.js"></script>
 * Pair it with the shared wallet widget (renders into the [data-orchard-connect] slot this injects):
 *   <script src="https://oracle.theorchard.network/connect.js"></script>
 * Edit LINKS once and every page that includes this file updates. Self-contained, no deps.
 */
(function () {
  if (window.__orchardNav) return;
  window.__orchardNav = true;

  // The canonical page list. Add/remove here → propagates everywhere.
  var LINKS = [
    { label: "Home",       href: "https://theorchard.network/" },
    { label: "Worldview",  href: "https://worldview.theorchard.network/" },
    { label: "Live Trees", href: "https://view.theorchard.network/" },
    { label: "Flash",      href: "https://flash.theorchard.network/" },
    { label: "Claim",      href: "https://oracle.theorchard.network/claim" },
    { label: "$JUICE",     href: "https://theorchard.network/#juice" }
  ];
  var MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#070b09"/><g stroke="#34c96a" stroke-width="2" stroke-linecap="round" fill="none"><path d="M16 29 L16 17 M16 17 L10 12 M16 17 L22 12 M16 17 L16 9"/></g><g fill="#ff9f2e"><circle cx="10" cy="12" r="2.6"/><circle cx="22" cy="12" r="2.6"/><circle cx="16" cy="9" r="2.8"/></g></svg>';
  var GH = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
  var X = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.6h3.5l-7.6 8.7L23.8 22h-7l-5.5-7.2L4.9 22H1.4l8.1-9.3L1 1.6h7.2l5 6.6 5.7-6.6zm-1.2 18.3h1.9L7.1 3.6H5l12.7 16.3z"/></svg>';

  var css =
    '.orchard-nav{position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;gap:12px;height:52px;padding:0 14px;' +
    'font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
    'background:linear-gradient(180deg,rgba(7,11,9,.93),rgba(7,11,9,.64));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);' +
    'border-bottom:1px solid rgba(120,230,200,.18)}' +
    '.orchard-nav,.orchard-nav *{box-sizing:border-box}' +
    '.onav-brand{display:flex;align-items:center;gap:8px;color:#ecfbf3;text-decoration:none;font-weight:800;letter-spacing:-.01em;font-size:15px;flex:0 0 auto}' +
    '.onav-brand svg{width:24px;height:24px;display:block;border-radius:6px;box-shadow:0 0 0 1px rgba(120,230,200,.25)}' +
    '.onav-brand .tld{color:#76907f;font-weight:600}' +
    '.onav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;flex:1 1 auto;scrollbar-width:none}' +
    '.onav-links::-webkit-scrollbar{display:none}' +
    '.onav-links a{color:#a3bcb0;text-decoration:none;font-size:13.5px;font-weight:600;padding:7px 11px;border-radius:9px;white-space:nowrap}' +
    '.onav-links a:hover{color:#ecfbf3;background:rgba(255,255,255,.05)}' +
    '.onav-links a.on{color:#ecfbf3;background:linear-gradient(180deg,rgba(120,230,200,.14),rgba(120,230,200,.05));box-shadow:inset 0 -2px 0 0 #46e08a}' +
    '.onav-right{display:flex;align-items:center;gap:8px;flex:0 0 auto}' +
    '.onav-ic{display:inline-flex;color:#a3bcb0}.onav-ic:hover{color:#ecfbf3}.onav-ic svg{width:17px;height:17px}' +
    'body{padding-top:52px}' +
    '@media (max-width:560px){.onav-brand .name{display:none}}';

  function activeHost(href) {
    try { var u = new URL(href);
      if (location.host !== u.host) return false;
      if (u.pathname === "/" || u.pathname === "") return location.pathname === "/" || location.pathname === "";
      return location.pathname.indexOf(u.pathname) === 0;
    } catch (e) { return false; }
  }

  function go() {
    var style = document.createElement("style");
    style.id = "orchard-nav-style";
    style.textContent = css;
    document.head.appendChild(style);

    var links = LINKS.map(function (l) {
      return '<a href="' + l.href + '"' + (activeHost(l.href) ? ' class="on" aria-current="page"' : "") + '>' + l.label + "</a>";
    }).join("");

    var nav = document.createElement("header");
    nav.className = "orchard-nav";
    nav.innerHTML =
      '<a class="onav-brand" href="https://theorchard.network/" aria-label="The Orchard home">' + MARK +
        '<span class="name">The Orchard<span class="tld">.network</span></span></a>' +
      '<nav class="onav-links" aria-label="Orchard pages">' + links + "</nav>" +
      '<div class="onav-right">' +
        '<a class="onav-ic" href="https://github.com/FlipThisCrypto/the-orchard" target="_blank" rel="noopener" aria-label="GitHub">' + GH + "</a>" +
        '<a class="onav-ic" href="https://x.com/FiendStudios" target="_blank" rel="noopener" aria-label="The Orchard on X">' + X + "</a>" +
        '<span data-orchard-connect></span>' +
      "</div>";
    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState !== "loading") go();
  else document.addEventListener("DOMContentLoaded", go);
})();
