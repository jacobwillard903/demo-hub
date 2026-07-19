/* ============================================================
   Stonebrook demo: motion, drill-through drawers, toasts,
   the working New Estimate modal, KPI deep-links.
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
  // rec: { kind, title, sub, chips:[{txt,cls}], fields:[[k,v]], timeline:[[when,what]], actions:[label] }
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
    var actions = rec.actions && rec.actions.length ? rec.actions : ["Text customer", "Add a note"];
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
    { keys: ["delgado", "birchwood"], rec: { kind: "Lead, booked", title: "Karen Delgado", sub: "412 Birchwood Ln, 0.3 acre corner lot. Called while Dave was on the mower.",
      chips: [{ txt: "Booked", cls: "good" }, { txt: "Standard plan $180/mo", cls: "tan" }],
      fields: [["Came in", "Missed call, Tue 10:42 AM"], ["Lot measure", "0.31 acre from the satellite view"], ["Quoted", "$52/cut or $180/mo standard plan"], ["She picked", "Monthly plan, card on file"], ["Scheduled", "Route B Westside, first cut this Thursday"]],
      timeline: [["10:42 AM", "Call missed while Dave ran Route C. Assistant answered by text in 22 seconds."], ["10:44 AM", "Pulled the lot from the address, measured 0.31 acre, quoted both prices."], ["10:51 AM", "She chose the monthly plan. Card saved, welcome text sent."], ["10:52 AM", "Dropped onto Route B between two nearby stops, first cut Thursday. Zero extra windshield time."]],
      actions: ["Text Karen", "View Route B"] } },
    { keys: ["hollis"], rec: { kind: "Commercial bid", title: "Hollis Dental Group", sub: "Two-building office campus on Weldon Pkwy. Wants weekly service plus beds.",
      chips: [{ txt: "Walkthrough Tue 7:30 AM", cls: "info" }],
      fields: [["Came in", "Web form, Sun 9:18 PM"], ["Property", "Approx 1.8 acres turf, 14 beds, parking islands"], ["Ballpark sent", "$1,240/mo maintenance, firm after walkthrough"], ["On your calendar", "Tue 7:30 AM, before the trucks roll"]],
      timeline: [["Sun 9:18 PM", "Form came in after hours. Assistant replied in 4 minutes with the ballpark and 3 walkthrough slots."], ["Sun 9:36 PM", "Office manager picked Tuesday 7:30 AM."], ["Mon 6:00 AM", "Walkthrough brief prepped: aerial, turf area, bed count, gate notes."]],
      actions: ["Open walkthrough brief", "Text the office manager"] } },
    { keys: ["trammel", "fox run", "patio"], rec: { kind: "Install lead", title: "Mike Trammel", sub: "88 Fox Run. Paver patio and fire pit, roughly 420 sq ft.",
      chips: [{ txt: "Site visit Sat 9:00 AM", cls: "info" }, { txt: "$9,800 est", cls: "tan" }],
      fields: [["Came in", "Missed call Thu 12:15 PM"], ["Photos", "6 backyard photos received by text"], ["Working estimate", "$9,800 based on photos and lot slope"], ["Site visit", "Saturday 9:00 AM, confirmed"], ["Follow-up rule", "Quote nudges day 3 and day 7 automatically"]],
      timeline: [["Thu 12:15 PM", "Call missed during lunch loadout. Assistant texted back in under a minute."], ["Thu 12:31 PM", "He sent photos. Working estimate built from photos plus the satellite view."], ["Thu 12:40 PM", "Saturday 9 AM site visit booked on Dave's calendar."], ["Fri 6:00 AM", "Prep note: bring the paver samples, gate is on the left."]],
      actions: ["Open the estimate", "Text Mike"] } },
    { keys: ["kowalski", "drainage"], rec: { kind: "Install, WON", title: "A. Kowalski", sub: "1420 Foxtail Rd. French drain plus regrade and sod, $4,200.",
      chips: [{ txt: "Won", cls: "good" }, { txt: "$4,200", cls: "tan" }],
      fields: [["Quoted", "Jun 28, $4,200"], ["Won", "Jul 9, after the 2nd automatic follow-up"], ["Deposit", "$1,260 collected with the acceptance"], ["Install", "Wed to Fri this week, install crew"]],
      timeline: [["Jun 28", "Quote sent same day as the site visit."], ["Jul 2", "Day-3 nudge went out. No reply."], ["Jul 8", "Day-7 nudge with a photo of a finished drain job nearby."], ["Jul 9", "He accepted online. Deposit collected, install scheduled."]],
      actions: ["View job schedule", "Text A. Kowalski"] } },
    { keys: ["patterson", "card retry"], rec: { kind: "Billing", title: "R. Patterson", sub: "1108 Glen Echo Dr, standard plan $180/mo",
      chips: [{ txt: "Collected", cls: "good" }],
      fields: [["Invoice", "$180, July plan"], ["What happened", "Card declined Jul 12"], ["Fixed by", "Automatic retry Jul 15, 2:00 AM, cleared"], ["Dave's involvement", "None"]],
      timeline: [["Jul 1", "Plan invoice posted."], ["Jul 12", "Card declined. Customer got a soft heads-up text."], ["Jul 15", "Retry succeeded. Receipt sent."]],
      actions: ["View invoice", "Text R. Patterson"] } },
    { keys: ["nguyen", "sycamore"], rec: { kind: "Billing", title: "T. Nguyen", sub: "77 Sycamore Ct, standard plan. Two invoices open, $360.",
      chips: [{ txt: "1-30 days", cls: "warn" }, { txt: "$360 open", cls: "warn" }],
      fields: [["Open", "June + July plan invoices, $180 each"], ["Reminders", "Day-3 text, day-10 text with payment link"], ["Last reply", '"Sorry, traveling. Will pay this weekend."'], ["Next", "Day-17 reminder queues Monday if unpaid"]],
      timeline: [["Jul 4", "Friendly day-3 reminder with the payment link."], ["Jul 11", "Day-10 reminder. He replied the same evening."], ["Mon (queued)", "Firmer note plus a pause-service warning, only if still unpaid."]],
      actions: ["Nudge again", "View both invoices"] } },
    { keys: ["brennan", "quarry", "paused", "60+"], rec: { kind: "Billing exception", title: "M. Brennan", sub: "89 Old Quarry Rd. $380 open past 60 days. Service paused.",
      chips: [{ txt: "60+ days", cls: "bad" }, { txt: "Paused", cls: "bad" }],
      fields: [["Open", "$380 across May and June"], ["Trail", "5 reminders, 2 replies, no payment"], ["Paused", "Jul 10, per your rule at day 60"], ["Final notice", "Sent Jul 14 with a payment plan option"]],
      timeline: [["May 31", "First invoice aged past due. Reminder trail started."], ["Jul 10", "Service auto-paused at day 60. Crew never rolled a truck for free."], ["Jul 14", "Final notice with a 2-payment option. One tap reinstates the route stop when it clears."]],
      actions: ["Offer payment plan", "Write it off"] } },
    { keys: ["whitfield", "larkspur", "mulch quote"], rec: { kind: "Quote going cold", title: "J. Whitfield", sub: "300 Larkspur Ave. Mulch refresh plus bed redesign, $3,600.",
      chips: [{ txt: "Day 12, following up", cls: "warn" }],
      fields: [["Quoted", "Jul 5, $3,600"], ["Nudges", "Day 3 and day 7 sent automatically"], ["Signal", "Opened the quote twice on Sunday"], ["Next", "Day-14 last-call text queues Friday"]],
      timeline: [["Jul 5", "Quote sent within an hour of the site visit."], ["Jul 8", "Day-3 nudge."], ["Jul 12", "Day-7 nudge with a before/after photo. She opened the quote twice."], ["Fri (queued)", "Last-call text: mulch pricing holds through the end of the month."]],
      actions: ["Nudge now", "Call script"] } },
    { keys: ["okafor", "meadowlark"], rec: { kind: "Lead, booked", title: "G. Okafor", sub: "95 Meadowlark Ln, 0.2 acre. Voicemail lead turned into an EOW plan.",
      chips: [{ txt: "Booked", cls: "good" }, { txt: "Basic $150/mo", cls: "tan" }],
      fields: [["Came in", "Voicemail, Mon 1:12 PM"], ["Quoted", "$48/cut or $150/mo EOW basic"], ["Booked", "Route A Mondays, first cut Jul 20"]],
      timeline: [["1:12 PM", "Voicemail transcribed. Assistant texted back with both prices."], ["1:26 PM", "He picked the EOW plan. Card saved."], ["1:27 PM", "Added to Route A between two stops one street over."]],
      actions: ["Text G. Okafor", "View Route A"] } },
    { keys: ["reyes", "stillwater"], rec: { kind: "Lead, booked", title: "C. Reyes", sub: "1817 Stillwater Dr, 0.35 acre. Web form lead.",
      chips: [{ txt: "Booked", cls: "good" }, { txt: "Standard $180/mo", cls: "tan" }],
      fields: [["Came in", "Web form, Wed 7:48 AM"], ["Quoted", "$54/cut or $180/mo standard"], ["Booked", "Route B Wednesdays, first cut Jul 22"]],
      timeline: [["7:48 AM", "Form in before the trucks left the shop. Answered in 3 minutes."], ["8:05 AM", "She picked the monthly plan and asked about fall aeration. Tagged for the fall campaign."]],
      actions: ["Text C. Reyes", "View Route B"] } },
    { keys: ["callahan", "briarcliff", "hoa"], rec: { kind: "Lead, booked", title: "Briarcliff HOA", sub: "Common areas, entrances, and the pool strip. H. Callahan, board president.",
      chips: [{ txt: "Booked", cls: "good" }, { txt: "$1,590/mo contract", cls: "tan" }],
      fields: [["Came in", "Referral call, Thu 4:40 PM"], ["Scope", "2.6 acres common turf, 9 beds, monthly reporting"], ["Contract", "$1,590/mo, 12 months, signed online"], ["Scheduled", "Route C Wednesdays, full-service"]],
      timeline: [["Thu 4:40 PM", "Board president called while Dave was trimming. Assistant handled scope questions from the aerial."], ["Thu 5:15 PM", "Proposal with per-area breakdown sent."], ["Fri 9:02 AM", "Signed. Biggest recurring add this season."]],
      actions: ["Open the contract", "Text H. Callahan"] } },
    { keys: ["pruitt", "alder"], rec: { kind: "Lead, quoted", title: "S. Pruitt", sub: "2214 Alder Ct, 0.25 acre. Wants per-cut only.",
      chips: [{ txt: "Quoted, thinking", cls: "warn" }],
      fields: [["Quoted", "$48/cut, Thu"], ["Signal", "Asked if we bag clippings (we mulch)"], ["Next", "Day-3 nudge queues Sunday"]],
      timeline: [["Thu 3:20 PM", "Texted in from the yard sign on Alder Ct. Quoted from the satellite measure in 2 minutes."], ["Sun (queued)", "Friendly nudge with the first-cut open slot on Route C."]],
      actions: ["Nudge now", "Text S. Pruitt"] } },
    { keys: ["rain", "washout", "reshuffle", "6:04"], rec: { kind: "Automation", title: "Wednesday washout reshuffle", sub: "90% rain flagged Tue 8:00 PM. Handled before Dave's alarm.",
      chips: [{ txt: "14 stops moved", cls: "good" }, { txt: "$1,690 protected", cls: "tan" }],
      fields: [["Trigger", "National Weather Service: 90% rain, 1.1 in, Wednesday"], ["Moved", "Route B's Wednesday, 14 stops, to Thursday"], ["Re-sequenced", "Thursday runs both loops tightest-first, 11 fewer drive miles"], ["Notified", "All 14 customers texted at 6:04 AM"], ["Replies", "6, all handled. One asked for Friday instead, done."]],
      timeline: [["Tue 8:00 PM", "Forecast crossed the 80% washout threshold."], ["Tue 8:01 PM", "Draft reshuffle built. Wednesday struck, Route B slid to Thursday, re-sequenced."], ["Wed 6:04 AM", "14 customers texted their new day. 6 replies handled by the assistant."], ["Wed 6:45 AM", "Crew told to run equipment maintenance and the Kowalski drain prep instead."]],
      actions: ["View the new board", "Edit the rain rule"] } },
    { keys: ["aeration", "overseed"], rec: { kind: "Campaign", title: "Fall Aeration + Overseed", sub: "Sent to 54 eligible lawns. The margin maker.",
      chips: [{ txt: "Live", cls: "good" }, { txt: "$3,215 booked", cls: "tan" }],
      fields: [["Audience", "54 accounts with cool-season turf, no aeration on file this year"], ["Accepted", "19 so far, $169 average ticket"], ["Booked", "$3,215, scheduled into Sep route slack"], ["Your effort", "One approval tap in March"]],
      timeline: [["Jul 8", "Campaign drafted from the account list. You approved with one tap."], ["Jul 9", "54 texts went out, spaced through the morning."], ["Jul 9-16", "19 yes replies auto-booked. 3 questions answered without you."]],
      actions: ["View accepted list", "Edit the offer"] } },
    { keys: ["winterization", "blowout"], rec: { kind: "Campaign", title: "Irrigation Winterization, $95", sub: "28 systems on file. Blowouts start the week of Oct 12.",
      chips: [{ txt: "22 of 28 booked", cls: "good" }, { txt: "$2,090", cls: "tan" }],
      fields: [["Audience", "Every account with an irrigation system on file"], ["Booked", "22 of 28, $2,090"], ["Route", "Blowouts batched by neighborhood, 2 days total"], ["Stragglers", "6 get one more nudge before the first freeze warning"]],
      timeline: [["Jul 6", "Offer texted to all 28. First 9 booked within 2 hours."], ["Oct 5 (queued)", "Schedule texts with exact day per neighborhood."]],
      actions: ["View booked list", "Edit the offer"] } },
    { keys: ["mulch refresh", "spring mulch"], rec: { kind: "Campaign, closed", title: "Spring Mulch Refresh", sub: "Ran in March. 24 yards of mulch, zero phone calls.",
      chips: [{ txt: "Closed", cls: "neutral" }, { txt: "$6,480 collected", cls: "tan" }],
      fields: [["Audience", "41 accounts with beds on file"], ["Accepted", "18, $360 average"], ["Collected", "$6,480, all card on file"], ["Comparison", "Last year, doing this by phone, it made $2,100"]],
      timeline: [["Mar 3", "Campaign sent. Accepted jobs auto-slotted between spring cleanups."], ["Apr 12", "Last job done, last card charged."]],
      actions: ["Clone for next spring", "View job list"] } },
    { keys: ["crew callout", "callout covered"], rec: { kind: "Ops", title: "Crew callout, covered", sub: "Route A's trimmer called in sick Thursday night.",
      chips: [{ txt: "Covered", cls: "good" }],
      fields: [["What happened", "Marcus texted in sick at 9:40 PM"], ["Fix", "Assistant offered the shift to both part-timers"], ["Covered by", "Deshawn accepted at 6:10 AM"], ["Route impact", "None. Route A rolled at 7:00 as scheduled."]],
      timeline: [["Thu 9:40 PM", "Sick text logged, shift flagged open."], ["Thu 9:42 PM", "Both part-timers offered the Friday shift."], ["Fri 6:10 AM", "Deshawn accepted. Dave found out from the morning summary, not a 5 AM call."]],
      actions: ["View crew schedule", "Text Deshawn"] } },
    { keys: ["quotes going cold", "3 quotes"], rec: { kind: "Alert", title: "3 quotes going cold", sub: "Whitfield $3,600, Nguyen wall $8,300, O'Rourke lighting $2,900",
      chips: [{ txt: "$14,800 at stake", cls: "warn" }],
      fields: [["Whitfield", "Day 12. Opened the quote twice Sunday. Last-call queues Friday."], ["Nguyen retaining wall", "Day 9. Day-7 nudge sent, no reply yet."], ["O'Rourke lighting", "Day 8. Asked one question, answered, gone quiet."], ["The rule", "Day 3, day 7, day 14. Every quote, every time, without you."]],
      timeline: [["This week", "All three got their scheduled nudges. Two showed open activity."], ["Friday", "Whitfield gets the last-call text with the month-end price hold."]],
      actions: ["Open the pipeline", "Nudge all three now"] } },
    { keys: ["morning summary", "6:00 am summary"], rec: { kind: "Daily digest", title: "The 6:00 AM owner text", sub: "Everything that happened overnight, in one text",
      chips: [{ txt: "Daily", cls: "neutral" }],
      fields: [["Today's", "2 new leads quoted, 1 booked. Wed washout moved to Thu, 14 notified. Patterson's card cleared on retry. Crew covered."], ["Length", "Under 400 characters, every day"], ["Replies", "Text back to change anything"]],
      timeline: [["6:00 AM daily", "Digest lands before the first coffee. Dave reads it on the tailgate."]],
      actions: ["Edit digest settings", "See yesterday's"] } }
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

  function planRecord(name) {
    if (!window.SB || !window.SB.plans) return null;
    var p = null;
    window.SB.plans.forEach(function (x) {
      if (name.toLowerCase().indexOf(x.name.toLowerCase()) > -1) p = x;
    });
    if (!p) return null;
    var rate = p.name === "H. Callahan" ? 1590 : window.SB.rates[p.tier];
    var tierLabel = { basic: "Basic, EOW mowing", standard: "Standard, weekly", full: "Full-service, weekly + beds" }[p.tier];
    var chips = [];
    if (!p.ar) chips.push({ txt: "Current", cls: "good" });
    else if (p.ar.bucket === "60+") chips.push({ txt: "60+ days, paused", cls: "bad" });
    else chips.push({ txt: p.ar.bucket + " days, $" + p.ar.amt, cls: "warn" });
    chips.push({ txt: p.autopay ? "Card on file" : "Invoice", cls: "neutral" });
    return {
      kind: "Monthly plan", title: p.name, sub: p.addr + ". " + tierLabel + ".",
      chips: chips,
      fields: [
        ["Plan", tierLabel],
        ["Rate", "$" + rate.toLocaleString("en-US") + "/mo"],
        ["Route", p.route],
        ["Status", p.ar ? (p.ar.note || "Open balance") : "Paid current, receipt sent"]
      ],
      timeline: [["Jul 1", "Plan invoice posted."], [p.ar ? "Since then" : "Jul 1-5", p.ar ? (p.ar.note || "Reminder trail running.") : "Collected automatically. Nothing needed."]],
      actions: ["View invoice", "Text " + p.name]
    };
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
    // list rows
    document.querySelectorAll(".rowlist .row").forEach(function (row) {
      var name = textOf(row, ".who b") || textOf(row, "b");
      if (!name) return;
      var all = row.textContent;
      wireClick(row, function () {
        openDrawer(findRecord(all) || planRecord(name) || genericRecord("Item", name, textOf(row, ".who span")));
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
    // data table rows
    document.querySelectorAll(".dtable tbody tr").forEach(function (tr) {
      var name = "";
      tr.querySelectorAll("td b").forEach(function (b) {
        if (!name && /[a-z]/i.test(b.textContent)) name = b.textContent.trim();
      });
      if (!name) return;
      wireClick(tr, function () {
        openDrawer(findRecord(name) || planRecord(name) || genericRecord("Account", name));
      });
    });
    // route board items
    document.querySelectorAll(".rb-item").forEach(function (item) {
      var head = textOf(item, "b") || item.textContent.trim();
      var all = item.textContent;
      wireClick(item, function () {
        openDrawer(findRecord(all) || genericRecord("Route stop", head.slice(0, 70), item.textContent.replace(head, "").trim().slice(0, 90)));
      });
    });
    // kanban cards
    document.querySelectorAll(".kan-card").forEach(function (card) {
      var head = textOf(card, "b");
      var all = card.textContent;
      wireClick(card, function () {
        openDrawer(findRecord(all) || genericRecord("Install job", head, textOf(card, ".kn")));
      });
    });
    // campaign cards
    document.querySelectorAll(".camp-card").forEach(function (card) {
      var head = textOf(card, ".camp-head b");
      var all = card.textContent;
      wireClick(card, function () {
        openDrawer(findRecord(all) || genericRecord("Campaign", head));
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
          timeline: [["Every time", textOf(card, ".sc-note")]],
          actions: ["Edit the template", "Send a test"]
        });
      });
    });
  }

  /* ----------------------------------------------------------
     KPI deep-links
     ---------------------------------------------------------- */
  var KPI_LINKS = [
    ["monthly recurring", "app-billing.html"],
    ["accounts", "app-billing.html"],
    ["leads captured", "app-estimates.html"],
    ["rain-day", "app-rainday.html"],
    ["install pipeline", "app-upsells.html"],
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
      // don't self-link
      var page = location.pathname.split("/").pop();
      if (hit === page) return;
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
     New Estimate modal
     ---------------------------------------------------------- */
  var modalRoot = null;
  function quoteFor(acres, service) {
    var perCut = Math.round(35 + acres * 55);
    var monthly = Math.round(perCut * 3.45 / 5) * 5;
    if (service === "EOW mowing") monthly = Math.round(perCut * 2 / 5) * 5 + 50;
    if (service === "Full-service, weekly + beds") monthly = Math.round((perCut * 3.45 + 62) / 5) * 5;
    return { perCut: perCut, monthly: monthly };
  }
  function buildModal() {
    modalRoot = document.createElement("div");
    modalRoot.className = "modal-root";
    modalRoot.innerHTML =
      '<div class="modal-mask"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New estimate">' +
      '  <div class="modal-head"><b>New Estimate</b><button class="drawer-x" data-mclose aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '  <div class="modal-body">' +
      '    <label class="mf"><span>Customer name</span><input type="text" id="ne-name" value="" placeholder="New customer"></label>' +
      '    <label class="mf"><span>Address</span><input type="text" id="ne-addr" value="" placeholder="Street address, Overland MO"></label>' +
      '    <div class="mf-row">' +
      '      <label class="mf"><span>Service</span><select id="ne-service"><option>Weekly mowing</option><option>EOW mowing</option><option>Full-service, weekly + beds</option><option>One-time cleanup</option><option>Install estimate</option></select></label>' +
      '      <label class="mf"><span>Lot size (acres)</span><input type="number" id="ne-acres" value="0.30" min="0.05" max="5" step="0.05"></label>' +
      "    </div>" +
      '    <div class="nr-match" id="ne-quote"></div>' +
      "  </div>" +
      '  <div class="modal-foot"><button class="btn" data-mclose type="button">Cancel</button><button class="btn btn-primary" id="ne-save" type="button">Send the quote</button></div>' +
      "</div>";
    document.body.appendChild(modalRoot);
    modalRoot.querySelector(".modal-mask").addEventListener("click", closeModal);
    modalRoot.querySelectorAll("[data-mclose]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalRoot.classList.contains("on")) closeModal();
    });
    ["ne-service", "ne-acres"].forEach(function (id) {
      modalRoot.querySelector("#" + id).addEventListener("input", refreshQuote);
    });
    modalRoot.querySelector("#ne-save").addEventListener("click", saveEstimate);
    refreshQuote();
  }
  function currentQuote() {
    var service = modalRoot.querySelector("#ne-service").value;
    var acres = parseFloat(modalRoot.querySelector("#ne-acres").value) || 0.3;
    return { service: service, acres: acres, q: quoteFor(acres, service) };
  }
  function refreshQuote() {
    var c = currentQuote();
    var txt;
    if (c.service === "Install estimate") {
      txt = "Install leads get a <b>site visit</b> first. Saving books the next open Saturday slot and starts the day-3 / day-7 follow-up rule.";
    } else if (c.service === "One-time cleanup") {
      txt = "Measured <b>" + c.acres.toFixed(2) + " acres</b> from the satellite view. Cleanup quote: <b>$" + Math.round(120 + c.acres * 260) + "</b>, weather-slotted into route slack.";
    } else {
      txt = "Measured <b>" + c.acres.toFixed(2) + " acres</b> from the satellite view. Quote: <b>$" + c.q.perCut + "/cut</b> or <b>$" + c.q.monthly + "/mo</b> on a plan. Texts out with a booking link.";
    }
    modalRoot.querySelector("#ne-quote").innerHTML =
      '<span class="mk ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
      "<span>" + txt + "</span>";
  }
  function openModal() {
    if (!modalRoot) buildModal();
    modalRoot.classList.add("on");
    setTimeout(function () { modalRoot.querySelector("#ne-name").focus(); }, reduce ? 0 : 180);
  }
  function closeModal() {
    if (modalRoot) modalRoot.classList.remove("on");
  }

  function saveEstimate() {
    var name = modalRoot.querySelector("#ne-name").value.trim() || "New customer";
    var addr = modalRoot.querySelector("#ne-addr").value.trim() || "Overland, MO";
    var c = currentQuote();
    closeModal();
    var priceTxt = c.service === "Install estimate" ? "site visit booked"
      : c.service === "One-time cleanup" ? "$" + Math.round(120 + c.acres * 260) + " quoted"
      : "$" + c.q.perCut + "/cut or $" + c.q.monthly + "/mo quoted";
    toast("Quote sent to " + esc(name) + ". " + priceTxt + ". Follow-ups queued.");

    var record = {
      kind: "Lead, quoted", title: name, sub: addr + ", " + c.acres.toFixed(2) + " acre. Quoted just now from the owner view.",
      chips: [{ txt: "New", cls: "tan" }, { txt: "Quote sent", cls: "good" }],
      fields: [["Service", c.service], ["Lot measure", c.acres.toFixed(2) + " acres, satellite"], ["Quote", priceTxt]],
      timeline: [["Just now", "Quote texted with a booking link."], ["Day 3 and day 7", "Automatic follow-ups queue unless they book first."]],
      actions: ["Text " + name, "Open the quote"]
    };
    BANK.unshift({ keys: [name.toLowerCase()], rec: record });

    // Make it visible on the current page: feed (estimates) or rowlist (dashboard).
    var ffeed = document.querySelector("#lead-feed .feed");
    if (ffeed) {
      var fi = document.createElement("div");
      fi.className = "feed-item row-new";
      fi.innerHTML =
        '<span class="t">Just now</span>' +
        '<div class="fbody">' +
        '  <div class="fhead"><b>' + esc(name) + ", " + esc(addr) + '</b> <span class="pill tan">New</span> <span class="pill good"><span class="dot"></span>Quote sent</span></div>' +
        '  <div class="fdesc">' + esc(c.service) + ", " + c.acres.toFixed(2) + " acre lot measured by satellite. " + esc(priceTxt) + ". Day-3 and day-7 follow-ups queued.</div>" +
        "</div>";
      ffeed.insertBefore(fi, ffeed.firstChild);
      wireClick(fi, function () { openDrawer(record); });
      return;
    }
    var feed = document.querySelector("#lead-feed .rowlist") || document.querySelector("#attention .rowlist");
    if (feed) {
      var row = document.createElement("div");
      row.className = "row row-new";
      row.innerHTML =
        '<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>' +
        '<span class="who"><b>' + esc(name) + "</b><span>" + esc(addr) + ". " + esc(c.service) + ", " + esc(priceTxt) + ".</span></span>" +
        '<span class="meta"><span class="amt">New</span><span class="when">Just now</span></span>';
      feed.insertBefore(row, feed.firstChild);
      wireClick(row, function () { openDrawer(record); });
    }
  }

  function wireCta() {
    document.querySelectorAll(".side-cta button, [data-new-estimate]").forEach(function (b) {
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
    var blocks = document.querySelectorAll(".kpi,.chip,.stat-banner,.weather-banner,.page > .card,.grid-2 > .card,.grid-2eq > .card,.stack > .card,.alert-card[id],.int-card,.outcome,.camp-card,.sms-card");
    var i = 0;
    blocks.forEach(function (b) {
      if (b.classList.contains("anim-in")) return;
      b.classList.add("anim-in");
      b.style.animationDelay = Math.min(i * 65, 700) + "ms";
      i++;
    });
    document.querySelectorAll(".kpi .value,.stat-banner .sb .v,.outcome .ov,.chip .num,.camp-stats .cs .v").forEach(countUp);
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
    document.querySelectorAll(".kan-card,.rb-item").forEach(function (c, ix) {
      c.classList.add("fade-in");
      c.style.animationDelay = Math.min(ix * 24, 500) + "ms";
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

  window.SBX = { toast: toast, openDrawer: openDrawer, openModal: openModal, findRecord: findRecord };
})();
