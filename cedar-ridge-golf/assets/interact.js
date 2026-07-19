/* ============================================================
   Cedar Ridge, round 3 interactivity: booking modal, drill-through
   drawer, toasts, entrance motion, KPI count-up. Zero backend;
   everything is in-memory and canned.
   ============================================================ */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------------- toasts ---------------- */
  var toastRoot = null;
  function toast(msg) {
    if (!toastRoot) {
      toastRoot = document.createElement("div");
      toastRoot.className = "toast-root";
      document.body.appendChild(toastRoot);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="dot"></span>' + msg;
    toastRoot.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 260);
    }, 2800);
  }
  window.crToast = toast;

  /* ---------------- booking modal ---------------- */
  var modalRoot = null;
  function closeModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove("on");
    setTimeout(function () { if (modalRoot) { modalRoot.remove(); modalRoot = null; } }, 220);
  }
  function openBooking() {
    if (modalRoot) return;
    modalRoot = document.createElement("div");
    modalRoot.className = "modal-root";
    modalRoot.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New tee time">' +
      '  <div class="modal-head"><div><h3>New Tee Time</h3>' +
      '  <div class="m-sub">Writes straight to the foreUP tee sheet, card on file optional.</div></div>' +
      '  <button class="modal-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '  <div class="modal-body">' +
      '    <div class="field"><label for="bk-date">Date</label><select id="bk-date">' +
      '      <option value="wd" selected>Tomorrow, Fri Jul 17</option>' +
      '      <option value="we">Sat Jul 18</option>' +
      '      <option value="we2">Sun Jul 19</option></select></div>' +
      '    <div class="field"><label for="bk-time">Tee time</label><select id="bk-time">' +
      '      <option>7:10 AM</option><option>9:30 AM</option><option selected>12:40 PM</option>' +
      '      <option>1:50 PM</option><option>3:00 PM</option><option>5:10 PM (twilight)</option></select></div>' +
      '    <div class="field"><label for="bk-players">Players</label><select id="bk-players">' +
      '      <option>1</option><option>2</option><option>3</option><option selected>4</option></select></div>' +
      '    <div class="field"><label for="bk-cart">Carts</label><select id="bk-cart">' +
      '      <option value="ride" selected>Riding, $18 per rider</option><option value="walk">Walking</option></select></div>' +
      '    <div class="field wide"><label for="bk-name">Name</label><input id="bk-name" type="text" value="B. Keller" autocomplete="off"></div>' +
      '    <div class="field wide"><label for="bk-phone">Mobile, for the confirmation text</label><input id="bk-phone" type="text" value="(555) 318-2276" autocomplete="off"></div>' +
      '  </div>' +
      '  <div class="modal-foot">' +
      '    <button class="btn btn-ghost" type="button" data-m-cancel>Cancel</button>' +
      '    <button class="btn btn-accent" type="button" data-m-save>Save to Tee Sheet</button>' +
      '  </div>' +
      "</div>";
    document.body.appendChild(modalRoot);
    requestAnimationFrame(function () { modalRoot.classList.add("on"); });

    function esc(e) { if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", esc); } }
    document.addEventListener("keydown", esc);
    modalRoot.addEventListener("click", function (e) { if (e.target === modalRoot) closeModal(); });
    modalRoot.querySelector(".modal-x").addEventListener("click", closeModal);
    modalRoot.querySelector("[data-m-cancel]").addEventListener("click", closeModal);
    modalRoot.querySelector("[data-m-save]").addEventListener("click", function () {
      var day = modalRoot.querySelector("#bk-date");
      var time = modalRoot.querySelector("#bk-time").value;
      var players = parseInt(modalRoot.querySelector("#bk-players").value, 10);
      var riding = modalRoot.querySelector("#bk-cart").value === "ride";
      var name = (modalRoot.querySelector("#bk-name").value || "Walk-in").trim();
      var twilight = time.indexOf("twilight") > -1;
      var green = twilight ? 29 : (day.value === "wd" ? 42 : 58);
      var total = players * green + (riding ? players * 18 : 0);
      var dayLabel = day.options[day.selectedIndex].text.replace("Tomorrow, ", "");
      closeModal();
      addBookingRow({
        name: name, players: players, time: time.replace(" (twilight)", ""),
        day: dayLabel, riding: riding, total: total
      });
    });
    modalRoot.querySelector("#bk-name").focus();
  }

  function addBookingRow(b) {
    var list = document.querySelector("[data-booking-list]");
    var msg = "Booked: " + b.name + " +" + (b.players - 1) + ", " + b.day + " " + b.time + ", $" + b.total + ". Confirmation text sent.";
    if (list) {
      var row = document.createElement("div");
      row.className = "row just-added";
      row.setAttribute("data-drill", "generic");
      row.innerHTML =
        '<span class="r-time">' + b.time + "</span>" +
        '<div class="r-main"><div class="r-title">' + b.name + (b.players > 1 ? " +" + (b.players - 1) : "") + "</div>" +
        '<div class="r-sub">' + b.day + ", " + (b.riding ? Math.ceil(b.players / 2) + " cart" + (b.players > 2 ? "s" : "") : "walking") + ", added just now, confirmation text sent</div></div>" +
        '<span class="chip chip-good"><span class="dot"></span>Confirmed</span>' +
        '<span class="r-amt">$' + b.total + "</span>";
      list.insertBefore(row, list.firstChild);
    } else {
      var count = document.querySelector("[data-booking-count]");
      if (count) {
        var n = parseInt(count.textContent.replace(/\D/g, ""), 10) + 1;
        count.textContent = n;
        msg += " Tomorrow is now " + n + " bookings.";
      }
    }
    toast(msg);
  }

  /* ---------------- drill-through drawer ---------------- */
  var DRILL = {
    "chip-unconfirmed": {
      title: "3 unconfirmed foursomes, tomorrow",
      sub: "Fri Jul 17, morning block", tag: ["chip-warn", "Auto-release 6 PM"], amt: "$672", amtLab: "Green + cart revenue held by these 3 times",
      kv: [["7:50 AM", "D. Pham +3, no reply to 2 texts"], ["9:10 AM", "K. Osei +3, no reply"], ["10:20 AM", "R. Maddox +3, link opened, not confirmed"]],
      tl: [["4:00 PM yest", "First confirmation SMS to all 62 bookings"], ["10:00 AM", "Second nudge to the 5 quiet ones, 2 confirmed"], ["6:00 PM", "Auto-release: quiet slots go to the 14-golfer waitlist"]],
      actions: ["Call the Maddox party", "Release early"]
    },
    "chip-rotary": {
      title: "Riverside Rotary, deposit pending",
      sub: "72-player scramble, Thu Sep 17", tag: ["chip-warn", "Nudge scheduled"], amt: "$1,224", amtLab: "Deposit outstanding on a $4,896 package",
      kv: [["Contact", "Carol Maes, (555) 402-7719"], ["Quote sent", "Tuesday 2:18 PM, 4 min after inquiry"], ["Link opens", "2, Tuesday and Wednesday"], ["Competitor", "Also quoting Prairie Bend"]],
      tl: [["Tue 2:14 PM", "Inquiry arrived by web form"], ["Tue 2:18 PM", "Quote, contract, and deposit link sent"], ["Tomorrow 9 AM", "Friendly nudge goes out unless paid tonight"]],
      actions: ["Send the nudge now", "Open the quote"]
    },
    "chip-storm": {
      title: "Weather watch, Saturday 1 PM",
      sub: "Thunderstorm cell, radar confidence high", tag: ["chip-bad", "Autopilot armed"], amt: "$3,910", amtLab: "Revenue in the 22 affected tee times",
      kv: [["Tee times in window", "22, from 12:20 to 3:10 PM"], ["Golfers", "84"], ["Playbook", "Horn, mass text, pro-rated rain checks"], ["Sent so far", "Nothing, fires only if the horn blows"]],
      tl: [["Thu 6:10 AM", "NWS radar flagged the Saturday cell"], ["Thu 6:12 AM", "Autopilot armed, rebook slots reserved Sun + next Sat"], ["Sat 12:48 PM", "If the horn blows: every golfer texted within 4 min"]],
      actions: ["Review the playbook", "See Rain Day page"]
    },
    "call-book": {
      title: "7:02 AM, Saturday foursome booked",
      sub: "Inbound call, 1 min 40 sec, before open", tag: ["chip-good", "Booked + paid"], amt: "$232", amtLab: "Green fees collected on the stored card",
      kv: [["Golfer", "M. Torres, (555) 208-1174"], ["Booked", "Sat Jul 18, 8:40 AM, 4 players"], ["Carts", "2, settled at the shop"], ["Written to", "foreUP tee sheet, row 8:40"]],
      tl: [["7:02 AM", "Call answered on ring one"], ["7:03 AM", "Slot held, card on file charged $232"], ["7:04 AM", "Confirmation text sent, calendar hold offered"]],
      actions: ["Text M. Torres", "Open in foreUP"]
    },
    "call-johnson": {
      title: "Johnson party moved to 1:30 PM",
      sub: "Inbound call, 11:15 AM", tag: ["chip-good", "Rescheduled"], amt: "$18", amtLab: "Cart fee added and collected",
      kv: [["Party", "Johnson, 4 players"], ["Was", "Today 11:15 AM"], ["Now", "Today 1:30 PM, cart added"], ["Sheet", "foreUP updated, old slot released to waitlist"]],
      tl: [["11:15 AM", "Caller asked to push the round back"], ["11:16 AM", "1:30 PM open, moved, cart added, $18 collected"], ["11:17 AM", "Old 11:15 slot offered to 14 waitlisted golfers"]],
      actions: ["Text the Johnsons", "Open in foreUP"]
    },
    "ar-rotary": {
      title: "Riverside Rotary, outing deposit",
      sub: "Invoice 2041, issued Tuesday", tag: ["chip-warn", "Nudge scheduled"], amt: "$1,224", amtLab: "25% deposit on the $4,896 package",
      kv: [["Contact", "Carol Maes, carol@riversiderotary.org"], ["Terms", "Deposit holds the Sep 17 shotgun"], ["Link opens", "2"], ["Next step", "Nudge email, tomorrow 9 AM"]],
      tl: [["Tue 2:18 PM", "Deposit link sent with the quote"], ["Wed 11:05 AM", "Link opened again, no payment"], ["Fri 9:00 AM", "Scheduled nudge, warm tone, one click to pay"]],
      actions: ["Send nudge now", "Mark as paid"]
    },
    "ar-maplewood": {
      title: "Maplewood FD Benefit, balance",
      sub: "84 players, booked for Mon Sep 28", tag: ["chip-neutral", "Not yet due"], amt: "$4,410", amtLab: "Balance after the paid deposit",
      kv: [["Deposit", "$1,470 paid"], ["Due", "Sep 21, one week before the event"], ["Reminder", "Drafted, in your approval queue"]],
      tl: [["Jun 30", "Deposit paid, date locked"], ["Wed", "Balance reminder drafted by the bookkeeper"], ["Sep 14", "Reminder sends on your OK"]],
      actions: ["Approve the reminder", "Open the draft"]
    },
    "ar-league": {
      title: "Wednesday Men's League, season balance",
      sub: "24 players, runs through September", tag: ["chip-warn", "Reminder sent"], amt: "$860", amtLab: "Outstanding on season dues",
      kv: [["Treasurer", "G. Lindqvist, (555) 771-0392"], ["Reminder", "Sent Monday, opened"], ["History", "Pays in full every season, usually late July"]],
      tl: [["Jul 1", "Season invoice issued"], ["Mon", "Reminder text sent to the treasurer"], ["Jul 28", "Second reminder if still open"]],
      actions: ["Text the treasurer", "Snooze to Aug 1"]
    },
    "ar-hartline": {
      title: "Hartline Insurance, house account",
      sub: "F&B tab from the June client day", tag: ["chip-bad", "Second notice"], amt: "$320", amtLab: "45 days outstanding",
      kv: [["Contact", "AP desk, ap@hartlineins.com"], ["First notice", "Jun 20, no reply"], ["Second notice", "Jul 10, opened twice"], ["Note", "They also have an outing inquiry open, handle warmly"]],
      tl: [["Jun 5", "Client-day tab signed to the house account"], ["Jul 10", "Second notice sent"], ["Jul 24", "Escalates to a phone call task for Kim"]],
      actions: ["Queue the call", "Write it off"]
    },
    "pipe-hartline": {
      title: "Hartline Insurance, outing inquiry",
      sub: "40 players, Fri Sep 25", tag: ["chip-neutral", "Inquiry, 22 min old"], amt: "est. $2,720", amtLab: "At the standard $68 package",
      kv: [["Contact", "T. Ridge, tridge@hartlineins.com"], ["Asked", "22 minutes ago, by email"], ["Draft quote", "Already built, 9:00 AM shotgun option"], ["Watch", "$320 house-account balance open, keep tone warm"]],
      tl: [["2:41 PM", "Inquiry read and parsed"], ["2:44 PM", "Quote drafted against the Sep 25 sheet"], ["3:00 PM", "Sends automatically unless you edit it"]],
      actions: ["Review the draft", "Send now"]
    },
    "pipe-stlukes": {
      title: "St. Luke's Booster Scramble",
      sub: "60 players, Sat Oct 3", tag: ["chip-neutral", "Quoted"], amt: "$4,080", amtLab: "Quoted in 6 minutes",
      kv: [["Contact", "Fr. D. Okon, (555) 940-2211"], ["Quoted", "Monday, link opened once"], ["Follow-up", "Scheduled Monday if no reply"]],
      tl: [["Mon 10:02 AM", "Inquiry in"], ["Mon 10:08 AM", "Quote out, $68 per player"], ["Next Mon", "Warm follow-up with two open Saturday options"]],
      actions: ["Send follow-up now", "Open the quote"]
    },
    "pipe-rotary": {
      title: "Riverside Rotary Fundraiser",
      sub: "72 players, Thu Sep 17", tag: ["chip-warn", "Deposit sent"], amt: "$4,896", amtLab: "1 PM shotgun, $68 per player",
      kv: [["Contact", "Carol Maes"], ["Deposit", "$1,224 pending, nudge tomorrow 9 AM"], ["Competitor", "Prairie Bend also quoting"]],
      tl: [["Tue 2:14 PM", "Inquiry in"], ["Tue 2:18 PM", "Quote + contract + deposit link out"], ["Fri 9:00 AM", "Deposit nudge scheduled"]],
      actions: ["Send nudge now", "Open the quote"]
    },
    "pipe-maplewood": {
      title: "Maplewood FD Benefit",
      sub: "84 players, Mon Sep 28", tag: ["chip-good", "Booked"], amt: "$5,880", amtLab: "Deposit paid, date locked",
      kv: [["Contact", "Lt. S. Barrera"], ["Deposit", "$1,470 paid Jun 30"], ["Balance", "$4,410 due Sep 21, reminder drafted"], ["Course", "Closed to public from 12:30 that day"]],
      tl: [["Jun 28", "Quote accepted"], ["Jun 30", "Deposit paid, foreUP blocked for the shotgun"], ["Sep 14", "Balance reminder sends on your OK"]],
      actions: ["Approve the reminder", "Open event sheet"]
    },
    "wx-sat": {
      title: "Saturday radar, hour by hour",
      sub: "National Weather Service point forecast, refreshed every 20 min", tag: ["chip-bad", "Autopilot armed"], amt: "85%", amtLab: "Peak rain probability, 1 PM cell",
      kv: [["Storm window", "12 PM to 3 PM, winds to 18 mph"], ["Tee times inside it", "22, holding $3,910"], ["Horn decision", "Yours. The playbook fires only after the horn"], ["If it fires", "84 golfers texted within 4 minutes"]],
      tl: [["Thu 6:10 AM", "NWS radar flagged the Saturday 1 PM cell"], ["Thu 6:12 AM", "Autopilot armed, rebook slots reserved Sun + next Sat"], ["Sat 12:48 PM", "Projected horn. Texts, rain checks, and rebooks all queue off this feed"]],
      actions: ["Review the playbook", "Open the full forecast"]
    },
    "wx-week": {
      title: "Next 7 days, from the radar feed",
      sub: "National Weather Service, updated this morning", tag: ["chip-warn", "1 storm day"], amt: "Sat", amtLab: "The only day the autopilot is armed",
      kv: [["Saturday", "85% rain at 1 PM, 22 tee times exposed"], ["Sunday", "20% and clearing, holding 14 rebook slots"], ["Rest of week", "Dry, no action needed"], ["Wired to", "Rain Day Autopilot + the tee sheet"]],
      tl: [["6:10 AM daily", "Forecast pulled and scored against the tee sheet"], ["Thu 6:12 AM", "Saturday cell crossed the threshold, autopilot armed"], ["Continuous", "Any new cell re-scores the week automatically"]],
      actions: ["See Rain Day page", "Adjust storm threshold"]
    },
    "gbp-reviews": {
      title: "Reviews, you vs the neighbors",
      sub: "Google Business Profile, checked hourly", tag: ["chip-good", "+21 this month"], amt: "4.7", amtLab: "534 reviews, best rating in a 20 mile radius",
      kv: [["Cedar Ridge", "4.7 stars, 534 reviews, +21 this month"], ["Willow Bend GC", "4.2 stars, 203 reviews"], ["Prairie Pines Muni", "4.4 stars, 388 reviews"], ["Reply time", "Every new review gets a drafted reply within the hour"]],
      tl: [["Tue 8:14 PM", "5-star review from a rain day rebook, reply drafted"], ["Wed 7:02 AM", "You approved 3 drafted replies with one click"], ["Monthly", "Review-ask texts go to golfers who just played, that is the +21"]],
      actions: ["Read the new reviews", "Approve drafted replies"]
    },
    "golfnow-rate": {
      title: "Your rate vs the trade time",
      sub: "Marketplace rates watched for comparison, nothing listed", tag: ["chip-good", "$2,340 kept"], amt: "$42 vs $19",
      amtLab: "Sat 2 PM: your rack rate against the marketplace trade time",
      kv: [["Your Sat 2 PM rate", "$42, sold on your own sheet"], ["Marketplace trade time", "$19 equivalent, golfer is theirs not yours"], ["Kept this season", "$2,340 by filling midday yourself"], ["Typical course", "Hands about $44,000 a year to marketplaces in barter"]],
      tl: [["Daily 6 AM", "Marketplace rates pulled for your zip code"], ["10:00 AM", "Soft windows offered to your own list first, at your price"], ["Season to date", "56 tee times kept off the trade pile"]],
      actions: ["See the backfill engine", "Compare another slot"]
    },
    "po-thu": {
      title: "Payout, Thursday July 16",
      sub: "Stripe payout po_9F42, landed in operating", tag: ["chip-good", "Matched"], amt: "$2,340", amtLab: "9 charges, tied to the bank deposit to the penny",
      kv: [["Green fees", "$1,742, 6 charges"], ["Cart fees", "$414, card on file"], ["Rain check redemptions", "$184, 2 golfers back from the Jul 3 storm"], ["Bank deposit", "Matched same day, no float mystery"]],
      tl: [["Thu 5:02 AM", "Payout initiated by Stripe"], ["Thu 9:14 AM", "Landed in the operating account"], ["Thu 9:15 AM", "Auto-matched to its 9 charges and posted to QuickBooks"]],
      actions: ["Open in QuickBooks", "See the 9 charges"]
    },
    "po-mon": {
      title: "Maplewood FD outing deposit",
      sub: "Stripe payout po_8D17, Monday July 13", tag: ["chip-good", "Matched"], amt: "$1,470", amtLab: "25% deposit on the $5,880 September package",
      kv: [["Payer", "Maplewood FD Benefit, Lt. S. Barrera"], ["Paid via", "The deposit link inside the quote"], ["Booked to", "Outings and events, deferred until Sep 28"], ["Balance", "$4,410 due Sep 21, reminder drafted"]],
      tl: [["Jun 30", "Deposit paid through the quote link"], ["Mon 9:20 AM", "Payout landed and matched to the invoice"], ["Sep 28", "Recognized as revenue when the shotgun plays"]],
      actions: ["Open the event sheet", "See the balance reminder"]
    },
    "toast-fb": {
      title: "F&B, straight from the register",
      sub: "Toast POS, grill and beverage cart, this week", tag: ["chip-good", "Reconciled nightly"], amt: "$5.61", amtLab: "F&B attached to every round played, July to date",
      kv: [["The turn (grill)", "$9,140 this week"], ["Beverage cart", "$4,320, best weekend on record"], ["Tips", "$1,238, split out of revenue automatically"], ["Where it lands", "The F&B line on the P&L, posted nightly"]],
      tl: [["Nightly 11:40 PM", "Toast batches close and post to the books"], ["Tue", "Week's batches reconciled, tips split out"], ["Monthly", "Attach rate per round tracked, up $0.84 vs last July"]],
      actions: ["Open the F&B line", "See beverage cart hours"]
    },
    "target-live": {
      title: "Tomorrow 11:50 AM to 2:30 PM",
      sub: "Weekday midday, the biggest soft window", tag: ["chip-warn", "Offer live"], amt: "+$279", amtLab: "9 bookings so far from the $31 offer",
      kv: [["Booked before offer", "38%"], ["Offer", "$31 midday rate, your list, your price"], ["Audience", "212 past weekday players"], ["Replies", "9 booked, 3 asked for other times"]],
      tl: [["10:00 AM", "Offer text sent to 212 golfers"], ["12:40 PM", "9th booking landed"], ["6:00 PM", "Window closes, unsold slots stay at rack rate"]],
      actions: ["Widen the audience", "Pause the offer"]
    }
  };

  var drawerRoot = null;
  function closeDrawer() {
    if (!drawerRoot) return;
    drawerRoot.classList.remove("on");
    setTimeout(function () { if (drawerRoot) { drawerRoot.remove(); drawerRoot = null; } }, 280);
  }
  function openDrawer(d) {
    closeDrawer();
    drawerRoot = document.createElement("div");
    drawerRoot.className = "drawer-root";
    var kv = "";
    (d.kv || []).forEach(function (p) { kv += '<div class="d-kv"><span class="k">' + p[0] + '</span><span class="v">' + p[1] + "</span></div>"; });
    var tl = "";
    (d.tl || []).forEach(function (p, idx, arr) {
      var cls = idx === arr.length - 1 ? " good" : "";
      tl += '<div class="tl-item' + cls + '"><span class="tl-dot"></span><div class="tl-body"><div class="tl-time">' + p[0] + '</div><div class="tl-sub">' + p[1] + "</div></div></div>";
    });
    var acts = "";
    (d.actions || []).forEach(function (a, idx) {
      acts += '<button class="btn ' + (idx === 0 ? "btn-accent" : "btn-ghost") + '" type="button" data-d-act="' + a + '">' + a + "</button>";
    });
    drawerRoot.innerHTML =
      '<div class="drawer-mask" data-d-close></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Detail">' +
      '  <div class="drawer-head">' +
      '    <div class="drawer-title">' + d.title + "</div>" +
      '    <div class="drawer-sub">' + (d.sub || "") + "</div>" +
      (d.tag ? '<span class="chip ' + d.tag[0] + '"><span class="dot"></span>' + d.tag[1] + "</span>" : "") +
      '    <button class="drawer-x" type="button" data-d-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      "  </div>" +
      '  <div class="drawer-body">' +
      (d.amt ? '<div class="d-amt tnum">' + d.amt + '</div><div class="d-amt-lab">' + (d.amtLab || "") + "</div>" : "") +
      (kv ? '<div class="d-section"><div class="d-label">Record</div>' + kv + "</div>" : "") +
      (tl ? '<div class="d-section"><div class="d-label">What the assistant did</div><div class="timeline">' + tl + "</div></div>" : "") +
      "  </div>" +
      (acts ? '<div class="drawer-foot">' + acts + "</div>" : "") +
      "</aside>";
    document.body.appendChild(drawerRoot);
    requestAnimationFrame(function () { drawerRoot.classList.add("on"); });
    drawerRoot.querySelectorAll("[data-d-close]").forEach(function (b) { b.addEventListener("click", closeDrawer); });
    drawerRoot.querySelectorAll("[data-d-act]").forEach(function (b) {
      b.addEventListener("click", function () { toast("Queued: " + b.getAttribute("data-d-act").toLowerCase()); });
    });
    function esc(e) { if (e.key === "Escape") { closeDrawer(); document.removeEventListener("keydown", esc); } }
    document.addEventListener("keydown", esc);
  }

  function textOf(el, sel) {
    var n = el.querySelector(sel);
    return n ? n.textContent.trim() : "";
  }
  function genericDrawer(el) {
    var title = textOf(el, ".r-title") || textOf(el, ".f-title") || textOf(el, ".a-title") ||
      textOf(el, ".p-name") || textOf(el, ".c-label") || (el.cells && el.cells[0] ? el.cells[0].textContent.trim() : "Detail");
    var sub = textOf(el, ".r-sub") || textOf(el, ".f-sub") || textOf(el, ".a-sub") || textOf(el, ".p-sub") || "";
    var amt = textOf(el, ".r-amt") || textOf(el, ".a-amt") || textOf(el, ".p-amt") || "";
    if (!amt && el.cells) {
      for (var c = el.cells.length - 1; c >= 0; c--) {
        var t = el.cells[c].textContent.trim();
        if (/\$|\d/.test(t) && !el.cells[c].querySelector(".chip")) { amt = t; break; }
      }
    }
    var chipEl = el.querySelector(".chip");
    var time = textOf(el, ".r-time") || textOf(el, ".f-time") || "Today";
    return {
      title: title, sub: sub,
      tag: chipEl ? [chipEl.className.split(/\s+/).filter(function (x) { return x.indexOf("chip-") === 0; })[0] || "chip-neutral", chipEl.textContent.trim()] : null,
      amt: amt, amtLab: amt ? "Attached to this record" : "",
      kv: [["Source", "foreUP tee sheet + call log"], ["Handled by", "Cedar Ridge assistant"], ["Logged", time]],
      tl: [[time, "Handled end to end by the assistant"], ["Tonight", "Rolls into the daily digest and the books"]],
      actions: ["Queue a follow-up", "Open in foreUP"]
    };
  }

  function wireDrills() {
    document.addEventListener("click", function (e) {
      if (e.target.closest("a") && !e.target.closest(".chip-card")) return;
      if (e.target.closest(".drawer-root") || e.target.closest(".modal-root") || e.target.closest(".tour-root")) return;
      if (e.target.closest("button") && !e.target.closest("[data-drill]")) return;
      var hit = e.target.closest("[data-drill], .chip-card, .pipe-item, .feed-item, .row, .table tbody tr");
      if (!hit) return;
      if (hit.closest(".heatmap")) return;
      e.preventDefault();
      var key = hit.getAttribute("data-drill");
      openDrawer(key && DRILL[key] ? DRILL[key] : genericDrawer(hit));
    });
  }

  /* ---------------- KPI deep links ---------------- */
  function wireKpiLinks() {
    document.querySelectorAll("[data-href]").forEach(function (el) {
      el.addEventListener("click", function () { location.href = el.getAttribute("data-href"); });
    });
    document.querySelectorAll("[data-scroll]").forEach(function (el) {
      el.addEventListener("click", function () {
        var t = document.querySelector(el.getAttribute("data-scroll"));
        if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      });
    });
  }

  /* ---------------- entrance motion ---------------- */
  function countUp(el) {
    var raw = el.textContent.trim();
    if (/[:]|AM|PM/.test(raw) || !/\d/.test(raw)) return;
    var m = raw.match(/^([^0-9]*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var prefix = m[1], suffix = m[3];
    var hasComma = m[2].indexOf(",") > -1;
    var target = parseFloat(m[2].replace(/,/g, ""));
    var decimals = (m[2].split(".")[1] || "").length;
    var t0 = null, dur = 700;
    function fmt(v) {
      var s = v.toFixed(decimals);
      if (hasComma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return prefix + s + suffix;
    }
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * p);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = raw;
    }
    requestAnimationFrame(frame);
  }

  function motion() {
    if (reduce) return;
    var i = 0;
    document.querySelectorAll(".content > *").forEach(function (el) {
      if (el.tagName === "SCRIPT") return;
      el.classList.add("anim-in");
      el.style.animationDelay = Math.min(i * 65, 520) + "ms";
      i++;
    });
    document.querySelectorAll(".kpis > .kpi, .chips > .chip-card").forEach(function (el, idx) {
      el.classList.add("anim-in");
      el.style.animationDelay = (idx * 55) + "ms";
    });
    document.querySelectorAll(".k-num, .s-num").forEach(countUp);
    document.querySelectorAll(".bar, .cf-bar").forEach(function (b) {
      var h = b.style.height;
      b.style.transition = "none";
      b.style.height = "0";
      requestAnimationFrame(function () {
        void b.offsetHeight;
        b.style.transition = "";
        b.style.height = h;
      });
    });
    document.querySelectorAll(".splitbar").forEach(function (s) { s.classList.add("grow-x"); });
  }

  /* ---------------- init ---------------- */
  function init() {
    document.querySelectorAll("[data-new-booking]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openBooking(); });
    });
    wireDrills();
    wireKpiLinks();
    motion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
