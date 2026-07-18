/* ============================================================
   Bear Hollow demo, round 3: motion, drill-through drawers,
   toasts, the working New Reservation modal, KPI deep-links.
   Zero backend. All state in memory.
   ============================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ----------------------------------------------------------
     Toasts
     ---------------------------------------------------------- */
  var toastWrap = null;
  function toast(msg) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-wrap";
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="tk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span>' + msg + "</span>";
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("on"); }); });
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 300);
    }, 3400);
  }

  /* ----------------------------------------------------------
     Drawer (right-side record panel)
     ---------------------------------------------------------- */
  var drawerRoot = null;
  function buildDrawer() {
    drawerRoot = document.createElement("div");
    drawerRoot.className = "drawer-root";
    drawerRoot.innerHTML =
      '<div class="drawer-mask"></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true">' +
      '  <button class="drawer-x" aria-label="Close panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '  <div class="drawer-body"></div>' +
      "</aside>";
    document.body.appendChild(drawerRoot);
    drawerRoot.querySelector(".drawer-mask").addEventListener("click", closeDrawer);
    drawerRoot.querySelector(".drawer-x").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawerRoot.classList.contains("on")) closeDrawer();
    });
  }
  function closeDrawer() {
    if (drawerRoot) drawerRoot.classList.remove("on");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // rec: { title, sub, chips:[{txt,cls}], fields:[[k,v]], timeline:[[when,what]], actions:[label] }
  function openDrawer(rec) {
    if (!drawerRoot) buildDrawer();
    var h = "";
    h += '<div class="dr-kind">' + esc(rec.kind || "Record") + "</div>";
    h += '<h2 class="dr-title">' + esc(rec.title) + "</h2>";
    if (rec.sub) h += '<div class="dr-sub">' + esc(rec.sub) + "</div>";
    if (rec.chips && rec.chips.length) {
      h += '<div class="dr-chips">';
      rec.chips.forEach(function (c) { h += '<span class="pill ' + (c.cls || "neutral") + '">' + esc(c.txt) + "</span>"; });
      h += "</div>";
    }
    if (rec.fields && rec.fields.length) {
      h += '<div class="dr-fields">';
      rec.fields.forEach(function (f) {
        h += '<div class="dr-field"><span>' + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
      });
      h += "</div>";
    }
    if (rec.timeline && rec.timeline.length) {
      h += '<div class="dr-sect">What the assistant did</div><div class="dr-tl">';
      rec.timeline.forEach(function (t) {
        h += '<div class="dr-tli"><span class="w">' + esc(t[0]) + "</span><span>" + esc(t[1]) + "</span></div>";
      });
      h += "</div>";
    }
    var actions = rec.actions && rec.actions.length ? rec.actions : ["Text guest", "Add a note"];
    h += '<div class="dr-actions">';
    actions.forEach(function (a, ix) {
      h += '<button type="button" class="btn' + (ix === 0 ? " btn-primary" : "") + '" data-queue>' + esc(a) + "</button>";
    });
    h += "</div>";
    h += '<div class="dr-foot">Demo data. In the live system these buttons hand the task to the assistant.</div>';
    var body = drawerRoot.querySelector(".drawer-body");
    body.innerHTML = h;
    body.querySelectorAll("[data-queue]").forEach(function (b) {
      b.addEventListener("click", function () { toast("Queued. The assistant will handle it."); });
    });
    body.scrollTop = 0;
    drawerRoot.classList.add("on");
  }

  /* ----------------------------------------------------------
     Record bank (grounded in the demo's data)
     ---------------------------------------------------------- */
  var BANK = [
    { keys: ["miller"], rec: { kind: "Reservation", title: "Miller party", sub: "38 ft Class C, repeat guests, 3rd stay",
      chips: [{ txt: "Refill booking", cls: "info" }, { txt: "Paid", cls: "good" }],
      fields: [["Site", "14, pull-through FHU 50A"], ["Dates", "Fri Jul 17 to Sun Jul 19"], ["Rate", "$52/night, 2 nights"], ["Total", "$104, paid"], ["Preference on file", "Shade. Site 14 is the shadiest pull-through."]],
      timeline: [["Thu 4:13 PM", "Waitlist offer texted after the Site 14 cancellation."], ["Thu 4:31 PM", "Millers confirmed and paid. Site board updated."], ["Fri 9:00 AM", "Arrival text: site, park map, gate code 4417."], ["Fri 4:30 PM", "Expected arrival."]],
      actions: ["Text the Millers", "View reservation"] } },
    { keys: ["hendricks"], rec: { kind: "Reservation", title: "R. Hendricks", sub: "42 ft fifth wheel, 3 slides, needs 50 amp. First visit.",
      chips: [{ txt: "Auto-matched", cls: "rust" }, { txt: "Paid", cls: "good" }],
      fields: [["Site", "22, 70 ft pull-through, FHU 50A"], ["Dates", "Fri Jul 17 to Mon Jul 20"], ["Rate", "$58/night, 3 nights, $174"], ["Match rule", "Sites 3-9 excluded, max rig 32 ft"]],
      timeline: [["Thu 1:20 PM", "Called asking if the park fits a 42-footer."], ["Thu 1:24 PM", "Booking link sent, paid within the hour."], ["Fri 9:00 AM", "Arrival text with gate code and hookup notes."], ["Fri 6:00 PM", "Expected arrival."]],
      actions: ["Text Ray", "View site 22"] } },
    { keys: ["baker"], rec: { kind: "Reservation", title: "Baker family", sub: "32 ft travel trailer, two dogs, repeat guests",
      chips: [{ txt: "After-hours arrival", cls: "rust" }, { txt: "Paid", cls: "good" }],
      fields: [["Site", "41, back-in W/E 30/50A"], ["Dates", "Fri Jul 17 to Sun Jul 19, $96"], ["Arriving", "10:15 PM, after the office closes"], ["On file", "Two dogs. Pet fee added, pet map texted."]],
      timeline: [["Thu 9:12 PM", "Texted asking about a spot for a 32 ft trailer."], ["Thu 9:13 PM", "Offered Site 41, booked with a payment link."], ["Fri 9:00 AM", "Gate code and after-hours instructions sent."]],
      actions: ["Text the Bakers", "View site 41"] } },
    { keys: ["nguyen"], rec: { kind: "Reservation", title: "T. Nguyen", sub: "Tent, creekside. 4th stay this year.",
      chips: [{ txt: "Repeat guest", cls: "neutral" }, { txt: "5 stars posted", cls: "good" }],
      fields: [["Site", "T4, creekside tent"], ["Dates", "2 nights, $56"], ["History", "4 stays, $308 this year"]],
      timeline: [["Wed 9:02 PM", "Texted for a next-night tent spot, answered in seconds."], ["Fri 9:00 AM", "Check-in instructions sent."], ["Prior stay", "Left a 5-star review, reply posted."]],
      actions: ["Text T. Nguyen", "View site T4"] } },
    { keys: ["casteel"], rec: { kind: "Reservation", title: "Casteel party", sub: "Cabin C2, sleeps 6. Repeat guests.",
      chips: [{ txt: "After-hours arrival", cls: "rust" }, { txt: "Paid", cls: "good" }],
      fields: [["Cabin", "C2"], ["Dates", "3 nights, $285"], ["Arriving", "9:40 PM, door code already sent"]],
      timeline: [["Tue", "Booked online, confirmation email sent."], ["Fri 9:00 AM", "Door code and parking note texted."]],
      actions: ["Text the Casteels", "View cabin C2"] } },
    { keys: ["garza"], rec: { kind: "Reservation", title: "L. Garza", sub: "44 ft toy hauler, 6-night stay",
      chips: [{ txt: "In the park", cls: "good" }],
      fields: [["Site", "27, 65 ft pull-through FHU 50A"], ["Dates", "6 nights, $348"], ["Open item", "Asked for a honey wagon pump-out Saturday morning"]],
      timeline: [["Wed", "Booked by phone, big-rig match to Site 27."], ["Thu 8:10 PM", "Pump-out request logged, added to the grounds list."]],
      actions: ["Confirm pump-out", "Text L. Garza"] } },
    { keys: ["whitaker"], rec: { kind: "Monthly tenant", title: "G. Whitaker", sub: "36 ft motorhome, Site 33. Snowbird, 2nd season.",
      chips: [{ txt: "Autopay", cls: "neutral" }, { txt: "Paid", cls: "good" }],
      fields: [["Rent", "$575/month"], ["Electric", "642 kWh this cycle, $89.88"], ["Spend", "$4,486 across 2 seasons"], ["Pattern", "Books November through February every year"]],
      timeline: [["Jul 1", "Invoice posted, autopay cleared same day."], ["Oct 1 (queued)", "Site 33 hold offer goes out before anyone else can take it."]],
      actions: ["Text G. Whitaker", "View invoice"] } },
    { keys: ["delgado"], rec: { kind: "Monthly tenant", title: "K. Delgado", sub: "40 ft fifth wheel, Site 45. Workamper, since March.",
      chips: [{ txt: "Manual pay", cls: "neutral" }, { txt: "Paid", cls: "good" }],
      fields: [["Rent", "$575/month"], ["Electric", "668 kWh this cycle, $93.52"], ["Spend", "$3,341 YTD"]],
      timeline: [["Jul 1", "Invoice emailed with the metered electric line."], ["Jul 3", "Paid at the office, receipt sent automatically."]],
      actions: ["Text K. Delgado", "View invoice"] } },
    { keys: ["prather", "late payer", "site 58"], rec: { kind: "Monthly tenant", title: "D. Prather", sub: "38 ft travel trailer, Site 58. Monthly since January.",
      chips: [{ txt: "6 days late", cls: "bad" }, { txt: "Card failed", cls: "warn" }],
      fields: [["Invoice", "$718.74, rent $615 + 741 kWh at $0.14"], ["Autopay", "Card failed Jul 11"], ["Last reply", '"Mailing a check Friday."'], ["Late fee", "Holds off until Friday per your policy"]],
      timeline: [["Jul 1", "Invoice posted."], ["Jul 11", "Autopay card declined."], ["Jul 12", "Friendly reminder text with payment link."], ["Jul 16", "Firmer reminder. He replied the same hour."], ["Fri (queued)", "If no check: late fee applies, you get a one-tap call script."]],
      actions: ["Nudge again", "Waive late fee"] } },
    { keys: ["okafor"], rec: { kind: "Incoming monthly", title: "J. Okafor", sub: "26 ft Class B. Travel nurse, 13 week contract.",
      chips: [{ txt: "Starts Aug 1", cls: "info" }],
      fields: [["Site", "47, Oak Loop back-in FHU"], ["Rate", "$615/month plus metered electric"], ["Booked", "By phone, Wed 8:44 PM, after hours"]],
      timeline: [["Wed 8:44 PM", "Called after seeing the park from the highway. Booked monthly."], ["Jul 25 (queued)", "Move-in details and gate code text."]],
      actions: ["Text J. Okafor", "View site 47"] } },
    { keys: ["holland"], rec: { kind: "Incoming snowbird", title: "The Hollands", sub: "34 ft fifth wheel. November through February.",
      chips: [{ txt: "Deposit paid", cls: "good" }],
      fields: [["Site", "45 from Nov 1"], ["Deposit", "$50 first-night deposit on file"], ["Quoted", "$595/month plus metered electric"]],
      timeline: [["Thu 4:55 PM", "Texted about wintering here, quoted and closed with a deposit link."], ["Oct 15 (queued)", "Arrival prep text with winter hookup notes."]],
      actions: ["Text the Hollands", "View site 45"] } },
    { keys: ["boland"], rec: { kind: "Google review", title: "K. Boland, 3 stars", sub: "Today, 8:14 AM. Wifi and road noise complaints.",
      chips: [{ txt: "Reply drafted", cls: "warn" }],
      fields: [["Issue 1", "Wifi weak on the back loop. New access point installs this month."], ["Issue 2", "Road noise Friday night."], ["Recovery offer", "Creekside site away from the road, first night free"]],
      timeline: [["8:14 AM", "Review landed on Google."], ["8:25 AM", "Reply drafted and queued for your approval."]],
      actions: ["Approve reply", "Edit reply"] } },
    { keys: ["aldana"], rec: { kind: "Google review", title: "M. Aldana, 4 stars", sub: "Late arrival praise, bathhouse line ding.",
      chips: [{ txt: "Reply posted", cls: "good" }],
      fields: [["Highlight", "10:30 PM arrival, gate code already on their phone"], ["Ding", "Bathhouse line Saturday morning"], ["Fix in reply", "Second shower house opens for peak weekends in August"]],
      timeline: [["Last week", "Review landed, reply drafted in 9 minutes."], ["Same day", "You approved, reply posted."]],
      actions: ["View on Google", "Text M. Aldana"] } },
    { keys: ["scout troop"], rec: { kind: "Hold", title: "Scout troop hold", sub: "T5, Wed Jul 22 and Thu Jul 23",
      chips: [{ txt: "Expires on its own", cls: "info" }],
      fields: [["Sites", "T5, wooded tent"], ["Holds", "2 nights, no payment yet"], ["Policy", "Unconfirmed holds release automatically at 48 hours"]],
      timeline: [["Tue", "Troop leader called, hold placed with a confirm-by date."], ["Thu (queued)", "Reminder text, then auto-release if silent."]],
      actions: ["Text the troop leader", "Extend hold"] } },
    { keys: ["palmer"], rec: { kind: "Reservation", title: "Palmer party", sub: "Riverside Site 15, out Sunday 11 AM",
      chips: [{ txt: "Departing Sun", cls: "neutral" }],
      fields: [["Site", "15, 72 ft pull-through FHU 50A"], ["Checkout", "Sunday 11 AM"], ["Next", "Site turns over for the open midweek nights"]],
      timeline: [["Sat 6:00 PM (queued)", "Checkout reminder with the dump station map."]],
      actions: ["Text the Palmers", "View site 15"] } },
    { keys: ["doyle"], rec: { kind: "Reservation", title: "K. Doyle", sub: "Oak Loop Site 40, 2 nights",
      chips: [{ txt: "In the park", cls: "good" }],
      fields: [["Site", "40, back-in FHU 30/50A"], ["Dates", "Fri and Sat night"]],
      timeline: [["Fri 9:00 AM", "Arrival text with gate code sent."]],
      actions: ["Text K. Doyle", "View site 40"] } },
    { keys: ["ruiz"], rec: { kind: "Reservation", title: "Ruiz party", sub: "Tent T3, wooded, 2 nights",
      chips: [{ txt: "In the park", cls: "good" }],
      fields: [["Site", "T3"], ["Dates", "Fri and Sat night"]],
      timeline: [["Fri 9:00 AM", "Check-in instructions sent."]],
      actions: ["Text the Ruiz party", "View site T3"] } },
    { keys: ["emery"], rec: { kind: "Reservation", title: "Emery party", sub: "Cabin C1, sleeps 4, 2 nights",
      chips: [{ txt: "In the park", cls: "good" }],
      fields: [["Cabin", "C1"], ["Dates", "Fri and Sat night"]],
      timeline: [["Fri 9:00 AM", "Door code texted."]],
      actions: ["Text the Emerys", "View cabin C1"] } },
    { keys: ["tran"], rec: { kind: "Reservation", title: "Tran family", sub: "Cabin C3, full week",
      chips: [{ txt: "In the park", cls: "good" }],
      fields: [["Cabin", "C3, sleeps 4"], ["Dates", "7 nights, Fri to Fri"]],
      timeline: [["Fri 9:00 AM", "Door code texted."], ["Sat 9:30 AM", "Morning-after check-in, all good."]],
      actions: ["Text the Trans", "View cabin C3"] } },
    { keys: ["meter read looks high", "site 60", "ibarra", "re-read"], rec: { kind: "Billing exception", title: "Site 60 meter re-read", sub: "F. Ibarra, 724 kWh, 31% above trailing average",
      chips: [{ txt: "Held before invoicing", cls: "warn" }],
      fields: [["Read", "724 kWh vs ~550 average"], ["Why it matters", "A misread bills a tenant wrong and starts an argument"], ["Status", "Re-read on the grounds list before the invoice goes out"]],
      timeline: [["Jul 16", "Outlier flagged automatically at invoice prep."], ["Sat (queued)", "Re-read during the morning walk-around."]],
      actions: ["Mark re-read done", "Text F. Ibarra"] } },
    { keys: ["honey wagon", "pump-out"], rec: { kind: "Grounds request", title: "Honey wagon, Site 27", sub: "L. Garza asked for a Saturday morning pump-out",
      chips: [{ txt: "On the grounds list", cls: "warn" }],
      fields: [["Site", "27, 44 ft toy hauler"], ["Requested", "Saturday morning"], ["Fee", "$25, added to the folio"]],
      timeline: [["Thu 8:10 PM", "Guest texted the request, assistant confirmed the window."], ["Sat 8:00 AM", "On the grounds run."]],
      actions: ["Confirm window", "Text L. Garza"] } },
    { keys: ["waitlist match", "labor day"], rec: { kind: "Waitlist", title: "3 Labor Day matches pending", sub: "Offers texted, holds expire in 24 hours",
      chips: [{ txt: "Self-resolving", cls: "info" }],
      fields: [["Weekend", "Labor Day, Fri Sep 4 to Mon Sep 7"], ["Offers out", "3 guests, first to confirm wins"], ["If they pass", "Next in line is queued automatically"]],
      timeline: [["Today 7:40 AM", "Two openings detected, waitlist matched by rig fit."], ["Tomorrow 7:40 AM", "Unclaimed holds release and re-offer."]],
      actions: ["View waitlist", "Add a guest"] } },
    { keys: ["storm", "weather"], rec: { kind: "Automation", title: "July 9 storm alert", sub: "Severe thunderstorm warning, 8:42 PM",
      chips: [{ txt: "61 sites texted", cls: "good" }],
      fields: [["Trigger", "National Weather Service warning for the park's county"], ["Sent", "Shelter location text to every occupied site within a minute"], ["Replies", "14, every one answered"]],
      timeline: [["8:42 PM", "Warning issued."], ["8:43 PM", "All 61 occupied sites texted the shelter location."], ["9:20 PM", "All clear follow-up."]],
      actions: ["View the message", "Edit shelter info"] } },
    { keys: ["shoulder-season", "campaign", "3rd night free"], rec: { kind: "Campaign", title: "Shoulder-season campaign", sub: '"3rd night free, October Tuesday through Thursday"',
      chips: [{ txt: "Live", cls: "good" }],
      fields: [["Audience", "214 past guests who stayed midweek before"], ["Results", "11 bookings, +$1,830 October revenue"], ["Rate", "5.1% booked from one text"]],
      timeline: [["Jul 8", "Drafted from the October occupancy gap, you approved with one tap."], ["Jul 9", "Sent. First booking within 40 minutes."]],
      actions: ["View bookings", "Extend to November"] } },
    { keys: ["gate code", "arrivals after hours"], rec: { kind: "Tonight", title: "2 after-hours arrivals", sub: "Baker family 10:15 PM, Casteel party 9:40 PM",
      chips: [{ txt: "Codes sent", cls: "good" }],
      fields: [["Baker family", "Site 41, gate code and pull-in notes texted"], ["Casteel party", "Cabin C2, door code texted"], ["You", "Nothing to do. Nobody idles at the gate."]],
      timeline: [["9:00 AM", "Day-of arrival texts went out."], ["On arrival", "After-hours instructions auto-send."]],
      actions: ["View arrivals", "Text a guest"] } }
  ];

  function findRecord(text) {
    var t = (text || "").toLowerCase();
    for (var i = 0; i < BANK.length; i++) {
      for (var k = 0; k < BANK[i].keys.length; k++) {
        if (t.indexOf(BANK[i].keys[k]) > -1) return BANK[i].rec;
      }
    }
    return null;
  }

  function tenantRecord(name) {
    if (!window.BH || !window.BH.tenants) return null;
    var t = null;
    window.BH.tenants.forEach(function (x) {
      if (name.toLowerCase().indexOf(x.name.toLowerCase()) > -1) t = x;
    });
    if (!t) return null;
    var elec = t.kwh * 0.14;
    return {
      kind: "Monthly tenant", title: t.name, sub: "Oak Loop Site " + t.site + ", monthly tenant",
      chips: t.paid ? [{ txt: "Paid", cls: "good" }, { txt: t.autopay ? "Autopay" : "Manual", cls: "neutral" }] : [{ txt: "6 days late", cls: "bad" }],
      fields: [
        ["Rent", "$" + t.rent + "/month"],
        ["Meter read", t.kwh.toLocaleString("en-US") + " kWh this cycle"],
        ["Electric", "$" + elec.toFixed(2) + " at $0.14/kWh"],
        ["Invoice", "$" + (t.rent + elec).toFixed(2)]
      ],
      timeline: [["Jul 1", "Invoice posted with the metered electric line."], [t.paid ? "Jul 1-5" : "Jul 11", t.paid ? "Collected, receipt sent." : "Autopay failed, reminder trail started."]],
      actions: ["View invoice", "Text " + t.name]
    };
  }

  function siteRecord(s) {
    var statusTxt = { occ: "Occupied", arr: "Arriving today", open: "Open, sellable", monthly: "Monthly tenant", matched: "New match tonight", refill: "Refilled from the waitlist" }[s.status] || s.status;
    var cls = { occ: "good", arr: "warn", open: "neutral", monthly: "neutral", matched: "rust", refill: "info" }[s.status] || "neutral";
    var rec = {
      kind: "Site", title: "Site " + s.label, sub: s.type,
      chips: [{ txt: statusTxt, cls: cls }],
      fields: [["Zone", { riverside: "Riverside pull-throughs", oakloop: "Oak Loop back-ins", tents: "Tent sites", cabins: "Cabins", overflow: "Dry camping overflow" }[s.zone] || s.zone]],
      timeline: [],
      actions: s.status === "open" ? ["Offer to the waitlist", "Block for maintenance"] : ["Text the guest", "View reservation"]
    };
    if (s.note) rec.fields.push(["Note", s.note]);
    if (s.status === "open") rec.timeline.push(["Now", "Bookable by the assistant. Open nights get offered to callers and the waitlist automatically."]);
    else if (s.status === "monthly") rec.timeline.push(["Jul 1", "Monthly invoice posted with metered electric."]);
    else if (s.status === "matched") rec.timeline.push(["Just now", "Auto-matched to a 42 ft fifth wheel. Payment cleared, board updated."]);
    else if (s.status === "refill") rec.timeline.push(["4:31 PM", "Refilled from the waitlist 19 minutes after the cancellation."]);
    else rec.timeline.push(["9:00 AM", "Arrival or stay texts handled for tonight's guest."]);
    return rec;
  }

  function genericRecord(kind, title, sub) {
    return {
      kind: kind, title: title, sub: sub || "",
      timeline: [["Logged", "Handled by the assistant and filed. Nothing waiting on you."]],
      actions: ["Open in full", "Add a note"]
    };
  }

  /* ----------------------------------------------------------
     Drill-through wiring
     ---------------------------------------------------------- */
  function textOf(el, sel) {
    var n = sel ? el.querySelector(sel) : el;
    return n ? n.textContent.trim() : "";
  }

  function wireClick(el, fn) {
    el.classList.add("clickable");
    el.addEventListener("click", function (e) {
      if (e.target.closest("a,button")) return;
      fn();
    });
  }

  function wireDrill() {
    // list rows (arrivals etc.)
    document.querySelectorAll(".rowlist .row").forEach(function (row) {
      var name = textOf(row, ".who b") || textOf(row, "b");
      if (!name) return;
      wireClick(row, function () {
        openDrawer(findRecord(name) || tenantRecord(name) || genericRecord("Item", name, textOf(row, ".who span")));
      });
    });
    // feed items
    document.querySelectorAll(".feed-item").forEach(function (item) {
      var head = textOf(item, ".fhead b") || textOf(item, ".fdesc");
      var all = item.textContent;
      wireClick(item, function () {
        openDrawer(findRecord(all) || genericRecord("Feed event", head.slice(0, 80), textOf(item, ".t")));
      });
    });
    // data table rows (tenants, guests)
    document.querySelectorAll(".dtable tbody tr").forEach(function (tr) {
      var name = "";
      tr.querySelectorAll("td b").forEach(function (b) {
        if (!name && /[a-z]/i.test(b.textContent)) name = b.textContent.trim();
      });
      if (!name) return;
      wireClick(tr, function () {
        openDrawer(findRecord(name) || tenantRecord(name) || genericRecord("Guest", name));
      });
    });
    // site cells (JS-rendered on the site board)
    document.querySelectorAll(".site").forEach(function (cell) {
      var id = (cell.id || "").replace("site-", "");
      var s = window.BH && window.BH.sites ? window.BH.sites.filter(function (x) { return x.id === id; })[0] : null;
      if (!s) return;
      wireClick(cell, function () { openDrawer(siteRecord(s)); });
    });
    // reservation grid cells + site labels
    document.querySelectorAll(".resgrid .rn").forEach(function (cell) {
      var tag = textOf(cell, ".tag");
      if (!tag) return;
      wireClick(cell, function () {
        openDrawer(findRecord(tag) || tenantRecord(tag) || genericRecord("Reservation", tag));
      });
    });
    document.querySelectorAll(".resgrid .rg-site").forEach(function (cell) {
      var label = textOf(cell, "b");
      var sub = textOf(cell, "span");
      wireClick(cell, function () {
        var s = window.BH && window.BH.sites ? window.BH.sites.filter(function (x) { return x.label === label; })[0] : null;
        openDrawer(s ? siteRecord(s) : genericRecord("Site", "Site " + label, sub));
      });
    });
    // alert chips (dashboard chip row): drawer first, page jump inside it
    document.querySelectorAll(".chip-row .chip").forEach(function (chip) {
      var href = chip.getAttribute("href");
      chip.addEventListener("click", function (e) {
        e.preventDefault();
        var rec = findRecord(chip.textContent) || genericRecord("Alert", textOf(chip, ".txt"));
        rec = JSON.parse(JSON.stringify(rec));
        rec.actions = rec.actions || [];
        openDrawer(rec);
        if (href) {
          var go = document.createElement("button");
          go.type = "button";
          go.className = "btn btn-primary";
          go.textContent = "Open the full page";
          go.addEventListener("click", function () { location.href = href; });
          var wrap = drawerRoot.querySelector(".dr-actions");
          if (wrap) wrap.insertBefore(go, wrap.firstChild);
        }
      });
    });
    // alert cards
    document.querySelectorAll(".alert-card").forEach(function (card) {
      var head = textOf(card, "b");
      wireClick(card, function () {
        openDrawer(findRecord(card.textContent) || genericRecord("Alert", head.slice(0, 80)));
      });
    });
    // review cards
    document.querySelectorAll(".review-card").forEach(function (card) {
      var name = textOf(card, ".review-head b");
      wireClick(card, function () {
        openDrawer(findRecord(name) || genericRecord("Google review", name, textOf(card, ".review-body").slice(0, 90) + "..."));
      });
    });
    // review action buttons
    document.querySelectorAll(".review-actions .btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        toast(b.textContent.indexOf("Approve") > -1 ? "Reply queued to post on Google." : "Opened for editing in the live system. Queued here.");
      });
    });
    // integration cards
    document.querySelectorAll(".int-card").forEach(function (card) {
      var name = textOf(card, ".int-name");
      var kind = textOf(card, ".int-kind");
      var body = textOf(card, "p");
      var connected = card.textContent.indexOf("Connected") > -1;
      wireClick(card, function () {
        openDrawer({
          kind: "Integration", title: name, sub: kind,
          chips: [{ txt: connected ? "Connected" : "Available", cls: connected ? "good" : "neutral" }],
          fields: [["What it does here", body]],
          timeline: connected ? [["Live", "Synced and healthy. Last activity within the hour."]] : [["Ready", "Connects in an afternoon. Nothing gets replaced."]],
          actions: connected ? ["View sync log", "Pause sync"] : ["Connect it", "Learn more"]
        });
      });
    });
    // sms strip cards
    document.querySelectorAll(".sms-card").forEach(function (card) {
      wireClick(card, function () {
        openDrawer({
          kind: "Automated text", title: textOf(card, ".sc-when"),
          fields: [["Message", textOf(card, ".sc-msg")]],
          timeline: [["Every reservation", textOf(card, ".sc-note")]],
          actions: ["Edit the template", "Send a test"]
        });
      });
    });
    // match card
    document.querySelectorAll(".match-card").forEach(function (card) {
      wireClick(card, function () { openDrawer(findRecord("hendricks")); });
    });
  }

  /* ----------------------------------------------------------
     KPI deep-links
     ---------------------------------------------------------- */
  var KPI_LINKS = [
    ["occupancy tonight", "app-siteboard.html"],
    ["adr", "app-reservations.html"],
    ["calls handled", "app-frontdesk.html"],
    ["after-hours", "app-frontdesk.html"],
    ["cancellations refilled", "app-rescue.html"],
    ["monthly billing", "app-billing.html"],
    ["revenue mtd", "#pnl-card"],
    ["expenses mtd", "#expense-mix"],
    ["net profit", "#pnl-card"],
    ["cash on hand", "#cashflow-card"],
    ["ar outstanding", "app-billing.html"],
    ["avg daily take", "#cashflow-card"]
  ];
  function wireKpis() {
    document.querySelectorAll(".kpi").forEach(function (kpi) {
      var label = textOf(kpi, ".label").toLowerCase();
      var hit = null;
      KPI_LINKS.forEach(function (m) { if (!hit && label.indexOf(m[0]) > -1) hit = m[1]; });
      if (!hit) return;
      kpi.classList.add("clickable");
      kpi.addEventListener("click", function () {
        if (hit.charAt(0) === "#") {
          var t = document.querySelector(hit);
          if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        } else location.href = hit;
      });
    });
  }

  /* ----------------------------------------------------------
     New Reservation modal
     ---------------------------------------------------------- */
  var modalRoot = null;
  function suggestSite(type, len, amps) {
    if (type === "Tent") return { site: "T9", desc: "wooded tent site, $28/night" };
    if (type === "Cabin") return { site: "C4", desc: "cabin, sleeps 4, $95/night (opens Sunday)" };
    if (len >= 36 || amps === "50" || type === "Fifth wheel" || type === "Class A") {
      return { site: "9", desc: "70 ft Riverside pull-through, FHU 50A, $58/night" };
    }
    return { site: "47", desc: "Oak Loop back-in, FHU 30/50A, $48/night" };
  }
  function buildModal() {
    modalRoot = document.createElement("div");
    modalRoot.className = "modal-root";
    modalRoot.innerHTML =
      '<div class="modal-mask"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New reservation">' +
      '  <div class="modal-head"><b>New Reservation</b><button class="drawer-x" data-mclose aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '  <div class="modal-body">' +
      '    <label class="mf"><span>Guest name</span><input type="text" id="nr-name" value="" placeholder="Walk-in guest"></label>' +
      '    <div class="mf-row">' +
      '      <label class="mf"><span>Rig type</span><select id="nr-type"><option>Travel trailer</option><option>Fifth wheel</option><option>Class A</option><option>Class C</option><option>Class B</option><option>Tent</option><option>Cabin</option></select></label>' +
      '      <label class="mf"><span>Length (ft)</span><input type="number" id="nr-len" value="34" min="10" max="75"></label>' +
      '      <label class="mf"><span>Amps</span><select id="nr-amps"><option>30</option><option selected>50</option></select></label>' +
      "    </div>" +
      '    <div class="mf-row">' +
      '      <label class="mf"><span>Arrive</span><input type="date" id="nr-in" value="2026-07-17"></label>' +
      '      <label class="mf"><span>Depart</span><input type="date" id="nr-out" value="2026-07-19"></label>' +
      "    </div>" +
      '    <label class="mf"><span>Site preference</span><select id="nr-pref"><option>Auto-match the best fit</option><option>Riverside pull-through</option><option>Oak Loop back-in</option><option>Tent site</option><option>Cabin</option></select></label>' +
      '    <div class="nr-match" id="nr-match"></div>' +
      "  </div>" +
      '  <div class="modal-foot"><button class="btn" data-mclose type="button">Cancel</button><button class="btn btn-primary" id="nr-save" type="button">Save reservation</button></div>' +
      "</div>";
    document.body.appendChild(modalRoot);
    modalRoot.querySelector(".modal-mask").addEventListener("click", closeModal);
    modalRoot.querySelectorAll("[data-mclose]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalRoot.classList.contains("on")) closeModal();
    });
    ["nr-type", "nr-len", "nr-amps", "nr-pref"].forEach(function (id) {
      modalRoot.querySelector("#" + id).addEventListener("input", refreshMatch);
    });
    modalRoot.querySelector("#nr-save").addEventListener("click", saveReservation);
    refreshMatch();
  }
  function currentMatch() {
    var pref = modalRoot.querySelector("#nr-pref").value;
    var type = modalRoot.querySelector("#nr-type").value;
    var len = parseInt(modalRoot.querySelector("#nr-len").value, 10) || 34;
    var amps = modalRoot.querySelector("#nr-amps").value;
    if (pref.indexOf("Riverside") > -1) return { site: "9", desc: "70 ft Riverside pull-through, FHU 50A, $58/night" };
    if (pref.indexOf("Oak Loop") > -1) return { site: "47", desc: "Oak Loop back-in, FHU 30/50A, $48/night" };
    if (pref.indexOf("Tent") > -1) return { site: "T9", desc: "wooded tent site, $28/night" };
    if (pref.indexOf("Cabin") > -1) return { site: "C4", desc: "cabin, sleeps 4, $95/night (opens Sunday)" };
    return suggestSite(type, len, amps);
  }
  function refreshMatch() {
    var m = currentMatch();
    modalRoot.querySelector("#nr-match").innerHTML =
      '<span class="mk ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
      "<span>Auto-matched: <b>Site " + m.site + "</b>, " + m.desc + ". Fits the rig, gate code sends on arrival day.</span>";
  }
  function openModal() {
    if (!modalRoot) buildModal();
    modalRoot.classList.add("on");
    setTimeout(function () { modalRoot.querySelector("#nr-name").focus(); }, reduce ? 0 : 180);
  }
  function closeModal() {
    if (modalRoot) modalRoot.classList.remove("on");
  }

  function saveReservation() {
    var name = modalRoot.querySelector("#nr-name").value.trim() || "Walk-in guest";
    var type = modalRoot.querySelector("#nr-type").value;
    var len = modalRoot.querySelector("#nr-len").value;
    var m = currentMatch();
    closeModal();
    toast("Reservation saved. " + esc(name) + ", Site " + m.site + ". Confirmation and gate code queued.");

    var rig = type === "Tent" || type === "Cabin" ? type : len + " ft " + type.toLowerCase();
    var record = {
      kind: "Reservation", title: name, sub: rig + ", booked just now from the owner view",
      chips: [{ txt: "New", cls: "rust" }, { txt: "Confirmed", cls: "good" }],
      fields: [["Site", m.site + ", " + m.desc], ["Dates", "Fri Jul 17 to Sun Jul 19"]],
      timeline: [["Just now", "Saved. Confirmation text and payment link queued."], ["Arrival day 9:00 AM", "Gate code and hookup notes send automatically."]],
      actions: ["Text " + name, "View site " + m.site]
    };
    BANK.unshift({ keys: [name.toLowerCase()], rec: record });

    // Make it visible on the current page.
    var arr = document.querySelector("#arrivals .rowlist");
    if (arr) {
      var row = document.createElement("div");
      row.className = "row row-new";
      row.innerHTML =
        '<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="15" height="10" rx="1"/><path d="M16 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg></span>' +
        '<span class="who"><b>' + esc(name) + "</b><span>" + esc(rig) + ". Site " + m.site + ", just booked. Confirmation queued.</span></span>" +
        '<span class="meta"><span class="amt">New</span><span class="when">Just now</span></span>';
      arr.insertBefore(row, arr.firstChild);
      wireClick(row, function () { openDrawer(record); });
      return;
    }
    var rg = document.querySelector(".resgrid .rg");
    if (rg) {
      var zone = rg.querySelector(".rg-zone");
      if (zone) {
        var frag = document.createElement("div");
        frag.innerHTML =
          '<div class="rg-site row-new"><b>' + m.site + "</b><span>" + esc(m.desc.split(",")[0]) + ", just booked</span></div>" +
          '<div class="rn arr"><span class="tag">' + esc(name) + ", new</span></div>" +
          '<div class="rn occ"><span class="tag">' + esc(name) + "</span></div>" +
          '<div class="rn open"></div><div class="rn open"></div><div class="rn open"></div><div class="rn open"></div><div class="rn open"></div>';
        var nodes = [];
        while (frag.firstChild) nodes.push(frag.firstChild), frag.removeChild(frag.firstChild);
        var anchor = zone.nextSibling;
        nodes.forEach(function (n) { rg.insertBefore(n, anchor); });
        nodes.forEach(function (n) {
          if (n.classList && (n.querySelector(".tag") || n.classList.contains("rg-site"))) {
            wireClick(n, function () { openDrawer(record); });
          }
        });
        return;
      }
    }
    var cell = document.getElementById("site-s" + m.site) || document.getElementById("site-" + m.site.toLowerCase());
    if (cell) {
      cell.className = "site matched clickable row-new";
      cell.innerHTML = '<div class="sn">' + m.site + '</div><div class="st">new</div>';
      cell.title = "Just booked, " + esc(name);
    }
  }

  function wireCta() {
    document.querySelectorAll(".side-cta button").forEach(function (b) {
      b.addEventListener("click", openModal);
    });
  }

  /* ----------------------------------------------------------
     Motion: entrance stagger, KPI count-up, bars grow in
     ---------------------------------------------------------- */
  function countUp(el) {
    var raw = el.textContent;
    var mnum = raw.match(/[\d,]+(\.\d+)?/);
    if (!mnum) return;
    var target = parseFloat(mnum[0].replace(/,/g, ""));
    if (!isFinite(target) || target === 0) return;
    var decimals = mnum[1] ? mnum[1].length - 1 : 0;
    var start = null, dur = 750;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var str = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
      el.textContent = raw.replace(mnum[0], str);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = raw;
    }
    requestAnimationFrame(frame);
  }

  function initMotion() {
    if (reduce) return;
    // staggered entrance
    var blocks = document.querySelectorAll(".kpi,.chip,.stat-banner,.page > .card,.grid-2 > .card,.grid-2eq > .card,.stack > .card,.stack > .match-card,.alert-card[id],.review-card,.int-card,.outcome,.match-card");
    var i = 0;
    blocks.forEach(function (b) {
      if (b.classList.contains("anim-in")) return;
      b.classList.add("anim-in");
      b.style.animationDelay = Math.min(i * 65, 700) + "ms";
      i++;
    });
    // count-up
    document.querySelectorAll(".kpi .value,.stat-banner .sb .v,.outcome .ov,.chip .num").forEach(countUp);
    // bars grow
    document.querySelectorAll(".barchart .bar,.flowchart .fin,.flowchart .fout").forEach(function (bar, ix) {
      var h = bar.style.height;
      if (!h) return;
      bar.style.transition = "none";
      bar.style.height = "0%";
      setTimeout(function () {
        bar.style.transition = "height .6s cubic-bezier(.22,.61,.36,1)";
        bar.style.height = h;
      }, 120 + ix * 40);
    });
    // heat cells fade
    document.querySelectorAll(".hcell,.cal .day,.site").forEach(function (c, ix) {
      c.classList.add("fade-in");
      c.style.animationDelay = Math.min(ix * 12, 500) + "ms";
    });
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function init() {
    initMotion();
    wireDrill();
    wireKpis();
    wireCta();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.BHX = { toast: toast, openDrawer: openDrawer, openModal: openModal, findRecord: findRecord };
})();
