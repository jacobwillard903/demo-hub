/* Cedar Ridge demo shell script: heatmap render, revenue bars, welcome gate. */
(function () {
  "use strict";
  var D = window.CRGC || {};

  function bucketColor(v) {
    var b = D.heatBuckets || [];
    for (var i = 0; i < b.length; i++) if (v >= b[i].min) return b[i].color;
    return "#b85c43";
  }

  function renderHeatmaps() {
    document.querySelectorAll("[data-heatmap]").forEach(function (host) {
      if (!D.heat) return;
      var days = Object.keys(D.heat);
      var html = '<table class="heatmap"><thead><tr><th></th>';
      D.heatHours.forEach(function (h) { html += "<th>" + h + "</th>"; });
      html += "</tr></thead><tbody>";
      days.forEach(function (day) {
        html += '<tr><td class="hm-day">' + day + "</td>";
        D.heat[day].forEach(function (v, idx) {
          html += '<td><div class="hm-cell" style="background:' + bucketColor(v) +
            '" data-tip="' + day + " " + D.heatHours[idx] + ", " + v + '% booked"></div></td>';
        });
        html += "</tr>";
      });
      html += "</tbody></table>";
      html += '<div class="hm-legend">';
      (D.heatBuckets || []).forEach(function (b) {
        html += '<span><span class="sw" style="background:' + b.color + '"></span>' + b.label + "</span>";
      });
      html += "</div>";
      host.innerHTML = html;
    });
  }

  function renderRevenueBars() {
    var host = document.querySelector("[data-revbars]");
    if (!host || !D.revenueWeek) return;
    var max = 0;
    D.revenueWeek.forEach(function (d) { if (d.amt > max) max = d.amt; });
    var html = '<div class="barchart">';
    D.revenueWeek.forEach(function (d) {
      var pct = Math.round((d.amt / max) * 100);
      var cls = d.amt === max ? "bar hi" : (d.amt < max * 0.5 ? "bar lo" : "bar");
      html += '<div class="bar-col">' +
        '<span class="bar-val">$' + (d.amt / 1000).toFixed(1) + "k</span>" +
        '<div class="' + cls + '" style="height:' + pct + '%"></div>' +
        '<span class="bar-lab">' + d.day + "</span></div>";
    });
    html += "</div>";
    host.innerHTML = html;
  }

  function welcomeGate() {
    if (!document.body.hasAttribute("data-welcome")) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    try { if (sessionStorage.getItem("crgc_welcome_seen")) return; } catch (e) {}
    var root = document.createElement("div");
    root.className = "welcome-root";
    root.innerHTML =
      '<div class="welcome-card" role="dialog" aria-modal="true" aria-label="Welcome">' +
      "<h3>Welcome to Cedar Ridge</h3>" +
      "<p>This is the ops layer running on top of the foreUP tee sheet. " +
      "Take the 2 minute walkthrough to see the phone agent, the no-show shield, " +
      "rain day handling, and outing quotes, in the order a GM feels the pain.</p>" +
      '<div class="welcome-btns">' +
      '<button class="btn btn-ghost" data-w-skip>Look around on my own</button>' +
      '<button class="btn btn-accent" data-w-start>Walk me through it</button>' +
      "</div></div>";
    document.body.appendChild(root);
    requestAnimationFrame(function () { root.classList.add("on"); });
    function close() {
      root.classList.remove("on");
      try { sessionStorage.setItem("crgc_welcome_seen", "1"); } catch (e) {}
      setTimeout(function () { root.remove(); }, 220);
    }
    root.querySelector("[data-w-skip]").addEventListener("click", close);
    root.querySelector("[data-w-start]").addEventListener("click", function () {
      close();
      if (window.Tour) setTimeout(window.Tour.start, 240);
    });
  }

  function init() {
    renderHeatmaps();
    renderRevenueBars();
    welcomeGate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
