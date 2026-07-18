/* ============================================================
   Bear Hollow demo data. All fictional, illustrative numbers.
   84 sites: Riverside pull-throughs 1-30 (FHU 50A, 65-75 ft),
   Oak Loop back-ins 31-64 (30/50A, W/E or FHU), tents T1-T12,
   cabins C1-C4. 22 monthly tenants on Oak Loop.
   ============================================================ */
(function () {
  "use strict";

  // ---- site board -------------------------------------------------
  // status: occ | arr | open | monthly | matched | refill
  var overrides = {
    12: { status: "occ", note: "Booked 2:47 AM by the assistant" },
    14: { status: "refill", note: "Refilled 4:31 PM, Miller party" },
    22: { status: "matched", note: "Auto-matched, 42 ft fifth wheel" },
    5:  { status: "open" }, 9: { status: "open" }, 27: { status: "occ" },
    41: { status: "arr" }, 47: { status: "open" }, 52: { status: "open" }
  };
  // 22 monthly tenants live on Oak Loop 43-64
  var monthlySites = [43,44,45,46,48,49,50,51,53,54,55,56,57,58,59,60,61,62,63,64,33,34];

  var sites = [];
  var n;
  for (n = 1; n <= 30; n++) {
    sites.push({
      id: "s" + n, label: String(n), zone: "riverside",
      type: "Pull-through, FHU 50A",
      status: (overrides[n] && overrides[n].status) || (n % 7 === 3 ? "arr" : "occ"),
      note: overrides[n] && overrides[n].note
    });
  }
  for (n = 31; n <= 64; n++) {
    var st;
    if (overrides[n] && overrides[n].status) st = overrides[n].status;
    else if (monthlySites.indexOf(n) > -1) st = "monthly";
    else if (n % 9 === 4) st = "open";
    else if (n % 6 === 2) st = "arr";
    else st = "occ";
    sites.push({
      id: "s" + n, label: String(n), zone: "oakloop",
      type: n % 2 === 0 ? "Back-in, FHU" : "Back-in, W/E",
      status: st, note: overrides[n] && overrides[n].note
    });
  }
  for (n = 1; n <= 12; n++) {
    sites.push({
      id: "t" + n, label: "T" + n, zone: "tents", type: "Tent",
      status: n <= 7 ? "occ" : (n === 8 ? "arr" : "open")
    });
  }
  for (n = 1; n <= 4; n++) {
    sites.push({
      id: "c" + n, label: "C" + n, zone: "cabins", type: "Cabin",
      status: n === 2 ? "arr" : "occ"
    });
  }
  for (n = 1; n <= 4; n++) {
    sites.push({
      id: "v" + n, label: "V" + n, zone: "overflow", type: "Dry camping",
      status: n <= 2 ? "occ" : "open"
    });
  }

  function renderSiteGrid(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var zones = [
      ["riverside", "Riverside pull-throughs, sites 1-30"],
      ["oakloop", "Oak Loop back-ins, sites 31-64"],
      ["tents", "Tent sites T1-T12"],
      ["cabins", "Cabins C1-C4"],
      ["overflow", "Dry camping overflow V1-V4"]
    ];
    var html = "";
    zones.forEach(function (z) {
      html += '<div class="zone-label">' + z[1] + "</div>";
      sites.filter(function (s) { return s.zone === z[0]; }).forEach(function (s) {
        var cls = s.status === "matched" ? "matched" : s.status;
        var tip = s.type + (s.note ? ". " + s.note : "");
        html += '<div class="site ' + cls + '" id="site-' + s.id + '" title="' + tip + '">' +
          '<div class="sn">' + s.label + "</div>" +
          '<div class="st">' + (s.status === "occ" ? "occ" :
            s.status === "arr" ? "arr" :
            s.status === "open" ? "open" :
            s.status === "monthly" ? "mo" :
            s.status === "matched" ? "new" : "refill") + "</div></div>";
      });
    });
    mount.innerHTML = html;
  }

  // ---- monthly tenants (billing) ---------------------------------
  // 22 tenants, 21 collected, 1 late (D. Prather, site 58).
  var tenants = [
    { site: 33, name: "G. Whitaker",  kwh: 642, rent: 575, autopay: true,  paid: true },
    { site: 34, name: "L. Sandoval",  kwh: 588, rent: 550, autopay: true,  paid: true },
    { site: 43, name: "R. Toomey",    kwh: 731, rent: 595, autopay: true,  paid: true },
    { site: 44, name: "M. Ferris",    kwh: 704, rent: 595, autopay: true,  paid: true },
    { site: 45, name: "K. Delgado",   kwh: 668, rent: 575, autopay: false, paid: true },
    { site: 46, name: "P. Osmond",    kwh: 812, rent: 625, autopay: true,  paid: true },
    { site: 48, name: "T. Marsh",     kwh: 590, rent: 550, autopay: true,  paid: true },
    { site: 49, name: "A. Kowalski",  kwh: 776, rent: 615, autopay: true,  paid: true },
    { site: 50, name: "J. Renner",    kwh: 699, rent: 595, autopay: false, paid: true },
    { site: 51, name: "S. Albright",  kwh: 735, rent: 595, autopay: true,  paid: true },
    { site: 53, name: "C. Nowak",     kwh: 651, rent: 575, autopay: true,  paid: true },
    { site: 54, name: "B. Ferrell",   kwh: 720, rent: 595, autopay: true,  paid: true },
    { site: 55, name: "H. Quist",     kwh: 803, rent: 650, autopay: true,  paid: true },
    { site: 56, name: "E. Maddox",    kwh: 688, rent: 595, autopay: true,  paid: true },
    { site: 57, name: "N. Voss",      kwh: 655, rent: 575, autopay: false, paid: true },
    { site: 58, name: "D. Prather",   kwh: 741, rent: 615, autopay: false, paid: false },
    { site: 59, name: "W. Corliss",   kwh: 690, rent: 595, autopay: true,  paid: true },
    { site: 60, name: "F. Ibarra",    kwh: 724, rent: 595, autopay: true,  paid: true, reread: true },
    { site: 61, name: "V. Stanton",   kwh: 611, rent: 550, autopay: true,  paid: true },
    { site: 62, name: "O. Pruitt",    kwh: 758, rent: 615, autopay: true,  paid: true },
    { site: 63, name: "I. Hollis",    kwh: 596, rent: 550, autopay: true,  paid: true },
    { site: 64, name: "Y. Camacho",   kwh: 843, rent: 675, autopay: true,  paid: true }
  ];
  var RATE = 0.14;

  function money(x) { return "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function money0(x) { return "$" + Math.round(x).toLocaleString("en-US"); }

  function renderTenantTable(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var html = "";
    tenants.forEach(function (t) {
      var elec = t.kwh * RATE;
      var total = t.rent + elec;
      var rowCls = t.paid ? "" : ' class="flagged" id="late-payer-row"';
      var status = t.paid
        ? '<span class="pill good"><span class="dot"></span>Paid</span>'
        : '<span class="pill bad"><span class="dot"></span>6 days late</span>';
      var autopay = t.autopay
        ? '<span class="pill neutral">Autopay</span>'
        : (t.paid ? '<span class="pill neutral">Manual</span>' : '<span class="pill warn">Card failed</span>');
      var meterNote = t.reread ? ' <span class="pill info">Re-read flagged</span>' : "";
      html += "<tr" + rowCls + ">" +
        '<td class="num"><b>' + t.site + "</b></td>" +
        "<td><b>" + t.name + "</b></td>" +
        '<td class="num">' + t.kwh.toLocaleString("en-US") + " kWh" + meterNote + "</td>" +
        '<td class="num">' + money(t.kwh * RATE) + "</td>" +
        '<td class="num">' + money0(t.rent) + "</td>" +
        '<td class="num"><b>' + money(total) + "</b></td>" +
        "<td>" + autopay + "</td>" +
        "<td>" + status + "</td>" +
        "</tr>";
    });
    mount.innerHTML = html;

    var totElec = tenants.reduce(function (a, t) { return a + t.kwh * RATE; }, 0);
    var totAll = tenants.reduce(function (a, t) { return a + t.rent + t.kwh * RATE; }, 0);
    var foot = document.getElementById("tenant-table-foot");
    if (foot) {
      foot.textContent = "22 monthly tenants. Metered electric this cycle " + money(totElec) +
        " at $0.14/kWh. Total invoiced " + money(totAll) + ". 21 of 22 collected.";
    }
  }

  window.BH = {
    sites: sites,
    tenants: tenants,
    renderSiteGrid: renderSiteGrid,
    renderTenantTable: renderTenantTable
  };
})();
