/* ============================================================
   Bluebird Moving Co. demo - interactivity
   Motion (entrance, count-up, bar growth), the New Quote/Booking
   modal, drill-through drawers, and toasts. Zero backend.
   ============================================================ */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* ---------------- toasts ---------------- */
  var stack = null;
  function toast(msg) {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 3400);
  }
  window.BBToast = toast;

  /* ---------------- entrance motion ---------------- */
  function entrance() {
    if (reduce) return;
    var els = document.querySelectorAll(".page .kpi, .page .chip, .page > .card, .page .grid-2 > .card, .page .grid-2-even > .card, .page .grid-3 > .card, .page .int-card, .page .kcol, .page .counter-strip");
    var i = 0;
    els.forEach(function (el) {
      el.classList.add("anim-in");
      el.style.animationDelay = Math.min(i * 60, 640) + "ms";
      i++;
    });
  }

  /* ---------------- KPI count-up ---------------- */
  function countUp() {
    if (reduce) return;
    document.querySelectorAll(".kpi .value, .counter-strip .v").forEach(function (v) {
      var tn = v.firstChild;
      if (!tn || tn.nodeType !== 3) return;
      var m = tn.nodeValue.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var target = parseFloat(m[2].replace(/,/g, ""));
      if (!isFinite(target)) return;
      var dec = (m[2].split(".")[1] || "").length;
      var comma = m[2].indexOf(",") > -1;
      var t0 = null;
      function fmt(n) {
        var s;
        if (comma || dec) s = n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        else s = String(Math.round(n));
        return m[1] + s + m[3];
      }
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 700);
        p = 1 - Math.pow(1 - p, 3);
        tn.nodeValue = fmt(target * p);
        if (p < 1) requestAnimationFrame(step);
        else tn.nodeValue = m[1] + m[2] + m[3];
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------------- chart bars grow in ---------------- */
  function grow(sel, prop) {
    if (reduce) return;
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!els.length) return;
    els.forEach(function (b) {
      b.dataset.gt = b.style[prop];
      b.style.transition = "none";
      b.style[prop] = "0%";
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (b, i) {
          b.style.transition = prop + " .6s cubic-bezier(.22,.61,.36,1) " + Math.min(i * 55, 500) + "ms";
          b.style[prop] = b.dataset.gt;
        });
      });
    });
  }

  /* ---------------- drawer (drill-through) ---------------- */
  var dRoot = null, dBody = null;
  function ensureDrawer() {
    if (dRoot) return;
    dRoot = document.createElement("div");
    dRoot.className = "drawer-root";
    dRoot.innerHTML =
      '<div class="drawer-scrim"></div>' +
      '<aside class="drawer" role="dialog" aria-label="Record detail">' +
      '  <div class="drawer-top">' +
      '    <div><div class="d-title"></div><div class="d-sub"></div></div>' +
      '    <button class="drawer-x" type="button" aria-label="Close">' +
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="drawer-body"></div>' +
      '</aside>';
    document.body.appendChild(dRoot);
    dBody = dRoot.querySelector(".drawer-body");
    dRoot.querySelector(".drawer-scrim").addEventListener("click", closeDrawer);
    dRoot.querySelector(".drawer-x").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dRoot.classList.contains("on")) closeDrawer();
    });
    dBody.addEventListener("click", function (e) {
      var a = e.target.closest(".d-act");
      if (a) toast("Queued: " + a.textContent.trim());
    });
  }
  function openDrawer(title, sub, html) {
    ensureDrawer();
    dRoot.querySelector(".d-title").textContent = title;
    dRoot.querySelector(".d-sub").textContent = sub || "";
    dBody.innerHTML = html;
    dRoot.classList.add("on");
  }
  function closeDrawer() {
    if (dRoot) dRoot.classList.remove("on");
  }
  window.BBDrawer = openDrawer;

  function kvRow(k, v) {
    if (Array.isArray(v)) {
      return '<div class="d-kv"><span class="k">' + esc(k) + '</span><span class="v"><span class="pill ' + esc(v[0]) + '"><span class="pdot"></span>' + esc(v[1]) + "</span></span></div>";
    }
    return '<div class="d-kv"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + "</span></div>";
  }

  function recDrawerHTML(r) {
    var h = "";
    if (r.who) {
      h += '<div class="d-sec">Details</div>';
      r.who.forEach(function (row) { h += kvRow(row[0], row[1]); });
    }
    if (r.cube) {
      h += '<div class="d-sec">Cube sheet</div>';
      r.cube.forEach(function (row) { h += kvRow(row[0], row[1]); });
    }
    if (r.tl) {
      h += '<div class="d-sec">AI touch timeline</div><div class="d-tl">';
      r.tl.forEach(function (t) {
        h += '<div class="te"><span class="tt">' + esc(t[0]) + "</span>" + esc(t[1]) + "</div>";
      });
      h += "</div>";
    }
    if (r.act) {
      h += '<div class="d-sec">Actions</div><div class="d-actions">';
      r.act.forEach(function (a) { h += '<button class="d-act" type="button">' + esc(a) + "</button>"; });
      h += "</div>";
    }
    return h;
  }

  function genericDrawer(el) {
    var title = "", sub = "Record detail", h = "";
    var t = el.querySelector(".who, .t, .kwho, .jt, .strong, td.strong, .int-name, .tn");
    title = (t ? t.textContent : el.textContent).trim().replace(/\s+/g, " ").slice(0, 80);
    var tr = el.tagName === "TR" ? el : null;
    if (tr) {
      var table = tr.closest("table");
      var heads = table ? Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); }) : [];
      h += '<div class="d-sec">Details</div>';
      Array.prototype.forEach.call(tr.children, function (td, i) {
        var v = td.textContent.trim().replace(/\s+/g, " ");
        if (!v) return;
        h += kvRow(heads[i] || "Field", v);
      });
    } else {
      var d = el.querySelector(".what, .d, .kdesc, .jd");
      h += '<div class="d-sec">Details</div>';
      if (d) h += '<div class="d-kv"><span class="k" style="flex:1">' + esc(d.textContent.trim().replace(/\s+/g, " ")) + "</span></div>";
      var meta = el.querySelector(".time, .n, .wt");
      if (meta) h += kvRow("Logged", meta.textContent.trim());
    }
    h += '<div class="d-sec">Actions</div><div class="d-actions">' +
      '<button class="d-act" type="button">Text the customer</button>' +
      '<button class="d-act" type="button">Open in SmartMoving</button></div>';
    return { title: title, sub: sub, html: h };
  }

  function wireDrill() {
    var sels = ".page .table tbody tr, .page .feed .ev, .page .attn .item, .page .bay, .page .chip-row .chip, .page .kcard, .page .drow, .page .tl-page .te";
    document.querySelectorAll(sels).forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function (e) {
        var a = e.target.closest("a[href]");
        if (a && a.getAttribute("href") !== "#" && !a.classList.contains("chip")) return;
        if (a && a.classList.contains("chip") && a.getAttribute("href") !== "#") return;
        if (e.target.closest("button")) return;
        var key = el.getAttribute("data-rec");
        var r = key && window.BB && BB.records[key];
        if (r) {
          openDrawer(r.title, r.sub, recDrawerHTML(r));
        } else {
          var g = genericDrawer(el);
          openDrawer(g.title, g.sub, g.html);
        }
        if (a) e.preventDefault();
      });
    });
  }

  /* ---------------- New Quote/Booking modal ---------------- */
  var nextQ = 2219;
  var mRoot = null;
  function openModal() {
    if (mRoot) { mRoot.remove(); mRoot = null; }
    mRoot = document.createElement("div");
    mRoot.className = "modal-root";
    mRoot.innerHTML =
      '<div class="modal-scrim"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New quote or booking">' +
      '  <button class="m-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      "  <h3>New Quote / Booking</h3>" +
      '  <div class="m-sub">Writes straight into SmartMoving as Q-' + nextQ + ". Deposit link ready to text.</div>" +
      '  <form class="f-grid">' +
      '    <div class="f-field"><label for="nq-cust">Customer</label><input id="nq-cust" type="text" value="Walk-in caller"></div>' +
      '    <div class="f-field"><label for="nq-phone">Phone</label><input id="nq-phone" type="tel" value="(555) 000-0000"></div>' +
      '    <div class="f-field"><label for="nq-from">From</label><input id="nq-from" type="text" value="Columbus, OH"></div>' +
      '    <div class="f-field"><label for="nq-to">To</label><input id="nq-to" type="text" value="Columbus, OH"></div>' +
      '    <div class="f-field full"><label>Move size</label><div class="seg-toggle" id="nq-size">' +
      '      <button type="button" data-v="Studio">Studio</button>' +
      '      <button type="button" class="on" data-v="2BR">2BR</button>' +
      '      <button type="button" data-v="3BR">3BR</button>' +
      '      <button type="button" data-v="4BR+">4BR+</button>' +
      "    </div></div>" +
      '    <div class="f-field"><label>Crew</label><div class="seg-toggle" id="nq-crew">' +
      '      <button type="button" class="on" data-v="2 movers, $129/hr">Crew of 2</button>' +
      '      <button type="button" data-v="3 movers, $169/hr">Crew of 3</button>' +
      "    </div></div>" +
      '    <div class="f-field"><label for="nq-date">Move date</label><input id="nq-date" type="text" value="Sat Jul 25"></div>' +
      '    <div class="f-field full"><label for="nq-notes">Big items / stairs</label><textarea id="nq-notes">Queen bed, sofa, 2nd floor walk-up.</textarea></div>' +
      '    <div class="m-actions full"><button type="button" class="cancel">Cancel</button><button type="submit" class="save">Create Quote</button></div>' +
      "  </form>" +
      "</div>";
    document.body.appendChild(mRoot);
    var close = function () { if (mRoot) { mRoot.remove(); mRoot = null; } };
    mRoot.querySelector(".modal-scrim").addEventListener("click", close);
    mRoot.querySelector(".m-x").addEventListener("click", close);
    mRoot.querySelector(".cancel").addEventListener("click", close);
    var onKey = function (e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
    };
    document.addEventListener("keydown", onKey);
    mRoot.querySelectorAll(".seg-toggle").forEach(function (seg) {
      seg.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (!b) return;
        seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
    });
    mRoot.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var cust = mRoot.querySelector("#nq-cust").value.trim() || "Walk-in caller";
      var size = mRoot.querySelector("#nq-size button.on").getAttribute("data-v");
      var crew = mRoot.querySelector("#nq-crew button.on").getAttribute("data-v");
      var date = mRoot.querySelector("#nq-date").value.trim() || "TBD";
      var q = nextQ++;
      close();
      saveQuote(q, cust, size, crew, date);
    });
    var first = mRoot.querySelector("#nq-cust");
    first.focus();
    first.select();
  }

  function flash(el) {
    el.classList.add("flash-new");
    setTimeout(function () { el.classList.remove("flash-new"); }, 2000);
  }

  function saveQuote(q, cust, size, crew, date) {
    var placed = insertQuote(q, cust, size, crew, date);
    toast("Q-" + q + " created for " + cust + " (" + size + ", " + date + "). SmartMoving updated, deposit link ready." + (placed ? "" : " It is on the Quote Pipeline board."));
  }

  function insertQuote(q, cust, size, crew, date) {
    // quotes page: prepend a card to the Quoted column
    var col = document.querySelector("#kb-quoted .kcards");
    if (col) {
      var c = document.createElement("div");
      c.className = "kcard clickable";
      c.innerHTML =
        '<div class="kwho"><span>' + esc(cust) + '</span><span class="kamt num">Q-' + q + "</span></div>" +
        '<div class="kdesc">' + esc(size) + ", " + esc(crew) + ". Move " + esc(date) + ".</div>" +
        '<div class="kmeta"><span class="pill neutral"><span class="pdot"></span>Just quoted</span></div>' +
        '<div class="kfup">Auto follow-up queued: <b>24h, 72h, 1wk</b></div>';
      col.prepend(c);
      c.addEventListener("click", function () {
        openDrawer(cust, "Quote Q-" + q, '<div class="d-sec">Details</div>' +
          kvRow("Move size", size) + kvRow("Crew", crew) + kvRow("Date", date) +
          kvRow("Status", ["neutral", "Just quoted"]) +
          '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Text deposit link</button><button class="d-act" type="button">Open in SmartMoving</button></div>');
      });
      var count = document.querySelector("#kb-quoted .kcol-head .kv");
      if (count) {
        var n = count.textContent.match(/\d+/);
        if (n) count.textContent = count.textContent.replace(/\d+/, String(parseInt(n[0], 10) + 1));
      }
      flash(c);
      c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      return true;
    }
    // any page with a feed: prepend an event
    var feed = document.querySelector(".page .feed");
    if (feed) {
      var ev = document.createElement("div");
      ev.className = "ev clickable";
      ev.innerHTML =
        '<span class="ic good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>' +
        "<div>" +
        '<div class="who">New quote: ' + esc(cust) + "</div>" +
        '<div class="what">' + esc(size) + ", " + esc(crew) + ". Move " + esc(date) + ". Q-" + q + " created in SmartMoving, deposit link ready.</div>" +
        "</div>" +
        '<div class="meta"><span class="time">Just now</span><br><span class="pill good"><span class="pdot"></span>Created</span></div>';
      feed.prepend(ev);
      flash(ev);
      return true;
    }
    return false;
  }

  /* ---------------- wire up ---------------- */
  ready(function () {
    entrance();
    countUp();
    grow(".barchart .fill", "height");
    grow(".cash-chart .cbar", "height");
    grow(".hourbar .f", "width");
    wireDrill();
    document.querySelectorAll(".side-cta, [data-new-quote]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    });
  });
})();
