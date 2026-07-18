/* Ironworks demo - shared shell behavior.
   Round 3: welcome gate + motion (entrance stagger, KPI count-up, bar grow-in)
   + detail drawer drill-through + add-member modal + toasts + KPI deep-links.
   Zero backend; everything in-memory. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* ---------- toast ---------- */
  var toastWrap = null;
  function toast(msg) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-wrap";
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="tick">&#10003;</span><span>' + esc(msg) + "</span>";
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () {
      t.classList.remove("on");
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }
  window.iwToast = toast;

  /* ---------- first-visit welcome gate (session-gated) ---------- */
  function welcomeGate() {
    if (!document.body.hasAttribute("data-welcome")) return;
    if (/[?&]tour=1\b/.test(location.search)) return;
    var KEY = "iw_welcomed";
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) { return; }

    var root = document.createElement("div");
    root.className = "welcome-root";
    root.innerHTML =
      '<div class="welcome-card" role="dialog" aria-modal="true" aria-label="Welcome">' +
      '  <div class="wm-mark">IRONWORKS</div>' +
      '  <h3>This is the ops layer that runs while you coach.</h3>' +
      '  <p>Failed payments chased, leads answered in seconds, quiet members caught before they cancel. Want the 3 minute walkthrough?</p>' +
      '  <div class="wbtns">' +
      '    <button class="btn btn-ghost" data-w-skip type="button">Not now</button>' +
      '    <button class="btn btn-accent" data-w-tour type="button">Walk me through it</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(function () { root.classList.add("on"); });

    function close() {
      root.classList.remove("on");
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      setTimeout(function () { root.remove(); }, 220);
    }
    root.querySelector("[data-w-skip]").addEventListener("click", close);
    root.querySelector("[data-w-tour]").addEventListener("click", function () {
      close();
      if (window.Tour) setTimeout(function () { window.Tour.start(); }, 240);
    });
  }

  /* ---------- motion: staggered entrance ---------- */
  function entrance() {
    if (reduce) return;
    var els = qsa(".page .kpi, .page .chip, .page .card, .page .icard");
    els.forEach(function (el, idx) {
      el.classList.add("anim-in");
      setTimeout(function () { el.classList.add("go"); }, 40 + Math.min(idx, 14) * 65);
    });
  }

  /* ---------- motion: KPI count-up ---------- */
  function countUps() {
    if (reduce) return;
    qsa(".kpi .n").forEach(function (n) {
      var txt = n.textContent.trim();
      var m = txt.match(/^(\$?)([\d,]+(?:\.\d+)?)([^\d]*)$/);
      if (!m) return;
      var pre = m[1];
      var num = parseFloat(m[2].replace(/,/g, ""));
      var suf = m[3];
      var dec = (m[2].split(".")[1] || "").length;
      if (!isFinite(num)) return;
      var t0 = null, dur = 700;
      function fmt(v) {
        var parts = v.toFixed(dec).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return pre + parts.join(".") + suf;
      }
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        n.textContent = fmt(num * e);
        if (p < 1) requestAnimationFrame(tick);
        else n.textContent = txt;
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- motion: bars grow in ---------- */
  function growBars() {
    if (reduce) return;
    function grow(el, prop) {
      var v = el.style[prop];
      if (!v) return;
      el.style.transition = "none";
      el.style[prop] = "0%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "";
          el.style[prop] = v;
        });
      });
    }
    qsa(".bfill,.cfill").forEach(function (b) { grow(b, "height"); });
    qsa(".meter i").forEach(function (b) { grow(b, "width"); });
  }

  /* ---------- KPI deep-links ---------- */
  function wireLinks() {
    qsa("[data-link]").forEach(function (el) {
      el.setAttribute("role", "link");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", function () { location.href = el.getAttribute("data-link"); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") location.href = el.getAttribute("data-link");
      });
    });
  }

  /* ---------- detail drawer ---------- */
  var droot = null;
  function buildDrawer() {
    droot = document.createElement("div");
    droot.className = "drawer-root";
    droot.innerHTML =
      '<div class="drawer-mask" data-d-close></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Record detail">' +
      '  <div class="drawer-h"><div><h3></h3><div class="dsub"></div></div>' +
      '    <button class="drawer-x" data-d-close aria-label="Close" type="button">' +
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '    </button></div>' +
      '  <div class="drawer-b"></div>' +
      '  <div class="drawer-f"></div>' +
      '</aside>';
    document.body.appendChild(droot);
    qsa("[data-d-close]", droot).forEach(function (b) { b.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && droot.classList.contains("on")) closeDrawer();
    });
  }
  function closeDrawer() { if (droot) droot.classList.remove("on"); }
  function openDrawer(rec) {
    if (!droot) buildDrawer();
    qs(".drawer-h h3", droot).textContent = rec.title;
    qs(".drawer-h .dsub", droot).textContent = rec.sub || "";
    var b = "";
    if (rec.chip) b += '<div class="dsec"><span class="st ' + esc(rec.chip[1]) + '">' + esc(rec.chip[0]) + "</span></div>";
    if (rec.money) b += '<div class="dsec dmoney"><div class="mn">' + esc(rec.money[0]) + '</div><div class="ml">' + esc(rec.money[1]) + "</div></div>";
    if (rec.fields && rec.fields.length) {
      b += '<div class="dsec"><h4>Details</h4>';
      rec.fields.forEach(function (f) {
        b += '<div class="dfield"><span class="k">' + esc(f[0]) + '</span><span class="v">' + esc(f[1]) + "</span></div>";
      });
      b += "</div>";
    }
    if (rec.timeline && rec.timeline.length) {
      b += '<div class="dsec"><h4>AI touch timeline</h4><div class="timeline">';
      rec.timeline.forEach(function (t) {
        b += '<div class="tl-item ' + esc(t[0] || "") + '"><div class="tt">' + esc(t[1]) + "</div>" +
          (t[2] ? '<div class="ts">' + esc(t[2]) + "</div>" : "") +
          (t[3] ? '<div class="ttime">' + esc(t[3]) + "</div>" : "") + "</div>";
      });
      b += "</div></div>";
    }
    if (rec.note) b += '<div class="dsec dnote">' + esc(rec.note) + "</div>";
    qs(".drawer-b", droot).innerHTML = b;
    var f = "";
    (rec.actions || ["Open the full record", "Send a text"]).forEach(function (a, idx) {
      f += '<button class="btn ' + (idx === 0 ? "btn-accent" : "btn-ghost") + '" type="button" data-d-act>' + esc(a) + "</button>";
    });
    qs(".drawer-f", droot).innerHTML = f;
    qsa("[data-d-act]", droot).forEach(function (btn) {
      btn.addEventListener("click", function () { toast("Queued"); });
    });
    droot.classList.add("on");
    qs(".drawer-b", droot).scrollTop = 0;
  }

  function recFromEl(el) {
    var nameEl = qs("b", el) || qs(".ft", el) || qs(".rt", el) || qs(".kn", el) ||
      qs(".sc-n", el) || qs(".iname", el) || qs(".tt", el);
    var title = (nameEl ? nameEl.textContent : el.textContent).trim().replace(/\s+/g, " ").slice(0, 80);
    var bank = (window.IW && window.IW.records) || {};
    var low = (qs("b", el) ? qs("b", el).textContent : title).trim().toLowerCase();
    var rec = bank[low];
    if (!rec) {
      var full = el.textContent.toLowerCase();
      for (var k in bank) {
        if (full.indexOf(k) > -1) { rec = bank[k]; low = k; break; }
      }
    }
    if (rec) {
      var out = { title: qs("b", el) ? qs("b", el).textContent.trim() : titleCase(low) };
      for (var p in rec) out[p] = rec[p];
      return out;
    }
    var subEl = qs(".rs", el) || qs(".fs", el) || qs(".ks", el) || qs(".ikind", el) || qs(".sc-c", el) || qs(".ts", el);
    return {
      title: title,
      sub: subEl ? subEl.textContent.trim() : "",
      note: "This is the demo's short view. In the live system this opens the full record: history, messages, and billing.",
      actions: ["Open the full record", "Send a text"]
    };
  }
  function titleCase(s) {
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function wireDrawerEl(el) {
    if (el.classList.contains("empty")) return;
    el.addEventListener("click", function (e) {
      if (e.target.closest("a, button, input, select")) return;
      if (document.body.classList.contains("tour-on")) return;
      openDrawer(recFromEl(el));
    });
  }
  function wireDrawers() {
    qsa("tbody tr, .feed .frow, .rows .row, .kcard, .scell, .icard").forEach(wireDrawerEl);
  }

  /* ---------- add-member modal ---------- */
  var mroot = null;
  function buildModal() {
    var today = new Date().toISOString().slice(0, 10);
    var tierOpts = "";
    ((window.IW && window.IW.tiers) || []).forEach(function (t) {
      var v = t.name + " $" + t.price;
      tierOpts += '<option value="' + esc(v) + '">' + esc(t.name + " $" + t.price + "/mo") + "</option>";
    });
    mroot = document.createElement("div");
    mroot.className = "modal-root";
    mroot.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Add member">' +
      '  <div class="modal-h"><h3>Add a member</h3>' +
      '  <div class="msub">Creates the member in PushPress and starts the 14-day welcome sequence.</div></div>' +
      '  <form class="modal-b">' +
      '    <div class="field"><label for="nm-name">Full name</label>' +
      '      <input id="nm-name" type="text" placeholder="e.g. Dana Whitmore" autocomplete="off"></div>' +
      '    <div class="field"><label for="nm-tier">Membership tier</label>' +
      '      <select id="nm-tier">' + tierOpts + "</select></div>" +
      '    <div class="fieldrow">' +
      '      <div class="field"><label for="nm-date">Start date</label>' +
      '        <input id="nm-date" type="date" value="' + today + '"></div>' +
      '      <div class="field"><label for="nm-src">Source</label>' +
      '        <select id="nm-src"><option>Walk-in</option><option>Instagram</option><option>Web form</option><option>Referral</option><option>Win-back</option></select></div>' +
      '    </div>' +
      '    <div class="modal-f">' +
      '      <button type="button" class="btn btn-ghost" data-m-close>Cancel</button>' +
      '      <button type="submit" class="btn btn-accent">Save member</button>' +
      '    </div>' +
      '  </form></div>';
    document.body.appendChild(mroot);
    mroot.addEventListener("click", function (e) { if (e.target === mroot) closeModal(); });
    qs("[data-m-close]", mroot).addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mroot.classList.contains("on")) closeModal();
    });
    qs("form", mroot).addEventListener("submit", function (e) {
      e.preventDefault();
      var name = qs("#nm-name", mroot).value.trim() || "New member";
      var tier = qs("#nm-tier", mroot).value;
      var src = qs("#nm-src", mroot).value;
      closeModal();
      addMemberRow(name, tier, src);
    });
  }
  function openModal() {
    if (!mroot) buildModal();
    mroot.classList.add("on");
    setTimeout(function () { qs("#nm-name", mroot).focus(); }, reduce ? 0 : 220);
  }
  function closeModal() { if (mroot) mroot.classList.remove("on"); }

  function addMemberRow(name, tier, src) {
    var roster = qs("#roster table tbody");
    if (roster) {
      var tr = document.createElement("tr");
      tr.className = "row-new";
      tr.innerHTML =
        "<td><b>" + esc(name) + '</b> <span class="st st-ink" style="margin-left:6px">New</span></td>' +
        "<td>" + esc(tier) + "</td>" +
        '<td><span class="st st-green">Active</span></td>' +
        "<td>Not set</td><td>Joined today</td>" +
        '<td class="num">0 mo</td><td class="num">$0</td>';
      roster.insertBefore(tr, roster.firstChild);
      wireDrawerEl(tr);
      toast(name + " added to the roster");
      tr.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      return;
    }
    var joined = null;
    qsa(".kcol").forEach(function (c) {
      var t = qs(".kt", c);
      if (t && /joined/i.test(t.textContent)) joined = c;
    });
    if (joined) {
      var kc = document.createElement("div");
      kc.className = "kcard row-new";
      kc.innerHTML =
        '<div class="kn">' + esc(name) + "</div>" +
        '<div class="ks">' + esc(tier) + " &middot; added by you, via " + esc(src) + "</div>" +
        '<div class="ktouch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Welcome sequence started</div>';
      joined.insertBefore(kc, qs(".kcard", joined));
      wireDrawerEl(kc);
      toast(name + " added, welcome sequence started");
      return;
    }
    toast(name + " added to the roster");
  }

  /* ---------- init ---------- */
  function init() {
    welcomeGate();
    entrance();
    countUps();
    growBars();
    wireLinks();
    wireDrawers();
    qsa("[data-new-member]").forEach(function (b) { b.addEventListener("click", openModal); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
