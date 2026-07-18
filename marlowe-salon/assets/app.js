/* Marlowe Hair Co. demo — shell behavior (static, no backend). */
(function () {
  "use strict";

  // Revenue trend bars (dashboard only): rendered from data.js so the
  // chart and its labels always agree.
  function renderBars() {
    var host = document.getElementById("revenue-bars");
    if (!host || !window.MARLOWE) return;
    var weeks = window.MARLOWE.revenueWeeks;
    var max = 0;
    weeks.forEach(function (w) { if (w.amount > max) max = w.amount; });
    var html = "";
    weeks.forEach(function (w, idx) {
      var h = Math.round((w.amount / max) * 150);
      var last = idx === weeks.length - 1;
      html +=
        '<div class="b">' +
        '<span class="v">$' + (w.amount / 1000).toFixed(1) + "k</span>" +
        '<div class="bar' + (last ? "" : " dim") + '" style="height:' + h + 'px"></div>' +
        '<span class="x">' + w.label + "</span>" +
        "</div>";
    });
    host.innerHTML = html;
  }

  // Welcome gate: on first visit (per session) offer the tour.
  // Skipped when the tour is already resuming via ?tour=1.
  function welcomeGate() {
    if (!document.body.hasAttribute("data-welcome")) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    var KEY = "marlowe-welcomed";
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) { return; }

    var box = document.createElement("div");
    box.className = "welcome";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Guided tour offer");
    box.innerHTML =
      "<h4>First time in Marlowe's owner view?</h4>" +
      "<p>Take the guided walkthrough. It follows one canceled balayage from dead chair to refilled slot, walks the live book, and ends where the money lands in QuickBooks.</p>" +
      '<div class="row">' +
      '<button class="go" type="button">Walk me through it</button>' +
      '<button class="no" type="button">Not now</button>' +
      "</div>";
    document.body.appendChild(box);

    function dismiss() {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      box.remove();
    }
    box.querySelector(".go").addEventListener("click", function () {
      dismiss();
      if (window.Tour) window.Tour.start();
    });
    box.querySelector(".no").addEventListener("click", dismiss);
  }

  function init() {
    renderBars();
    welcomeGate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
