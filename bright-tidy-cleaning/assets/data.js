/* ============================================================
   Bright & Tidy demo data. All fictional, illustrative numbers.
   84 recurring clients across the Kansas City metro. The book:
   on the books $24,700/mo = recurring residential $23,100
   (84 clients, avg $275/mo, ~$3,300/yr) + Riverside Dental
   commercial $480/mo + deep/move-out average $1,120/mo.
   ============================================================ */
(function () {
  "use strict";

  // ---- churn radar client list (top of the 84 by risk) -----------
  // risk: 0-100. band: bad >=70, warn 40-69, good <40.
  var clients = [
    { name: "The Patels", plan: "Biweekly, 3/2.5", team: "Team A", rate: 150, yr: 3900, risk: 82,
      signal: "2 skips in 6 weeks + \"the baseboards were missed\" text Jul 9",
      save: "Free baseboard redo on the next visit, note to Dana" },
    { name: "K. Ellison", plan: "Biweekly, 3/2", team: "Team B", rate: 145, yr: 3770, risk: 61,
      signal: "Needed 2 payment reminders, asked to trim the scope",
      save: "Offer the smaller-scope rate card before she asks again" },
    { name: "M. Duran", plan: "Weekly, 2/2", team: "Team A", rate: 125, yr: 6500, risk: 55,
      signal: "1 skip + no reply to the last two confirmation texts",
      save: "Switch confirmations to email, she replies there" },
    { name: "The Watsons", plan: "Weekly, 4/3", team: "Team A", rate: 170, yr: 8840, risk: 38,
      signal: "Paused for July vacation, resume date confirmed Aug 4",
      save: "Resume reminder queued for Aug 1" },
    { name: "Karen Walsh", plan: "Biweekly, 3/2", team: "Team B", rate: 140, yr: 3640, risk: 24,
      signal: "Skip request Wednesday, moved to Thursday instead. Saved.",
      save: "" },
    { name: "The Hendersons", plan: "Weekly, 4/3", team: "Team A", rate: 165, yr: 8580, risk: 8,
      signal: "5-star review in March, referred two neighbors",
      save: "" },
    { name: "Dr. Amy Chen", plan: "Monthly, 2/2 condo", team: "Team C", rate: 120, yr: 1440, risk: 12,
      signal: "Flexible window, always pays same day",
      save: "" },
    { name: "T. Brennan", plan: "Weekly, 3/2", team: "Team B", rate: 165, yr: 8580, risk: 33,
      signal: "Invoice 11 days overdue, reminder 2 sent Tuesday",
      save: "" },
    { name: "The Muellers", plan: "Biweekly, 3/2", team: "Team B", rate: 140, yr: 3640, risk: 29,
      signal: "Invoice 8 days overdue, autopay invite sent with reminder",
      save: "" },
    { name: "S. Park", plan: "Biweekly, 2/1", team: "Team A", rate: 140, yr: 3640, risk: 26,
      signal: "Invoice 6 days overdue, reminder 1 sent this morning",
      save: "" },
    { name: "Riverside Dental", plan: "Commercial, 3x/week evenings", team: "Team B", rate: 480, yr: 5760, risk: 10,
      signal: "Office manager renewed the janitorial agreement in June",
      save: "" },
    { name: "The Ngs", plan: "Deep clean Jul 22, then biweekly", team: "Team C", rate: 150, yr: 3900, risk: 15,
      signal: "Took the Tuesday 10 AM slot from the waitlist in 12 minutes",
      save: "" }
  ];

  function money0(x) { return "$" + Math.round(x).toLocaleString("en-US"); }

  function band(risk) { return risk >= 70 ? "bad" : risk >= 40 ? "warn" : "good"; }

  function renderRiskTable(mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var html = "";
    clients.forEach(function (c) {
      var b = band(c.risk);
      var rowCls = b === "bad" ? ' class="flagged" id="patel-row"' : "";
      html += "<tr" + rowCls + ">" +
        "<td><b>" + c.name + "</b></td>" +
        "<td>" + c.plan + "</td>" +
        "<td>" + c.team + "</td>" +
        '<td class="num">' + money0(c.rate) + (c.plan.indexOf("Commercial") > -1 ? "/mo" : "/visit") + "</td>" +
        '<td class="num">' + money0(c.yr) + "/yr</td>" +
        '<td><div class="riskbar ' + b + '"><div class="track"><div class="fill" style="width:' + c.risk + '%"></div></div><b>' + c.risk + "</b></div></td>" +
        "<td>" + c.signal + "</td>" +
        "</tr>";
    });
    mount.innerHTML = html;
    var foot = document.getElementById("risk-table-foot");
    if (foot) {
      foot.textContent = "Showing the 12 clients the radar is watching closest, of 84 on the books. " +
        "1 high risk, 2 medium. Everyone else is quiet, which is the point.";
    }
  }

  window.BT = {
    clients: clients,
    renderRiskTable: renderRiskTable
  };
})();
