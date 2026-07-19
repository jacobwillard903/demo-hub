/* Summit demo shell behaviors. Static demo, no backend. */
(function () {
  "use strict";

  var REDUCE = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var PAGE = (location.pathname.split("/").pop() || "app-dashboard.html").replace(".html", "") || "app-dashboard";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- live AI text feed (trials page) ----
  var feedHost = document.getElementById("ai-feed-list");
  if (feedHost && window.SUMMIT && window.SUMMIT.aiFeed) {
    function stamp(minsAgo) {
      var d = new Date(Date.now() - minsAgo * 60000);
      var h = d.getHours(), m = d.getMinutes();
      var ap = h >= 12 ? "PM" : "AM";
      h = h % 12; if (h === 0) h = 12;
      return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
    }
    var html = "";
    window.SUMMIT.aiFeed.forEach(function (t) {
      html += '<div class="f-item">' +
        '<div class="f-meta"><span class="dot info"></span><b>' + t.who + '</b>' +
        '<span class="f-tag">' + t.tag + '</span><span class="t">' + stamp(t.minsAgo) + '</span></div>';
      t.msgs.forEach(function (m) {
        var cls = m.from === "ai" ? "bubble ai" : "bubble reply";
        html += '<div class="' + cls + '">' + m.text + "</div>";
      });
      html += "</div>";
    });
    feedHost.innerHTML = html;
  }

  // ---- welcome gate (dashboard, first visit, sessionStorage) ----
  var gate = document.getElementById("welcome-gate");
  if (gate) {
    var touring = /[?&]tour=1\b/.test(location.search);
    var seen = false;
    try { seen = sessionStorage.getItem("summit-welcomed") === "1"; } catch (e) {}
    if (!touring && !seen) {
      setTimeout(function () { gate.classList.add("on"); }, 700);
      try { sessionStorage.setItem("summit-welcomed", "1"); } catch (e) {}
    }
    var startBtn = gate.querySelector("[data-welcome-start]");
    var dismissBtn = gate.querySelector("[data-welcome-dismiss]");
    if (startBtn) startBtn.addEventListener("click", function () {
      gate.classList.remove("on");
      if (window.Tour) window.Tour.start();
    });
    if (dismissBtn) dismissBtn.addEventListener("click", function () {
      gate.classList.remove("on");
    });
  }

  // ============================================================
  // Round 3: toast
  // ============================================================
  var toastHost = null;
  function toast(msg) {
    if (!toastHost) {
      toastHost = document.createElement("div");
      toastHost.className = "toast-host";
      document.body.appendChild(toastHost);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="dot"></span>' + esc(msg);
    toastHost.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () { t.classList.add("on"); }, 40);
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 300);
    }, 3200);
  }
  window.SummitToast = toast;

  // ============================================================
  // Round 3: entrance motion + count-up + bar grow
  // ============================================================
  function initMotion() {
    if (REDUCE) return;

    var i = 0;
    document.querySelectorAll(".kpi, .alert-chip, .main > .grid > *, .main > .card, .land-stat, .land-card, #int-grid > .card").forEach(function (el) {
      el.classList.add("anim-in");
      el.style.animationDelay = Math.min(i * 65, 600) + "ms";
      i++;
    });

    // KPI count-up: animate the leading numeric token of the first text node
    document.querySelectorAll(".kpi .k-val, .land-stat .n").forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var raw = node.textContent;
      var m = raw.match(/^(\s*)(\$?)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var target = parseFloat(m[3].replace(/,/g, ""));
      if (!isFinite(target) || target === 0) return;
      var decimals = (m[3].split(".")[1] || "").length;
      var t0 = null, dur = 750;
      function fmt(v) {
        var s = v.toFixed(decimals);
        var parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      }
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        node.textContent = m[1] + m[2] + fmt(target * ease) + m[4];
        if (p < 1) requestAnimationFrame(frame);
        else node.textContent = raw;
      }
      requestAnimationFrame(frame);
    });

    // bars grow in
    document.querySelectorAll(".vbar .bar").forEach(function (b, n) {
      var h = b.style.height;
      b.style.transition = "none";
      b.style.height = "0%";
      requestAnimationFrame(function () {
        b.style.transition = "height .6s cubic-bezier(.22,.61,.36,1) " + (n * 55) + "ms";
        b.style.height = h;
      });
    });
    document.querySelectorAll(".bl-fill, .f-fill, .mini .mfill").forEach(function (b, n) {
      var w = b.style.width;
      if (!w) return;
      b.style.transition = "none";
      b.style.width = "0%";
      requestAnimationFrame(function () {
        b.style.transition = "width .55s cubic-bezier(.22,.61,.36,1) " + Math.min(n * 40, 500) + "ms";
        b.style.width = w;
      });
    });
  }

  // ============================================================
  // Round 3: right-side drill-through drawer
  // ============================================================
  var dBack = null, dPanel = null;
  function buildDrawer() {
    dBack = document.createElement("div");
    dBack.className = "drawer-back";
    dPanel = document.createElement("div");
    dPanel.className = "drawer";
    dPanel.setAttribute("role", "dialog");
    dPanel.setAttribute("aria-label", "Record detail");
    document.body.appendChild(dBack);
    document.body.appendChild(dPanel);
    dBack.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dPanel.classList.contains("on")) closeDrawer();
    });
  }
  function closeDrawer() {
    if (dPanel) { dPanel.classList.remove("on"); dBack.classList.remove("on"); }
  }
  function openDrawer(rec) {
    if (!dPanel) buildDrawer();
    var tl = (window.SUMMIT && window.SUMMIT.timelines && window.SUMMIT.timelines[PAGE]) || (window.SUMMIT && window.SUMMIT.timelines["app-dashboard"]) || [];
    var html =
      '<div class="d-head"><div><h3>' + esc(rec.title) + "</h3>" +
      (rec.sub ? '<div class="d-sub">' + esc(rec.sub) + "</div>" : "") +
      '</div><button class="d-x" type="button" aria-label="Close">' +
      '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="d-body">';
    if (rec.kv && rec.kv.length) {
      html += '<div class="d-sec">Record</div>';
      rec.kv.forEach(function (p) {
        html += '<div class="d-kv"><span class="k">' + esc(p[0]) + '</span><span class="v">' + esc(p[1]) + "</span></div>";
      });
    }
    html += '<div class="d-sec">Assistant activity</div><div class="d-tl">';
    tl.forEach(function (ev) {
      html += '<div class="d-ev' + (ev.hot ? " hot" : "") + '"><div class="t">' + esc(ev.t) + '</div><div class="x">' +
        esc(ev.txt.replace("{name}", rec.first || rec.title)) + "</div></div>";
    });
    html += "</div></div>" +
      '<div class="d-foot">' +
      '<button class="btn btn-ghost" type="button" data-queue="Message queued for review in the drafts folder">Send a message</button>' +
      '<button class="btn btn-accent" type="button" data-queue="Queued for Coach Ray\'s morning review">Queue for Coach Ray</button>' +
      "</div>";
    dPanel.innerHTML = html;
    dPanel.querySelector(".d-x").addEventListener("click", closeDrawer);
    dPanel.querySelectorAll("[data-queue]").forEach(function (b) {
      b.addEventListener("click", function () { toast(b.getAttribute("data-queue")); });
    });
    dBack.classList.add("on");
    dPanel.classList.add("on");
  }

  function recFromTableRow(tr) {
    var title = "", sub = "", kv = [];
    var who = tr.querySelector(".who");
    if (who) {
      var b = who.querySelector("b"), s = who.querySelector("span");
      title = b ? b.textContent.trim() : who.textContent.trim();
      sub = s ? s.textContent.trim() : "";
    }
    var table = tr.closest("table");
    var ths = table ? table.querySelectorAll("thead th") : [];
    var tds = tr.querySelectorAll("td");
    for (var i = 0; i < tds.length; i++) {
      if (tds[i].querySelector(".who")) continue;
      var label = ths[i] ? ths[i].textContent.trim() : "Detail";
      var val = tds[i].textContent.replace(/\s+/g, " ").trim();
      if (label && val) kv.push([label, val]);
    }
    if (!title) { title = tds[0] ? tds[0].textContent.trim() : "Record"; }
    return { title: title, sub: sub, kv: kv, first: title.split(" ")[0] };
  }

  function recFromRow(el) {
    var b = el.querySelector("b");
    var title = b ? b.textContent.trim() : el.textContent.trim().slice(0, 60);
    var subEl = el.querySelector(".rt span, .f-tag, .a-sub");
    var sub = subEl ? subEl.textContent.replace(/\s+/g, " ").trim() : "";
    var kv = [];
    var amt = el.querySelector(".amt, .rmeta .when, .f-meta .t");
    if (amt) kv.push(["Detail", amt.textContent.trim()]);
    var chip = el.querySelector(".chip, .cap");
    if (chip) kv.push(["Status", chip.textContent.trim()]);
    return { title: title, sub: sub, kv: kv, first: title.split(" ")[0] };
  }

  function initDrill() {
    // table rows (skip P&L total lines with <b> in the amount col? keep all: every line drills)
    document.querySelectorAll(".card .tbl tbody tr").forEach(function (tr) {
      tr.classList.add("clickable");
      tr.addEventListener("click", function () { openDrawer(recFromTableRow(tr)); });
    });
    // feed items (not on ask page)
    document.querySelectorAll(".feed .f-item").forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function () { openDrawer(recFromRow(el)); });
    });
    // row lists
    document.querySelectorAll(".rowlist .row").forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function () { openDrawer(recFromRow(el)); });
    });
    // needs-attention items
    document.querySelectorAll(".attn .a-item").forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function () {
        var top = el.querySelector(".a-top span");
        var rec = recFromRow(el);
        if (top) { rec.title = top.textContent.trim(); rec.first = rec.title.split(" ")[0]; }
        openDrawer(rec);
      });
    });
    // KPI deep links
    document.querySelectorAll(".kpi[data-href]").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "link");
      function go() {
        var href = el.getAttribute("data-href");
        if (href.charAt(0) === "#") {
          var tgt = document.querySelector(href);
          if (tgt) tgt.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" });
        } else {
          location.href = href;
        }
      }
      el.addEventListener("click", go);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    });
  }

  // ============================================================
  // Round 3: New Student modal (sidebar CTA + any [data-new-student])
  // ============================================================
  var moBack = null;
  function buildModal() {
    moBack = document.createElement("div");
    moBack.className = "modal-back";
    moBack.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New student">' +
      '<div class="mo-head"><h3>New Student</h3><button class="d-x" type="button" data-mo-close aria-label="Close">' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="mo-body">' +
      '<div class="fld"><label for="ns-name">Student name</label><input type="text" id="ns-name" placeholder="First name, last initial" value="Mia T."></div>' +
      '<div class="fld"><label for="ns-program">Program</label><select id="ns-program">' +
      "<option>Kids Karate</option><option>Little Dragons</option><option>Teen/Adult Karate</option><option>Adult BJJ</option>" +
      "</select></div>" +
      '<div class="fld fld-row">' +
      '<div><label for="ns-parent">Parent or contact</label><input type="text" id="ns-parent" value="Rachel T."></div>' +
      '<div><label for="ns-phone">Mobile</label><input type="tel" id="ns-phone" value="(555) 014-2288"></div>' +
      "</div>" +
      '<label class="tog"><span class="tg-t"><b>Start on the intro offer</b><span>2 Weeks + Uniform, $49. The assistant runs the 14 day clock.</span></span>' +
      '<input type="checkbox" id="ns-intro" checked><span class="sw"></span></label>' +
      "</div>" +
      '<div class="mo-foot"><button class="btn btn-ghost" type="button" data-mo-close>Cancel</button>' +
      '<button class="btn btn-accent" type="button" data-mo-save>Save student</button></div>' +
      "</div>";
    document.body.appendChild(moBack);
    moBack.addEventListener("click", function (e) { if (e.target === moBack) closeModal(); });
    moBack.querySelectorAll("[data-mo-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    moBack.querySelector("[data-mo-save]").addEventListener("click", saveStudent);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && moBack.classList.contains("on")) closeModal();
    });
  }
  function openModal() {
    if (!moBack) buildModal();
    moBack.classList.add("on");
    setTimeout(function () { var f = moBack.querySelector("#ns-name"); if (f) { f.focus(); f.select(); } }, REDUCE ? 0 : 180);
  }
  function closeModal() { if (moBack) moBack.classList.remove("on"); }

  function introRowHTML(s) {
    return '<td class="who"><b>' + esc(s.name) + "</b><span>" + esc(s.program) + "</span></td>" +
      "<td>" + (s.intro ? "2 Weeks + Uniform $49" : "Standard membership") + "</td>" +
      '<td class="num">1 of 14</td>' +
      '<td><span class="mini"><span class="mtrack"><span class="mfill" style="width:4%;display:block"></span></span><span>0 of 6</span></span></td>' +
      '<td><span class="chip info"><span class="dot info"></span>Just added</span></td>' +
      "<td>Day 1 welcome text, queued</td>";
  }
  function prependIntroRow(s) {
    var tbody = document.querySelector("#intro-table tbody");
    if (!tbody) return false;
    var tr = document.createElement("tr");
    tr.className = "row-new";
    tr.innerHTML = introRowHTML(s);
    tbody.insertBefore(tr, tbody.firstChild);
    tr.classList.add("clickable");
    tr.addEventListener("click", function () { openDrawer(recFromTableRow(tr)); });
    setTimeout(function () { tr.classList.remove("row-new"); }, 2600);
    return true;
  }
  function prependAttnItem(s) {
    var host = document.querySelector(".attn");
    if (!host) return false;
    var d = document.createElement("div");
    d.className = "a-item green clickable";
    d.innerHTML = '<div class="a-top"><span>' + esc(s.name) + " just enrolled</span><span class=\"amt\">" +
      (s.intro ? "Intro, $49" : "Member") + "</span></div>" +
      '<div class="a-sub">' + esc(s.program) + ". Welcome text queued to " + esc(s.parent) + " at " + esc(s.phone) + ".</div>";
    host.insertBefore(d, host.firstChild);
    d.addEventListener("click", function () { openDrawer(recFromRow(d)); });
    return true;
  }
  function saveStudent() {
    var s = {
      name: (moBack.querySelector("#ns-name").value || "New Student").trim(),
      program: moBack.querySelector("#ns-program").value,
      parent: (moBack.querySelector("#ns-parent").value || "the family").trim(),
      phone: (moBack.querySelector("#ns-phone").value || "(555) 000-0000").trim(),
      intro: moBack.querySelector("#ns-intro").checked
    };
    closeModal();
    var placed = prependIntroRow(s) || prependAttnItem(s);
    if (!placed) {
      try {
        var q = JSON.parse(sessionStorage.getItem("summit-new-students") || "[]");
        q.unshift(s);
        sessionStorage.setItem("summit-new-students", JSON.stringify(q));
      } catch (e) {}
    }
    toast(s.name + " added to " + s.program + (s.intro ? ", intro clock started" : "") + (placed ? "" : ". See Leads & Trials"));
  }
  function initNewStudent() {
    var launchers = document.querySelectorAll(".side-cta, [data-new-student]");
    launchers.forEach(function (b) { b.addEventListener("click", openModal); });
    // replay queued adds on the trials page
    if (document.querySelector("#intro-table tbody")) {
      try {
        var q = JSON.parse(sessionStorage.getItem("summit-new-students") || "[]");
        q.reverse().forEach(prependIntroRow);
        sessionStorage.removeItem("summit-new-students");
      } catch (e) {}
    }
  }

  // ============================================================
  // Round 3: Ask (canned chat, app-ask.html)
  // ============================================================
  function initAsk() {
    var thread = document.getElementById("ask-thread");
    var input = document.getElementById("ask-input");
    var send = document.getElementById("ask-send");
    if (!thread || !input || !window.SUMMIT || !window.SUMMIT.ask) return;
    var bank = window.SUMMIT.ask;
    var busy = false;

    function scrollEnd() { thread.scrollTop = thread.scrollHeight; window.scrollTo(0, document.body.scrollHeight); }

    function answerFor(q) {
      var s = q.toLowerCase();
      var best = null, bestScore = 0;
      bank.forEach(function (item) {
        var score = 0;
        item.k.forEach(function (kw) { if (s.indexOf(kw) > -1) score += kw.length > 5 ? 2 : 1; });
        if (score > bestScore) { bestScore = score; best = item; }
      });
      if (best && bestScore > 0) return best.a;
      return "In the live system I would pull that straight from Kicksite, Stripe, and QuickBooks. In this demo, try one of the suggested questions below, they cover Saturday's belt test, intros, churn saves, failed autopays, and revenue by program.";
    }

    function typeOut(el, html) {
      if (REDUCE) { el.innerHTML = html; scrollEnd(); busy = false; return; }
      // type by word, preserving markup by revealing progressively
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      var full = tmp.textContent;
      var words = full.split(" ");
      var n = 0;
      var iv = setInterval(function () {
        n += 2;
        if (n >= words.length) {
          clearInterval(iv);
          el.innerHTML = html;
          busy = false;
        } else {
          el.textContent = words.slice(0, n).join(" ");
        }
        scrollEnd();
      }, 45);
    }

    function ask(q) {
      if (busy || !q) return;
      busy = true;
      var me = document.createElement("div");
      me.className = "ask-msg me";
      me.textContent = q;
      thread.appendChild(me);
      var typing = document.createElement("div");
      typing.className = "ask-typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      thread.appendChild(typing);
      scrollEnd();
      var wait = REDUCE ? 80 : 600 + Math.random() * 600;
      setTimeout(function () {
        typing.remove();
        var bot = document.createElement("div");
        bot.className = "ask-msg bot";
        thread.appendChild(bot);
        typeOut(bot, answerFor(q));
        scrollEnd();
      }, wait);
    }

    function submit() {
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      ask(q);
    }
    if (send) send.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    document.querySelectorAll(".ask-chip").forEach(function (c) {
      c.addEventListener("click", function () { ask(c.textContent.trim()); });
    });
  }

  // ============================================================
  // Round 4: mobile chrome (bottom nav + More sheet + hamburger)
  // ============================================================
  function initMobileChrome() {
    var sidebar = document.querySelector(".sidebar");
    var topbar = document.querySelector(".topbar");
    if (!sidebar || !topbar) return; // landing page keeps its own layout

    // -- More sheet, built from the sidebar's own groups so grouping stays in sync
    var sheetBack = document.createElement("div");
    sheetBack.className = "sheet-back";
    var sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-label", "All pages");
    var shHtml = '<div class="sh-grab"></div>' +
      '<div class="sh-head"><b>Summit Martial Arts</b>' +
      '<button class="sh-x" type="button" aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>';
    sidebar.querySelectorAll(".nav-group").forEach(function (g) {
      var lab = g.querySelector(".nav-label");
      shHtml += '<div class="nav-label">' + esc(lab ? lab.textContent : "") + "</div>";
      g.querySelectorAll(".nav-item").forEach(function (a) {
        var svg = a.querySelector("svg");
        shHtml += '<a class="nav-item' + (a.classList.contains("on") ? " on" : "") + '" href="' + esc(a.getAttribute("href")) + '">' +
          (svg ? svg.outerHTML : "") + esc(a.textContent.trim()) + "</a>";
      });
    });
    shHtml += '<div class="sh-foot"><span>ray@summitmartialarts.com</span>' +
      '<a class="signout" href="index.html">Sign Out</a></div>';
    sheet.innerHTML = shHtml;
    document.body.appendChild(sheetBack);
    document.body.appendChild(sheet);
    function openSheet() { sheetBack.classList.add("on"); sheet.classList.add("on"); }
    function closeSheet() { sheetBack.classList.remove("on"); sheet.classList.remove("on"); }
    sheetBack.addEventListener("click", closeSheet);
    sheet.querySelector(".sh-x").addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("on")) closeSheet();
    });

    // -- bottom nav: the 4 pages a prospect must see, plus More
    var tabs = [
      { href: "app-dashboard.html", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>' },
      { href: "app-trials.html", label: "Trials", icon: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>' },
      { href: "app-belttest.html", label: "Belt Test", icon: '<circle cx="12" cy="9" r="6"/><path d="M12 15l-2 6 2-1.5L14 21l-2-6z"/>' },
      { href: "app-retention.html", label: "Retention", icon: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/>' }
    ];
    var bnav = document.createElement("nav");
    bnav.className = "bnav";
    bnav.setAttribute("aria-label", "Primary");
    var inTabs = false, bHtml = "";
    tabs.forEach(function (t) {
      var on = t.href.replace(".html", "") === PAGE;
      if (on) inTabs = true;
      bHtml += '<a href="' + t.href + '"' + (on ? ' class="on" aria-current="page"' : "") + '>' +
        '<svg viewBox="0 0 24 24">' + t.icon + "</svg>" + t.label + "</a>";
    });
    bHtml += '<button type="button" id="bn-more"' + (inTabs ? "" : ' class="on"') + ' aria-label="More pages">' +
      '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>More</button>';
    bnav.innerHTML = bHtml;
    document.body.appendChild(bnav);
    bnav.querySelector("#bn-more").addEventListener("click", function () {
      if (sheet.classList.contains("on")) closeSheet(); else openSheet();
    });

    // -- topbar: brand wordmark + hamburger (visible below 900px only, via CSS)
    var brand = document.createElement("a");
    brand.className = "m-brand";
    brand.href = "app-dashboard.html";
    brand.innerHTML = 'SUM<span class="stripe">M</span>IT';
    topbar.insertBefore(brand, topbar.firstChild);
    var burger = document.createElement("button");
    burger.className = "m-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Open menu");
    burger.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    var right = topbar.querySelector(".top-right");
    if (right) right.appendChild(burger); else topbar.appendChild(burger);
    burger.addEventListener("click", function () {
      if (sheet.classList.contains("on")) closeSheet(); else openSheet();
    });
  }

  // wrap every data table so wide tables scroll inside the card, not the page
  function initTableScroll() {
    document.querySelectorAll(".tbl").forEach(function (t) {
      if (t.parentElement.classList.contains("tbl-scroll")) return;
      var w = document.createElement("div");
      w.className = "tbl-scroll";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  // ============================================================
  // boot
  // ============================================================
  function boot() {
    initMobileChrome();
    initTableScroll();
    initMotion();
    initDrill();
    initNewStudent();
    initAsk();
    document.querySelectorAll("[data-toast]").forEach(function (b) {
      b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
