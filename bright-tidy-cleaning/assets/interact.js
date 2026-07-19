/* ============================================================
   Bright & Tidy demo: motion, drill-through drawers, toasts,
   the working New Booking modal, KPI deep-links.
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
    var actions = rec.actions && rec.actions.length ? rec.actions : ["Text the client", "Add a note"];
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
    { keys: ["patel"], rec: { kind: "Churn risk", title: "The Patels", sub: "Biweekly, 3/2.5, two dogs. Team A Northside since 2023.",
      chips: [{ txt: "Risk 82", cls: "bad" }, { txt: "$3,900/yr", cls: "neutral" }],
      fields: [["Plan", "Biweekly, $150/visit"], ["Signals", "2 skips in 6 weeks + baseboards complaint Jul 9"], ["Pattern", "Skip once, skip twice, gone. This is how clients leave."], ["Suggested save", "Free baseboard redo next visit, note to Dana"]],
      timeline: [["Jun 12", "First skip logged, rebook offer declined."], ["Jul 2", "Second skip. Risk score crossed 70, flagged to you."], ["Jul 9", '"The baseboards were missed" text. Logged to the account.'], ["Today", "Save play drafted: redo + crew note. One tap to run it."]],
      actions: ["Run the save play", "Text the Patels"] } },
    { keys: ["karen walsh", "walsh"], rec: { kind: "Skip saved", title: "Karen Walsh", sub: "Biweekly, 3/2. Team B West Loop, Thursday regular.",
      chips: [{ txt: "$140 saved", cls: "good" }, { txt: "Moved, not lost", cls: "gold" }],
      fields: [["Plan", "Biweekly, $140/visit, $3,640/yr"], ["Asked", '"Hey we need to skip this week, sorry!" Wed 8:52 PM'], ["Answered", "Thursday 1:00 PM offered instead, 30 seconds later"], ["Result", "Visit kept. No hole in Thursday's route."]],
      timeline: [["Wed 8:52 PM", "Skip text landed after hours."], ["Wed 8:52 PM", "Reply sent: two open Thursday windows to pick from."], ["Wed 9:04 PM", '"Actually Thursday works!" Rebooked, route updated.'], ["Thu 12:45 PM", "Arrival window text queued."]],
      actions: ["View Thursday's route", "Text Karen"] } },
    { keys: ["henderson"], rec: { kind: "Recurring client", title: "The Hendersons", sub: "Weekly, 4/3. Team A Northside, Tuesday 8:30 AM anchor stop.",
      chips: [{ txt: "Healthy", cls: "good" }, { txt: "$8,580/yr", cls: "neutral" }],
      fields: [["Plan", "Weekly, $165/visit"], ["Entry", "Garage keypad, code on file in the vault"], ["History", "5-star review in March, referred two neighbors"], ["Card on file", "Autopay, never late"]],
      timeline: [["Tue 7:45 AM", "Arrival window text sent."], ["Tue 10:40 AM", "Visit logged complete by Dana, photos attached."], ["Tue 10:41 AM", "Invoice auto-charged to the card on file."]],
      actions: ["View visit history", "Text the Hendersons"] } },
    { keys: ["watson"], rec: { kind: "Paused client", title: "The Watsons", sub: "Weekly, 4/3. Team A. Paused for July vacation.",
      chips: [{ txt: "Resumes Aug 4", cls: "info" }],
      fields: [["Plan", "Weekly, $170/visit, $8,840/yr"], ["Pause", "Jul 7 to Aug 4, confirmed by text"], ["Their Tuesday slot", "Backfilled from the waitlist, not left empty"]],
      timeline: [["Jul 5", "Pause request handled, resume date confirmed."], ["Jul 6", "Tuesday 10 AM slot offered to the waitlist."], ["Aug 1 (queued)", "Welcome-back text and supply check."]],
      actions: ["View the backfill", "Text the Watsons"] } },
    { keys: ["chen"], rec: { kind: "Recurring client", title: "Dr. Amy Chen", sub: "Monthly, 2/2 condo. Team C, flexible window.",
      chips: [{ txt: "Healthy", cls: "good" }, { txt: "Moved to Monday", cls: "gold" }],
      fields: [["Plan", "Monthly, $120/visit"], ["Flexibility", "Any weekday, prefers mornings"], ["Today", "Visit moved to Monday in the callout re-route. She approved by text."]],
      timeline: [["6:46 AM", "Re-route proposed moving her flexible monthly to Monday."], ["6:52 AM", "You approved. Text drafted and sent."], ["7:03 AM", '"Monday is fine, thanks for the heads up!"']],
      actions: ["View Monday's route", "Text Dr. Chen"] } },
    { keys: ["riverside dental", "riverside"], rec: { kind: "Commercial account", title: "Riverside Dental", sub: "Janitorial, 3 evenings a week. Team B after residential routes.",
      chips: [{ txt: "$480/mo", cls: "neutral" }, { txt: "Renewed June", cls: "good" }],
      fields: [["Agreement", "3x/week evenings, $480/mo, renewed June"], ["Last visit", "Logged complete 9:12 PM, supplies restocked"], ["Open item", "Quarterly carpet extraction quote, drafted for your review"]],
      timeline: [["Last night 9:12 PM", "Visit logged, checklist complete."], ["Jul 14", "Office manager asked about carpet extraction. Quote drafted."], ["Aug 1 (queued)", "Monthly invoice posts to QuickBooks."]],
      actions: ["Review the carpet quote", "Text the office manager"] } },
    { keys: ["whitfield"], rec: { kind: "New lead", title: "J. Whitfield", sub: "3 bed, 2.5 bath, one dog. Called while you were on-site.",
      chips: [{ txt: "Quoted $150 biweekly", cls: "gold" }, { txt: "Walkthrough booked", cls: "good" }],
      fields: [["Came in", "Missed call, Tue 11:42 AM, (816) 555-0164"], ["Text-back", "40 seconds after the missed call"], ["Intake", "Beds, baths, pets, frequency, all by text"], ["Quote", "$150 biweekly from the rate card"], ["Walkthrough", "Thursday 4:30 PM, on the West Loop route day"]],
      timeline: [["11:42 AM", "Call missed while you were at the Hendersons."], ["11:42 AM", "Text-back sent. She replied within a minute."], ["11:49 AM", "Intake complete, quote sent."], ["11:56 AM", "Walkthrough booked. Worth ~$3,900/yr if she converts."]],
      actions: ["View the thread", "Reschedule the walkthrough"] } },
    { keys: ["the ngs", "ngs", "ng family"], rec: { kind: "Backfill win", title: "The Ngs", sub: "Deep clean Jul 22, converting to biweekly at $150.",
      chips: [{ txt: "Filled in 12 min", cls: "good" }, { txt: "$285 deep clean", cls: "neutral" }],
      fields: [["Took", "Tuesday 10 AM slot, Team A Northside"], ["Ranked #1 because", "Converting deep clean, wants Tue/Wed, Northside address"], ["Pipeline", "Deep clean $285, then biweekly $150, ~$3,900/yr"]],
      timeline: [["9:41 AM", "Waitlist offer texted, 3 ranked candidates."], ["9:53 AM", "The Ngs confirmed. Slot filled in 12 minutes."], ["Jul 21 (queued)", "Deep-clean prep text: clear surfaces, pets, parking."]],
      actions: ["View the waitlist", "Text the Ngs"] } },
    { keys: ["alvarez", "move-out"], rec: { kind: "Pipeline quote", title: "K. Alvarez, move-out clean", sub: "3/2 rental, empty by Jul 28. Landlord walkthrough Jul 30.",
      chips: [{ txt: "$320 quoted", cls: "gold" }],
      fields: [["Quote", "$320 move-out, from the rate card (2.2x base)"], ["Window", "Jul 28 or 29, Team C"], ["Status", "Quote sent, follow-up queued for Monday"]],
      timeline: [["Jul 15", "Web form inquiry, quoted within 4 minutes."], ["Mon (queued)", "Friendly follow-up if no reply."]],
      actions: ["Nudge now", "Edit the quote"] } },
    { keys: ["brennan"], rec: { kind: "Overdue invoice", title: "T. Brennan", sub: "Weekly, 3/2. $165 invoice, 11 days overdue.",
      chips: [{ txt: "11 days", cls: "bad" }, { txt: "Reminder 2 sent", cls: "warn" }],
      fields: [["Invoice", "$165, weekly visit Jul 6"], ["Ladder", "Day 3 friendly text, day 7 firmer + pause note, day 14 call script"], ["Last step", "Reminder 2 sent Tuesday with a payment link"]],
      timeline: [["Jul 9", "Day-3 friendly reminder with payment link."], ["Jul 14", "Day-7 firmer reminder. Read, no reply yet."], ["Jul 20 (queued)", "Day-14: you get a one-tap call script, nothing sends alone."]],
      actions: ["Nudge again", "Mark as paid"] } },
    { keys: ["mueller"], rec: { kind: "Overdue invoice", title: "The Muellers", sub: "Biweekly, 3/2. $140 invoice, 8 days overdue.",
      chips: [{ txt: "8 days", cls: "warn" }],
      fields: [["Invoice", "$140, visit Jul 9"], ["Extra", "Autopay invite went with the reminder, most clients take it"], ["History", "Paid late twice before, always pays"]],
      timeline: [["Jul 12", "Day-3 reminder with payment link and autopay invite."], ["Jul 16", "Day-7 reminder sent."]],
      actions: ["Nudge again", "Mark as paid"] } },
    { keys: ["s. park", "park"], rec: { kind: "Overdue invoice", title: "S. Park", sub: "Biweekly, 2/1. $140 invoice, 6 days overdue.",
      chips: [{ txt: "6 days", cls: "warn" }, { txt: "Reminder 1 today", cls: "info" }],
      fields: [["Invoice", "$140, visit Jul 11"], ["Step", "Day-3 friendly text went out this morning"], ["Odds", "Two of three invoices this month cleared after reminder 1"]],
      timeline: [["This morning", "Friendly reminder with payment link."], ["Jul 21 (queued)", "Firmer reminder if unpaid."]],
      actions: ["View the invoice", "Text S. Park"] } },
    { keys: ["fogler", "reyes", "auto-collected"], rec: { kind: "Collected", title: "2 invoices auto-collected", sub: "The Foglers $150 and D. Reyes $120, after reminder 1.",
      chips: [{ txt: "$270 in", cls: "good" }],
      fields: [["The Foglers", "$150, paid 22 minutes after the friendly text"], ["D. Reyes", "$120, paid same evening, took the autopay invite"], ["You", "Never sent an awkward text. Never will."]],
      timeline: [["Mon", "Both day-3 reminders sent automatically."], ["Mon", "Both paid. Receipts sent, QuickBooks updated."]],
      actions: ["View in QuickBooks", "Adjust the ladder"] } },
    { keys: ["ellison"], rec: { kind: "Churn watch", title: "K. Ellison", sub: "Biweekly, 3/2. Team B. Risk 61.",
      chips: [{ txt: "Risk 61", cls: "warn" }],
      fields: [["Signals", "2 payment reminders + asked to trim the scope"], ["Read", "Budget pressure, not service unhappiness"], ["Suggested save", "Offer the smaller-scope rate before she asks again"]],
      timeline: [["Jun 30", "Scope-trim question logged from her text."], ["Today", "Downsell option drafted: 3/2 lite at $120."]],
      actions: ["Send the downsell option", "Text K. Ellison"] } },
    { keys: ["duran"], rec: { kind: "Churn watch", title: "M. Duran", sub: "Weekly, 2/2. Team A. Risk 55.",
      chips: [{ txt: "Risk 55", cls: "warn" }],
      fields: [["Signals", "1 skip + no reply to the last two confirmation texts"], ["Suggested fix", "Switch confirmations to email, she replies there"]],
      timeline: [["Jul 10", "Second unanswered confirmation flagged the account."], ["Today", "Channel switch suggested. One tap to apply."]],
      actions: ["Switch to email", "Text M. Duran"] } },
    { keys: ["kayla", "callout", "6:45"], rec: { kind: "Callout covered", title: "Kayla's 6:45 AM callout", sub: "Team B down to one cleaner. Re-route approved by 6:52.",
      chips: [{ txt: "0 visits lost", cls: "good" }, { txt: "Approved in one tap", cls: "gold" }],
      fields: [["6:45 AM", "Kayla texted in sick"], ["Proposal logic", "Who's closest, who has cleaned that house, which visit bends"], ["Moves", "Marisol solo on 2 smaller homes, Jen covers the 10:00 Beaumont stop, Dr. Chen to Monday"], ["Client texts", "2 arrival-window changes, drafted before you woke up"]],
      timeline: [["6:45 AM", "Callout received."], ["6:46 AM", "Re-route proposed with drafted client texts."], ["6:52 AM", "You approved in one tap. Texts sent."], ["7:15 AM", "All crews confirmed the new day."]],
      actions: ["View the new routes", "Text Kayla"] } },
    { keys: ["beaumont"], rec: { kind: "Covered stop", title: "The Beaumonts, 10:00 AM", sub: "Moved to Jen in the re-route. She's cleaned it twice.",
      chips: [{ txt: "Covered", cls: "good" }],
      fields: [["Why Jen", "Floating today, 9 minutes away, knows the house"], ["Client text", "Arrival-window update sent at 6:53 AM, thumbs-up reply"]],
      timeline: [["6:46 AM", "Stop reassigned in the proposed re-route."], ["6:53 AM", "Client notified after your approval."]],
      actions: ["View Jen's route", "Text the Beaumonts"] } },
    { keys: ["supply", "reorder", "microfiber"], rec: { kind: "Supplies", title: "Low-stock reorder", sub: "3 items low. Draft ready at KC Janitorial Supply.",
      chips: [{ txt: "$86 draft", cls: "info" }],
      fields: [["Microfiber cloths", "Team B caddy under 10 left"], ["Hardwood cleaner", "1 refill left across teams"], ["Vacuum bags", "Team C Shark, last box open"]],
      timeline: [["Logged", "Crew leads mark low stock in their end-of-day text."], ["Now", "One tap places the order for Thursday delivery."]],
      actions: ["Place the order", "Edit quantities"] } },
    { keys: ["brookside", "web form", "9:48"],
      rec: { kind: "After-hours lead", title: "Brookside web form, 9:48 PM", sub: "4/3 asking about weekly service. Answered in under a minute.",
      chips: [{ txt: "Quoted", cls: "gold" }],
      fields: [["Intake", "4 bed, 3 bath, no pets, weekly"], ["Quote", "$165 to $185 pending walkthrough"], ["Offered", "Tuesday or Friday slots"]],
      timeline: [["9:48 PM", "Form submitted from the website."], ["9:49 PM", "Reply sent with quote range and two slot options."], ["Morning", "Waiting on their pick. Follow-up queued for tomorrow."]],
      actions: ["View the thread", "Adjust the quote"] } },
    { keys: ["waitlist"], rec: { kind: "Waitlist", title: "The ranked waitlist", sub: "3 candidates, ranked by fit and value, offers text themselves.",
      chips: [{ txt: "Self-serving", cls: "info" }],
      fields: [["Ranking logic", "Route-day fit, neighborhood, converting vs new, value per year"], ["Current list", "J. Whitfield, R. Calloway, plus walk-in inquiries"], ["Used to be", "A list in your head that died with every open slot"]],
      timeline: [["On any opening", "Top fit gets the offer with a confirm window."], ["If they pass", "Next in line is queued automatically."]],
      actions: ["Add someone", "View past fills"] } },
    { keys: ["calloway"], rec: { kind: "Waitlist", title: "R. Calloway", sub: "Monthly, 2/2. Flexible, any weekday.",
      chips: [{ txt: "#2 in line", cls: "info" }],
      fields: [["Wants", "Monthly service, ~$130/visit"], ["Rank", "Behind converting clients, ahead of unquoted inquiries"]],
      timeline: [["Jul 8", "Asked to be added when a slot opens."], ["On next opening", "Gets the offer if the Ngs-style fits pass."]],
      actions: ["Offer Thursday 1 PM", "Text R. Calloway"] } },
    { keys: ["haller"], rec: { kind: "Schedule change", title: "The Hallers", sub: "Moved Thursday to Friday. Freed the 1:00 PM slot.",
      chips: [{ txt: "Rescheduled", cls: "neutral" }],
      fields: [["Change", "Thursday 1 PM to Friday 9 AM, their ask"], ["Freed slot", "Offered to the waitlist automatically"]],
      timeline: [["Tue", "Reschedule handled by text in 3 messages."], ["Tue", "Thursday 1 PM marked open and queued for offer."]],
      actions: ["View Friday's route", "Text the Hallers"] } },
    { keys: ["zenmaid"], rec: { kind: "Integration", title: "ZenMaid", sub: "Scheduling system of record",
      chips: [{ txt: "Connected", cls: "good" }],
      fields: [["What it does here", "The assistant reads and writes the schedule: skips, backfills, re-routes, new bookings all land in ZenMaid, not a second calendar."]],
      timeline: [["Live", "Two-way sync, last write 6 minutes ago."]],
      actions: ["View sync log", "Pause sync"] } }
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

  function clientRecord(name) {
    if (!window.BT || !window.BT.clients) return null;
    var c = null;
    window.BT.clients.forEach(function (x) {
      if (name.toLowerCase().indexOf(x.name.toLowerCase()) > -1) c = x;
    });
    if (!c) return null;
    var b = c.risk >= 70 ? "bad" : c.risk >= 40 ? "warn" : "good";
    return {
      kind: "Client", title: c.name, sub: c.plan + ". " + c.team + ".",
      chips: [{ txt: "Risk " + c.risk, cls: b }, { txt: "$" + c.yr.toLocaleString("en-US") + "/yr", cls: "neutral" }],
      fields: [
        ["Rate", "$" + c.rate + (c.plan.indexOf("Commercial") > -1 ? "/mo" : "/visit")],
        ["Latest signal", c.signal]
      ].concat(c.save ? [["Suggested save", c.save]] : []),
      timeline: [["Ongoing", "Visits confirmed, invoices chased, and churn signals watched automatically."]],
      actions: c.save ? ["Run the save play", "Text " + c.name] : ["View visit history", "Text " + c.name]
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
      wireClick(row, function () {
        openDrawer(findRecord(row.textContent) || clientRecord(name) || genericRecord("Item", name, textOf(row, ".who span")));
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
        openDrawer(findRecord(name) || clientRecord(name) || genericRecord("Client", name));
      });
    });
    // crew stops
    document.querySelectorAll(".stop").forEach(function (stop) {
      var name = textOf(stop, ".st-b b");
      if (!name) return;
      wireClick(stop, function () {
        openDrawer(findRecord(stop.textContent) || clientRecord(name) || genericRecord("Route stop", name, textOf(stop, ".st-b span")));
      });
    });
    // waitlist rows
    document.querySelectorAll(".wl .wl-row").forEach(function (row) {
      var name = textOf(row, ".wl-body b");
      if (!name) return;
      wireClick(row, function () {
        openDrawer(findRecord(row.textContent) || clientRecord(name) || genericRecord("Waitlist", name));
      });
    });
    // ladder steps
    document.querySelectorAll(".ladder .lstep").forEach(function (step) {
      var head = textOf(step, "b");
      wireClick(step, function () {
        openDrawer(genericRecord("Escalation step", head, textOf(step, "p").slice(0, 90)));
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
  }

  /* ----------------------------------------------------------
     KPI deep-links
     ---------------------------------------------------------- */
  var KPI_LINKS = [
    ["on the books", "app-money.html"],
    ["recurring clients", "app-retention.html"],
    ["monthly churn", "app-retention.html"],
    ["skips saved", "app-gaps.html"],
    ["missed calls", "app-frontdesk.html"],
    ["unpaid invoices", "app-retention.html"],
    ["revenue mtd", "#pnl-card"],
    ["expenses mtd", "#expense-mix"],
    ["net profit", "#pnl-card"],
    ["cash on hand", "#cashflow-card"],
    ["ar outstanding", "app-retention.html"],
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
     New Booking modal
     ---------------------------------------------------------- */
  var modalRoot = null;

  function quoteFor(service, beds, baths, pets) {
    var base = beds <= 2 ? 120 : beds === 3 ? 140 : beds === 4 ? 165 : 185;
    if (baths >= 3) base += 10;
    if (pets !== "None") base += 5;
    if (service === "Deep clean") return { amt: Math.round(base * 1.9 / 5) * 5, label: "one-time deep clean" };
    if (service === "Move-out clean") return { amt: Math.round(base * 2.2 / 5) * 5, label: "one-time move-out clean" };
    if (service === "Commercial janitorial") return { amt: 480, label: "per month, 3 evenings a week" };
    return { amt: base, label: "per visit, " + service.toLowerCase() };
  }
  function slotFor(day) {
    if (day === "Tuesday") return "Team A Northside, Tuesday 10:00 AM";
    if (day === "Thursday") return "Team B West Loop, Thursday 1:00 PM";
    if (day === "Monday" || day === "Wednesday") return "Team A Northside, " + day + " 1:30 PM";
    return "Team C, Friday 9:00 AM";
  }

  function buildModal() {
    modalRoot = document.createElement("div");
    modalRoot.className = "modal-root";
    modalRoot.innerHTML =
      '<div class="modal-mask"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New booking">' +
      '  <div class="modal-head"><b>New Booking</b><button class="drawer-x" data-mclose aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '  <div class="modal-body">' +
      '    <label class="mf"><span>Client name</span><input type="text" id="nb-name" value="" placeholder="New client"></label>' +
      '    <div class="mf-row">' +
      '      <label class="mf"><span>Service</span><select id="nb-service"><option>Weekly</option><option selected>Biweekly</option><option>Monthly</option><option>Deep clean</option><option>Move-out clean</option><option>Commercial janitorial</option></select></label>' +
      '      <label class="mf"><span>Beds</span><input type="number" id="nb-beds" value="3" min="1" max="6"></label>' +
      '      <label class="mf"><span>Baths</span><input type="number" id="nb-baths" value="2" min="1" max="5"></label>' +
      "    </div>" +
      '    <div class="mf-row">' +
      '      <label class="mf"><span>Pets</span><select id="nb-pets"><option>None</option><option selected>Dog</option><option>Cat</option><option>Both</option></select></label>' +
      '      <label class="mf"><span>Preferred day</span><select id="nb-day"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option selected>Thursday</option><option>Friday</option></select></label>' +
      "    </div>" +
      '    <div class="nr-match" id="nb-match"></div>' +
      "  </div>" +
      '  <div class="modal-foot"><button class="btn" data-mclose type="button">Cancel</button><button class="btn btn-primary" id="nb-save" type="button">Save booking</button></div>' +
      "</div>";
    document.body.appendChild(modalRoot);
    modalRoot.querySelector(".modal-mask").addEventListener("click", closeModal);
    modalRoot.querySelectorAll("[data-mclose]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalRoot.classList.contains("on")) closeModal();
    });
    ["nb-service", "nb-beds", "nb-baths", "nb-pets", "nb-day"].forEach(function (id) {
      modalRoot.querySelector("#" + id).addEventListener("input", refreshMatch);
    });
    modalRoot.querySelector("#nb-save").addEventListener("click", saveBooking);
    refreshMatch();
  }
  function currentQuote() {
    var service = modalRoot.querySelector("#nb-service").value;
    var beds = parseInt(modalRoot.querySelector("#nb-beds").value, 10) || 3;
    var baths = parseFloat(modalRoot.querySelector("#nb-baths").value) || 2;
    var pets = modalRoot.querySelector("#nb-pets").value;
    var day = modalRoot.querySelector("#nb-day").value;
    var q = quoteFor(service, beds, baths, pets);
    return { q: q, slot: slotFor(day), service: service, beds: beds, baths: baths, pets: pets, day: day };
  }
  function refreshMatch() {
    var m = currentQuote();
    modalRoot.querySelector("#nb-match").innerHTML =
      '<span class="mk ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
      "<span>Rate card: <b>$" + m.q.amt + "</b> " + m.q.label + ". Suggested slot: <b>" + m.slot + "</b>. Confirmation and arrival-window texts send themselves.</span>";
  }
  function openModal() {
    if (!modalRoot) buildModal();
    modalRoot.classList.add("on");
    setTimeout(function () { modalRoot.querySelector("#nb-name").focus(); }, reduce ? 0 : 180);
  }
  function closeModal() {
    if (modalRoot) modalRoot.classList.remove("on");
  }

  function saveBooking() {
    var name = modalRoot.querySelector("#nb-name").value.trim() || "New client";
    var m = currentQuote();
    closeModal();
    toast("Booking saved. " + esc(name) + ", " + m.slot.split(",")[1].trim() + ". Confirmation text queued.");

    var desc = m.beds + "/" + m.baths + (m.pets === "None" ? "" : ", " + m.pets.toLowerCase() + " on file") + ". " + m.service + ", $" + m.q.amt + ".";
    var record = {
      kind: "Booking", title: name, sub: desc + " Booked just now from the owner view.",
      chips: [{ txt: "New", cls: "gold" }, { txt: "Confirmed", cls: "good" }],
      fields: [["Service", m.service + ", $" + m.q.amt + " " + m.q.label], ["Slot", m.slot], ["Next", "Confirmation text and card-on-file link queued"]],
      timeline: [["Just now", "Saved. Confirmation text queued."], ["Day before", "Arrival-window text sends automatically."]],
      actions: ["Text " + name, "View the route"]
    };
    BANK.unshift({ keys: [name.toLowerCase()], rec: record });

    // Make it visible on the current page: prepend to the primary rowlist.
    var list = document.querySelector("#routes-today .rowlist") || document.querySelector(".rowlist");
    if (list) {
      var row = document.createElement("div");
      row.className = "row row-new";
      row.innerHTML =
        '<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg></span>' +
        '<span class="who"><b>' + esc(name) + "</b><span>" + esc(desc) + " " + esc(m.slot) + ". Just booked, confirmation queued.</span></span>" +
        '<span class="meta"><span class="amt">$' + m.q.amt + '</span><span class="when">Just now</span></span>';
      list.insertBefore(row, list.firstChild);
      wireClick(row, function () { openDrawer(record); });
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
    var blocks = document.querySelectorAll(".kpi,.chip,.stat-banner,.page > .card,.grid-2 > .card,.grid-2eq > .card,.stack > .card,.crew-grid > .crew-col,.alert-card[id],.int-card,.outcome");
    var i = 0;
    blocks.forEach(function (b) {
      if (b.classList.contains("anim-in")) return;
      b.classList.add("anim-in");
      b.style.animationDelay = Math.min(i * 65, 700) + "ms";
      i++;
    });
    document.querySelectorAll(".kpi .value,.stat-banner .sb .v,.outcome .ov,.chip .num").forEach(countUp);
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

  window.BTX = { toast: toast, openDrawer: openDrawer, openModal: openModal, findRecord: findRecord };
})();
