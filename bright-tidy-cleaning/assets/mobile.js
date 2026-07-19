/* ============================================================
   Bright & Tidy demo, mobile chrome.
   Injects (below 900px, via CSS media queries):
     - topbar wordmark + hamburger
     - fixed bottom nav (Dashboard, Route Gaps, Front Desk,
       Crew Board, More)
     - "More" slide-up sheet with every remaining page, the
       New Booking CTA, and sign out
   Also wraps wide data tables in a .tscroll so they scroll
   inside their card instead of the page.
   ============================================================ */
(function () {
  "use strict";

  var ICONS = {
    dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    gaps: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>',
    frontdesk: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    crews: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    ask: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    integrations: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    retention: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    money: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    burger: '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
  };

  var TABS = [
    { href: "app-dashboard.html", label: "Dashboard", icon: "dashboard" },
    { href: "app-gaps.html", label: "Route Gaps", icon: "gaps" },
    { href: "app-frontdesk.html", label: "Front Desk", icon: "frontdesk" },
    { href: "app-crews.html", label: "Crew Board", icon: "crews" }
  ];

  var SHEET = [
    { label: "Overview", items: [
      { href: "app-ask.html", label: "Ask", icon: "ask" },
      { href: "app-integrations.html", label: "Integrations", icon: "integrations" }
    ]},
    { label: "Clients", items: [
      { href: "app-retention.html", label: "Churn Radar & Payments", icon: "retention" }
    ]},
    { label: "Money", items: [
      { href: "app-money.html", label: "Financials", icon: "money" }
    ]}
  ];

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }

  function init() {
    var topbar = document.querySelector(".topbar");
    if (!topbar) return; // landing page: no app chrome
    var page = currentPage();

    // ---- topbar: wordmark + hamburger ----------------------------
    var brand = document.createElement("div");
    brand.className = "m-brand";
    brand.innerHTML = "BRIGHT <span>&amp; TIDY</span>";
    topbar.insertBefore(brand, topbar.firstChild);

    var burger = document.createElement("button");
    burger.type = "button";
    burger.className = "bnav-burger";
    burger.setAttribute("aria-label", "Open menu");
    burger.innerHTML = ICONS.burger;
    var right = topbar.querySelector(".top-right") || topbar;
    right.appendChild(burger);

    // ---- bottom nav ----------------------------------------------
    var inSheet = SHEET.some(function (g) {
      return g.items.some(function (it) { return it.href === page; });
    });
    var nav = document.createElement("nav");
    nav.className = "bnav";
    nav.setAttribute("aria-label", "Primary");
    var html = "";
    TABS.forEach(function (t) {
      html += '<a class="bn-item' + (t.href === page ? " active" : "") + '" href="' + t.href + '">' +
        ICONS[t.icon] + "<span>" + t.label + "</span></a>";
    });
    html += '<button type="button" id="bnav-more" class="bn-item' + (inSheet ? " active" : "") + '">' +
      ICONS.more + "<span>More</span></button>";
    nav.innerHTML = html;
    document.body.appendChild(nav);

    // ---- More sheet ----------------------------------------------
    var sheet = document.createElement("div");
    sheet.className = "bsheet";
    var sh = '<div class="bsheet-mask"></div><div class="bsheet-panel" role="dialog" aria-modal="true" aria-label="All pages">' +
      '<div class="bsheet-grab"></div>' +
      '<button type="button" class="bs-cta">+ New Booking</button>';
    SHEET.forEach(function (g) {
      sh += '<div class="bs-group-label">' + g.label + "</div>";
      g.items.forEach(function (it) {
        sh += '<a class="bs-link' + (it.href === page ? " active" : "") + '" href="' + it.href + '">' +
          ICONS[it.icon] + it.label + "</a>";
      });
    });
    sh += '<div class="bs-foot"><div class="who">melissa@brightandtidykc.com</div>' +
      '<a class="bs-link" href="index.html">' + ICONS.out + "Sign Out</a></div></div>";
    sheet.innerHTML = sh;
    document.body.appendChild(sheet);

    function openSheet() { sheet.classList.add("on"); }
    function closeSheet() { sheet.classList.remove("on"); }
    burger.addEventListener("click", openSheet);
    nav.querySelector("#bnav-more").addEventListener("click", openSheet);
    sheet.querySelector(".bsheet-mask").addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("on")) closeSheet();
    });
    sheet.querySelector(".bs-cta").addEventListener("click", function () {
      closeSheet();
      var b = document.querySelector(".side-cta button");
      if (b) b.click(); // interact.js opens the New Booking modal
    });

    // ---- wide tables scroll inside their card --------------------
    document.querySelectorAll(".dtable").forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains("tscroll")) return;
      var w = document.createElement("div");
      w.className = "tscroll";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
