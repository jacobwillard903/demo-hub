/* ============================================================
   Bear Hollow demo, shared shell behavior.
   Welcome gate: on first app visit this session, offer the tour
   (unless the tour was launched via ?tour=1).
   ============================================================ */
(function () {
  "use strict";

  var GATE_KEY = "bh-welcome-seen";

  function initGate() {
    var gate = document.getElementById("welcome-gate");
    if (!gate) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    var seen = null;
    try { seen = sessionStorage.getItem(GATE_KEY); } catch (e) {}
    if (seen) return;

    setTimeout(function () { gate.classList.add("on"); }, 700);

    function dismiss() {
      gate.classList.remove("on");
      try { sessionStorage.setItem(GATE_KEY, "1"); } catch (e) {}
    }
    var go = gate.querySelector(".wg-go");
    var skip = gate.querySelector(".wg-skip");
    if (go) go.addEventListener("click", function () {
      dismiss();
      if (window.Tour) window.Tour.start();
    });
    if (skip) skip.addEventListener("click", dismiss);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGate);
  else initGate();
})();
