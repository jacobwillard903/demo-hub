/* ============================================================
   Precision Auto Care demo - round 3 interactivity
   Motion (entrance, count-up, bar growth), the New RO modal,
   drill-through drawers, and toasts. Zero backend, in-memory only.
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
    }, 3200);
  }
  window.PTToast = toast;

  /* ---------------- entrance motion ---------------- */
  function entrance() {
    if (reduce) return;
    var els = document.querySelectorAll(".page .kpi, .page .chip, .page > .card, .page .grid-2 > .card, .page .grid-2-even > .card, .page .grid-3 > .card, .page .int-card");
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
    document.querySelectorAll(".kpi .value").forEach(function (v) {
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

  var DVI_DOT = { red: "bad", yellow: "warn", green: "good" };
  function roDrawerHTML(ro) {
    var r = window.PT && PT.records && PT.records[ro];
    if (!r) return null;
    var h = "";
    h += '<div class="d-sec">Vehicle and customer</div>';
    h += '<div class="d-kv"><span class="k">Vehicle</span><span class="v">' + esc(r.veh) + "</span></div>";
    h += '<div class="d-kv"><span class="k">Customer</span><span class="v">' + esc(r.cust) + "</span></div>";
    h += '<div class="d-kv"><span class="k">Phone</span><span class="v num">' + esc(r.phone) + "</span></div>";
    h += '<div class="d-kv"><span class="k">Concern</span><span class="v">' + esc(r.concern) + "</span></div>";
    h += '<div class="d-kv"><span class="k">Amount</span><span class="v num">' + esc(r.amt) + "</span></div>";
    h += '<div class="d-kv"><span class="k">Status</span><span class="v"><span class="pill ' + esc(r.stage[0]) + '"><span class="pdot"></span>' + esc(r.stage[1]) + "</span></span></div>";
    if (r.dvi && r.dvi.length) {
      h += '<div class="d-sec">DVI summary</div>';
      r.dvi.forEach(function (row) {
        h += '<div class="d-kv"><span class="k"><span class="pill ' + (DVI_DOT[row[0]] || "neutral") + '" style="margin-right:8px"><span class="pdot"></span>' + esc(row[0]) + "</span>" + esc(row[1]) + '</span><span class="v num">' + esc(row[2]) + "</span></div>";
      });
    }
    if (r.recall) {
      h += '<div class="d-sec">Open recall <span class="via">via NHTSA Recalls</span></div>';
      h += '<div class="d-kv"><span class="k" style="flex:1"><span class="pill warn" style="margin-right:8px"><span class="pdot"></span>Open</span>' + esc(r.recall) + "</span></div>";
    }
    if (r.cf && r.cf.length) {
      h += '<div class="d-sec">Service history <span class="via">via CARFAX</span></div><div class="d-tl">';
      r.cf.forEach(function (t) {
        h += '<div class="te"><span class="tt">' + esc(t[0]) + "</span>" + esc(t[1]) + "</div>";
      });
      h += "</div>";
      h += '<div class="d-note">Prior services at other shops feed the maintenance reminder engine, so the 60k text goes out on real mileage, not a guess.</div>';
    }
    if (r.tl && r.tl.length) {
      h += '<div class="d-sec">AI touch timeline</div><div class="d-tl">';
      r.tl.forEach(function (t) {
        h += '<div class="te"><span class="tt">' + esc(t[0]) + "</span>" + esc(t[1]) + "</div>";
      });
      h += "</div>";
    }
    if (r.act && r.act.length) {
      h += '<div class="d-sec">Actions</div><div class="d-actions">';
      r.act.forEach(function (a) { h += '<button class="d-act" type="button">' + esc(a) + "</button>"; });
      h += "</div>";
    }
    return h;
  }

  function genericDrawer(el) {
    var title = "", sub = "Record detail", h = "";
    var t = el.querySelector(".who, .t, .strong, td.strong, .int-name, .bay-ro");
    title = (t ? t.textContent : el.textContent).trim().replace(/\s+/g, " ").slice(0, 80);
    var tr = el.closest ? (el.tagName === "TR" ? el : null) : null;
    if (tr) {
      var table = tr.closest("table");
      var heads = table ? Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); }) : [];
      h += '<div class="d-sec">Details</div>';
      Array.prototype.forEach.call(tr.children, function (td, i) {
        var v = td.textContent.trim().replace(/\s+/g, " ");
        if (!v) return;
        h += '<div class="d-kv"><span class="k">' + esc(heads[i] || "Field") + '</span><span class="v">' + esc(v) + "</span></div>";
      });
    } else {
      var d = el.querySelector(".what, .d");
      h += '<div class="d-sec">Details</div>';
      if (d) h += '<div class="d-kv"><span class="k" style="flex:1">' + esc(d.textContent.trim().replace(/\s+/g, " ")) + "</span></div>";
      var meta = el.querySelector(".time, .n");
      if (meta) h += '<div class="d-kv"><span class="k">Logged</span><span class="v">' + esc(meta.textContent.trim()) + "</span></div>";
    }
    h += '<div class="d-sec">Actions</div><div class="d-actions">' +
      '<button class="d-act" type="button">Text the customer</button>' +
      '<button class="d-act" type="button">Open in Tekmetric</button></div>';
    return { title: title, sub: sub, html: h };
  }

  function wireDrill() {
    var sels = ".page .table tbody tr, .page .feed .ev, .page .attn .item, .page .bay, .page .chip-row .chip";
    document.querySelectorAll(sels).forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function (e) {
        var a = e.target.closest("a[href]");
        if (a && a.getAttribute("href") !== "#" && !a.classList.contains("chip")) return;
        if (a && a.classList.contains("chip") && a.getAttribute("href") !== "#") return; // real chip link navigates
        if (e.target.closest("button")) return;
        var m = el.textContent.match(/#(\d{4})/);
        var html = m ? roDrawerHTML(m[1]) : null;
        if (html) {
          openDrawer("RO #" + m[1], (PT.records[m[1]].veh || "") + ", " + (PT.records[m[1]].cust || ""), html);
        } else {
          var g = genericDrawer(el);
          openDrawer(g.title, g.sub, g.html);
        }
        if (a) e.preventDefault();
      });
    });
  }

  /* ---------------- New RO modal ---------------- */
  var nextRO = 4222;
  var mRoot = null;
  function openModal() {
    if (mRoot) { mRoot.remove(); mRoot = null; }
    mRoot = document.createElement("div");
    mRoot.className = "modal-root";
    mRoot.innerHTML =
      '<div class="modal-scrim"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="New repair order">' +
      '  <button class="m-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      "  <h3>New Repair Order</h3>" +
      '  <div class="m-sub">Writes straight into Tekmetric as RO #' + nextRO + ".</div>" +
      '  <form class="f-grid">' +
      '    <div class="f-field"><label for="nro-cust">Customer</label><input id="nro-cust" type="text" value="Walk-in customer"></div>' +
      '    <div class="f-field"><label for="nro-phone">Phone</label><input id="nro-phone" type="tel" value="(555) 000-0000"></div>' +
      '    <div class="f-field full"><label>Vehicle</label><div class="f-3">' +
      '      <input id="nro-year" type="text" value="2018" aria-label="Year">' +
      '      <input id="nro-make" type="text" value="Honda" aria-label="Make">' +
      '      <input id="nro-model" type="text" value="CR-V" aria-label="Model">' +
      "    </div></div>" +
      '    <div class="f-field full"><label for="nro-concern">Concern</label><textarea id="nro-concern">Customer reports a squeal from the front when braking.</textarea></div>' +
      '    <div class="f-field full"><label>Visit type</label><div class="seg-toggle" id="nro-visit">' +
      '      <button type="button" class="on" data-v="Drop-off">Drop-off</button>' +
      '      <button type="button" data-v="Waiter">Waiter</button>' +
      "    </div></div>" +
      '    <div class="m-actions full"><button type="button" class="cancel">Cancel</button><button type="submit" class="save">Create RO</button></div>' +
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
    var seg = mRoot.querySelector("#nro-visit");
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]");
      if (!b) return;
      seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
    });
    mRoot.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var cust = mRoot.querySelector("#nro-cust").value.trim() || "Walk-in customer";
      var veh = [mRoot.querySelector("#nro-year").value, mRoot.querySelector("#nro-make").value, mRoot.querySelector("#nro-model").value].join(" ").trim();
      var visit = seg.querySelector("button.on").getAttribute("data-v");
      var ro = nextRO++;
      close();
      saveRO(ro, cust, veh, visit);
    });
    var first = mRoot.querySelector("#nro-cust");
    first.focus();
    first.select();
  }

  function saveRO(ro, cust, veh, visit) {
    var placed = insertRO(ro, cust, veh, visit);
    toast("RO #" + ro + " created for " + veh + " (" + cust + ", " + visit.toLowerCase() + "). Tekmetric updated." + (placed ? "" : " It is on the Dashboard bay board."));
  }

  function flash(el) {
    el.classList.add("flash-new");
    setTimeout(function () { el.classList.remove("flash-new"); }, 2000);
  }

  function insertRO(ro, cust, veh, visit) {
    var strip = document.querySelector("#bay-board .bay-strip");
    if (strip) {
      var b = document.createElement("div");
      b.className = "bay";
      b.innerHTML =
        '<div class="bay-name">Check-In</div>' +
        '<div class="bay-ro num">RO #' + ro + "</div>" +
        '<div class="bay-veh">' + esc(veh) + "</div>" +
        '<div class="bay-stage"><span class="pill neutral"><span class="pdot"></span>Checked In, ' + esc(visit) + "</span></div>";
      strip.appendChild(b);
      b.classList.add("clickable");
      b.addEventListener("click", function () {
        openDrawer("RO #" + ro, veh + ", " + cust, '<div class="d-sec">Details</div>' +
          '<div class="d-kv"><span class="k">Vehicle</span><span class="v">' + esc(veh) + "</span></div>" +
          '<div class="d-kv"><span class="k">Customer</span><span class="v">' + esc(cust) + "</span></div>" +
          '<div class="d-kv"><span class="k">Visit</span><span class="v">' + esc(visit) + "</span></div>" +
          '<div class="d-kv"><span class="k">Status</span><span class="v"><span class="pill neutral"><span class="pdot"></span>Checked In</span></span></div>' +
          '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Assign a bay</button><button class="d-act" type="button">Open in Tekmetric</button></div>');
      });
      var openCount = document.querySelector("#pipeline .card-head .link");
      if (openCount) {
        var n = openCount.textContent.match(/\d+/);
        if (n) openCount.textContent = (parseInt(n[0], 10) + 1) + " open";
      }
      flash(b);
      b.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      return true;
    }
    var feed = document.querySelector("#call-feed .feed");
    if (feed) {
      var ev = document.createElement("div");
      ev.className = "ev";
      ev.innerHTML =
        '<span class="ic good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>' +
        "<div>" +
        '<div class="who">New RO: ' + esc(cust) + "</div>" +
        '<div class="what">' + esc(veh) + ", checked in at the counter as a " + esc(visit.toLowerCase()) + ". RO #" + ro + " created in Tekmetric.</div>" +
        "</div>" +
        '<div class="meta"><span class="time">Just now</span><br><span class="pill good"><span class="pdot"></span>Created</span></div>';
      feed.prepend(ev);
      ev.classList.add("clickable");
      flash(ev);
      return true;
    }
    var est = document.querySelector("#est-table tbody");
    if (est) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="strong num">#' + ro + "</td>" +
        "<td>" + esc(veh) + ", " + esc(cust) + "</td>" +
        '<td class="r">Pending diag</td>' +
        '<td class="dim">Just now</td>' +
        '<td class="num">0h</td>' +
        '<td class="dim">Queued</td>' +
        '<td><span class="pill neutral"><span class="pdot"></span>Checked In</span></td>';
      est.prepend(tr);
      tr.classList.add("clickable");
      flash(tr);
      return true;
    }
    return false;
  }

  /* ---------------- round 5: live-data widget drawers ---------------- */
  function kv(k, v) {
    return '<div class="d-kv"><span class="k">' + k + '</span><span class="v">' + v + "</span></div>";
  }
  var LIVE = {
    "vin": function () {
      var v = PT.live.vin;
      return { title: v.veh, sub: "Decoded from plate " + v.plateState + " " + v.plate + ", via CARFAX", html:
        '<div class="d-sec">Decoded vehicle <span class="via">via CARFAX</span></div>' +
        kv("VIN", '<span class="num" style="font-family:var(--mono);font-size:12px">' + v.vin + "</span>") +
        kv("Trim", "EX-L") + kv("Engine", v.engine) + kv("Drivetrain", v.drive) +
        kv("Transmission", v.trans) + kv("In service", v.inService) + kv("Mileage", v.miles) +
        '<div class="d-sec">Auto-filled into the RO</div><div class="d-tl">' +
        '<div class="te"><span class="tt">Tue 7:47 PM</span>' + v.cust + " booked Thursday 8:00 AM by text</div>" +
        '<div class="te"><span class="tt">Tue 7:47 PM</span>Plate ran through CARFAX, VIN and build decoded</div>' +
        '<div class="te"><span class="tt">Tue 7:48 PM</span>RO #' + v.ro + " created in Tekmetric with year, make, engine, and drivetrain filled</div>" +
        '<div class="te"><span class="tt">Tue 7:48 PM</span>VIN checked against NHTSA, no open recalls on this car</div></div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Open RO #' + v.ro + "</button><button class=\"d-act\" type=\"button\">View full history report</button></div>" };
    },
    "recall-rav4": function () {
      return { title: "Open recall: fuel pump", sub: "2019 Toyota RAV4, Alice K., RO #4218", html:
        '<div class="d-sec">Recall detail <span class="via">via NHTSA Recalls</span></div>' +
        kv("Campaign", '<span class="num">NHTSA 20V-682</span>') + kv("Component", "Low pressure fuel pump") +
        kv("Risk", "Pump may fail, engine can stall") + kv("Remedy", "Dealer replaces the pump, free") +
        '<div class="d-sec">Drafted customer text</div>' +
        '<div class="d-note" style="border:1px solid var(--border);border-radius:10px;padding:10px 13px;margin-top:0;color:var(--ink)">Hi Alice, quick heads up from Precision. While your RAV4 was in we ran the VIN and found an open fuel pump recall (NHTSA 20V-682). The dealer fixes it free, and it is worth doing. Want the details with your pickup text?</div>' +
        '<div class="d-note">Mentioning it before the dealer does builds trust, and the car usually comes back to us for everything else.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Approve and send</button><button class="d-act" type="button">Open RO #4218</button></div>' };
    },
    "recall-f150": function () {
      return { title: "Open recall: brake master cylinder", sub: "2016 Ford F-150, Dan W., RO #4213", html:
        '<div class="d-sec">Recall detail <span class="via">via NHTSA Recalls</span></div>' +
        kv("Campaign", '<span class="num">NHTSA 20V-332</span>') + kv("Component", "Brake master cylinder") +
        kv("Remedy", "Dealer replaces it, free") + kv("Status", "Customer told at pickup") +
        '<div class="d-note">Flagged at write-up, mentioned when Dan approved the front end work. He booked the dealer visit for next month.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Open RO #4213</button></div>' };
    },
    "parts-worldpac": function () {
      return { title: "WorldPac, $118.40", sub: "Outer tie rod ends (pair), RO #4213", html:
        '<div class="d-sec">Quote <span class="via">via PartsTech</span></div>' +
        kv("Price", "$118.40") + kv("Availability", "In stock, Tulsa DC") + kv("Delivery", "Today 2:30 PM") + kv("Brand", "Moog, problem solver") +
        '<div class="d-note">Cheapest in-stock option, on the estimate automatically. The truck is in Bay 4 this afternoon, so 2:30 works.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Order now</button><button class="d-act" type="button">Open estimate</button></div>' };
    },
    "parts-oreilly": function () {
      return { title: "O'Reilly Pro, $126.90", sub: "Outer tie rod ends (pair), RO #4213", html:
        '<div class="d-sec">Quote <span class="via">via PartsTech</span></div>' +
        kv("Price", "$126.90") + kv("Availability", "In stock, store 4112") + kv("Delivery", "45 minutes") +
        '<div class="d-note">Fastest option. The AI holds it as the backup if WorldPac misses the 2:30 run.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Switch to this supplier</button></div>' };
    },
    "parts-napa": function () {
      return { title: "NAPA, $109.80", sub: "Outer tie rod ends (pair), RO #4213", html:
        '<div class="d-sec">Quote <span class="via">via PartsTech</span></div>' +
        kv("Price", "$109.80") + kv("Availability", "Backordered") + kv("ETA", "Tuesday") +
        '<div class="d-note">Cheapest on paper, but a backordered part is a truck blocking Bay 4 until Tuesday. Skipped.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Watch for restock</button></div>' };
    },
    "sunbit": function () {
      return { title: "Financing offer, RO #4189", sub: "2014 Chevy Tahoe, the Hendersons, via Sunbit", html:
        '<div class="d-sec">Offer <span class="via">via Sunbit</span></div>' +
        kv("Ticket", "$2,150.00, transmission service") + kv("Prequalified", "Yes, soft check only") +
        kv("Plan", "6 months, $358/mo") + kv("Offered", "In nudge #2, this morning 8:30 AM") +
        '<div class="d-note">Big tickets are where approvals die. A monthly number in the nudge text is a big part of the 61% to 78% approval climb.</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Resend the offer</button><button class="d-act" type="button">Open RO #4189</button></div>' };
    },
    "comp-you": function () {
      return { title: "Precision Auto Care, 4.9", sub: "327 Google reviews, via Google Business Profile", html:
        '<div class="d-sec">This month <span class="via">via Google Business Profile</span></div>' +
        kv("New reviews", "+9") + kv("Requests sent", "14, one hour after pickup") + kv("Unhappy routed private", "2, straight to Gary") +
        '<div class="d-note">Review velocity is the local ranking lever. Nine a month keeps Precision on top of "auto repair Tulsa".</div>' +
        '<div class="d-sec">Actions</div><div class="d-actions"><button class="d-act" type="button">Open Business Profile</button></div>' };
    },
    "comp-tulsa": function () {
      return { title: "Tulsa Auto Pros, 4.4", sub: "156 Google reviews, via Google Business Profile", html:
        '<div class="d-sec">This month</div>' + kv("New reviews", "+2") + kv("Trend", "Flat since March") +
        '<div class="d-note">The shop down the street the missed calls used to go to.</div>' };
    },
    "comp-midtown": function () {
      return { title: "Midtown Motors, 4.1", sub: "89 Google reviews, via Google Business Profile", html:
        '<div class="d-sec">This month</div>' + kv("New reviews", "+1") + kv("Trend", "Two 1-star reviews in June, both about phone calls not returned") +
        '<div class="d-note">Their last two bad reviews are the exact problem this system removes.</div>' };
    }
  };
  function wireLiveDrawers() {
    document.querySelectorAll("[data-ld]").forEach(function (el) {
      el.classList.add("clickable");
      el.addEventListener("click", function (e) {
        if (e.target.closest("button") && !e.target.closest("[data-ld-open]")) return;
        var f = LIVE[el.getAttribute("data-ld")];
        if (!f) return;
        var d = f();
        openDrawer(d.title, d.sub, d.html);
      });
    });
  }

  /* ---------------- round 5: VIN decode card ---------------- */
  var vinDone = false;
  function runVinDecode(instant) {
    var card = document.querySelector("#vin-decode");
    if (!card || vinDone) return;
    vinDone = true;
    var btn = card.querySelector(".vin-decode-btn");
    var scan = card.querySelector(".vin-scan");
    var res = card.querySelector(".vin-result");
    if (btn) { btn.disabled = true; btn.textContent = "Decoded"; }
    function reveal() {
      if (scan) scan.classList.remove("on");
      if (res) res.classList.add("on");
      toast("Decoded: 2018 Honda CR-V EX-L. RO #4221 write-up auto-filled in Tekmetric.");
    }
    if (instant || reduce) { reveal(); return; }
    if (scan) scan.classList.add("on");
    setTimeout(reveal, 750);
  }
  window.PTVinDecode = runVinDecode;

  /* ---------------- wire up ---------------- */
  ready(function () {
    entrance();
    countUp();
    grow(".barchart .fill", "height");
    grow(".cash-chart .cbar", "height");
    grow(".hourbar .f", "width");
    grow(".rvc-bar .f", "width");
    wireDrill();
    wireLiveDrawers();
    var vbtn = document.querySelector("#vin-decode .vin-decode-btn");
    if (vbtn) vbtn.addEventListener("click", function () { runVinDecode(false); });
    document.querySelectorAll(".side-cta, [data-new-ro]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    });
  });
})();
