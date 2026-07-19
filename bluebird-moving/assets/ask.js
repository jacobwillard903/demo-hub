/* ============================================================
   Bluebird Moving demo, Ask page. Canned, keyword-matched Q&A.
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
    { keys: ["deposit", "hasn't paid", "hasnt paid", "unpaid", "owes"],
      a: "One: <b>T. Harper, $1,480 quote, deposit link unpaid for 26 hours</b>. She said \"book it\" over text Thursday but a verbal yes without a deposit holds nothing. Nudge #1 went out Friday noon, nudge #2 fires at 9:00 AM, and if she's still quiet you get a one-tap call script. The other 9 deposits this week are collected, $1,350 total." },
    { keys: ["saturday", "booked saturday", "tomorrow", "this weekend", "dispatch"],
      a: "All 4 trucks are out Saturday, <b>100% utilization</b>. Trucks 1 and 3 run the Delgado 4BR (day 1 of 2, Marcus, Deon, Tony riding along, 20 ft shuttle for the tight street). Truck 2 is Whitfield's 3BR at 8:30 (Tyler and Luis), then they swing to Okafor's piano at 2:30 with Big Mike on the liftgate truck. 4 of 5 crew confirmed, Tyler's reminder went out at 7:12 PM." },
    { keys: ["month-end", "month end", "capacity", "jul 25", "waitlist", "next weekend"],
      a: "The month-end weekend, Jul 25-26, is <b>100% booked with a waitlist 3 deep</b> (Draper, Munoz, Standish). If anyone cancels, the waitlist gets texted first come first served, like Thursday when Vance's slot refilled with Whitfield in <b>26 minutes</b>. You lose zero truck-days to late cancels." },
    { keys: ["after hours", "after-hours", "overnight", "while i", "dinner", "9:40"],
      a: "This week the receptionist booked <b>9 jobs after hours</b>. The one to tell your buddies about: Sunday 9:40 PM, Denise Ellison called while you were at dinner, got a $1,040 quote from the cube-sheet questions, and paid the $150 deposit at 9:47. That used to be a voicemail she'd never leave, and a job for whoever answered first Monday." },
    { keys: ["close rate", "closing", "conversion", "win rate"],
      a: "Close rate is <b>45%, up from 28%</b>: 9 of the last 20 quotes booked. What moved it: answering in 2 seconds, texting the range in about 4 minutes while they're still on the phone with you and nobody else, and the 24h/72h/1wk follow-ups that never forget. At your $1,500 average, that jump is roughly <b>$3,800 a month</b> you were quoting and losing." },
    { keys: ["calls", "missed", "answer", "phone"],
      a: "<b>47 of 47 calls answered this week, zero missed</b>, average pickup 2 seconds. When both lines were busy Thursday, the missed-call text-back went out in 40 seconds and turned into Harper's $1,480 quote. Small movers lose 3 to 7 jobs a month to unanswered calls; this week that number was zero." },
    { keys: ["revenue", "money", "profit", "made", "july", "financial"],
      a: "July 1 through 18: revenue <b>$43,750</b> (local moves $38,450, packing and materials $4,120, bulky-item fees $1,180), expenses $27,790, net <b>$15,960 at 36.5%</b>. Cash on hand $28,400. Only open AR is Kessler's $1,750 office move, net 15. All synced from QuickBooks, 4 minutes fresh." },
    { keys: ["coi", "certificate", "kessler", "office move"],
      a: "Kessler's building needs a <b>COI, $1M general, before Jul 23</b>. The requirements were pulled from the property manager's email, the request is already with your insurance agent, and I'll nudge the agent daily until it lands. No day-before fire drill this time. The $1,750 quote is signed." },
    { keys: ["crew", "confirm", "tyler", "no-show", "no show"],
      a: "Saturday crews: <b>4 of 5 confirmed</b>. Marcus, Deon, Luis, and Big Mike replied within minutes of Friday's 6:30 PM assignment texts. Tyler is quiet, auto-reminder sent 7:12 PM, and if he's still quiet at 9:00 you get a heads-up plus Luis's cousin lined up as standby. No more Saturday 7 AM surprises." },
    { keys: ["piano", "bulky", "okafor"],
      a: "M. Okafor's 1BR plus upright piano is booked Saturday 2:30 PM: <b>$890 + $175 bulky-item fee</b>, crew of 3, the 16 ft liftgate truck reserved. He called at 7:55 AM before the line opened, had a quote by 7:58, and paid the deposit from the text link at 8:40." },
    { keys: ["february", "slow", "winter", "dead"],
      a: "February is the dead month, so the plan writes itself from your data: the receptionist tags every summer customer who mentioned a second move, storage, or a business, and in January it runs a \"lock a winter date, crew of 2 rate\" text campaign to past customers and the realtor list. Off-season demand you don't have to buy ads for." },
    { keys: ["review", "google", "stars", "dinged", "dresser"],
      a: "Every move closes with a same-day text: \"How did the crew do?\" Happy answers get the Google review link, 5 of them posted this month. The one grumble (a scuffed door frame on the Bryant move) got caught in text, turned into a $75 credit and a valuation claim note, and never became the 1-star that outweighs 30 clean moves." }
  ];
  var FALLBACK = "In the live system I'd pull that straight from SmartMoving and your books. In this demo, try one of the suggested questions below, they cover Saturday, deposits, month-end, and the money.";

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
    you.className = "msg out";
    you.textContent = q;
    thread.appendChild(you);
    scrollDown();

    var typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = '<i class="tdot"></i><i class="tdot"></i><i class="tdot"></i>';
    thread.appendChild(typing);
    scrollDown();

    setTimeout(function () {
      typing.remove();
      var ai = document.createElement("div");
      ai.className = "msg in";
      thread.appendChild(ai);
      typeOut(ai, answerFor(q));
      busy = false;
    }, reduce ? 120 : 650 + Math.random() * 550);
  }
  window.BBAsk = ask;

  send.addEventListener("click", function () { ask(input.value); input.value = ""; });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { ask(input.value); input.value = ""; }
  });
  if (chips) chips.querySelectorAll(".ask-chip").forEach(function (c) {
    c.addEventListener("click", function () { ask(c.textContent.trim()); });
  });
})();
