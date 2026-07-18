/* Precision Auto Care demo - shell behavior (no backend). */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    // Decorative nav items (not built in this demo) stay put.
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });

    // Topbar tour switch drives the walkthrough.
    var sw = document.querySelector("#tour-switch");
    if (sw) {
      sw.addEventListener("change", function () {
        if (!window.Tour) { sw.checked = false; return; }
        if (sw.checked) window.Tour.start();
        else window.Tour.end();
      });
    }

    // First-visit welcome gate on the dashboard (session-gated).
    var wantsWelcome = document.body.hasAttribute("data-welcome");
    var resuming = /[?&]tour=1\b/.test(location.search);
    var seen = false;
    try { seen = sessionStorage.getItem("pt_welcome") === "1"; } catch (e) {}
    if (wantsWelcome && !resuming && !seen) {
      try { sessionStorage.setItem("pt_welcome", "1"); } catch (e) {}
      var root = document.createElement("div");
      root.className = "welcome-root";
      root.innerHTML =
        '<div class="welcome-card" role="dialog" aria-label="Welcome">' +
        '  <h3>Welcome to Precision’s AI service desk</h3>' +
        '  <p>This is what the shop looks like with an AI front desk answering the phone, chasing approvals, and reselling declined work. Want the 3 minute walkthrough?</p>' +
        '  <div class="welcome-actions">' +
        '    <button class="go" type="button">Walk Me Through It</button>' +
        '    <button class="later" type="button">Maybe later</button>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(root);
      root.querySelector(".go").addEventListener("click", function () {
        root.remove();
        if (window.Tour) window.Tour.start();
      });
      root.querySelector(".later").addEventListener("click", function () { root.remove(); });
    }
  });
})();
