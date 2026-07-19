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

  // ---- live meter feed (round 5, via MeterLink) -------------------
  // 14 daily kWh values per pedestal. Site 44 runs 2.3x normal from Tue on.
  var meterFeed = [
    { site: 33, name: "G. Whitaker", days: [21,22,20,23,22,21,24,22,23,21,22,23,22,21] },
    { site: 43, name: "R. Toomey",   days: [25,24,26,25,27,24,26,25,24,26,25,27,26,25] },
    { site: 44, name: "M. Ferris",   days: [23,22,24,23,22,24,23,22,23,22,51,53,52,54], anom: true,
      note: "2.3x normal since Tue. Space heater pattern. Tenant texted." },
    { site: 46, name: "P. Osmond",   days: [28,27,29,28,30,27,29,28,27,29,28,30,29,28] },
    { site: 55, name: "H. Quist",    days: [27,28,26,29,28,27,29,28,27,28,29,27,28,29] },
    { site: 58, name: "D. Prather",  days: [25,26,24,27,25,26,25,24,26,25,26,25,24,26] },
    { site: 60, name: "F. Ibarra",   days: [19,20,18,21,19,20,19,21,20,19,33,20,19,20],
      note: "One-day spike Jul 14, re-read flagged before invoicing." },
    { site: 64, name: "Y. Camacho",  days: [29,30,28,31,29,30,29,28,30,29,31,30,29,30] }
  ];

  function sparkline(days, w, h) {
    var max = Math.max.apply(null, days), min = Math.min.apply(null, days);
    var span = Math.max(1, max - min);
    var pts = days.map(function (v, i) {
      var x = (i / (days.length - 1)) * (w - 6) + 3;
      var y = h - 4 - ((v - min) / span) * (h - 8);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    var last = pts[pts.length - 1].split(",");
    return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true">' +
      '<polyline points="' + pts.join(" ") + '"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="2.4"/></svg>';
  }

  function renderMeterFeed(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var html = "";
    meterFeed.forEach(function (m) {
      var t = null;
      tenants.forEach(function (x) { if (x.site === m.site) t = x; });
      var cyc = t ? t.kwh.toLocaleString("en-US") : "";
      html += '<div class="mrow' + (m.anom ? " anom" : "") + '" data-msite="' + m.site + '">' +
        '<span class="ms">' + m.site + "</span>" +
        '<span class="mwho"><b>' + m.name + "</b><span>" +
          (m.note ? m.note : "Steady. " + m.days[m.days.length - 1] + " kWh yesterday.") + "</span></span>" +
        sparkline(m.days, 100, 26) +
        '<span class="mk"><b>' + cyc + ' kWh</b>cycle to date</span>' +
        "</div>";
    });
    mount.innerHTML = html;
  }

  // ---- schematic park map (round 5, via Google Maps) --------------
  function padColor(status) { return status === "matched" ? "matched" : status; }
  function renderParkMap(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var byId = {};
    sites.forEach(function (s) { byId[s.id] = s; });
    function pad(id, x, y, w2, h2, rx) {
      var s = byId[id];
      if (!s) return "";
      var cls = padColor(s.status);
      var dark = cls === "occ" || cls === "matched";
      return '<g class="pad-g" data-sid="' + id + '"><title>' + s.label + ". " + s.type + (s.note ? ". " + s.note : "") + "</title>" +
        '<rect class="pad ' + cls + '" x="' + (x - w2 / 2).toFixed(1) + '" y="' + (y - h2 / 2).toFixed(1) +
        '" width="' + w2 + '" height="' + h2 + '" rx="' + (rx || 3) + '"/>' +
        '<text class="p-lbl' + (dark ? " lt" : "") + '" x="' + x.toFixed(1) + '" y="' + (y + 2.8).toFixed(1) +
        '" text-anchor="middle">' + s.label + "</text></g>";
    }
    var h = "";
    h += '<svg class="pmap" viewBox="0 0 1000 560" role="img" aria-label="Schematic map of Bear Hollow RV Park">';
    // grounds + river
    h += '<rect class="p-grass" x="0" y="0" width="1000" height="560" rx="10"/>';
    h += '<path class="p-river" d="M0 492 C 180 470, 320 512, 520 496 C 720 480, 850 516, 1000 498 L1000 560 L0 560 Z"/>';
    h += '<path class="p-riverline" d="M0 505 C 190 484, 330 524, 530 508 C 725 493, 855 528, 1000 511"/>';
    h += '<text class="p-tag" x="500" y="541" text-anchor="middle">Bear Creek</text>';
    // roads: entrance, spine down to riverside lane, oak loop
    h += '<path class="p-road" d="M0 84 L306 84 L306 442"/>';
    h += '<path class="p-road" d="M60 442 L952 442"/>';
    h += '<ellipse class="p-road2" cx="622" cy="220" rx="278" ry="118" fill="none"/>';
    h += '<path class="p-road2" d="M306 260 L344 240"/>';
    // office + bathhouse
    h += '<rect class="p-bldg" x="322" y="56" width="52" height="32" rx="4"/><text class="p-lbl lt" x="348" y="75" text-anchor="middle">Office</text>';
    h += '<rect class="p-bldg" x="560" y="196" width="42" height="26" rx="4"/><text class="p-lbl lt" x="581" y="212" text-anchor="middle">Bath</text>';
    // trees
    [[120,300],[150,330],[95,345],[185,300],[905,120],[930,160],[875,95],[420,120],[450,95]].forEach(function (t) {
      h += '<circle class="p-tree" cx="' + t[0] + '" cy="' + t[1] + '" r="11"/>';
    });
    // zone labels
    h += '<text class="p-zone" x="60" y="416">Riverside pull-throughs 1-30</text>';
    h += '<text class="p-zone" x="500" y="220" text-anchor="middle">Oak Loop 31-64</text>';
    h += '<text class="p-zone" x="118" y="152" text-anchor="middle">Tents</text>';
    h += '<text class="p-zone" x="874" y="52" text-anchor="middle">Cabins</text>';
    h += '<text class="p-zone" x="66" y="52">Overflow</text>';
    h += '<text class="p-tag" x="10" y="72">Entrance</text>';
    // riverside 1-30 along the lane above the creek
    var n;
    for (n = 1; n <= 30; n++) h += pad("s" + n, 62 + (n - 1) * 30.6, 468, 26, 17);
    // oak loop 31-64 around the ellipse
    for (n = 31; n <= 64; n++) {
      var a = ((n - 31) / 34) * Math.PI * 2 - Math.PI / 2;
      var x = 622 + Math.cos(a) * 278, y = 220 + Math.sin(a) * 118;
      h += pad("s" + n, x, y, 26, 16);
    }
    // tents T1-12: grove cluster
    for (n = 1; n <= 12; n++) {
      var col = (n - 1) % 4, row = Math.floor((n - 1) / 4);
      h += pad("t" + n, 72 + col * 34, 176 + row * 32, 24, 16, 8);
    }
    // cabins C1-4
    for (n = 1; n <= 4; n++) h += pad("c" + n, 806 + (n - 1) * 46, 78, 34, 24, 4);
    // overflow V1-4
    for (n = 1; n <= 4; n++) h += pad("v" + n, 44 + (n - 1) * 40, 116, 30, 17);
    h += "</svg>";
    mount.innerHTML = h;
  }

  window.BH = {
    sites: sites,
    tenants: tenants,
    meterFeed: meterFeed,
    renderSiteGrid: renderSiteGrid,
    renderTenantTable: renderTenantTable,
    renderMeterFeed: renderMeterFeed,
    renderParkMap: renderParkMap
  };
})();
