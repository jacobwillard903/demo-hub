/* ============================================================
   Stonebrook demo data. All fictional, illustrative numbers.
   85 maintenance accounts: 61 monthly plans (13 basic $150,
   34 standard $180, 14 full-service $240 = $11,430 MRR), 24
   per-cut. Routes: A Maple Grove (Mon, 16), B Westside (Wed,
   14), C mixed (Tue, 15), plus the install crew.
   ============================================================ */
(function () {
  "use strict";

  // ---- monthly plan roster (representative rows of the 61) --------
  // tier: basic 150 | standard 180 | full 240
  // ar: null = current, or { bucket:"1-30"|"31-60"|"60+", amt, note }
  var plans = [
    { name: "K. Delgado",   addr: "412 Birchwood Ln",   tier: "standard", route: "B / Wed", autopay: true,  ar: null, note: "New this week, booked by the assistant" },
    { name: "R. Patterson", addr: "1108 Glen Echo Dr",  tier: "standard", route: "A / Mon", autopay: true,  ar: null, note: "Card retry succeeded Jul 15" },
    { name: "T. Nguyen",    addr: "77 Sycamore Ct",     tier: "standard", route: "B / Wed", autopay: false, ar: { bucket: "1-30", amt: 360, note: "2 invoices open, day-10 reminder sent" } },
    { name: "A. Kowalski",  addr: "1420 Foxtail Rd",    tier: "full",     route: "C / Tue", autopay: true,  ar: null, note: "Drainage + sod install WON, $4,200" },
    { name: "M. Brennan",   addr: "89 Old Quarry Rd",   tier: "standard", route: "C / Tue", autopay: false, ar: { bucket: "60+", amt: 380, note: "Service paused, final notice sent" } },
    { name: "J. Whitfield", addr: "300 Larkspur Ave",   tier: "full",     route: "A / Mon", autopay: true,  ar: null, note: "Mulch quote following up, day 12" },
    { name: "D. Amara",     addr: "512 Chestnut St",    tier: "standard", route: "B / Wed", autopay: false, ar: { bucket: "31-60", amt: 180, note: "2nd reminder sent Jul 12" } },
    { name: "S. Ferrell",   addr: "18 Hollow Creek Dr", tier: "standard", route: "C / Tue", autopay: false, ar: { bucket: "31-60", amt: 180, note: "Promised to pay Friday" } },
    { name: "L. Ruiz",      addr: "2204 Prairie View",  tier: "standard", route: "A / Mon", autopay: false, ar: { bucket: "31-60", amt: 180, note: "2nd reminder sent Jul 12" } },
    { name: "P. Voss",      addr: "640 Timber Ridge",   tier: "full",     route: "B / Wed", autopay: true,  ar: { bucket: "1-30", amt: 240, note: "Card expired, retry queued tonight" } },
    { name: "G. Okafor",    addr: "95 Meadowlark Ln",   tier: "basic",    route: "A / Mon", autopay: true,  ar: null, note: "New this week, EOW plan" },
    { name: "C. Reyes",     addr: "1817 Stillwater Dr", tier: "standard", route: "B / Wed", autopay: true,  ar: null, note: "New this week" },
    { name: "H. Callahan",  addr: "Briarcliff HOA",     tier: "full",     route: "C / Tue", autopay: true,  ar: null, note: "HOA common areas, $1,590/mo contract" },
    { name: "E. Marsh",     addr: "410 Dogwood Cir",    tier: "basic",    route: "A / Mon", autopay: true,  ar: null },
    { name: "N. Pruitt",    addr: "2214 Alder Ct",      tier: "basic",    route: "C / Tue", autopay: true,  ar: null },
    { name: "W. Sandoval",  addr: "76 Juniper Way",     tier: "standard", route: "B / Wed", autopay: true,  ar: null },
    { name: "B. Quist",     addr: "1533 Ridgeline Dr",  tier: "full",     route: "A / Mon", autopay: true,  ar: null },
    { name: "F. Toomey",    addr: "228 Wren Hollow",    tier: "standard", route: "C / Tue", autopay: true,  ar: null },
    { name: "V. Stanton",   addr: "901 Cobblestone Ct", tier: "basic",    route: "B / Wed", autopay: true,  ar: null },
    { name: "O. Maddox",    addr: "1745 Shady Bend",    tier: "standard", route: "A / Mon", autopay: true,  ar: null },
    { name: "I. Corliss",   addr: "63 Pin Oak Dr",      tier: "full",     route: "C / Tue", autopay: true,  ar: null },
    { name: "Y. Camacho",   addr: "3308 Harvest Ln",    tier: "standard", route: "B / Wed", autopay: true,  ar: null }
  ];

  var RATES = { basic: 150, standard: 180, full: 240 };
  var TIER_LABEL = { basic: "Basic $150", standard: "Standard $180", full: "Full-service $240" };

  function money0(x) { return "$" + Math.round(x).toLocaleString("en-US"); }

  function renderPlanTable(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var html = "";
    plans.forEach(function (p) {
      var rate = p.name === "H. Callahan" ? 1590 : RATES[p.tier];
      var rowCls = p.ar && p.ar.bucket === "60+" ? ' class="flagged" id="paused-account-row"' : "";
      var status;
      if (!p.ar) status = '<span class="pill good"><span class="dot"></span>Current</span>';
      else if (p.ar.bucket === "1-30") status = '<span class="pill warn"><span class="dot"></span>1-30 days, ' + money0(p.ar.amt) + "</span>";
      else if (p.ar.bucket === "31-60") status = '<span class="pill warn"><span class="dot"></span>31-60 days, ' + money0(p.ar.amt) + "</span>";
      else status = '<span class="pill bad"><span class="dot"></span>60+ days, ' + money0(p.ar.amt) + "</span>";
      var pay = p.autopay
        ? '<span class="pill neutral">Card on file</span>'
        : '<span class="pill neutral">Invoice</span>';
      html += "<tr" + rowCls + ">" +
        "<td><b>" + p.name + "</b></td>" +
        "<td>" + p.addr + "</td>" +
        "<td>" + TIER_LABEL[p.tier] + "</td>" +
        '<td class="num"><b>' + money0(rate) + "/mo</b></td>" +
        "<td>" + p.route + "</td>" +
        "<td>" + pay + "</td>" +
        "<td>" + status + "</td>" +
        "</tr>";
    });
    mount.innerHTML = html;

    var foot = document.getElementById("plan-table-foot");
    if (foot) {
      foot.textContent = "Showing 22 of 61 monthly plans. 13 basic at $150, 34 standard at $180, 14 full-service at $240. " +
        "$11,430/mo recurring. 5 accounts carry open AR totaling $2,180.";
    }
  }

  window.SB = {
    plans: plans,
    rates: RATES,
    renderPlanTable: renderPlanTable
  };
})();
