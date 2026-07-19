/* ============================================================
   Stonebrook demo, Ask page. Canned, keyword-matched Q&A.
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
    { keys: ["rained out", "rain", "washout", "where did it go", "wednesday"],
      a: "Wednesday washed out, 90% rain flagged Tuesday night. Route B's <b>14 Westside stops slid to Thursday</b>, Thursday got re-sequenced tightest-first (11 fewer drive miles), and all 14 customers were texted their new day at <b>6:04 AM</b>. Six replied, all handled. About <b>$1,690</b> of cuts protected instead of scattered." },
    { keys: ["owes", "owe", "money out", "past due", "late", "ar "],
      a: "Open AR is <b>$2,180</b>, down from $6,400 in April. The breakdown: $1,260 in 1-30 days (T. Nguyen's $360 is the biggest, day-10 reminder sent), $540 across 3 accounts at 31-60 days, and <b>M. Brennan at $380 past 60</b>, service paused, final notice out with a payment plan option. Everyone's on an automatic reminder trail. You chase nobody." },
    { keys: ["quotes going cold", "cold", "follow up", "quote"],
      a: "Three: <b>Whitfield's $3,600 mulch and beds</b> (day 12, she opened the quote twice Sunday, last-call queues Friday), <b>Nguyen's $8,300 retaining wall</b> (day 9, day-7 nudge out), and <b>O'Rourke's $2,900 lighting</b> (day 8, went quiet after one question). That's $14,800 on autopilot. Every quote gets day 3, day 7, day 14, every time." },
    { keys: ["book this week", "booked this week", "what did the ai book", "leads", "captured"],
      a: "12 leads captured this week, <b>5 booked, $2,340/mo of new recurring</b>: Karen Delgado ($180 standard, Route B Thursday), G. Okafor ($150 EOW), C. Reyes ($180 standard), one full-service at $240, and the big one, <b>Briarcliff HOA at $1,590/mo</b>, signed online Friday morning. Plus Hollis Dental's walkthrough is on your calendar Tuesday 7:30 AM and Trammel's $9,800 patio visit is Saturday 9." },
    { keys: ["blowout", "winterization", "irrigation"],
      a: "Blowouts start the <b>week of October 12</b>, batched by neighborhood so it's 2 truck days total. The $95 winterization offer already went to all 28 systems on file: <b>22 booked, $2,090</b>. The 6 stragglers get one more nudge before the first freeze warning." },
    { keys: ["revenue", "profit", "made this month", "money", "financial", "july"],
      a: "July 1 through today: revenue <b>$27,070</b>, expenses $16,610, net <b>$10,460</b> at a 38.6% margin. Recurring plans put in $11,430 of that, installs $9,450. Cash on hand $18,940, open AR $2,180. All synced from QuickBooks on the Financials tab, four minutes fresh." },
    { keys: ["aeration", "overseed", "enhancement", "upsell"],
      a: "Fall aeration + overseed went to <b>54 eligible lawns</b>: 19 accepted so far, <b>$3,215 booked</b> into September route slack at a $169 average. Add winterization ($2,090) and spring's mulch refresh ($6,480 collected) and enhancements are tracking <b>$11,785</b> this year, off three approval taps." },
    { keys: ["hollis", "commercial", "dental"],
      a: "Hollis Dental Group, two buildings on Weldon Pkwy. Web form came in Sunday 9:18 PM, answered in 4 minutes, ballpark of <b>$1,240/mo</b> sent. The walkthrough is <b>Tuesday 7:30 AM</b>, before Route B rolls, and the brief (aerial, turf area, 14 beds, gate notes) is already on your phone." },
    { keys: ["route", "today", "tomorrow", "schedule", "this week"],
      a: "This week: Route A ran Maple Grove Monday, 16 cuts. Route C ran the mixed loop Tuesday, 15. Wednesday washed out, so Thursday ran <b>Route B's 14 moved Westside stops</b>, re-sequenced. The install crew is on the Kowalski drain job through Friday. Karen Delgado's first cut is Thursday on Route B." },
    { keys: ["brennan", "paused"],
      a: "M. Brennan, 89 Old Quarry Rd, <b>$380 past 60 days</b>. Five reminders, two replies, no payment, so service auto-paused July 10 per your rule. Final notice went out on the 14th with a 2-payment option. If it clears, one tap puts the stop back on Route C. No more mowing for free." },
    { keys: ["collections", "collected", "autopay", "billing"],
      a: "Collected this month: <b>$14,820, 92% of it automatic</b>. Card on file runs the plans on the 1st, failed cards retry at 2 AM (Patterson's cleared on retry Wednesday), and invoice customers get the day-3 / day-10 trail. AR is $2,180, down from $6,400 before the autopilot went in." }
  ];
  var FALLBACK = "In the live system I'd pull that straight from your routes, plans, and books. In this demo, try one of the suggested questions below, they cover the washout, money, quotes, and what got booked.";

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
})();
