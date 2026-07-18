/* ============================================================
   Bear Hollow, guided walkthrough ("walkme")
   Shared, zero-dependency. Each page sets window.TOUR = [steps].
   A step: { el:'<css selector>'|null, title, body, side, cta, pre }
     - el     : element to spotlight. null = centered card (no spotlight).
     - side   : 'top'|'bottom'|'left'|'right'|'auto'  (default 'auto')
     - cta    : final-step override for the Next button label
     - pre    : optional fn() run before the step shows
   Continuity: window.TOUR_NEXT = { href, label } sends the user to the
   next page with ?tour=1, which auto-resumes that page's walkthrough.
   ============================================================ */
(function () {
  "use strict";
  if (!Array.isArray(window.TOUR) || !window.TOUR.length) return;

  var steps = window.TOUR;
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var i = 0, root = null, spot = null, card = null, live = false;

  function el(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }

  function build() {
    root = document.createElement("div");
    root.className = "tour-root";
    root.innerHTML =
      '<div class="tour-mask" data-skip></div>' +
      '<div class="tour-spot"></div>' +
      '<div class="tour-card" role="dialog" aria-modal="true" aria-label="Guided walkthrough">' +
      '  <button class="tour-x" data-skip aria-label="Close walkthrough">' +
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '  </button>' +
      '  <div class="tour-step"></div>' +
      '  <h3 class="tour-title"></h3>' +
      '  <p class="tour-body"></p>' +
      '  <div class="tour-foot">' +
      '    <div class="tour-dots"></div>' +
      '    <div class="tour-btns">' +
      '      <button class="tour-back" type="button">Back</button>' +
      '      <button class="tour-next" type="button">Next</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(root);
    spot = root.querySelector(".tour-spot");
    card = root.querySelector(".tour-card");

    root.querySelectorAll("[data-skip]").forEach(function (b) {
      b.addEventListener("click", end);
    });
    card.querySelector(".tour-back").addEventListener("click", function () { go(i - 1); });
    card.querySelector(".tour-next").addEventListener("click", next);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
  }

  function onKey(e) {
    if (!live) return;
    if (e.key === "Escape") { e.preventDefault(); end(); }
    else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
  }

  function next() {
    if (i < steps.length - 1) { go(i + 1); return; }
    var n = window.TOUR_NEXT;
    if (n && n.href) {
      cleanup();
      var sep = n.href.indexOf("?") > -1 ? "&" : "?";
      location.href = n.href + sep + "tour=1";
      return;
    }
    end();
  }

  function go(n) {
    n = Math.max(0, Math.min(steps.length - 1, n));
    i = n;
    var s = steps[i];
    if (typeof s.pre === "function") { try { s.pre(); } catch (e) {} }

    card.querySelector(".tour-step").textContent = "Step " + (i + 1) + " of " + steps.length;
    card.querySelector(".tour-title").textContent = s.title || "";
    card.querySelector(".tour-body").innerHTML = s.body || "";
    card.querySelector(".tour-back").style.visibility = i === 0 ? "hidden" : "visible";
    var nx = card.querySelector(".tour-next");
    var last = i === steps.length - 1;
    nx.textContent = last ? (s.cta || (window.TOUR_NEXT && window.TOUR_NEXT.label) || "Done") : "Next";

    var dots = "";
    for (var d = 0; d < steps.length; d++) dots += '<span class="tour-dot' + (d === i ? " on" : "") + '"></span>';
    card.querySelector(".tour-dots").innerHTML = dots;

    var target = el(s.el);
    if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center", inline: "nearest" });
    }
    // let smooth-scroll settle before measuring
    setTimeout(function () { place(s, target); }, reduce ? 0 : 260);
  }

  function reflow() {
    if (!live) return;
    place(steps[i], el(steps[i].el));
  }

  function place(s, target) {
    if (!target) {
      spot.style.opacity = "0";
      card.classList.add("center");
      card.style.left = ""; card.style.top = "";
      return;
    }
    card.classList.remove("center");
    var r = target.getBoundingClientRect();
    var pad = 6;
    spot.style.opacity = "1";
    spot.style.left = (r.left - pad) + "px";
    spot.style.top = (r.top - pad) + "px";
    spot.style.width = (r.width + pad * 2) + "px";
    spot.style.height = (r.height + pad * 2) + "px";

    var cw = card.offsetWidth, ch = card.offsetHeight, gap = 16, vw = innerWidth, vh = innerHeight;
    var side = s.side || "auto";
    if (side === "auto") {
      if (r.bottom + gap + ch < vh) side = "bottom";
      else if (r.top - gap - ch > 0) side = "top";
      else if (r.right + gap + cw < vw) side = "right";
      else side = "left";
    }
    var left, top;
    if (side === "bottom") { left = r.left + r.width / 2 - cw / 2; top = r.bottom + gap; }
    else if (side === "top") { left = r.left + r.width / 2 - cw / 2; top = r.top - gap - ch; }
    else if (side === "right") { left = r.right + gap; top = r.top + r.height / 2 - ch / 2; }
    else { left = r.left - gap - cw; top = r.top + r.height / 2 - ch / 2; }
    left = Math.max(12, Math.min(left, vw - cw - 12));
    top = Math.max(12, Math.min(top, vh - ch - 12));
    card.style.left = left + "px";
    card.style.top = top + "px";
    card.setAttribute("data-side", side);
  }

  function start() {
    if (live) return;
    if (!root) build();
    live = true;
    document.body.classList.add("tour-on");
    root.classList.add("on");
    go(0);
    card.focus && card.querySelector(".tour-next").focus();
  }

  function cleanup() {
    document.body.classList.remove("tour-on");
    if (root) root.classList.remove("on");
  }

  function end() { cleanup(); live = false; }

  // public
  window.Tour = { start: start, end: end };

  // auto-resume across pages, or first-step launch buttons
  function wireLaunchers() {
    document.querySelectorAll("[data-tour-start]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); start(); });
    });
  }
  document.addEventListener("DOMContentLoaded", wireLaunchers);
  if (document.readyState !== "loading") wireLaunchers();

  if (/[?&]tour=1\b/.test(location.search)) {
    var go0 = function () { setTimeout(start, 350); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go0);
    else go0();
  }
})();
