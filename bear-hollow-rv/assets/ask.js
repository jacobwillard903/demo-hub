/* ============================================================
   Bear Hollow demo, Ask page. Canned, keyword-matched Q&A.
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
    { keys: ["pull-through", "pull through", "40 ft", "40ft", "40 foot", "big rig", "fit a", "friday"],
      a: "Yes. Two Riverside pull-throughs are open Friday night: <b>Site 9</b> (70 ft, FHU, 50 amp) and <b>Site 5</b> (68 ft, FHU, 50 amp). Both fit a 40-footer with slides out. $58 a night. Want me to hold Site 9 and text you a payment link to forward?" },
    { keys: ["occupancy", "how full", "full tonight", "tonight"],
      a: "Tonight we're at <b>91%, 76 of 84 sites</b>. Five arrivals still inbound, two of them after hours with gate codes already sent. Saturday is 97% with one back-in left, and Monday drops to 64%, which is the optimizer's current target." },
    { keys: ["owes rent", "owes", "late", "rent", "unpaid", "past due"],
      a: "One tenant: <b>D. Prather, Site 58, $718.74, six days late</b>. His autopay card failed July 11. I sent a friendly reminder on the 12th and a firmer one on the 16th, and he replied \"mailing a check Friday.\" If nothing lands Friday, the late fee applies and I'll hand you a one-tap call script. The other 21 monthlies are collected." },
    { keys: ["overnight", "last night", "while i", "book overnight", "booked overnight", "2:47", "asleep"],
      a: "One booking overnight: a caller at <b>2:47 AM</b> wanted a 40 ft pull-through with full hookups and 50 amp for Friday to Sunday. I put them on <b>Site 12</b> at $58 a night and the payment link cleared at 2:51 AM. <b>$116 captured.</b> This week's after-hours total is $1,240 across 9 bookings." },
    { keys: ["october", "midweek", "shoulder", "empty nights", "slow season"],
      a: "October midweek is sitting at <b>31%</b>. The shoulder-season campaign is already live: \"3rd night free, Tuesday through Thursday,\" sent to 214 past midweek guests. So far <b>11 bookings and +$1,830</b> of October revenue. If it keeps converting, I'll propose extending it to early November." },
    { keys: ["review", "google", "stars", "rating"],
      a: "We're at <b>4.7 stars on 218 Google reviews</b>, 34 new this season, every one replied to in a median of 11 minutes. One needs you: K. Boland's 3-star from 8:14 this morning about back-loop wifi. A reply owning it, with a comeback-night offer, is <b>drafted and waiting for your approval</b> on the Reviews tab." },
    { keys: ["cancel", "refill", "waitlist"],
      a: "This month <b>4 of 5 cancellations refilled</b> from the waitlist, the fastest in 19 minutes (Site 14, Thursday). Right now 3 Labor Day waitlist offers are out with 24-hour holds; if anyone passes, the next in line is queued automatically." },
    { keys: ["revenue", "money", "profit", "made this month", "july so far", "financial"],
      a: "July 1 through today: revenue <b>$58,188</b>, expenses $23,977, net <b>$34,211</b> at a 58.8% margin. Cash on hand is $46,912 and the only open AR is Prather's $718.74. It's all synced from QuickBooks on the Financials tab, four minutes fresh." },
    { keys: ["electric", "meter", "kwh"],
      a: "Metered electric billed this cycle: <b>$2,159.50</b> across the 22 monthlies at $0.14/kWh, zero meters skipped. Site 60's read came in 31% above its average, so I'm holding it for a re-read before it bills wrong. Season to date we've recovered <b>$6,140 more</b> than last year." },
    { keys: ["arrival", "arriving", "check in", "check-in", "coming in"],
      a: "Five arrivals today: the Millers (Site 14, 4:30), R. Hendricks' 42 ft fifth wheel (Site 22, 6:00), T. Nguyen (tent T4, 5:30), and two after close, the Bakers at 10:15 and the Casteels at 9:40. Everyone already has their site number, map, and gate code by text. <b>Nothing needs you.</b>" },
    { keys: ["weather", "storm", "rain"],
      a: "Clear tonight. The National Weather Service feed is live for the county; if a warning drops, every occupied site gets the shelter text within a minute, like the July 9 storm when 61 sites were notified before anyone called the office." }
  ];
  var FALLBACK = "In the live system I'd pull that straight from your board and books. In this demo, try one of the suggested questions below, they cover sites, money, guests, and tonight.";

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
    // type plain text progressively, then swap in the formatted version
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
