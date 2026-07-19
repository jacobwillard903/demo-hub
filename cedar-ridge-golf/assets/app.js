/* Cedar Ridge demo shell script: heatmap render, revenue bars, welcome gate. */
(function () {
  "use strict";
  var D = window.CRGC || {};

  function bucketColor(v) {
    var b = D.heatBuckets || [];
    for (var i = 0; i < b.length; i++) if (v >= b[i].min) return b[i].color;
    return "#b85c43";
  }

  function renderHeatmaps() {
    document.querySelectorAll("[data-heatmap]").forEach(function (host) {
      if (!D.heat) return;
      var days = Object.keys(D.heat);
      var html = '<table class="heatmap"><thead><tr><th></th>';
      D.heatHours.forEach(function (h) { html += "<th>" + h + "</th>"; });
      html += "</tr></thead><tbody>";
      days.forEach(function (day) {
        html += '<tr><td class="hm-day">' + day + "</td>";
        D.heat[day].forEach(function (v, idx) {
          html += '<td><div class="hm-cell" style="background:' + bucketColor(v) +
            '" data-tip="' + day + " " + D.heatHours[idx] + ", " + v + '% booked"></div></td>';
        });
        html += "</tr>";
      });
      html += "</tbody></table>";
      html += '<div class="hm-legend">';
      (D.heatBuckets || []).forEach(function (b) {
        html += '<span><span class="sw" style="background:' + b.color + '"></span>' + b.label + "</span>";
      });
      html += "</div>";
      host.innerHTML = html;
    });
  }

  function renderRevenueBars() {
    var host = document.querySelector("[data-revbars]");
    if (!host || !D.revenueWeek) return;
    var max = 0;
    D.revenueWeek.forEach(function (d) { if (d.amt > max) max = d.amt; });
    var html = '<div class="barchart">';
    D.revenueWeek.forEach(function (d) {
      var pct = Math.round((d.amt / max) * 100);
      var cls = d.amt === max ? "bar hi" : (d.amt < max * 0.5 ? "bar lo" : "bar");
      html += '<div class="bar-col">' +
        '<span class="bar-val">$' + (d.amt / 1000).toFixed(1) + "k</span>" +
        '<div class="' + cls + '" style="height:' + pct + '%"></div>' +
        '<span class="bar-lab">' + d.day + "</span></div>";
    });
    html += "</div>";
    host.innerHTML = html;
  }

  function welcomeGate() {
    if (!document.body.hasAttribute("data-welcome")) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    try { if (sessionStorage.getItem("crgc_welcome_seen")) return; } catch (e) {}
    var root = document.createElement("div");
    root.className = "welcome-root";
    root.innerHTML =
      '<div class="welcome-card" role="dialog" aria-modal="true" aria-label="Welcome">' +
      "<h3>Welcome to Cedar Ridge</h3>" +
      "<p>This is the ops layer running on top of the foreUP tee sheet. " +
      "Take the 2 minute walkthrough to see the phone agent, the no-show shield, " +
      "rain day handling, and outing quotes, in the order a GM feels the pain.</p>" +
      '<div class="welcome-btns">' +
      '<button class="btn btn-ghost" data-w-skip>Look around on my own</button>' +
      '<button class="btn btn-accent" data-w-start>Walk me through it</button>' +
      "</div></div>";
    document.body.appendChild(root);
    requestAnimationFrame(function () { root.classList.add("on"); });
    function close() {
      root.classList.remove("on");
      try { sessionStorage.setItem("crgc_welcome_seen", "1"); } catch (e) {}
      setTimeout(function () { root.remove(); }, 220);
    }
    root.querySelector("[data-w-skip]").addEventListener("click", close);
    root.querySelector("[data-w-start]").addEventListener("click", function () {
      close();
      if (window.Tour) setTimeout(window.Tour.start, 240);
    });
  }

  /* ---------------- Round 4: mobile chrome ---------------- */
  var BN_TABS = [
    { href: "app-dashboard.html", label: "Dashboard" },
    { href: "app-phone.html", label: "Phone" },
    { href: "app-teesheet.html", label: "Tee Sheet" },
    { href: "app-money.html", label: "Money" }
  ];

  function mobileChrome() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var here = (location.pathname.split("/").pop() || "app-dashboard.html");

    function iconFor(href) {
      var a = sidebar.querySelector('.nav-item[href="' + href + '"]');
      var svg = a && a.querySelector("svg");
      return svg ? svg.outerHTML : "";
    }

    /* topbar: wordmark + hamburger (visible below 900px only) */
    var topbar = document.querySelector(".topbar");
    if (topbar) {
      var wm = document.createElement("div");
      wm.className = "m-wordmark";
      wm.textContent = "CEDAR RIDGE";
      topbar.insertBefore(wm, topbar.firstChild);
      var right = topbar.querySelector(".topbar-right") || topbar;
      var burger = document.createElement("button");
      burger.className = "hamburger";
      burger.type = "button";
      burger.setAttribute("aria-label", "Menu");
      burger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
      burger.addEventListener("click", function () { openSheet(); });
      right.appendChild(burger);
    }

    /* bottom nav */
    var promoted = BN_TABS.map(function (t) { return t.href; });
    var nav = document.createElement("nav");
    nav.className = "bottomnav";
    nav.setAttribute("aria-label", "Primary");
    var html = "";
    BN_TABS.forEach(function (t) {
      html += '<a class="bn-item' + (here === t.href ? " active" : "") + '" href="' + t.href + '">' +
        iconFor(t.href) + "<span>" + t.label + "</span></a>";
    });
    html += '<button class="bn-item' + (promoted.indexOf(here) === -1 ? " active" : "") + '" type="button" data-more-open>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>' +
      "<span>More</span></button>";
    nav.innerHTML = html;
    document.body.appendChild(nav);

    /* More sheet: every remaining page, grouped like the sidebar */
    var sheetRoot = document.createElement("div");
    sheetRoot.className = "sheet-root";
    var groups = "";
    sidebar.querySelectorAll(".nav-group").forEach(function (g) {
      var items = "";
      g.querySelectorAll(".nav-item").forEach(function (a) {
        var href = a.getAttribute("href");
        if (promoted.indexOf(href) > -1) return;
        items += '<a class="nav-item' + (href === here ? " active" : "") + '" href="' + href + '">' +
          (a.querySelector("svg") ? a.querySelector("svg").outerHTML : "") + a.textContent.trim() + "</a>";
      });
      if (!items) return;
      var lab = g.querySelector(".nav-label");
      groups += (lab ? '<div class="nav-label">' + lab.textContent + "</div>" : "") + items;
    });
    sheetRoot.innerHTML =
      '<div class="sheet-mask" data-sheet-close></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="All pages">' +
      '  <div class="sheet-head"><span class="s-title">Cedar Ridge</span>' +
      '  <button class="sheet-x" type="button" data-sheet-close aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '  <button class="side-cta" type="button" data-new-booking data-sheet-close>+ New Booking</button>' +
      groups +
      '  <a class="nav-item" href="index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>Sign Out</a>' +
      "</div>";
    document.body.appendChild(sheetRoot);

    function openSheet() {
      sheetRoot.classList.add("on");
      document.addEventListener("keydown", escSheet);
    }
    function closeSheet() {
      sheetRoot.classList.remove("on");
      document.removeEventListener("keydown", escSheet);
    }
    function escSheet(e) { if (e.key === "Escape") closeSheet(); }
    sheetRoot.querySelectorAll("[data-sheet-close]").forEach(function (b) {
      b.addEventListener("click", closeSheet);
    });
    nav.querySelector("[data-more-open]").addEventListener("click", openSheet);
  }

  /* wide tables scroll inside their card, never the page */
  function wrapTables() {
    document.querySelectorAll(".table").forEach(function (t) {
      if (t.closest(".heatmap") || t.parentElement.classList.contains("table-scroll")) return;
      var w = document.createElement("div");
      w.className = "table-scroll";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function init() {
    renderHeatmaps();
    renderRevenueBars();
    mobileChrome();
    wrapTables();
    welcomeGate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
