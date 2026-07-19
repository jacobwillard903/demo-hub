/* ============================================================
   Marlowe Hair Co. demo — round 3 interactivity + motion.
   Toasts, New Appointment modal, drill-through drawer, Ask chat,
   entrance stagger, KPI count-up, chart grow-in.
   Static demo: no backend, no network calls. In-memory state only.
   ============================================================ */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var D = window.MARLOWE || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------- toasts ---------------- */
  var toastHost = null;
  function toast(msg) {
    if (!toastHost) {
      toastHost = document.createElement("div");
      toastHost.className = "toasts";
      toastHost.setAttribute("aria-live", "polite");
      document.body.appendChild(toastHost);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = msg;
    toastHost.appendChild(t);
    if (reduce) t.classList.add("on");
    else requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("on"); }); });
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 350);
    }, 3400);
  }
  window.toast = toast;

  /* ---------------- entrance stagger ---------------- */
  function entrance() {
    if (reduce) return;
    var seen = [];
    var sel = ".page .kpis .kpi, .page .chips .chip, .page > .card, " +
              ".page .grid-2 > section, .page .grid-2 > div > section, " +
              ".page .grid-2b > section, .page .int-grid .int, .page > .client-search";
    document.querySelectorAll(sel).forEach(function (el) {
      if (seen.indexOf(el) === -1) seen.push(el);
    });
    seen.forEach(function (el, i) {
      el.classList.add("anim");
      el.style.transitionDelay = Math.min(i * 65, 700) + "ms";
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
    });
    requestAnimationFrame(function () {
      seen.forEach(function (el) { el.classList.add("anim-in"); });
      setTimeout(function () {
        seen.forEach(function (el) { el.style.transitionDelay = ""; el.classList.remove("anim"); });
      }, 1400);
    });
  }

  /* ---------------- KPI count-up ---------------- */
  function countUp() {
    if (reduce) return;
    var els = document.querySelectorAll(".kpi .num, .big-stat .n, .glance .n, .chip .count");
    els.forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var m = node.nodeValue.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var prefix = m[1], numStr = m[2], suffix = m[3];
      var target = parseFloat(numStr.replace(/,/g, ""));
      if (!isFinite(target)) return;
      var decimals = (numStr.split(".")[1] || "").length;
      var hasCommas = numStr.indexOf(",") > -1;
      var t0 = null, dur = 700;
      function fmt(v) {
        var s = v.toFixed(decimals);
        if (hasCommas) {
          var parts = s.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          s = parts.join(".");
        }
        return prefix + s + suffix;
      }
      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        node.nodeValue = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else node.nodeValue = fmt(target);
      }
      node.nodeValue = fmt(0);
      requestAnimationFrame(tick);
      // settle guard: if rAF is throttled or frozen, snap to the final value
      setTimeout(function () { node.nodeValue = fmt(target); }, dur + 300);
    });
  }

  /* ---------------- chart grow-in ---------------- */
  function growCharts() {
    if (reduce) return;
    // vertical bars (dashboard revenue, money cash flow)
    document.querySelectorAll(".bars .bar, .duo .in, .duo .out").forEach(function (b, i) {
      var h = b.style.height;
      if (!h) return;
      b.style.transition = "none";
      b.style.height = "0px";
      b.offsetHeight;
      b.style.transition = "height .55s " + (0.06 * i) + "s cubic-bezier(.22,.61,.36,1)";
      b.style.height = h;
    });
    // horizontal fills (stock bars, confirm pipeline)
    document.querySelectorAll(".stockbar i, .progressbar .seg").forEach(function (b, i) {
      var w = b.style.width;
      if (!w) return;
      b.style.transition = "none";
      b.style.width = "0%";
      b.offsetHeight;
      b.style.transition = "width .6s " + (0.05 * i) + "s cubic-bezier(.22,.61,.36,1)";
      b.style.width = w;
    });
    // donut segments
    document.querySelectorAll("svg circle[stroke-dasharray]").forEach(function (c) {
      var dash = c.getAttribute("stroke-dasharray");
      var parts = dash.split(/[\s,]+/);
      if (parts.length < 2) return;
      c.style.transition = "none";
      c.style.strokeDasharray = "0 " + (parseFloat(parts[0]) + parseFloat(parts[1]));
      c.offsetHeight;
      c.style.transition = "stroke-dasharray .8s .15s cubic-bezier(.22,.61,.36,1)";
      c.style.strokeDasharray = dash;
    });
  }

  /* ---------------- KPI deep links ---------------- */
  function deepLinks() {
    document.querySelectorAll("[data-href]").forEach(function (el) {
      el.classList.add("linky");
      el.setAttribute("role", "link");
      el.setAttribute("tabindex", "0");
      function go() { location.href = el.getAttribute("data-href"); }
      el.addEventListener("click", go);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    });
  }

  /* ---------------- drawer ---------------- */
  var drawer = null, scrim = null, drawerBody = null, drawerTitle = null, drawerSub = null;
  function buildDrawer() {
    scrim = document.createElement("div");
    scrim.className = "drawer-scrim";
    drawer = document.createElement("aside");
    drawer.className = "drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.innerHTML =
      '<div class="drawer-h">' +
      '  <div><h3 class="drawer-t"></h3><div class="drawer-s"></div></div>' +
      '  <button class="drawer-x" type="button" aria-label="Close panel">' +
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "  </button>" +
      "</div>" +
      '<div class="drawer-b"></div>';
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    drawerBody = drawer.querySelector(".drawer-b");
    drawerTitle = drawer.querySelector(".drawer-t");
    drawerSub = drawer.querySelector(".drawer-s");
    scrim.addEventListener("click", closeDrawer);
    drawer.querySelector(".drawer-x").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("on")) closeDrawer();
    });
    drawerBody.addEventListener("click", function (e) {
      var b = e.target.closest("[data-queue]");
      if (b) toast("<b>Queued:</b> " + esc(b.getAttribute("data-queue")));
    });
  }
  function openDrawer(title, sub, html) {
    if (!drawer) buildDrawer();
    drawerTitle.textContent = title;
    drawerSub.textContent = sub || "";
    drawerBody.innerHTML = html;
    scrim.classList.add("on");
    drawer.classList.add("on");
    drawer.querySelector(".drawer-x").focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    scrim.classList.remove("on");
    drawer.classList.remove("on");
  }
  window.openDrawer = openDrawer;

  function actionsHTML(list) {
    var h = '<div class="drawer-actions">';
    list.forEach(function (a) {
      if (a.href) h += '<a class="dbtn quiet" href="' + esc(a.href) + '">' + esc(a.label) + "</a>";
      else h += '<button class="dbtn" type="button" data-queue="' + esc(a.queue) + '">' + esc(a.label) + "</button>";
    });
    return h + "</div>";
  }
  function timelineHTML(tl) {
    var h = '<div class="dsec">AI touch timeline</div><ul class="dtl">';
    tl.forEach(function (s) {
      h += '<li><span class="t tnum">' + esc(s.t) + "</span><span>" + esc(s.x) + "</span></li>";
    });
    return h + "</ul>";
  }
  function clientDrawer(name) {
    var c = D.clients && D.clients[name];
    if (!c) return false;
    var first = name.split(" ")[0];
    var html =
      '<div class="dgrid">' +
      '  <div class="dcell"><div class="k">Usual service</div><div class="v">' + esc(c.service) + "</div></div>" +
      '  <div class="dcell"><div class="k">Cadence</div><div class="v">' + esc(c.cadence) + "</div></div>" +
      '  <div class="dcell"><div class="k">12 month value</div><div class="v tnum">' + esc(c.value) + "</div></div>" +
      '  <div class="dcell"><div class="k">Phone</div><div class="v tnum">' + esc(c.phone) + "</div></div>" +
      "</div>" +
      '<div class="dnote">' + esc(c.note) + "</div>" +
      timelineHTML(c.timeline) +
      '<div class="dsec">Dollars</div><div class="dmoney">' + esc(c.dollars) + "</div>" +
      actionsHTML([
        { label: "Text " + first, queue: "text to " + name + " from the salon number" },
        { label: "Open in Square", queue: "opening " + name + " in Square Appointments" },
        { label: "Full roster", href: "app-clients.html" }
      ]);
    openDrawer(name, c.status, html);
    return true;
  }
  function stylistDrawer(name) {
    var s = D.stylists && D.stylists[name];
    if (!s) return false;
    var html =
      '<div class="dgrid">' +
      '  <div class="dcell"><div class="k">Revenue, 30 days</div><div class="v tnum">' + esc(s.rev) + "</div></div>" +
      '  <div class="dcell"><div class="k">Tickets</div><div class="v tnum">' + esc(s.tickets) + "</div></div>" +
      '  <div class="dcell"><div class="k">Average ticket</div><div class="v tnum">' + esc(s.avg) + "</div></div>" +
      '  <div class="dcell"><div class="k">Retail mix</div><div class="v tnum">' + esc(s.retail) + "</div></div>" +
      '  <div class="dcell"><div class="k">Rebook rate</div><div class="v tnum">' + esc(s.rebook) + "</div></div>" +
      '  <div class="dcell"><div class="k">Pay model</div><div class="v">' + esc(s.role) + "</div></div>" +
      "</div>" +
      '<div class="dnote">' + esc(s.note) + "</div>" +
      actionsHTML([
        { label: "Open today's column", href: "app-calendar.html" },
        { label: "Message " + name, queue: "message to " + name }
      ]);
    openDrawer(name, s.role + " stylist", html);
    return true;
  }
  function genericDrawer(title, sub, body, extra) {
    var html = '<div class="dnote">' + body + "</div>";
    if (extra) html += extra;
    html += actionsHTML([
      { label: "Mark handled", queue: "marking this item handled" },
      { label: "Remind me at 5 PM", queue: "reminder for 5 PM today" }
    ]);
    openDrawer(title, sub, html);
  }

  function nameIn(text) {
    if (!D.clients) return null;
    for (var n in D.clients) { if (text.indexOf(n) > -1) return n; }
    return null;
  }
  function stylistIn(text) {
    if (!D.stylists) return null;
    for (var n in D.stylists) { if (text.indexOf(n) === 0) return n; }
    return null;
  }

  /* preset drawers for the dashboard alert chips */
  var chipDrawers = {
    "sat-chairs": function () {
      genericDrawer("2 chairs open this Saturday", "Saturday, Jul 19",
        "Chairs 6 and 7 are open from 10:00 AM to 4:00 PM on the biggest day of the week. " +
        "The AI is already offering those hours to 9 waitlisted clients who fit them, first YES wins.",
        '<div class="dsec">AI touch timeline</div><ul class="dtl">' +
        '<li><span class="t tnum">Yesterday</span><span>Open Saturday hours detected on the book.</span></li>' +
        '<li><span class="t tnum">8:00 AM</span><span>Waitlist matched: 9 clients fit the open blocks by service length.</span></li>' +
        '<li><span class="t tnum">8:05 AM</span><span>First round of offers sent. 2 replies so far, both considering times.</span></li>' +
        "</ul>" +
        '<div class="dsec">Dollars</div><div class="dmoney">Filled at the average $140 ticket, those two chairs are worth roughly $1,600 of Saturday revenue.</div>');
    },
    "overdue-color": function () {
      genericDrawer("4 clients overdue for color", "Watched by service cadence",
        "Tara B. (8 weeks, 2nd nudge queued), Lauren P. (7 weeks 1 day, in today at 3:00 after her nudge landed), " +
        "Kayla M. (6 weeks 4 days, nudged today), Jessica R. (5 weeks 6 days, nudged today).",
        '<div class="dsec">Dollars</div><div class="dmoney">Together these four are worth about $4,200 a year. The nudges land before the drift becomes a quiet goodbye.</div>' +
        '<div class="drawer-actions"><a class="dbtn quiet" href="app-rebooking.html">Open Rebooking Radar</a></div>');
    },
    "reviews-reply": function () {
      genericDrawer("3 reviews needing a reply", "Google Business Profile",
        "Three new Google reviews came in this week, all 5 stars. The assistant drafted a warm, specific reply for each. " +
        "Nothing posts until you approve it.",
        '<div class="dsec">AI touch timeline</div><ul class="dtl">' +
        '<li><span class="t tnum">Tue</span><span>Review from a balayage client. Draft reply ready.</span></li>' +
        '<li><span class="t tnum">Wed</span><span>Review mentioning Brooke by name. Draft reply ready.</span></li>' +
        '<li><span class="t tnum">Today</span><span>Review from a first-time keratin client. Draft reply ready.</span></li>' +
        "</ul>");
    }
  };

  function wireDrill() {
    // rows, feed items, match cards (round-5 widgets carry data-r5 and wire themselves)
    document.querySelectorAll(".rows li, .feed li, .match, .visits li").forEach(function (el) {
      if (el.hasAttribute("data-r5")) return;
      el.classList.add("clicky");
      el.setAttribute("tabindex", "0");
      function open() {
        var text = el.textContent.replace(/\s+/g, " ").trim();
        var who = nameIn(text);
        if (who && clientDrawer(who)) return;
        var b = el.querySelector("b");
        var title = b ? b.textContent.trim() : text.slice(0, 60);
        var sub = el.closest(".card") ? (el.closest(".card").querySelector(".card-h h2") || {}).textContent || "" : "";
        genericDrawer(title, sub, esc(text),
          '<div class="dsec">AI touch timeline</div><ul class="dtl">' +
          '<li><span class="t tnum">Logged</span><span>Event recorded by the assistant and filed to the right page.</span></li>' +
          '<li><span class="t tnum">Next</span><span>Any follow-up runs automatically. Approvals wait for you.</span></li></ul>');
      }
      el.addEventListener("click", open);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
    // tables: client roster + stylist leaderboard + retail tables
    document.querySelectorAll("table.data tbody tr").forEach(function (tr) {
      tr.classList.add("clicky");
      tr.setAttribute("tabindex", "0");
      function open() {
        var text = tr.textContent.replace(/\s+/g, " ").trim();
        var who = nameIn(text);
        if (who && clientDrawer(who)) return;
        var sty = stylistIn(text);
        if (sty && stylistDrawer(sty)) return;
        var b = tr.querySelector("b");
        genericDrawer(b ? b.textContent.trim() : "Item", "Inventory",
          esc(text) + ". Counted by the register, watched by the reorder desk.",
          '<div class="drawer-actions"><button class="dbtn" type="button" data-queue="adding to the draft distributor order">Add to draft order</button></div>');
      }
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
    // calendar blocks
    document.querySelectorAll(".appt").forEach(function (a) {
      a.classList.add("clicky");
      a.setAttribute("tabindex", "0");
      function open() {
        var text = a.textContent.replace(/\s+/g, " ").trim();
        if (a.classList.contains("ghost")) {
          genericDrawer("Open hours", "Today's book",
            "This block is empty on the book, but it is not idle. The AI is offering these hours to waitlisted clients who fit them by service length and stylist.",
            '<div class="drawer-actions"><button class="dbtn" type="button" data-queue="fresh waitlist offer for this block">Offer to waitlist</button><a class="dbtn quiet" href="app-rescue.html">How rescues work</a></div>');
          return;
        }
        var who = nameIn(text);
        if (who && clientDrawer(who)) return;
        var b = a.querySelector("b");
        genericDrawer(b ? b.textContent.trim() : "Appointment", "Today's book", esc(text),
          '<div class="drawer-actions"><button class="dbtn" type="button" data-queue="confirmation text for this appointment">Send confirm text</button></div>');
      }
      a.addEventListener("click", open);
      a.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
    // alert chips
    document.querySelectorAll(".chip[data-drawer]").forEach(function (chip) {
      chip.addEventListener("click", function (e) {
        e.preventDefault();
        var fn = chipDrawers[chip.getAttribute("data-drawer")];
        if (fn) fn();
      });
    });
    // integration cards
    document.querySelectorAll(".int").forEach(function (card) {
      card.classList.add("clicky");
      card.setAttribute("tabindex", "0");
      function open(ev) {
        // let the "See it live" deep link navigate instead of opening the drawer
        if (ev && ev.target && ev.target.closest && ev.target.closest("a")) return;
        var mark = card.querySelector(".mark");
        var st = card.querySelector(".st");
        var p = card.querySelector("p");
        var see = card.querySelector(".see");
        var connected = st && /Connected/.test(st.textContent);
        var extra = "";
        if (see) {
          var where = see.querySelector("span:not(.k)");
          var live = see.querySelector(".golive");
          extra = '<div class="dsec">Where you\'ll see it</div><div class="dnote" style="margin-top:0">' +
                  esc(where ? where.textContent.trim() : "") + "</div>";
          if (live) extra += '<div class="drawer-actions"><a class="dbtn quiet" href="' + esc(live.getAttribute("href")) + '">See it live</a></div>';
        }
        genericDrawer(mark ? mark.textContent.trim() : "Integration",
          connected ? "Connected" : "Available",
          esc(p ? p.textContent.trim() : ""),
          extra +
          '<div class="drawer-actions">' +
          (connected
            ? '<button class="dbtn" type="button" data-queue="sync check for this connection">Run a sync check</button>'
            : '<button class="dbtn" type="button" data-queue="setup request for this integration">Request setup</button>') +
          "</div>");
      }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.target.closest("a")) open(e); });
    });
  }

  /* ---------------- round 5: live-data showcase drawers ---------------- */
  function r5Drawer(title, sub, note, tl, money, actions) {
    var html = '<div class="dnote" style="margin-top:0">' + note + "</div>";
    if (tl) html += timelineHTML(tl);
    if (money) html += '<div class="dsec">Dollars</div><div class="dmoney">' + money + "</div>";
    html += actionsHTML(actions || [{ label: "Mark handled", queue: "marking this item handled" }]);
    openDrawer(title, sub, html);
  }
  var r5Drawers = {
    "rev-marlowe": function () {
      r5Drawer("Marlowe Hair Co. on Google", "4.9 stars, 212 reviews, via Google Business Profile",
        "Pulled live from the salon's Business Profile. 18 new reviews this month, all 5 stars but one. " +
        "Requests go out by text after happy visits, and drafted replies wait for Dana's approval before anything posts.",
        [
          { t: "Today", x: "Review requests sent to 6 clients after checkout." },
          { t: "This wk", x: "5 new reviews in. Two mention Danielle by name." },
          { t: "This mo", x: "+18 reviews. The pace doubled since requests went automatic." }
        ],
        "Salons at 4.9 win the \"best salon near me\" search. Every tenth of a star up the list is booked chairs.",
        [{ label: "Open review queue", href: "app-rebooking.html#radar-reviews" },
         { label: "Request more reviews", queue: "review requests for today's happy visits" }]);
    },
    "rev-luxe": function () {
      r5Drawer("Luxe & Co Salon", "Competitor, 2.1 miles away, via Google Business Profile",
        "4.5 stars across 148 reviews, adding about 6 a month. Watched read-only from public data so Dana always knows where Marlowe stands on the local map. No action needed, just the scoreboard.",
        [
          { t: "This mo", x: "+6 reviews. Their pace is flat." },
          { t: "Gap", x: "Marlowe is +0.4 stars and 64 reviews ahead, and pulling away." }
        ],
        null,
        [{ label: "See Marlowe's numbers", queue: "opening the full reviews comparison" }]);
    },
    "rev-blowout": function () {
      r5Drawer("The Blowout Bar", "Competitor, 0.8 miles away, via Google Business Profile",
        "4.3 stars across 96 reviews, adding about 3 a month. Closest competitor by distance, furthest by rating. " +
        "A new client comparing the two listings sees the difference before she ever calls.",
        [
          { t: "This mo", x: "+3 reviews, one 2-star about a missed appointment." },
          { t: "Gap", x: "Marlowe is +0.6 stars and 116 reviews ahead." }
        ],
        null,
        [{ label: "See Marlowe's numbers", queue: "opening the full reviews comparison" }]);
    },
    "slot-1": function () {
      r5Drawer("Today 4:15 PM, Brooke", "Open slot, via Square Appointments",
        "A 45 minute window on Brooke's book, surfaced straight from the synced Square calendar. Long enough for a cut or a gloss. The waitlist has 3 clients who fit it.",
        [{ t: "2 min ago", x: "Slot confirmed still open on the last sync." },
         { t: "Ready", x: "One tap offers it to the 3 matching waitlist clients, first YES wins." }],
        "Filled at the average $140 ticket, this window pays for the software month in one afternoon.",
        [{ label: "Offer to waitlist", queue: "waitlist offer for today 4:15 PM with Brooke" },
         { label: "Open the calendar", href: "app-calendar.html#cal-card" }]);
    },
    "slot-2": function () {
      r5Drawer("Saturday 11:30 AM, Marissa", "Open slot, via Square Appointments",
        "A 105 minute window on the biggest day of the week, big enough for a partial highlight. Two waitlisted highlight clients fit it, including Tara B., who is 8 weeks overdue.",
        [{ t: "2 min ago", x: "Slot confirmed still open on the last sync." },
         { t: "Queued", x: "Tomorrow's 10:00 AM nudge to Tara B. attaches this exact opening." }],
        "A $145 partial highlight, and possibly a drifting client recovered in the same text.",
        [{ label: "Offer to waitlist", queue: "waitlist offer for Saturday 11:30 AM with Marissa" },
         { label: "Open Rebooking Radar", href: "app-rebooking.html" }]);
    },
    "slot-3": function () {
      r5Drawer("Saturday 2:00 PM, chair 6", "Open chair, via Square Appointments",
        "One of the two open Saturday chairs. Any stylist working overflow can take it, so the AI matches by service length only, which widens the waitlist pool to 9 clients.",
        [{ t: "8:05 AM", x: "First round of offers went to the 9 matching clients." },
         { t: "So far", x: "2 replies, both considering times. Re-ping at 5 PM." }],
        "Two open Saturday chairs are roughly $1,600 of bookable revenue.",
        [{ label: "Offer to waitlist", queue: "fresh waitlist offer for Saturday 2:00 PM" },
         { label: "How rescues work", href: "app-rescue.html" }]);
    },
    "chan-bar": function () {
      r5Drawer("Bookings by channel", "This week, via Instagram, Meta and the salon line",
        "11 bookings from 34 conversations. Instagram DMs converted 5, texts 4, missed calls texted back 2. " +
        "The DM number is the one that used to be zero: those messages sat unread until close.",
        [{ t: "IG DMs", x: "5 bookings from 14 conversations, 2 of them after hours." },
         { t: "Texts", x: "4 bookings from 13 conversations." },
         { t: "Calls", x: "2 bookings from 7 missed calls, texted back within a minute." }],
        "At the salon's $100 to $500 service range, slow replies were quietly the most expensive leak in the business.",
        [{ label: "Open the feed", queue: "scrolling to this week's conversations" }]);
    },
    "pay-1": function () {
      r5Drawer("Payout $1,284, tomorrow", "Scheduled, via Square",
        "Tomorrow's deposit, already reconciled before it lands: 14 card tickets from today, tips split out per stylist, fees accounted for. When the bank shows it, the books already agree.",
        [{ t: "Gross", x: "$1,415 across 14 tickets." },
         { t: "Tips", x: "$186 passed through to stylist tip payable, never revenue." },
         { t: "Fees", x: "$45 card processing, filed to its expense line." }],
        "Net to bank: $1,284. Matched to the deposit automatically when it posts.",
        [{ label: "View in the books", href: "app-money.html#money-pl" }]);
    },
    "pay-2": function () {
      r5Drawer("Payout $2,180, landed Thursday", "Matched, via Square",
        "Thursday's deposit hit the operating account and matched to 31 tickets on the first pass. Tips were split to 5 stylists the same night.",
        [{ t: "Thu 6:02 AM", x: "Deposit posted to the bank." },
         { t: "Thu 6:04 AM", x: "Auto-matched to Wednesday's 31 tickets, to the penny." },
         { t: "Thu 6:04 AM", x: "$318 of tips confirmed in tip payable, $0 in revenue." }],
        null,
        [{ label: "View in the books", href: "app-money.html#money-pl" }]);
    },
    "pay-3": function () {
      r5Drawer("Payout $1,940, landed Wednesday", "Matched, via Square",
        "Matched to 27 tickets. One refund from Tuesday ($40 gloss) was netted out and filed against the original sale, the way an accountant would want it.",
        [{ t: "Wed 6:01 AM", x: "Deposit posted and matched." },
         { t: "Note", x: "$40 refund netted against Tuesday's sale, categorized correctly." }],
        null,
        [{ label: "View in the books", href: "app-money.html#money-pl" }]);
    },
    "pay-4": function () {
      r5Drawer("Payout $1,730, landed Tuesday", "Matched, via Square",
        "Matched to 24 tickets, including the $312 retail Saturday spillover that settled Monday night. Nothing for Dana to chase.",
        [{ t: "Tue 6:03 AM", x: "Deposit posted and matched to 24 tickets." }],
        null,
        [{ label: "View in the books", href: "app-money.html#money-pl" }]);
    },
    "pay-5": function () {
      r5Drawer("Payout $2,050, landed Monday", "Matched, via Square",
        "Saturday and Sunday's combined settlement. The biggest deposit of the week matched on the first pass, 29 tickets and $402 of tips passed through.",
        [{ t: "Mon 6:02 AM", x: "Weekend deposit posted and matched." },
         { t: "Mon 6:02 AM", x: "$402 of tips split across 5 stylists." }],
        null,
        [{ label: "View in the books", href: "app-money.html#money-pl" }]);
    },
    "ord-1042": function () {
      r5Drawer("Order #1042, shipped", "Online store, via Shopify",
        "Olaplex No. 3 x2 for a regular who ran out between visits. Paid online, shipped this morning with tracking texted to her.",
        [{ t: "Yesterday", x: "Ordered 9:40 PM from the link in Danielle's reel." },
         { t: "Today", x: "Shipped. Shelf count decremented automatically, reorder math updated." }],
        "$60 of retail that used to walk to a big-box store between appointments.",
        [{ label: "Open the shelf", href: "app-retail.html#ret-shelf" }]);
    },
    "ord-1041": function () {
      r5Drawer("Order #1041, ready for pickup", "Online store, via Shopify",
        "Purple shampoo and heat protectant, ordered for pickup before Friday's appointment. It will be bagged at the front desk when she checks in.",
        [{ t: "Today", x: "Order placed, pickup chosen. Added to Friday's check-in notes." }],
        "$52, attached to a visit that was already on the book.",
        [{ label: "Open the shelf", href: "app-retail.html#ret-shelf" }]);
    },
    "ord-1039": function () {
      r5Drawer("Order #1039, delivered", "Online store, via Shopify",
        "Bond repair mask, delivered Tuesday to a client who moved to Franklin and still buys her products from Marlowe.",
        [{ t: "Mon", x: "Ordered from the win-back email's product link." },
         { t: "Tue", x: "Delivered. A retail client kept after moving away." }],
        null,
        [{ label: "Open the shelf", href: "app-retail.html#ret-shelf" }]);
    },
    "ord-1036": function () {
      r5Drawer("Order #1036, restock notify", "Online store, via Shopify",
        "Texture spray is sold out in the salon and online. Two clients tapped \"notify me\"; both get a text the moment the draft reorder lands and counts go back up.",
        [{ t: "Thu", x: "Sold out flagged. Notify list opened online." },
         { t: "Queued", x: "Restock texts fire automatically on delivery." }],
        "Out of stock used to be a silent lost sale. Now it is a queued one.",
        [{ label: "Approve the reorder", queue: "approving the $312 draft distributor order" }]);
    }
  };
  function wireR5() {
    document.querySelectorAll("[data-r5]").forEach(function (el) {
      var fn = r5Drawers[el.getAttribute("data-r5")];
      if (!fn) return;
      el.classList.add("clicky");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", function (e) { e.preventDefault(); fn(); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); fn(); } });
    });
    // tips pass-through: each stylist split row opens that stylist's record
    document.querySelectorAll(".tiprow").forEach(function (row) {
      var who = row.querySelector(".who");
      if (!who) return;
      row.classList.add("clicky");
      row.setAttribute("tabindex", "0");
      function open() { stylistDrawer(who.textContent.trim()); }
      row.addEventListener("click", open);
      row.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
  }
  // deep-link landing: highlight the widget an integrations "See it live" link points at
  function hashLand() {
    if (!location.hash || location.hash.length < 2) return;
    var t = null;
    try { t = document.querySelector(location.hash); } catch (e) { return; }
    if (!t) return;
    setTimeout(function () {
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      t.classList.add("hl-target");
      setTimeout(function () { t.classList.remove("hl-target"); }, 2200);
    }, 250);
  }

  /* ---------------- New Appointment modal ---------------- */
  var modal = null, mScrim = null;
  function optionList(arr, sel) {
    return arr.map(function (o) {
      var v = typeof o === "string" ? o : o.name;
      return "<option" + (v === sel ? " selected" : "") + ">" + esc(v) + "</option>";
    }).join("");
  }
  function buildModal() {
    mScrim = document.createElement("div");
    mScrim.className = "modal-scrim";
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "New appointment");
    var times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
                 "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
                 "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"];
    modal.innerHTML =
      '<div class="modal-h"><h3>New Appointment</h3>' +
      '<button class="drawer-x" type="button" data-close aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "</button></div>" +
      '<form class="modal-b">' +
      '  <label>Client<input type="text" name="client" value="" placeholder="Client name" required></label>' +
      '  <div class="frow">' +
      '    <label>Service<select name="service">' + optionList(D.services || [], "Women's Cut") + "</select></label>" +
      '    <label>Stylist<select name="stylist">' + optionList(D.stylistNames || [], "Brooke") + "</select></label>" +
      "  </div>" +
      '  <div class="frow">' +
      '    <label>Date<select name="date"><option>Today, Fri Jul 18</option><option>Tomorrow, Sat Jul 19</option><option>Mon Jul 21</option><option>Tue Jul 22</option></select></label>' +
      '    <label>Time<select name="time">' + optionList(times, "5:00 PM") + "</select></label>" +
      "  </div>" +
      '  <div class="modal-f">' +
      '    <button class="dbtn quiet" type="button" data-close>Cancel</button>' +
      '    <button class="dbtn" type="submit">Save appointment</button>' +
      "  </div>" +
      "</form>";
    document.body.appendChild(mScrim);
    document.body.appendChild(modal);
    mScrim.addEventListener("click", closeModal);
    modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("on")) closeModal();
    });
    modal.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var client = f.client.value.trim() || "Walk-in";
      var service = f.service.value, stylist = f.stylist.value;
      var date = f.date.value, time = f.time.value;
      var svc = (D.services || []).filter(function (s) { return s.name === service; })[0] || { price: 65, mins: 45 };
      closeModal();
      addAppointment(client, service, stylist, date, time, svc);
      toast("<b>Booked:</b> " + esc(client) + ", " + esc(service) + " with " + esc(stylist) +
            ", " + esc(date.split(",")[0].toLowerCase() === "today" ? "today" : date) + " " + esc(time) +
            ". Written to Square Appointments.");
    });
  }
  function openModal() {
    if (!modal) buildModal();
    mScrim.classList.add("on");
    modal.classList.add("on");
    modal.querySelector("input[name=client]").focus();
  }
  function closeModal() {
    if (!modal) return;
    mScrim.classList.remove("on");
    modal.classList.remove("on");
  }

  function addAppointment(client, service, stylist, date, time, svc) {
    var isToday = /^Today/.test(date);
    // dashboard: prepend to Up Next
    var up = document.querySelector("#upnext .rows");
    if (up && isToday) {
      var li = document.createElement("li");
      li.className = "flash";
      li.innerHTML =
        '<span class="when tnum">' + esc(time) + "</span>" +
        '<span class="who"><b>' + esc(client) + '</b> <span class="svc">&middot; ' + esc(service) + ", " + esc(stylist) + "</span></span>" +
        '<span class="pill plum">Just booked</span>' +
        '<span class="amt tnum">$' + svc.price + "</span>";
      up.insertBefore(li, up.firstChild);
      li.addEventListener("click", function () {
        genericDrawer(client, "Just booked", esc(service) + " with " + esc(stylist) + ", " + esc(date) + " at " + esc(time) + ". Confirmation text queued.");
      });
      return;
    }
    // calendar: drop a block into the open-chairs column
    var openCol = document.getElementById("cal-open");
    if (openCol && isToday) {
      var m = time.match(/(\d+):(\d+)\s(AM|PM)/);
      var hour = parseInt(m[1], 10) % 12 + (m[3] === "PM" ? 12 : 0) + parseInt(m[2], 10) / 60;
      var top = Math.max(0, Math.min(520, (hour - 9) * 56));
      var h = Math.max(24, Math.round(svc.mins / 60 * 56));
      var blk = document.createElement("div");
      blk.className = "appt rescued flash";
      blk.style.top = top + "px";
      blk.style.height = h + "px";
      blk.innerHTML = "<b>" + esc(client) + '</b><span class="sv">' + esc(service) + " &middot; just booked</span>";
      openCol.appendChild(blk);
      blk.classList.add("clicky");
      blk.addEventListener("click", function () {
        genericDrawer(client, "Just booked", esc(service) + " with " + esc(stylist) + " at " + esc(time) + " today. Confirmation text queued.");
      });
    }
  }

  function wireNewAppt() {
    document.querySelectorAll("[data-new-appt]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    });
  }

  /* ---------------- Ask (canned chat) ---------------- */
  function wireAsk() {
    var thread = document.getElementById("ask-thread");
    if (!thread) return;
    var form = document.getElementById("ask-form");
    var input = document.getElementById("ask-input");

    function bubble(cls, html) {
      var d = document.createElement("div");
      d.className = "ab " + cls;
      d.innerHTML = html;
      thread.appendChild(d);
      thread.scrollTop = thread.scrollHeight;
      return d;
    }
    function answerFor(q) {
      var s = q.toLowerCase();
      var bank = D.ask || [];
      for (var i = 0; i < bank.length; i++) {
        for (var j = 0; j < bank[i].k.length; j++) {
          if (s.indexOf(bank[i].k[j]) > -1) return bank[i].a;
        }
      }
      return D.askFallback || "Try one of the suggested questions.";
    }
    var busy = false;
    function send(q) {
      if (busy || !q.trim()) return;
      busy = true;
      bubble("me", esc(q.trim()));
      var typing = bubble("ai typing", "<span></span><span></span><span></span>");
      var ans = answerFor(q);
      var wait = reduce ? 150 : 600 + Math.random() * 600;
      setTimeout(function () {
        typing.remove();
        var out = bubble("ai", "");
        if (reduce) { out.textContent = ans; busy = false; thread.scrollTop = thread.scrollHeight; return; }
        var i = 0;
        (function type() {
          i = Math.min(ans.length, i + 2 + Math.floor(Math.random() * 3));
          out.textContent = ans.slice(0, i);
          thread.scrollTop = thread.scrollHeight;
          if (i < ans.length) setTimeout(type, 14);
          else busy = false;
        })();
      }, wait);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input.value);
      input.value = "";
    });
    document.querySelectorAll(".ask-chip").forEach(function (c) {
      c.addEventListener("click", function () { send(c.textContent.trim()); });
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    entrance();
    countUp();
    growCharts();
    deepLinks();
    wireDrill();
    wireR5();
    wireNewAppt();
    wireAsk();
    hashLand();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
