/* Bluebird Moving Co. demo - shell behavior (no backend). */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ---------- mobile bottom nav + More sheet ----------
  var NAV_ICONS = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    quotes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    ask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    integ: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'
  };

  function buildMobileNav() {
    if (!document.body.classList.contains("app")) return;
    var here = (location.pathname.split("/").pop() || "app-dashboard.html");
    function on(href) { return here === href ? " on" : ""; }

    // topbar: brand wordmark + hamburger (CSS shows them below 900px only)
    var topbar = document.querySelector(".topbar");
    if (topbar) {
      var brand = document.createElement("a");
      brand.className = "m-brand";
      brand.href = "app-dashboard.html";
      brand.innerHTML = 'BLUEBIRD<span class="tick">.</span>';
      topbar.insertBefore(brand, topbar.firstChild);
      var right = topbar.querySelector(".topbar-right");
      if (right) {
        var hamb = document.createElement("button");
        hamb.className = "hamb";
        hamb.type = "button";
        hamb.setAttribute("aria-label", "All pages");
        hamb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
        hamb.addEventListener("click", function () { toggleSheet(true); });
        right.appendChild(hamb);
      }
    }

    // bottom nav: the 4 pages that sell + More
    var bnav = document.createElement("nav");
    bnav.className = "bnav";
    bnav.setAttribute("aria-label", "Primary");
    bnav.innerHTML =
      '<a class="bnav-item' + on("app-dashboard.html") + '" href="app-dashboard.html">' + NAV_ICONS.dash + "Dashboard</a>" +
      '<a class="bnav-item' + on("app-phone.html") + '" href="app-phone.html">' + NAV_ICONS.phone + "Phone</a>" +
      '<a class="bnav-item' + on("app-quotes.html") + '" href="app-quotes.html">' + NAV_ICONS.quotes + "Quotes</a>" +
      '<a class="bnav-item' + on("app-dispatch.html") + '" href="app-dispatch.html">' + NAV_ICONS.truck + "Dispatch</a>" +
      '<button class="bnav-more' + (on("app-ask.html") || on("app-money.html") || on("app-integrations.html") ? " on" : "") + '" type="button">' + NAV_ICONS.more + "More</button>";
    document.body.appendChild(bnav);
    bnav.querySelector(".bnav-more").addEventListener("click", function () { toggleSheet(); });

    // More sheet: every remaining page, grouped like the sidebar
    var sheetRoot = document.createElement("div");
    sheetRoot.className = "sheet-root";
    sheetRoot.innerHTML =
      '<div class="sheet-scrim"></div>' +
      '<div class="sheet" role="dialog" aria-label="All pages">' +
      '  <div class="sheet-grab"></div>' +
      '  <button class="sheet-cta" type="button" data-new-quote>+ New Quote / Booking</button>' +
      '  <div class="sheet-label">Overview</div>' +
      '  <a class="' + on("app-dashboard.html").trim() + '" href="app-dashboard.html">' + NAV_ICONS.dash + "Dashboard</a>" +
      '  <a class="' + on("app-ask.html").trim() + '" href="app-ask.html">' + NAV_ICONS.ask + "Ask</a>" +
      '  <div class="sheet-label">Front Office</div>' +
      '  <a class="' + on("app-phone.html").trim() + '" href="app-phone.html">' + NAV_ICONS.phone + "AI Receptionist</a>" +
      '  <a class="' + on("app-quotes.html").trim() + '" href="app-quotes.html">' + NAV_ICONS.quotes + "Quote Pipeline</a>" +
      '  <div class="sheet-label">Operations</div>' +
      '  <a class="' + on("app-dispatch.html").trim() + '" href="app-dispatch.html">' + NAV_ICONS.truck + "Dispatch Board</a>" +
      '  <a class="dim-link" href="#">' + NAV_ICONS.doc + "Trucks</a>" +
      '  <a class="dim-link" href="#">' + NAV_ICONS.doc + "Crew</a>" +
      '  <a class="dim-link" href="#">' + NAV_ICONS.doc + "Calendar</a>" +
      '  <div class="sheet-label">Money</div>' +
      '  <a class="' + on("app-money.html").trim() + '" href="app-money.html">' + NAV_ICONS.money + "Financials</a>" +
      '  <a class="' + on("app-integrations.html").trim() + '" href="app-integrations.html">' + NAV_ICONS.integ + "Integrations</a>" +
      '  <div class="sheet-label">Back Office</div>' +
      '  <a class="dim-link" href="#">' + NAV_ICONS.doc + "Invoices</a>" +
      '  <a class="dim-link" href="#">' + NAV_ICONS.doc + "Claims</a>" +
      '  <div class="sheet-foot"><div class="email">tony@bluebirdmoving.com</div><a href="#">Sign Out</a></div>' +
      "</div>";
    document.body.appendChild(sheetRoot);
    sheetRoot.querySelector(".sheet-scrim").addEventListener("click", function () { toggleSheet(false); });
    sheetRoot.querySelector(".sheet-cta").addEventListener("click", function () { toggleSheet(false); });
    sheetRoot.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggleSheet(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheetRoot.classList.contains("on")) toggleSheet(false);
    });

    function toggleSheet(force) {
      var want = typeof force === "boolean" ? force : !sheetRoot.classList.contains("on");
      sheetRoot.classList.toggle("on", want);
    }
  }

  ready(function () {
    buildMobileNav();

    // Decorative nav items (not built in this demo) stay put.
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });

    // Topbar tour switch drives the walkthrough.
    var sw = document.querySelector("#tour-switch");
    if (sw) {
      sw.addEventListener("change", function () {
        if (!window.Tour) { sw.checked = false; return; }
        if (sw.checked) window.Tour.start();
        else window.Tour.end();
      });
    }

    // First-visit welcome gate on the dashboard (session-gated).
    var wantsWelcome = document.body.hasAttribute("data-welcome");
    var resuming = /[?&]tour=(1|go)\b/.test(location.search);
    var seen = false;
    try { seen = sessionStorage.getItem("bb_welcome") === "1"; } catch (e) {}
    if (wantsWelcome && !resuming && !seen) {
      try { sessionStorage.setItem("bb_welcome", "1"); } catch (e) {}
      var root = document.createElement("div");
      root.className = "welcome-root";
      root.innerHTML =
        '<div class="welcome-card" role="dialog" aria-label="Welcome">' +
        "  <h3>Welcome to Bluebird's AI office</h3>" +
        "  <p>This is the moving company with an AI receptionist answering every call, quoting off the cube sheet, chasing deposits, and confirming crews. Want the 3 minute walkthrough?</p>" +
        '  <div class="welcome-actions">' +
        '    <button class="go" type="button">Walk Me Through It</button>' +
        '    <button class="later" type="button">Maybe later</button>' +
        "  </div>" +
        "</div>";
      document.body.appendChild(root);
      root.querySelector(".go").addEventListener("click", function () {
        root.remove();
        if (window.Tour) window.Tour.start();
      });
      root.querySelector(".later").addEventListener("click", function () { root.remove(); });
    }
  });
})();
