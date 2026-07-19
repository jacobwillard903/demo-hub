/* ============================================================
   Stonebrook demo, round 5: live-data showcases.
   Hand-rolled SVG parcel sketch (satellite lot measure), the
   NWS forecast strips, the Route B schematic map, the reviews
   snapshot, and the Stripe collections ledger. Zero network
   calls: everything canned, presented as live feeds with a
   quiet "via <API>" source tag.
   Load order: after data.js, before interact.js.
   ============================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ----------------------------------------------------------
     Parcel sketch: 412 Birchwood Ln, 0.31 acre corner lot.
     Zones (sq ft): back turf 4,310 + front turf 3,880 + side
     strip 1,210 = 9,400 turf. Beds 640, house 1,860, driveway
     980, walks 614. Total 13,504 = 0.31 acre.
     ---------------------------------------------------------- */
  var Z = {
    back:  "#5d8a6c",
    front: "#6e9c7d",
    side:  "#7fa98d",
    bed:   "#a5714a",
    house: "#ddd8ca",
    drive: "#cbc5b4",
    walk:  "#d8d3c2",
    street:"#b9b3a2"
  };

  function parcelSVG(opts) {
    opts = opts || {};
    var anim = !reduce && !opts.still;
    var cls = "parcel-svg" + (anim ? " p-anim" : "");
    // label helper: chip rect + text
    function lab(x, y, txt, light) {
      var w = txt.length * 6.1 + 14;
      return '<g class="p-lab"><rect x="' + (x - w / 2) + '" y="' + (y - 10) + '" width="' + w + '" height="18" rx="9" fill="' + (light ? "rgba(255,255,255,.88)" : "rgba(18,33,23,.78)") + '"/>' +
        '<text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle" font-size="10" font-weight="600" fill="' + (light ? "#1e231e" : "#f1f6f2") + '">' + txt + "</text></g>";
    }
    var s = "";
    s += '<svg class="' + cls + '" viewBox="0 0 560 440" role="img" aria-label="Measured parcel sketch of 412 Birchwood Ln">';
    // canvas
    s += '<rect x="0" y="0" width="560" height="440" rx="10" fill="#eef0e6"/>';
    // streets: bottom (Birchwood Ln) + right (Glen Echo Dr), corner lot
    s += '<rect x="0" y="384" width="560" height="56" fill="' + Z.street + '"/>';
    s += '<rect x="486" y="0" width="74" height="440" fill="' + Z.street + '"/>';
    s += '<path d="M486 384 h74 v56 h-130 a56 56 0 0 0 56 -56 z" fill="' + Z.street + '"/>';
    // street center dashes
    s += '<line x1="14" y1="412" x2="420" y2="412" stroke="#f4f1e6" stroke-width="2.5" stroke-dasharray="14 12"/>';
    s += '<line x1="523" y1="14" x2="523" y2="330" stroke="#f4f1e6" stroke-width="2.5" stroke-dasharray="14 12"/>';
    s += '<text x="150" y="432" font-size="11" font-weight="600" fill="#7c7666" letter-spacing=".08em">BIRCHWOOD LN</text>';
    s += '<text x="530" y="120" font-size="11" font-weight="600" fill="#7c7666" letter-spacing=".08em" transform="rotate(90 530 120)">GLEN ECHO DR</text>';

    // parcel zones (order back to front)
    var zones = "";
    // back turf (top band)
    zones += '<path class="p-zone pz1" d="M28 28 h430 v128 h-244 v34 h-186 z" fill="' + Z.back + '"/>';
    // side strip (left of house)
    zones += '<rect class="p-zone pz2" x="28" y="190" width="112" height="182" fill="' + Z.side + '"/>';
    // front turf (bottom band around drive/walk)
    zones += '<path class="p-zone pz3" d="M140 286 h180 v34 h36 v52 h-216 z M416 286 h42 v86 h-42 z" fill="' + Z.front + '"/>';
    // turf mow-line texture
    zones += '<g class="p-zone pz1" stroke="#ffffff" stroke-opacity=".12" stroke-width="7">' +
      '<line x1="46" y1="40" x2="440" y2="40"/><line x1="46" y1="62" x2="440" y2="62"/>' +
      '<line x1="46" y1="84" x2="440" y2="84"/><line x1="46" y1="106" x2="440" y2="106"/>' +
      '<line x1="46" y1="128" x2="440" y2="128"/></g>';
    s += zones;

    // house footprint (L-shape) + wing
    s += '<g class="p-zone pz4">';
    s += '<path d="M140 156 h180 v130 h-180 z" fill="' + Z.house + '" stroke="#b4ad99" stroke-width="1.5"/>';
    s += '<rect x="320" y="196" width="62" height="90" fill="' + Z.house + '" stroke="#b4ad99" stroke-width="1.5"/>';
    s += '<line x1="140" y1="221" x2="320" y2="221" stroke="#c8c2b0" stroke-width="1"/>';
    s += "</g>";

    // driveway from wing to street
    s += '<rect class="p-zone pz5" x="330" y="286" width="52" height="98" fill="' + Z.drive + '" stroke="#b4ad99" stroke-width="1"/>';
    // walk to front door
    s += '<path class="p-zone pz5" d="M330 306 h-84 v78 h-16 v-94 h100 z" fill="' + Z.walk + '"/>';

    // beds: along house front + corner bed
    s += '<g class="p-zone pz6">';
    s += '<rect x="140" y="286" width="90" height="16" rx="4" fill="' + Z.bed + '"/>';
    s += '<rect x="416" y="156" width="42" height="116" rx="6" fill="' + Z.bed + '"/>';
    s += '<path d="M28 372 h112 v-24 a112 24 0 0 1 -112 24 z" fill="' + Z.bed + '" opacity=".9"/>';
    s += "</g>";

    // trees (back yard)
    s += '<g class="p-zone pz2"><circle cx="90" cy="86" r="26" fill="#3f6b50" opacity=".85"/><circle cx="90" cy="86" r="26" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="1.5"/>' +
      '<circle cx="392" cy="72" r="20" fill="#3f6b50" opacity=".85"/><circle cx="392" cy="72" r="20" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="1.5"/></g>';

    // fence: back + left boundary
    s += '<path class="p-zone pz2" d="M28 190 v-162 h430" fill="none" stroke="#4a4336" stroke-width="2" stroke-dasharray="7 5" opacity=".55"/>';

    // parcel boundary (drawn line)
    s += '<path class="p-bound" pathLength="100" d="M28 28 h430 v344 h-430 z" fill="none" stroke="#122117" stroke-width="2.5" stroke-dasharray="100" stroke-linejoin="round"/>';
    // measure ticks + dimensions
    s += '<g class="p-dim" stroke="#5b6455" stroke-width="1.2" fill="none">' +
      '<line x1="28" y1="392" x2="28" y2="380"/><line x1="458" y1="392" x2="458" y2="380"/><line x1="28" y1="388" x2="458" y2="388"/>' +
      '<line x1="16" y1="28" x2="24" y2="28"/><line x1="16" y1="372" x2="24" y2="372"/><line x1="20" y1="28" x2="20" y2="372"/></g>';
    s += '<g class="p-dim"><rect x="216" y="379" width="52" height="17" rx="8.5" fill="#eef0e6"/><text x="242" y="391.5" text-anchor="middle" font-size="10.5" font-weight="700" fill="#3c4438">142 ft</text>';
    s += '<rect x="1" y="186" width="40" height="17" rx="8.5" fill="#eef0e6"/><text x="21" y="198.5" text-anchor="middle" font-size="10.5" font-weight="700" fill="#3c4438">95 ft</text></g>';

    // zone labels
    s += '<g class="p-labs">';
    s += lab(240, 92, "Back turf 4,310 sq ft");
    s += lab(224, 344, "Front turf 3,880 sq ft");
    s += lab(84, 262, "Side 1,210", true);
    s += lab(230, 190, "House 1,860 sq ft", true);
    s += lab(356, 336, "Drive 980", true);
    s += lab(437, 214, "Beds 640", false);
    s += "</g>";
    // address chip
    s += '<g class="p-lab"><rect x="292" y="38" width="156" height="22" rx="11" fill="rgba(255,255,255,.92)"/><text x="370" y="53" text-anchor="middle" font-size="11" font-weight="700" fill="#1a3323">412 Birchwood Ln, 0.31 ac</text></g>';
    s += "</svg>";
    return s;
  }

  /* ----------------------------------------------------------
     Route B schematic map: 14 stops, the slid Thursday line.
     ---------------------------------------------------------- */
  var STOPS = [
    { n: 1,  x: 96,  y: 300, who: "W. Sandoval",  addr: "76 Juniper Way" },
    { n: 2,  x: 156, y: 246, who: "Westside stop", addr: "205 Juniper Way" },
    { n: 3,  x: 232, y: 292, who: "V. Stanton",   addr: "901 Cobblestone Ct" },
    { n: 4,  x: 300, y: 330, who: "Westside stop", addr: "118 Cobblestone Ct" },
    { n: 5,  x: 362, y: 282, who: "T. Nguyen",    addr: "77 Sycamore Ct" },
    { n: 6,  x: 340, y: 208, who: "Westside stop", addr: "31 Sycamore Ct" },
    { n: 7,  x: 262, y: 172, who: "P. Voss",      addr: "640 Timber Ridge" },
    { n: 8,  x: 196, y: 118, who: "Westside stop", addr: "512 Chestnut St" },
    { n: 9,  x: 284, y: 84,  who: "Westside stop", addr: "618 Chestnut St" },
    { n: 10, x: 378, y: 112, who: "Y. Camacho",   addr: "3308 Harvest Ln" },
    { n: 11, x: 458, y: 86,  who: "Westside stop", addr: "3410 Harvest Ln" },
    { n: 12, x: 520, y: 152, who: "C. Reyes",     addr: "1817 Stillwater Dr" },
    { n: 13, x: 574, y: 224, who: "Westside stop", addr: "1901 Stillwater Dr" },
    { n: 14, x: 620, y: 300, who: "Karen Delgado", addr: "412 Birchwood Ln", isNew: true }
  ];

  function routeMapSVG() {
    var anim = !reduce;
    var s = "";
    s += '<svg class="routemap-svg' + (anim ? " p-anim" : "") + '" viewBox="0 0 720 400" role="img" aria-label="Schematic map of Route B, 14 stops, Thursday line">';
    s += '<rect x="0" y="0" width="720" height="400" rx="10" fill="#f0efe7"/>';
    // street grid
    s += '<g stroke="#d9d4c2" stroke-width="13" stroke-linecap="round">';
    s += '<line x1="34" y1="118" x2="686" y2="118"/><line x1="34" y1="212" x2="686" y2="212"/><line x1="34" y1="306" x2="686" y2="306"/>';
    s += '<line x1="120" y1="34" x2="120" y2="366"/><line x1="262" y1="34" x2="262" y2="366"/><line x1="404" y1="34" x2="404" y2="366"/><line x1="546" y1="34" x2="546" y2="366"/>';
    s += '<path d="M34 366 C 200 340, 420 388, 686 342" fill="none"/>';
    s += "</g>";
    // street labels
    s += '<g font-size="10" font-weight="600" fill="#948d79">';
    s += '<text x="44" y="110">CHESTNUT ST</text><text x="44" y="204">TIMBER RIDGE</text><text x="44" y="298">JUNIPER WAY</text>';
    s += '<text x="574" y="70" transform="rotate(90 574 70)" text-anchor="start">STILLWATER DR</text>';
    s += '<text x="500" y="380">BIRCHWOOD LN</text>';
    s += "</g>";
    // shop pin
    s += '<g><rect x="24" y="322" width="58" height="30" rx="7" fill="#122117"/><text x="53" y="341" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">Shop</text></g>';
    // old Wednesday order: faint dashed
    var oldOrder = [1, 4, 9, 2, 11, 6, 13, 3, 8, 10, 5, 12, 7, 14];
    var d0 = "M53 337 ";
    oldOrder.forEach(function (n) { var p = STOPS[n - 1]; d0 += "L" + p.x + " " + p.y + " "; });
    s += '<path class="rm-old" d="' + d0 + '" fill="none" stroke="#a98549" stroke-width="2" stroke-dasharray="4 6" opacity=".38"/>';
    // Thursday line: re-sequenced, tightest-first
    var d1 = "M53 337 ";
    STOPS.forEach(function (p) { d1 += "L" + p.x + " " + p.y + " "; });
    s += '<path class="rm-line" pathLength="100" d="' + d1 + '" fill="none" stroke="#2e5a40" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="100"/>';
    // stop pins
    STOPS.forEach(function (p) {
      var fill = p.isNew ? "#94713d" : "#1a3323";
      s += '<g class="rm-pin" data-stop="' + p.n + '" tabindex="0" role="button" aria-label="Stop ' + p.n + ", " + p.who + '">' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="12.5" fill="' + fill + '" stroke="#fff" stroke-width="2.5"/>' +
        '<text x="' + p.x + '" y="' + (p.y + 3.8) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">' + p.n + "</text></g>";
    });
    // new-stop callout
    s += '<g><rect x="562" y="252" width="120" height="20" rx="10" fill="rgba(255,255,255,.92)"/><text x="622" y="266" text-anchor="middle" font-size="10" font-weight="700" fill="#7d5f33">New: Delgado, stop 14</text></g>';
    s += "</svg>";
    return s;
  }

  /* ----------------------------------------------------------
     NWS data (canned)
     ---------------------------------------------------------- */
  var NWS7 = [
    { d: "Fri", date: "Jul 17", hi: 88, lo: 68, p: 5,  k: "sun" },
    { d: "Sat", date: "Jul 18", hi: 91, lo: 70, p: 10, k: "sun" },
    { d: "Sun", date: "Jul 19", hi: 89, lo: 71, p: 0,  k: "sun" },
    { d: "Mon", date: "Jul 20", hi: 85, lo: 69, p: 20, k: "cloud" },
    { d: "Tue", date: "Jul 21", hi: 83, lo: 67, p: 55, k: "rain", watch: true },
    { d: "Wed", date: "Jul 22", hi: 82, lo: 66, p: 30, k: "cloud" },
    { d: "Thu", date: "Jul 23", hi: 84, lo: 64, p: 10, k: "sun" }
  ];
  var NWS_HOURS = [
    ["4a", 20], ["5a", 30], ["6a", 45], ["7a", 60], ["8a", 75], ["9a", 90],
    ["10a", 95], ["11a", 95], ["12p", 90], ["1p", 90], ["2p", 85], ["3p", 70],
    ["4p", 55], ["5p", 40], ["6p", 30], ["7p", 20], ["8p", 10]
  ];

  var ICO = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5.3" y1="5.3" x2="7" y2="7"/><line x1="17" y1="17" x2="18.7" y2="18.7"/><line x1="5.3" y1="18.7" x2="7" y2="17"/><line x1="17" y1="7" x2="18.7" y2="5.3"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a4 4 0 0 0 0-8z"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="16" y1="19" x2="16" y2="21"/></svg>'
  };

  function nws7HTML() {
    var h = "";
    NWS7.forEach(function (d) {
      h += '<button type="button" class="nws-day' + (d.watch ? " watch" : "") + '" data-nws="' + d.d + '">' +
        '<span class="nd">' + d.d + "</span>" +
        '<span class="ni ' + d.k + '">' + ICO[d.k] + "</span>" +
        '<span class="np' + (d.p >= 50 ? " wet" : "") + '">' + d.p + "%</span>" +
        '<span class="nt"><b>' + d.hi + "</b>/" + d.lo + "</span>" +
        (d.watch ? '<span class="nw-flag">watching</span>' : "") +
        "</button>";
    });
    return h;
  }

  function nwsHoursHTML() {
    var h = "";
    NWS_HOURS.forEach(function (x) {
      var cls = x[1] >= 80 ? " heavy" : x[1] >= 50 ? " wet" : "";
      h += '<div class="nh-col' + (x[0] === "6a" ? " sent" : "") + '">' +
        '<span class="nh-p">' + x[1] + "</span>" +
        '<div class="nh-bar' + cls + '" style="height:' + Math.max(6, x[1]) + '%"></div>' +
        '<span class="nh-cap">' + x[0] + "</span>" +
        (x[0] === "6a" ? '<span class="nh-mark">6:04 texts</span>' : "") +
        "</div>";
    });
    return h;
  }

  /* ----------------------------------------------------------
     Drawer records for the new widgets
     ---------------------------------------------------------- */
  function drawer(rec) { if (window.SBX) window.SBX.openDrawer(rec); }

  var PARCEL_REC = {
    kind: "Satellite lot measure", title: "412 Birchwood Ln", sub: "Karen Delgado's corner lot, measured in 8 seconds from the address. No truck rolled.",
    chips: [{ txt: "0.31 acre parcel", cls: "neutral" }, { txt: "Turf 9,400 sq ft", cls: "good" }, { txt: "$52/cut", cls: "tan" }],
    html: function () {
      return '<div class="dr-sect">The sketch</div><div class="dr-parcel">' + parcelSVG({ still: true }) + "</div>";
    },
    fields: [
      ["Turf, mowable", "9,400 sq ft (back 4,310 + front 3,880 + side 1,210)"],
      ["Beds", "640 sq ft, mulch and edging eligible"],
      ["House + drive + walks", "3,454 sq ft, excluded from the cut"],
      ["Rate sheet band", "9,000 to 11,000 sq ft turf"],
      ["Quote", "$52/cut, or $180/mo standard plan"]
    ],
    timeline: [
      ["10:42 AM", "Missed call captured, address pulled from caller ID."],
      ["10:42 AM", "Parcel measured from the satellite view: turf zones, beds, hard surfaces."],
      ["10:44 AM", "Turf 9,400 sq ft hit the $52 band on your rate sheet. Both prices texted."]
    ],
    actions: ["Open Karen's thread", "Edit the rate sheet"]
  };

  var REVIEW_RECS = {
    stonebrook: {
      kind: "Google Business Profile", title: "Stonebrook Lawn & Landscape", sub: "4.8 stars, 134 reviews, +9 this month. The velocity is the review nudge after every 4th cut.",
      chips: [{ txt: "4.8 (134)", cls: "good" }, { txt: "+9 this month", cls: "tan" }],
      fields: [["This month", "9 new reviews, all 5 star"], ["Reply time", "Every review answered within minutes, drafted for your voice"], ["Where they come from", "Nudge texted after the 4th cut, only to happy accounts"], ["Last one", '"Crew texted when they were 10 min out. Yard looks like a golf course." R. Patterson']],
      timeline: [["Tue 5:40 PM", "New 5-star from C. Reyes. Reply drafted and posted after your standing approval."], ["Jul 12", "Review nudge went to 6 accounts that hit their 4th cut. Three posted."], ["Jul 8", "One 3-star (mower tracks after rain). Apology + free edging visit drafted; customer bumped it to 4."]],
      actions: ["See all reviews", "Edit the nudge rule"]
    },
    greenscape: {
      kind: "Competitor watch", title: "GreenScape Pros", sub: "4.3 stars, 201 reviews, +2 a month. The biggest crew in Overland, and the slowest to answer its phone.",
      chips: [{ txt: "4.3 (201)", cls: "warn" }],
      fields: [["Velocity", "+2 a month and flat"], ["Recent theme", '"Nobody calls you back" appears in 4 of the last 10'], ["What it means", "Their missed calls are the leads your desk answers in 41 seconds"]],
      timeline: [["Weekly", "The assistant reads new competitor reviews and flags switching signals to the Estimate Desk."]],
      actions: ["View review themes"]
    },
    mowtown: {
      kind: "Competitor watch", title: "Mow Town", sub: "4.5 stars, 88 reviews, +3 a month. Two trucks, per-cut only, no plans.",
      chips: [{ txt: "4.5 (88)", cls: "warn" }],
      fields: [["Velocity", "+3 a month"], ["Recent theme", "Good cuts, no shows on rain weeks"], ["What it means", "Every washout they fumble is a Route B opening"]],
      timeline: [["Weekly", "Rain-week complaints get flagged; their unhappy customers are your spring pipeline."]],
      actions: ["View review themes"]
    }
  };

  var PAYOUTS = [
    { when: "Thu Jul 16", amt: "$2,340", n: 9,  note: "8 plan invoices + the Kowalski deposit balance" },
    { when: "Mon Jul 13", amt: "$3,180", n: 14, note: "Plan run week: 13 cards on the 1st cycle + 1 late clear" },
    { when: "Fri Jul 10", amt: "$1,905", n: 11, note: "Per-cut cards + 2 invoice-link payments" },
    { when: "Mon Jul 6",  amt: "$4,480", n: 17, note: "The big 1st-of-month card run landing" }
  ];

  function payoutRec(p) {
    return {
      kind: "Stripe payout", title: p.amt + " landed " + p.when, sub: "Matched to " + p.n + " invoices and filed in QuickBooks before Dave's coffee.",
      chips: [{ txt: "Matched " + p.n + " of " + p.n, cls: "good" }, { txt: "Reconciled", cls: "neutral" }],
      fields: [["Payout", p.amt + ", " + p.when], ["Matched to", p.n + " invoices"], ["What's inside", p.note], ["Books", "Filed against the right jobs in QuickBooks, same morning"]],
      timeline: [["Bank deposit", "Payout hit the operating account."], ["Same morning", "Every invoice inside it matched and marked paid. Nothing to chase in a spreadsheet."]],
      actions: ["View matched invoices", "Open in Financials"]
    };
  }

  var CASCADE_REC = {
    kind: "Card retry cascade", title: "How 92% collects itself", sub: "The dunning ladder behind every plan card, shown on R. Patterson's July invoice.",
    chips: [{ txt: "Collected $180", cls: "good" }, { txt: "0 minutes of Dave", cls: "tan" }],
    fields: [["Step 1", "Card charged on the 1st with the plan run"], ["Step 2", "Decline caught, soft heads-up text, no shame"], ["Step 3", "Automatic retry at 2:00 AM on day 3"], ["Step 4", "Still failing: update-card link, then the reminder trail"], ["Step 5", "Day 60 unpaid: service pauses, per your rule"]],
    timeline: [["Jul 1", "Patterson's $180 plan invoice charged with the monthly run."], ["Jul 12", "Card declined. He got a friendly heads-up text."], ["Jul 15, 2:00 AM", "Retry cleared. Receipt sent."], ["Jul 15, 6:00 AM", "It shows up in your morning text as one line: collected."]],
    actions: ["Edit the retry ladder", "View Patterson"]
  };

  function nwsDayRec(d) {
    return {
      kind: "National Weather Service", title: d.d + " " + d.date + ": " + d.p + "% rain, " + d.hi + "/" + d.lo,
      sub: d.watch
        ? "Above 50% and climbing. If Tuesday crosses your 80% washout rule, the reshuffle drafts itself that night."
        : "Below your 80% washout rule. Routes run as boarded.",
      chips: d.watch ? [{ txt: "Watching", cls: "warn" }, { txt: "Rule: 80% + half inch", cls: "neutral" }] : [{ txt: "Clear to mow", cls: "good" }],
      fields: [["Forecast", d.p + "% chance of rain, high " + d.hi + ", low " + d.lo], ["Feed", "Hourly forecast for Overland, checked every hour"], ["Your rule", "Above 80% with half an inch or more, the day reshuffles automatically"]],
      timeline: [[d.watch ? "If it crosses" : "Standing", d.watch ? "Draft reshuffle built overnight, customers texted at 6 AM, you get the summary." : "Nothing to do. The feed watches so nobody refreshes a radar app at 9 PM."]],
      actions: d.watch ? ["Preview the reshuffle", "Edit the rain rule"] : ["Edit the rain rule"]
    };
  }

  function stopRec(p) {
    return {
      kind: "Route B stop " + p.n + " of 14", title: p.who, sub: p.addr + ". Wednesday cut moved to Thursday's re-sequenced line.",
      chips: [{ txt: "Moved to Thu", cls: "good" }].concat(p.isNew ? [{ txt: "New account", cls: "tan" }] : []),
      fields: [["Position", "Stop " + p.n + " on the Thursday line"], ["Notified", "Texted 6:04 AM with the new day"], ["Why this order", "Tightest-first sequencing, 11 fewer drive miles than tacking stops on"]],
      timeline: [["Tue 8:01 PM", "Slotted into the draft reshuffle."], ["Wed 6:04 AM", "Move text sent. " + (p.isNew ? "First cut stayed on schedule." : "No reply needed.")]],
      actions: ["Text " + p.who, "View the full line"]
    };
  }

  /* ----------------------------------------------------------
     Mount + wire
     ---------------------------------------------------------- */
  function mount() {
    var el;

    // parcel hero (estimates)
    el = document.getElementById("parcel-mount");
    if (el) el.innerHTML = parcelSVG();
    document.querySelectorAll("[data-parcel-drawer]").forEach(function (b) {
      b.classList.add("clickable");
      b.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        drawer(PARCEL_REC);
      });
    });

    // route map (rain day)
    el = document.getElementById("route-map-mount");
    if (el) {
      el.innerHTML = routeMapSVG();
      el.querySelectorAll(".rm-pin").forEach(function (pin) {
        function open() { drawer(stopRec(STOPS[+pin.getAttribute("data-stop") - 1])); }
        pin.addEventListener("click", open);
        pin.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      });
    }

    // NWS 7 day (dashboard)
    el = document.getElementById("nws7-mount");
    if (el) {
      el.innerHTML = nws7HTML();
      el.querySelectorAll(".nws-day").forEach(function (d, ix) {
        d.addEventListener("click", function () { drawer(nwsDayRec(NWS7[ix])); });
      });
    }

    // NWS hourly (rain day)
    el = document.getElementById("nwsh-mount");
    if (el) {
      el.innerHTML = nwsHoursHTML();
      if (!reduce) {
        el.querySelectorAll(".nh-bar").forEach(function (bar, ix) {
          var h = bar.style.height;
          bar.style.transition = "none";
          bar.style.height = "0%";
          setTimeout(function () {
            bar.style.transition = "height .5s cubic-bezier(.22,.61,.36,1)";
            bar.style.height = h;
          }, 140 + ix * 30);
        });
      }
    }

    // reviews snapshot (dashboard)
    document.querySelectorAll("[data-review]").forEach(function (col) {
      col.classList.add("clickable");
      col.addEventListener("click", function () {
        drawer(REVIEW_RECS[col.getAttribute("data-review")] || REVIEW_RECS.stonebrook);
      });
    });

    // stripe ledger (billing)
    el = document.getElementById("payout-mount");
    if (el) {
      var h = "";
      PAYOUTS.forEach(function (p, ix) {
        h += '<div class="ledger-row" data-payout="' + ix + '">' +
          '<span class="lr-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></span>' +
          '<span class="lr-main"><b>Payout ' + p.amt + " landed " + p.when.split(" ")[0] + '</b><span>Matched to ' + p.n + " invoices. " + p.note + ".</span></span>" +
          '<span class="lr-chip"><span class="pill good"><span class="dot"></span>Matched ' + p.n + "/" + p.n + "</span></span></div>";
      });
      el.innerHTML = h;
      el.querySelectorAll(".ledger-row").forEach(function (row) {
        row.classList.add("clickable");
        row.addEventListener("click", function () { drawer(payoutRec(PAYOUTS[+row.getAttribute("data-payout")])); });
      });
    }
    el = document.getElementById("cascade-card");
    if (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function (e) {
        if (e.target.closest("a,button")) return;
        drawer(CASCADE_REC);
      });
    }

    // integrations: "See it live" deep links must not open the card drawer
    document.querySelectorAll(".int-see a").forEach(function (a) {
      a.addEventListener("click", function (e) { e.stopPropagation(); });
    });

    // deep-link landing: scroll + flash the target widget
    if (location.hash && location.hash.length > 1) {
      var t = null;
      try { t = document.querySelector(location.hash); } catch (e) {}
      if (t) {
        setTimeout(function () {
          t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
          t.classList.add("flash-target");
          setTimeout(function () { t.classList.remove("flash-target"); }, 2600);
        }, 250);
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  window.SHOW = { parcelSVG: parcelSVG, routeMapSVG: routeMapSVG, parcelRec: PARCEL_REC };
})();
