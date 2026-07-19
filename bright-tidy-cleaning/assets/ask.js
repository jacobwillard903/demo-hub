/* ============================================================
   Bright & Tidy demo, Ask page. Canned, keyword-matched Q&A.
   No network calls. Answers grounded in the demo's numbers.
   ============================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var thread = document.getElementById("ask-thread");
  var input = document.getElementById("ask-input");
  var send = document.getElementById("ask-send");
  var chips = document.getElementById("ask-chips");
  if (!thread || !input) return;

  var QA = [
    { keys: ["at risk", "risk", "churn", "losing", "about to quit", "cancel on us"],
      a: "One client is genuinely at risk: <b>the Patels</b>, biweekly at $150. Two skips in six weeks plus a \"the baseboards were missed\" text on Jul 9. That pattern is how clients leave: skip, skip, gone, worth <b>$3,900 a year</b>. I've suggested a save: free baseboard redo on the next visit with a note to Dana. K. Ellison (61) and M. Duran (55) are on watch. Everyone else is quiet." },
    { keys: ["open thursday", "thursday", "open slot", "slot open", "gap this week"],
      a: "One slot is open Thursday: <b>1:00 PM on Team B's West Loop route</b>, freed when the Hallers moved to Friday. The waitlist has two fits: J. Whitfield (quoted $150 biweekly, walkthrough already booked) and R. Calloway (monthly, any weekday). Say the word and I'll offer it, first to confirm wins." },
    { keys: ["owes", "owe", "unpaid", "overdue", "late", "invoices", "who hasn't paid"],
      a: "Three invoices are overdue, <b>$445 total</b>: T. Brennan $165 (11 days, reminder 2 sent Tuesday), the Muellers $140 (8 days, autopay invite went with the reminder), S. Park $140 (6 days, reminder 1 this morning). Two others, the Foglers and D. Reyes, <b>paid $270 after one friendly text</b> this week. Nothing needs an awkward call yet. Day 14 is when you get a call script." },
    { keys: ["while i was cleaning", "came in", "missed call", "this morning", "while i was", "on site"],
      a: "While you were at the Hendersons Tuesday: <b>1 call, 2 texts, 1 web form</b>. The call was J. Whitfield at 11:42 AM. I texted back in 40 seconds, ran the intake (3 bed, 2.5 bath, one dog, biweekly), quoted <b>$150 from the rate card</b>, and booked her walkthrough for Thursday 4:30 PM on the West Loop day. Before, that call had a 27% chance of ringing out and booking someone else." },
    { keys: ["this month vs last", "vs last month", "compare", "month over month", "how are we doing"],
      a: "July through the 17th: revenue <b>$13,980</b> vs $12,840 at this point in June, up 8.9%. Churn is holding at <b>4.1%</b> vs 8% in the spring. Skips saved this week: 4 of 6, worth $560. Unpaid invoices are down from $1,100 to <b>$445</b>. The book is $24,700 a month and climbing." },
    { keys: ["skip", "skips", "saved", "reschedule"],
      a: "Six skip requests this week, <b>4 saved</b> by offering a different day instead of accepting the hole: $560 kept on the books. The pattern that used to happen: a biweekly texts \"skip us this week\" the night before, that's an instant $140 hole and a churn signal. Now the reply goes out in seconds with two open slots to pick from. Karen Walsh's Wednesday skip became a Thursday visit." },
    { keys: ["overnight", "last night", "while i slept", "after hours"],
      a: "Overnight: a web form came in at <b>9:48 PM</b>, a 4/3 in Brookside asking about weekly service. I answered in under a minute, quoted <b>$165 to $185</b> pending walkthrough, and offered Tuesday or Friday slots. Also queued: the Ngs' deep-clean prep text for Jul 22 and three visit confirmations for tomorrow. Nothing rang your phone." },
    { keys: ["riverside", "dental", "commercial", "janitorial"],
      a: "<b>Riverside Dental</b> is steady: janitorial 3 evenings a week at <b>$480 a month</b>, agreement renewed in June. Last night's visit logged complete at 9:12 PM, supplies restocked. The office manager's only open item is a quarterly carpet extraction quote, drafted and waiting for your look." },
    { keys: ["callout", "call out", "sick", "kayla", "cover", "schedule fell apart"],
      a: "This morning at <b>6:45 AM Kayla called out sick</b>. By 6:46 I had a re-route drafted: Marisol solo on the two smaller West Loop homes, Jen (floating today) covering the 10:00 Beaumont stop she's cleaned twice before, and Dr. Chen's flexible monthly moved to Monday. Client texts were drafted for the two arrival-window changes. You approved it in one tap at 6:52. <b>Zero visits lost</b>, and you didn't cover a route yourself." },
    { keys: ["revenue", "money", "profit", "made this month", "financial", "cash"],
      a: "July 1 through today: revenue <b>$13,980</b>, expenses $7,610, net <b>$6,370</b> at a 45.6% margin. Cash on hand $18,940. AR outstanding is just the $445 of overdue invoices. All synced from QuickBooks on the Financials tab, four minutes fresh." },
    { keys: ["waitlist", "backfill", "tuesday", "fill"],
      a: "The Tuesday 10 AM gap on Team A filled in <b>12 minutes</b>. The waitlist ranked three fits by fit and value: the Ngs first (deep clean converting to biweekly, Northside, wants Tue/Wed). Offer texted 9:41 AM, accepted 9:53. That slot used to just die, the waitlist lived in your head." },
    { keys: ["supplies", "supply", "reorder", "stock"],
      a: "Three items are low: microfiber cloths (Team B's caddy), hardwood cleaner refill, and vacuum bags for the Team C Shark. A reorder is drafted at KC Janitorial Supply for <b>$86</b>, one tap to place it." }
  ];
  var FALLBACK = "In the live system I'd pull that straight from your schedule and books. In this demo, try one of the suggested questions below, they cover clients, routes, money, and this morning.";

  function answerFor(q) {
    var t = q.toLowerCase();
    var best = null, bestScore = 0;
    QA.forEach(function (item) {
      var score = 0;
      item.keys.forEach(function (k) { if (t.indexOf(k) > -1) score += k.length; });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return best ? best.a : FALLBACK;
  }

  function scrollDown() { thread.scrollTop = thread.scrollHeight; }

  function typeOut(el, html) {
    if (reduce) { el.innerHTML = html; scrollDown(); return; }
    var plain = html.replace(/<[^>]+>/g, "");
    var i = 0, step = Math.max(1, Math.round(plain.length / 60));
    (function tick() {
      i += step;
      el.textContent = plain.slice(0, i);
      scrollDown();
      if (i < plain.length) setTimeout(tick, 16);
      else { el.innerHTML = html; scrollDown(); }
    })();
  }

  var busy = false;
  function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    var you = document.createElement("div");
    you.className = "ask-msg you";
    you.textContent = q;
    thread.appendChild(you);
    scrollDown();

    var typing = document.createElement("div");
    typing.className = "ask-typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    thread.appendChild(typing);
    scrollDown();

    setTimeout(function () {
      typing.remove();
      var ai = document.createElement("div");
      ai.className = "ask-msg ai";
      thread.appendChild(ai);
      typeOut(ai, answerFor(q));
      busy = false;
    }, reduce ? 120 : 650 + Math.random() * 550);
  }

  send.addEventListener("click", function () { ask(input.value); input.value = ""; });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { ask(input.value); input.value = ""; }
  });
  if (chips) chips.querySelectorAll(".ask-chip").forEach(function (c) {
    c.addEventListener("click", function () { ask(c.textContent.trim()); });
  });

  window.BTASK = { ask: ask };
})();
