/* ============================================================
   Marlowe Hair Co. demo — round 4 mobile shell.
   Injects (below 900px, via CSS visibility):
   - topbar brand wordmark + hamburger (opens the More sheet)
   - fixed bottom nav: Dashboard, Calendar, Rescue, Front Desk + More
   - slide-up "More" sheet listing every page, grouped like the sidebar
   Static demo, no backend.
   ============================================================ */
(function () {
  "use strict";

  var PAGES = [
    { group: "Overview", items: [
      { href: "app-dashboard.html", label: "Dashboard" },
      { href: "app-ask.html", label: "Ask Marlowe" }
    ]},
    { group: "Front Desk", items: [
      { href: "app-calendar.html", label: "Calendar" },
      { href: "app-frontdesk.html", label: "AI Front Desk" },
      { href: "app-rescue.html", label: "Cancellation Rescue" }
    ]},
    { group: "Clients", items: [
      { href: "app-clients.html", label: "Clients" },
      { href: "app-rebooking.html", label: "Rebooking Radar" }
    ]},
    { group: "Money", items: [
      { href: "app-money.html", label: "Financials" },
      { href: "app-retail.html", label: "Retail and Backbar" },
      { href: "app-integrations.html", label: "Integrations" }
    ]}
  ];

  var TABS = [
    { href: "app-dashboard.html", label: "Dashboard",
      icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
    { href: "app-calendar.html", label: "Calendar",
      icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { href: "app-rescue.html", label: "Rescue",
      icon: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' },
    { href: "app-frontdesk.html", label: "Front Desk",
      icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' }
  ];

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  function here() {
    var p = location.pathname.split("/").pop() || "index.html";
    return p;
  }

  var sheet = null, sheetScrim = null;

  function buildSheet() {
    if (sheet) return;
    sheetScrim = document.createElement("div");
    sheetScrim.className = "msheet-scrim";
    sheet = document.createElement("div");
    sheet.className = "msheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "All pages");

    var h = '<div class="msheet-grab" aria-hidden="true"></div>' +
      '<div class="msheet-h"><span class="msheet-t">Marlowe <span>Hair Co.</span></span>' +
      '<button class="msheet-x" type="button" aria-label="Close menu">' +
      svg('<path d="M18 6L6 18M6 6l12 12"/>') + "</button></div>" +
      '<button class="msheet-new" type="button">+ New Appointment</button>';
    var cur = here();
    PAGES.forEach(function (g) {
      h += '<div class="msheet-g">' + g.group + "</div>";
      g.items.forEach(function (it) {
        h += '<a class="msheet-a' + (it.href === cur ? " on" : "") + '" href="' + it.href + '">' +
          it.label + (it.href === cur ? '<span class="now">Current</span>' : "") + "</a>";
      });
    });
    h += '<a class="msheet-out" href="index.html">Sign Out &middot; dana@marlowehair.co</a>';
    sheet.innerHTML = h;

    document.body.appendChild(sheetScrim);
    document.body.appendChild(sheet);
    sheetScrim.addEventListener("click", closeSheet);
    sheet.querySelector(".msheet-x").addEventListener("click", closeSheet);
    sheet.querySelector(".msheet-new").addEventListener("click", function () {
      closeSheet();
      // reuse the wired sidebar CTA so the same modal opens
      var b = document.querySelector(".side [data-new-appt]");
      if (b) b.click();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("on")) closeSheet();
    });
  }
  function openSheet() {
    buildSheet();
    sheetScrim.classList.add("on");
    sheet.classList.add("on");
    sheet.querySelector(".msheet-x").focus();
  }
  function closeSheet() {
    if (!sheet) return;
    sheetScrim.classList.remove("on");
    sheet.classList.remove("on");
  }

  function buildBottomNav() {
    var cur = here();
    var nav = document.createElement("nav");
    nav.className = "bnav";
    nav.setAttribute("aria-label", "Primary");
    var h = "";
    TABS.forEach(function (t) {
      h += '<a class="bi' + (t.href === cur ? " on" : "") + '" href="' + t.href + '"' +
        (t.href === cur ? ' aria-current="page"' : "") + ">" + svg(t.icon) +
        "<span>" + t.label + "</span></a>";
    });
    h += '<button class="bi" id="mnav-more" type="button" aria-haspopup="dialog">' +
      svg('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>') +
      "<span>More</span></button>";
    nav.innerHTML = h;
    document.body.appendChild(nav);
    nav.querySelector("#mnav-more").addEventListener("click", openSheet);
    // when the current page lives under More, mark the More tab active
    if (!TABS.some(function (t) { return t.href === cur; }) && cur.indexOf("app-") === 0) {
      nav.querySelector("#mnav-more").classList.add("on");
    }
  }

  function buildTopbarBits() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    var brand = document.createElement("a");
    brand.className = "m-brand";
    brand.href = "app-dashboard.html";
    brand.innerHTML = "Marlowe <span>Hair Co.</span>";
    bar.insertBefore(brand, bar.firstChild);
    var right = bar.querySelector(".topbar-right") || bar;
    var burger = document.createElement("button");
    burger.className = "m-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Open menu");
    burger.innerHTML = svg('<line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>');
    right.appendChild(burger);
    burger.addEventListener("click", openSheet);
  }

  function init() {
    if (!document.querySelector(".shell")) return; // landing page: skip
    buildTopbarBits();
    buildBottomNav();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
