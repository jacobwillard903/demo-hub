/* Ironworks demo - shared shell behavior.
   Round 3: welcome gate + motion (entrance stagger, KPI count-up, bar grow-in)
   + detail drawer drill-through + add-member modal + toasts + KPI deep-links.
   Zero backend; everything in-memory. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* ---------- toast ---------- */
  var toastWrap = null;
  function toast(msg) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-wrap";
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="tick">&#10003;</span><span>' + esc(msg) + "</span>";
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }
  window.iwToast = toast;

  /* ---------- first-visit welcome gate (session-gated) ---------- */
  function welcomeGate() {
    if (!document.body.hasAttribute("data-welcome")) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    var KEY = "iw_welcomed";
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) { return; }

    var root = document.createElement("div");
    root.className = "welcome-root";
    root.innerHTML =
      '<div class="welcome-card" role="dialog" aria-modal="true" aria-label="Welcome">' +
      '  <div class="wm-mark">IRONWORKS</div>' +
      '  <h3>This is the ops layer that runs while you coach.</h3>' +
      '  <p>Failed payments chased, leads answered in seconds, quiet members caught before they cancel. Want the 3 minute walkthrough?</p>' +
      '  <div class="wbtns">' +
      '    <button class="btn btn-ghost" data-w-skip type="button">Not now</button>' +
      '    <button class="btn btn-accent" data-w-tour type="button">Walk me through it</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(function () { root.classList.add("on"); });

    function close() {
      root.classList.remove("on");
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      setTimeout(function () { root.remove(); }, 220);
    }
    root.querySelector("[data-w-skip]").addEventListener("click", close);
    root.querySelector("[data-w-tour]").addEventListener("click", function () {
      close();
      if (window.Tour) setTimeout(function () { window.Tour.start(); }, 240);
    });
  }

  /* ---------- motion: staggered entrance ---------- */
  function entrance() {
    if (reduce) return;
    var els = qsa(".page .kpi, .page .chip, .page .card, .page .icard");
    els.forEach(function (el, idx) {
      el.classList.add("anim-in");
      setTimeout(function () { el.classList.add("go"); }, 40 + Math.min(idx, 14) * 65);
    });
  }

  /* ---------- motion: KPI count-up ---------- */
  function countUps() {
    if (reduce) return;
    qsa(".kpi .n").forEach(function (n) {
      var txt = n.textContent.trim();
      var m = txt.match(/^(\$?)([\d,]+(?:\.\d+)?)([^\d]*)$/);
      if (!m) return;
      var pre = m[1];
      var num = parseFloat(m[2].replace(/,/g, ""));
      var suf = m[3];
      var dec = (m[2].split(".")[1] || "").length;
      if (!isFinite(num)) return;
      var t0 = null, dur = 700;
      function fmt(v) {
        var parts = v.toFixed(dec).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return pre + parts.join(".") + suf;
      }
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        n.textContent = fmt(num * e);
        if (p < 1) requestAnimationFrame(tick);
        else n.textContent = txt;
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- motion: bars grow in ---------- */
  function growBars() {
    if (reduce) return;
    function grow(el, prop) {
      var v = el.style[prop];
      if (!v) return;
      el.style.transition = "none";
      el.style[prop] = "0%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "";
          el.style[prop] = v;
        });
      });
    }
    qsa(".bfill,.cfill").forEach(function (b) { grow(b, "height"); });
    qsa(".meter i").forEach(function (b) { grow(b, "width"); });
  }

  /* ---------- KPI deep-links ---------- */
  function wireLinks() {
    qsa("[data-link]").forEach(function (el) {
      el.setAttribute("role", "link");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", function () { location.href = el.getAttribute("data-link"); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") location.href = el.getAttribute("data-link");
      });
    });
  }

  /* ---------- detail drawer ---------- */
  var droot = null;
  function buildDrawer() {
    droot = document.createElement("div");
    droot.className = "drawer-root";
    droot.innerHTML =
      '<div class="drawer-mask" data-d-close></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Record detail">' +
      '  <div class="drawer-h"><div><h3></h3><div class="dsub"></div></div>' +
      '    <button class="drawer-x" data-d-close aria-label="Close" type="button">' +
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '    </button></div>' +
      '  <div class="drawer-b"></div>' +
      '  <div class="drawer-f"></div>' +
      '</aside>';
    document.body.appendChild(droot);
    qsa("[data-d-close]", droot).forEach(function (b) { b.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && droot.classList.contains("on")) closeDrawer();
    });
  }
  function closeDrawer() { if (droot) droot.classList.remove("on"); }
  function openDrawer(rec) {
    if (!droot) buildDrawer();
    qs(".drawer-h h3", droot).textContent = rec.title;
    qs(".drawer-h .dsub", droot).textContent = rec.sub || "";
    var b = "";
    if (rec.chip) b += '<div class="dsec"><span class="st ' + esc(rec.chip[1]) + '">' + esc(rec.chip[0]) + "</span></div>";
    if (rec.money) b += '<div class="dsec dmoney"><div class="mn">' + esc(rec.money[0]) + '</div><div class="ml">' + esc(rec.money[1]) + "</div></div>";
    if (rec.fields && rec.fields.length) {
      b += '<div class="dsec"><h4>Details</h4>';
      rec.fields.forEach(function (f) {
        b += '<div class="dfield"><span class="k">' + esc(f[0]) + '</span><span class="v">' + esc(f[1]) + "</span></div>";
      });
      b += "</div>";
    }
    if (rec.timeline && rec.timeline.length) {
      b += '<div class="dsec"><h4>AI touch timeline</h4><div class="timeline">';
      rec.timeline.forEach(function (t) {
        b += '<div class="tl-item ' + esc(t[0] || "") + '"><div class="tt">' + esc(t[1]) + "</div>" +
          (t[2] ? '<div class="ts">' + esc(t[2]) + "</div>" : "") +
          (t[3] ? '<div class="ttime">' + esc(t[3]) + "</div>" : "") + "</div>";
      });
      b += "</div></div>";
    }
    if (rec.note) b += '<div class="dsec dnote">' + esc(rec.note) + "</div>";
    qs(".drawer-b", droot).innerHTML = b;
    var f = "";
    (rec.actions || ["Open the full record", "Send a text"]).forEach(function (a, idx) {
      f += '<button class="btn ' + (idx === 0 ? "btn-accent" : "btn-ghost") + '" type="button" data-d-act>' + esc(a) + "</button>";
    });
    qs(".drawer-f", droot).innerHTML = f;
    qsa("[data-d-act]", droot).forEach(function (btn) {
      btn.addEventListener("click", function () { toast("Queued"); });
    });
    droot.classList.add("on");
    qs(".drawer-b", droot).scrollTop = 0;
  }

  function recFromEl(el) {
    var nameEl = qs("b", el) || qs(".ft", el) || qs(".rt", el) || qs(".kn", el) ||
      qs(".sc-n", el) || qs(".iname", el) || qs(".tt", el);
    var title = (nameEl ? nameEl.textContent : el.textContent).trim().replace(/\s+/g, " ").slice(0, 80);
    var bank = (window.IW && window.IW.records) || {};
    var low = (qs("b", el) ? qs("b", el).textContent : title).trim().toLowerCase();
    var rec = bank[low];
    if (!rec) {
      var full = el.textContent.toLowerCase();
      for (var k in bank) {
        if (full.indexOf(k) > -1) { rec = bank[k]; low = k; break; }
      }
    }
    if (rec) {
      var out = { title: qs("b", el) ? qs("b", el).textContent.trim() : titleCase(low) };
      for (var p in rec) out[p] = rec[p];
      return out;
    }
    var subEl = qs(".rs", el) || qs(".fs", el) || qs(".ks", el) || qs(".ikind", el) || qs(".sc-c", el) || qs(".cs", el) || qs(".ts", el);
    return {
      title: title,
      sub: subEl ? subEl.textContent.trim() : "",
      note: "This is the demo's short view. In the live system this opens the full record: history, messages, and billing.",
      actions: ["Open the full record", "Send a text"]
    };
  }
  function titleCase(s) {
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function wireDrawerEl(el) {
    if (el.classList.contains("empty")) return;
    el.addEventListener("click", function (e) {
      if (e.target.closest("a, button, input, select")) return;
      if (document.body.classList.contains("tour-on")) return;
      openDrawer(recFromEl(el));
    });
  }
  function wireDrawers() {
    qsa("tbody tr, .feed .frow, .rows .row, .kcard, .scell, .icard, .rev-row, .cev, .cpl-row").forEach(wireDrawerEl);
  }

  /* ---------- add-member modal ---------- */
  var mroot = null;
  function buildModal() {
    var today = new Date().toISOString().slice(0, 10);
    var tierOpts = "";
    ((window.IW && window.IW.tiers) || []).forEach(function (t) {
      var v = t.name + " $" + t.price;
      tierOpts += '<option value="' + esc(v) + '">' + esc(t.name + " $" + t.price + "/mo") + "</option>";
    });
    mroot = document.createElement("div");
    mroot.className = "modal-root";
    mroot.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Add member">' +
      '  <div class="modal-h"><h3>Add a member</h3>' +
      '  <div class="msub">Creates the member in PushPress and starts the 14-day welcome sequence.</div></div>' +
      '  <form class="modal-b">' +
      '    <div class="field"><label for="nm-name">Full name</label>' +
      '      <input id="nm-name" type="text" placeholder="e.g. Dana Whitmore" autocomplete="off"></div>' +
      '    <div class="field"><label for="nm-tier">Membership tier</label>' +
      '      <select id="nm-tier">' + tierOpts + "</select></div>" +
      '    <div class="fieldrow">' +
      '      <div class="field"><label for="nm-date">Start date</label>' +
      '        <input id="nm-date" type="date" value="' + today + '"></div>' +
      '      <div class="field"><label for="nm-src">Source</label>' +
      '        <select id="nm-src"><option>Walk-in</option><option>Instagram</option><option>Web form</option><option>Referral</option><option>Win-back</option></select></div>' +
      '    </div>' +
      '    <div class="modal-f">' +
      '      <button type="button" class="btn btn-ghost" data-m-close>Cancel</button>' +
      '      <button type="submit" class="btn btn-accent">Save member</button>' +
      '    </div>' +
      '  </form></div>';
    document.body.appendChild(mroot);
    mroot.addEventListener("click", function (e) { if (e.target === mroot) closeModal(); });
    qs("[data-m-close]", mroot).addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mroot.classList.contains("on")) closeModal();
    });
    qs("form", mroot).addEventListener("submit", function (e) {
      e.preventDefault();
      var name = qs("#nm-name", mroot).value.trim() || "New member";
      var tier = qs("#nm-tier", mroot).value;
      var src = qs("#nm-src", mroot).value;
      closeModal();
      addMemberRow(name, tier, src);
    });
  }
  function openModal() {
    if (!mroot) buildModal();
    mroot.classList.add("on");
    setTimeout(function () { qs("#nm-name", mroot).focus(); }, reduce ? 0 : 220);
  }
  function closeModal() { if (mroot) mroot.classList.remove("on"); }

  function addMemberRow(name, tier, src) {
    var roster = qs("#roster table tbody");
    if (roster) {
      var tr = document.createElement("tr");
      tr.className = "row-new";
      tr.innerHTML =
        "<td><b>" + esc(name) + '</b> <span class="st st-ink" style="margin-left:6px">New</span></td>' +
        "<td>" + esc(tier) + "</td>" +
        '<td><span class="st st-green">Active</span></td>' +
        "<td>Not set</td><td>Joined today</td>" +
        '<td class="num">0 mo</td><td class="num">$0</td>';
      roster.insertBefore(tr, roster.firstChild);
      wireDrawerEl(tr);
      toast(name + " added to the roster");
      tr.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      return;
    }
    var joined = null;
    qsa(".kcol").forEach(function (c) {
      var t = qs(".kt", c);
      if (t && /joined/i.test(t.textContent)) joined = c;
    });
    if (joined) {
      var kc = document.createElement("div");
      kc.className = "kcard row-new";
      kc.innerHTML =
        '<div class="kn">' + esc(name) + "</div>" +
        '<div class="ks">' + esc(tier) + " &middot; added by you, via " + esc(src) + "</div>" +
        '<div class="ktouch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Welcome sequence started</div>';
      joined.insertBefore(kc, qs(".kcard", joined));
      wireDrawerEl(kc);
      toast(name + " added, welcome sequence started");
      return;
    }
    toast(name + " added to the roster");
  }

  /* ---------- round 4: wide tables scroll inside their card ---------- */
  function wrapTables() {
    qsa("table").forEach(function (t) {
      if (t.closest(".tblwrap, .schedwrap")) return;
      var w = document.createElement("div");
      w.className = "tblwrap";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  /* ---------- round 4: mobile chrome (bottom nav + More sheet + topbar brand) ---------- */
  var ICONS = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    ask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    members: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    risk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    sched: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    integ: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    pay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };
  var NAV_GROUPS = [
    { label: "Overview", items: [["app-dashboard.html", "Dashboard", "dash"], ["app-ask.html", "Ask", "ask"]] },
    { label: "Members", items: [["app-members.html", "Members", "members"], ["app-leads.html", "Lead Concierge", "leads"], ["app-retention.html", "At-Risk Radar", "risk"]] },
    { label: "Operations", items: [["app-schedule.html", "Schedule & Classes", "sched"], ["app-integrations.html", "Integrations", "integ"]] },
    { label: "Money", items: [["app-money.html", "Financials", "money"], ["app-payments.html", "Payment Recovery", "pay"]] }
  ];
  var BOTTOM_TABS = [
    ["app-dashboard.html", "Dashboard", "dash"],
    ["app-payments.html", "Recovery", "pay"],
    ["app-retention.html", "At-Risk", "risk"],
    ["app-money.html", "Money", "money"]
  ];
  function here() { return (location.pathname.split("/").pop() || "app-dashboard.html"); }

  var sheetRoot = null;
  function closeSheet() { if (sheetRoot) sheetRoot.classList.remove("on"); }
  function openSheet() { if (sheetRoot) sheetRoot.classList.add("on"); }
  function buildSheet() {
    var page = here();
    var h = '<div class="sheet-mask" data-s-close></div><div class="sheet" role="dialog" aria-modal="true" aria-label="All pages"><div class="sheet-grab"></div>';
    NAV_GROUPS.forEach(function (g) {
      h += '<div class="sheet-group"><div class="sheet-group-label">' + g.label + "</div>";
      g.items.forEach(function (it) {
        h += '<a href="' + it[0] + '"' + (it[0] === page ? ' class="on" aria-current="page"' : "") + ">" +
          ICONS[it[2]] + esc(it[1]) + '<span class="chev">&#8250;</span></a>';
      });
      h += "</div>";
    });
    h += '<div class="sheet-group"><a href="index.html">' + ICONS.out + 'Sign Out<span class="chev">&#8250;</span></a></div>';
    h += '<div class="sheet-actions"><button class="btn btn-accent" type="button" data-new-member>+ Add Member</button></div></div>';
    sheetRoot = document.createElement("div");
    sheetRoot.className = "sheet-root";
    sheetRoot.innerHTML = h;
    document.body.appendChild(sheetRoot);
    qs("[data-s-close]", sheetRoot).addEventListener("click", closeSheet);
    qs("[data-new-member]", sheetRoot).addEventListener("click", function () { closeSheet(); openModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheetRoot.classList.contains("on")) closeSheet();
    });
  }

  function mobileChrome() {
    var topbar = qs(".shell .topbar");
    if (!topbar) return; // landing page: no app shell
    var page = here();

    // topbar: brand wordmark (left) + hamburger (right)
    var brand = document.createElement("div");
    brand.className = "tb-brand";
    brand.textContent = "IRONWORKS";
    topbar.insertBefore(brand, topbar.firstChild);
    var burger = document.createElement("button");
    burger.type = "button";
    burger.className = "tb-menu";
    burger.setAttribute("aria-label", "All pages");
    burger.innerHTML = ICONS.burger;
    var right = qs(".topbar-right", topbar) || topbar;
    right.appendChild(burger);

    // bottom nav
    var bn = document.createElement("nav");
    bn.className = "bottomnav";
    bn.setAttribute("aria-label", "Primary");
    var h = "";
    BOTTOM_TABS.forEach(function (t) {
      h += '<a href="' + t[0] + '"' + (t[0] === page ? ' class="on" aria-current="page"' : "") + ">" + ICONS[t[2]] + "<span>" + esc(t[1]) + "</span></a>";
    });
    var moreOn = !BOTTOM_TABS.some(function (t) { return t[0] === page; });
    h += '<button type="button" id="bn-more"' + (moreOn ? ' class="on"' : "") + ">" + ICONS.more + "<span>More</span></button>";
    bn.innerHTML = h;
    document.body.appendChild(bn);

    buildSheet();
    qs("#bn-more", bn).addEventListener("click", openSheet);
    burger.addEventListener("click", openSheet);
  }

  /* ---------- init ---------- */
  function init() {
    wrapTables();
    mobileChrome();
    welcomeGate();
    entrance();
    countUps();
    growBars();
    wireLinks();
    wireDrawers();
    qsa("[data-new-member]").forEach(function (b) { b.addEventListener("click", openModal); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
