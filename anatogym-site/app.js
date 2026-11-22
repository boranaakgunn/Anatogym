(function () {
  "use strict";
  var M = window.MUSCLES, EQ = window.EQUIPMENT, LIST = window.EXERCISES, CFG = window.CONFIG || {};
  var byId = {};
  LIST.forEach(function (e) { byId[e.id] = e; });
  var $ = function (id) { return document.getElementById(id); };

  /* ───────── ikonlar ───────── */
  var ICONS = {
    play: '<path d="M8 5l11 7-11 7z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    timer: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2M9 3h6"/>',
    calc: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
    save: '<path d="M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    scale: '<path d="M12 3v18M5 7h14M8 21h8"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
    leaf: '<path d="M12 21c-4 0-7-3-7-7 0-3 2-5 4-6 1-.5 2-1.5 3-3 1 1.5 2 2.5 3 3 2 1 4 3 4 6 0 4-3 7-7 7z"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'
  };
  function ic(n) { return '<svg class="ic" viewBox="0 0 24 24">' + ICONS[n] + "</svg>"; }

  /* ───────── yardımcılar ───────── */
  function load(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) {
    return String(s || "").replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  var toastT;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function fmt(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }

  var favs = load("gym-favs", []);
  var plan = load("gym-plan", { days: [] });
  var log = load("gym-log", []);
  var state = { q: "", muscle: "", equip: "", onlyFav: false };

  /* ───────── yedek görsel: kas haritası (fotoğraf yoksa) ───────── */
  var BASE =
    '<circle class="base" cx="100" cy="26" r="17"/><rect class="base" x="93" y="40" width="14" height="14" rx="4"/>' +
    '<path class="base" d="M68 58 Q100 50 132 58 L136 118 Q136 150 126 178 L74 178 Q64 150 64 118 Z"/>' +
    '<line class="bl" x1="54" y1="72" x2="46" y2="128" stroke-width="20"/><line class="bl" x1="146" y1="72" x2="154" y2="128" stroke-width="20"/>' +
    '<line class="bl" x1="46" y1="132" x2="38" y2="184" stroke-width="16"/><line class="bl" x1="154" y1="132" x2="162" y2="184" stroke-width="16"/>' +
    '<line class="bl" x1="86" y1="182" x2="84" y2="270" stroke-width="30"/><line class="bl" x1="114" y1="182" x2="116" y2="270" stroke-width="30"/>' +
    '<line class="bl" x1="84" y1="274" x2="82" y2="340" stroke-width="22"/><line class="bl" x1="116" y1="274" x2="118" y2="340" stroke-width="22"/>';
  function reg(m, shape, attrs, hl) { return "<" + shape + ' class="reg' + (hl === m ? " hl" : "") + '" style="--h:' + M[m].hue + '" ' + attrs + "></" + shape + ">"; }
  function pair(m, cx, cy, rx, ry, rot, hl) {
    return reg(m, "ellipse", 'cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + " " + cx + " " + cy + ')"', hl) +
      reg(m, "ellipse", 'cx="' + (200 - cx) + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (-rot) + " " + (200 - cx) + " " + cy + ')"', hl);
  }
  function bodySvg(view, hl) {
    var r = "";
    if (view === "front") {
      r += pair("omuz", 62, 72, 13, 13, 0, hl) + pair("gogus", 85, 90, 15, 13, 0, hl) + pair("biceps", 50, 100, 9, 18, 8, hl) + pair("onkol", 41, 158, 8, 22, 6, hl) +
        reg("karin", "rect", 'x="86" y="108" width="28" height="58" rx="10"', hl) + pair("onbacak", 85, 224, 14, 38, 0, hl);
    } else {
      r += reg("trapez", "path", 'd="M100 48 L78 64 L100 102 L122 64 Z"', hl) + pair("omuz", 62, 72, 13, 13, 0, hl) +
        reg("sirt", "path", 'd="M76 72 L97 106 L97 138 L84 130 Q72 110 76 72 Z"', hl) + reg("sirt", "path", 'd="M124 72 L103 106 L103 138 L116 130 Q128 110 124 72 Z"', hl) +
        pair("triceps", 50, 100, 9, 18, 8, hl) + pair("onkol", 41, 158, 8, 22, 6, hl) + reg("bel", "rect", 'x="88" y="140" width="24" height="28" rx="8"', hl) +
        pair("kalca", 88, 190, 16, 15, 0, hl) + pair("arkabacak", 85, 238, 13, 32, 0, hl) + pair("baldir", 82, 310, 10, 26, 0, hl);
    }
    return '<svg class="body mini" viewBox="0 0 200 350" role="img">' + BASE + r + "</svg>";
  }
  function fallbackHtml(m) { return '<div class="ph">' + bodySvg(M[m].view, m) + "</div>"; }

  /* görsel yüklenemezse (çevrimdışı vb.) kas haritasına dön */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (!t || t.tagName !== "IMG" || !t.dataset.fb || !t.parentNode) return;
    var m = t.dataset.fb, demo = t.closest(".demo");
    if (demo) {
      if (t.classList.contains("b")) { t.remove(); return; }
      var n = demo.querySelector(".demo-note"); if (n) n.remove();
      Array.prototype.forEach.call(demo.querySelectorAll("img"), function (i) { i.remove(); });
      demo.insertAdjacentHTML("beforeend", fallbackHtml(m));
    } else { t.outerHTML = fallbackHtml(m); }
  }, true);

  /* ───────── sekmeler ───────── */
  var TABS = ["home", "ex", "plan", "tools", "nutrio"];
  function goTab(t) {
    if (TABS.indexOf(t) === -1) t = "home";
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar button"), function (x) { x.classList.toggle("on", x.dataset.tab === t); });
    Array.prototype.forEach.call(document.querySelectorAll(".view"), function (v) { v.classList.toggle("active", v.id === "v-" + t); });
    document.body.dataset.tab = t;
    if (t === "home") window.AtlasModel.start(); else window.AtlasModel.stop();
    if (t === "plan") renderPlan(); if (t === "tools") renderTools(); if (t === "nutrio") renderNutrio();
    window.scrollTo(0, 0);
  }
  document.querySelector(".tabbar").addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) goTab(b.dataset.tab); });
  document.addEventListener("click", function (e) { var g = e.target.closest("[data-goto]"); if (g) goTab(g.dataset.goto); });
  $("modelBtn").addEventListener("click", function () { goTab("home"); });

  /* ───────── ana sayfa: model ───────── */
  function selectMuscle(m) { setMuscle(m); goTab("ex"); }
  $("homeChips").innerHTML = Object.keys(M).map(function (k, i) {
    var n = LIST.filter(function (ex) { return ex.muscle === k; }).length;
    return '<button class="chip" data-v="' + k + '" style="--h:' + (M[k].hue || 20) + '"><i>' + (i < 9 ? "0" : "") + (i + 1) + "</i><span>" + esc(M[k].label) + "</span><em>" + n + "</em></button>";
  }).join("");
  $("homeChips").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) selectMuscle(b.dataset.v); });
  $("qCount").textContent = LIST.length;
  window.AtlasModel.init($("model"), $("modelLabel"), selectMuscle);
  function setView(side) { window.AtlasModel.view && window.AtlasModel.view(side); $("vFront").classList.toggle("on", side === "front"); $("vBack").classList.toggle("on", side === "back"); }
  $("vFront").addEventListener("click", function () { setView("front"); });
  $("vBack").addEventListener("click", function () { setView("back"); });

  /* ───────── hareket listesi ───────── */
  function chipsHtml(map, current) {
    var h = '<button class="chip' + (current ? "" : " on") + '" data-v="">Hepsi</button>';
    Object.keys(map).forEach(function (k) {
      var label = typeof map[k] === "string" ? map[k] : map[k].label;
      h += '<button class="chip' + (current === k ? " on" : "") + '" data-v="' + k + '">' + esc(label) + "</button>";
    });
    return h;
  }
  function setMuscle(m) {
    state.muscle = m;
    $("muscles").innerHTML = chipsHtml(M, state.muscle);
    renderList();
  }
  $("muscles").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) setMuscle(b.dataset.v); });
  $("equipment").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.equip = b.dataset.v; $("equipment").innerHTML = chipsHtml(EQ, state.equip); renderList();
  });
  $("search").addEventListener("input", function (e) { state.q = e.target.value; renderList(); });
  $("onlyFav").addEventListener("change", function (e) { state.onlyFav = e.target.checked; renderList(); });

  function filtered() {
    var toks = norm(state.q).split(/\s+/).filter(Boolean);
    return LIST.filter(function (ex) {
      if (state.muscle && ex.muscle !== state.muscle) return false;
      if (state.equip && ex.equipment !== state.equip) return false;
      if (state.onlyFav && favs.indexOf(ex.id) === -1) return false;
      if (toks.length) {
        var hay = norm(ex.name + " " + ex.alias + " " + ex.secondary + " " + M[ex.muscle].label + " " + EQ[ex.equipment]);
        for (var i = 0; i < toks.length; i++) if (hay.indexOf(toks[i]) === -1) return false;
      }
      return true;
    });
  }
  function thumbHtml(ex) {
    if (window.Illu && Illu.has(ex.id)) return '<div class="ill" role="img" aria-label="' + esc(ex.name) + '">' + Illu.thumb(ex.id) + "</div>";
    return fallbackHtml(ex.muscle);
  }
  function renderList() {
    var items = filtered();
    $("count").textContent = items.length;
    $("empty").hidden = items.length > 0;
    $("grid").innerHTML = items.map(function (ex) {
      var on = favs.indexOf(ex.id) !== -1, mm = M[ex.muscle];
      return '<div class="card" data-id="' + esc(ex.id) + '" style="--h:' + mm.hue + '">' +
        '<div class="thumb">' + thumbHtml(ex) + '<button class="star' + (on ? " on" : "") + '" data-star="' + esc(ex.id) + '" aria-label="Favori">' + ic("star") + "</button></div>" +
        '<div class="card-b"><h3>' + esc(ex.name) + '</h3><span class="tag m">' + esc(mm.label) + '</span><span class="tag">' + esc(EQ[ex.equipment]) + "</span></div></div>";
    }).join("");
  }
  $("grid").addEventListener("click", function (e) {
    var s = e.target.closest("[data-star]");
    if (s) { toggleFav(s.dataset.star); return; }
    var c = e.target.closest(".card");
    if (c) openDetail(c.dataset.id);
  });
  function toggleFav(id) {
    var i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    save("gym-favs", favs); renderList();
  }
  $("randomBtn").addEventListener("click", function () {
    var l = filtered(); if (!l.length) return;
    openDetail(l[Math.floor(Math.random() * l.length)].id);
  });

  /* ───────── hareket detayı ───────── */
  var dlg = $("dlg"), detail = $("detail");
  function listHtml(tag, arr, cls) {
    if (!arr || !arr.length) return "";
    return "<" + tag + (cls ? ' class="' + cls + '"' : "") + ">" + arr.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</" + tag + ">";
  }
  function favBtn(id) { var f = favs.indexOf(id) !== -1; return ic("star") + (f ? " Favoride" : " Favori"); }
  function openDetail(id) {
    var ex = byId[id]; if (!ex) return;
    var mm = M[ex.muscle], demo;
    if (window.Illu && Illu.has(id)) demo = '<div class="demo">' + Illu.pair(id) + "</div>";
    else demo = '<div class="demo">' + fallbackHtml(ex.muscle) + "</div>";
    var opts = plan.days.map(function (d) { return '<option value="' + d.id + '">' + esc(d.name) + "</option>"; }).join("");
    detail.style.setProperty("--h", mm.hue);
    detail.innerHTML =
      '<button class="close" aria-label="Kapat">×</button>' + demo + "<h2>" + esc(ex.name) + "</h2>" +
      '<div><span class="tag m">' + esc(mm.label) + '</span><span class="tag">' + esc(EQ[ex.equipment]) + '</span><span class="tag">' + esc(ex.level) + "</span></div>" +
      (ex.secondary ? '<p class="note">Yardımcı kaslar: ' + esc(ex.secondary) + "</p>" : "") +
      '<div class="links"><a class="btn small" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + " nasıl yapılır") + '">' + ic("play") + " Video ara</a>" +
      '<a class="btn small ghost" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(ex.name + " exercise") + '">' + ic("image") + " Görsel ara</a>" +
      '<button class="btn small ghost" data-fav="' + esc(id) + '">' + favBtn(id) + "</button></div>" +
      "<h4>Nasıl yapılır</h4>" + listHtml("ol", ex.steps, "steps") +
      "<h4>İpuçları</h4>" + listHtml("ul", ex.tips, "dots tip") +
      "<h4>Sık yapılan hatalar</h4>" + listHtml("ul", ex.mistakes, "dots warn") +
      '<h4>Programa ekle</h4><div class="row"><select id="addDaySel" class="field" style="max-width:240px">' + opts + '<option value="__new">+ Yeni gün</option></select>' +
      '<button class="btn small" data-addplan="' + esc(id) + '">' + ic("plus") + " Ekle</button></div>";
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target.closest(".close")) { dlg.close(); return; }
    var f = e.target.closest("[data-fav]");
    if (f) { toggleFav(f.dataset.fav); f.innerHTML = favBtn(f.dataset.fav); return; }
    var a = e.target.closest("[data-addplan]");
    if (a) addToPlan($("addDaySel").value, a.dataset.addplan);
  });
  dlg.addEventListener("close", function () { detail.innerHTML = ""; });

  /* ───────── program ───────── */
  var DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  var TEMPLATES = {
    ppl: { name: "Push / Pull / Legs (3 gün)", days: [
      ["Push", [["bench-press", 4, "6-8"], ["incline-db-press", 3, "8-10"], ["db-shoulder-press", 3, "8-10"], ["lateral-raise", 4, "12-15"], ["triceps-pushdown", 3, "10-12"], ["overhead-triceps", 3, "10-12"]]],
      ["Pull", [["lat-pulldown", 3, "8-10"], ["barbell-row", 3, "8-10"], ["seated-cable-row", 3, "10-12"], ["face-pull", 3, "15"], ["barbell-curl", 3, "8-10"], ["hammer-curl", 3, "10-12"]]],
      ["Legs", [["squat", 3, "6-8"], ["rdl", 3, "8-10"], ["leg-press", 3, "10-12"], ["lying-leg-curl", 3, "10-12"], ["standing-calf-raise", 4, "12-15"], ["plank", 3, "45 sn"]]]
    ] },
    ul: { name: "Üst / Alt (4 gün)", days: [
      ["Üst A", [["bench-press", 4, "6-8"], ["barbell-row", 4, "6-8"], ["overhead-press", 3, "8-10"], ["lat-pulldown", 3, "8-10"], ["ez-bar-curl", 3, "10"], ["triceps-pushdown", 3, "10"]]],
      ["Alt A", [["squat", 4, "6-8"], ["rdl", 3, "8-10"], ["leg-extension", 3, "12"], ["lying-leg-curl", 3, "12"], ["standing-calf-raise", 4, "12-15"]]],
      ["Üst B", [["incline-db-press", 4, "8-10"], ["seated-cable-row", 4, "8-10"], ["db-shoulder-press", 3, "10"], ["pull-up", 3, "6-10"], ["hammer-curl", 3, "10-12"], ["overhead-triceps", 3, "10-12"], ["lateral-raise", 3, "12-15"]]],
      ["Alt B", [["leg-press", 4, "10-12"], ["hip-thrust", 3, "8-10"], ["bulgarian-split-squat", 3, "8-10"], ["seated-leg-curl", 3, "12"], ["seated-calf-raise", 4, "12-15"], ["cable-crunch", 3, "12-15"]]]
    ] },
    fb: { name: "Full Body (3 gün)", days: [
      ["Full Body A", [["squat", 3, "6-8"], ["bench-press", 3, "6-8"], ["barbell-row", 3, "8"], ["lateral-raise", 3, "12-15"], ["db-curl", 2, "10-12"], ["triceps-pushdown", 2, "10-12"]]],
      ["Full Body B", [["rdl", 3, "8-10"], ["overhead-press", 3, "8"], ["lat-pulldown", 3, "8-10"], ["incline-db-press", 3, "8-10"], ["hammer-curl", 2, "10-12"], ["overhead-triceps", 2, "10-12"]]],
      ["Full Body C", [["leg-press", 3, "10-12"], ["dips", 3, "8-10"], ["seated-cable-row", 3, "10"], ["cable-lateral-raise", 3, "12-15"], ["incline-curl", 2, "10-12"], ["plank", 3, "45 sn"]]]
    ] },
    arm: { name: "Kol & Omuz günü (ekstra)", days: [
      ["Kol & Omuz", [["lateral-raise", 4, "12-15"], ["rear-delt-fly", 3, "12-15"], ["ez-bar-curl", 3, "8-10"], ["incline-curl", 3, "10-12"], ["hammer-curl", 3, "10-12"], ["skullcrusher", 3, "8-10"], ["overhead-triceps", 3, "10-12"], ["triceps-pushdown", 3, "12"], ["wrist-curl", 3, "15"], ["reverse-curl", 3, "12"]]]
    ] }
  };
  TEMPLATES.fb2 = { name: "Başlangıç Full Body (2 gün)", days: [
    ["Full Body A", [["leg-press", 3, "10-12"], ["chest-press-machine", 3, "10-12"], ["lat-pulldown", 3, "10-12"], ["machine-shoulder-press", 2, "10-12"], ["plank", 3, "30 sn"]]],
    ["Full Body B", [["goblet-squat", 3, "10-12"], ["db-bench-press", 3, "10"], ["seated-cable-row", 3, "10-12"], ["lateral-raise", 2, "12-15"], ["db-curl", 2, "12"], ["triceps-pushdown", 2, "12"]]]
  ] };
  TEMPLATES.bro = { name: "Bölge Split (5 gün)", days: [
    ["Göğüs", [["bench-press", 4, "6-8"], ["incline-db-press", 4, "8-10"], ["cable-fly", 3, "12-15"], ["chest-dips", 3, "8-12"], ["push-up", 2, "max"]]],
    ["Sırt", [["pull-up", 4, "6-10"], ["barbell-row", 4, "8"], ["seated-cable-row", 3, "10-12"], ["straight-arm-pulldown", 3, "12-15"], ["back-extension", 3, "12-15"]]],
    ["Omuz", [["overhead-press", 4, "6-8"], ["lateral-raise", 5, "12-15"], ["rear-delt-fly", 4, "12-15"], ["face-pull", 3, "15"], ["barbell-shrug", 3, "10-12"]]],
    ["Bacak", [["squat", 4, "6-8"], ["rdl", 3, "8-10"], ["leg-press", 3, "10-12"], ["leg-extension", 3, "12-15"], ["lying-leg-curl", 3, "12"], ["standing-calf-raise", 4, "12-15"]]],
    ["Kol & Karın", [["ez-bar-curl", 3, "8-10"], ["skullcrusher", 3, "8-10"], ["hammer-curl", 3, "10-12"], ["overhead-triceps", 3, "10-12"], ["cable-crunch", 3, "12-15"], ["hanging-leg-raise", 3, "10"]]]
  ] };
  TEMPLATES.home = { name: "Evde / ekipmansız (3 gün)", days: [
    ["Üst vücut", [["push-up", 4, "10-15"], ["diamond-push-up", 3, "8-12"], ["bench-dips", 3, "12-15"], ["inverted-row", 3, "8-12"], ["plank", 3, "45 sn"]]],
    ["Alt vücut", [["lunge", 4, "12"], ["glute-bridge", 4, "15"], ["step-up", 3, "12"], ["nordic-curl", 3, "5-8"], ["side-plank", 3, "30 sn"]]],
    ["Karın & Kondisyon", [["mountain-climber", 4, "30 sn"], ["crunch", 3, "20"], ["bicycle-crunch", 3, "20"], ["dead-bug", 3, "12"], ["bird-dog", 3, "12"]]]
  ] };
  var META = {
    fb2: { level: "Yeni başlayan", desc: "Haftada 2 gün, makine ağırlıklı, öğrenmesi kolay. Salona yeni başlayanlar ve çok yoğun haftalar için.", wd: [1, 4] },
    ppl: { level: "Orta", desc: "İtme (göğüs, omuz, triceps), çekme (sırt, biceps) ve bacak günleri. Haftada 3 gün için kas gelişimi odaklı klasik düzen.", wd: [1, 3, 5] },
    fb: { level: "Yeni başlayan - orta", desc: "Her antrenmanda tüm vücut. Kasları haftada 3 kez çalıştırdığın için gelişim hızlı; günler arasında dinlenme olur.", wd: [1, 3, 5] },
    ul: { level: "Orta", desc: "Üst vücut / alt vücut dönüşümlü, haftada 4 gün. Her kas haftada 2 kez çalışır.", wd: [1, 2, 4, 5] },
    bro: { level: "Orta - ileri", desc: "Haftada 5 gün, her gün bir bölge. Hacim yüksek, her kasa tek gün odaklanırsın.", wd: [1, 2, 3, 5, 6] },
    home: { level: "Yeni başlayan", desc: "Ekipman gerektirmeyen, evde veya parkta yapılabilen 3 günlük program.", wd: [1, 3, 5] },
    arm: { level: "Orta", desc: "Mevcut programına ek olarak yapabileceğin tek günlük kol ve omuz odaklı antrenman.", wd: [6] }
  };
  window.__TEMPLATES = TEMPLATES;

  function savePlan() { save("gym-plan", plan); }
  function findDay(id) { for (var i = 0; i < plan.days.length; i++) if (plan.days[i].id === id) return plan.days[i]; return null; }
  function addToPlan(dayId, exId) {
    var d;
    if (dayId === "__new" || !dayId) { d = { id: uid(), name: "Antrenman " + (plan.days.length + 1), weekday: "", items: [] }; plan.days.push(d); }
    else d = findDay(dayId);
    if (!d) return;
    d.items.push({ id: exId, sets: 3, reps: "8-12", kg: "" });
    savePlan(); renderPlan(); renderToday();
    toast("Programa eklendi: " + byId[exId].name);
  }

  var WK = [1, 2, 3, 4, 5, 6, 0], DS = { 0: "Paz", 1: "Pzt", 2: "Sal", 3: "Çar", 4: "Per", 5: "Cum", 6: "Cmt" };
  var ui = { pv: load("gym-planview", "week") };
  function dayMuscles(d) {
    var seen = {}, out = [];
    d.items.forEach(function (it) { var e = byId[it.id]; if (e && !seen[e.muscle]) { seen[e.muscle] = 1; out.push(e.muscle); } });
    return out;
  }
  function tplCards() {
    return Object.keys(TEMPLATES).map(function (k) {
      var t = TEMPLATES[k], m = META[k] || {};
      return '<div class="tpl"><div class="tpl-h"><b>' + esc(t.name) + '</b><span class="tag">' + esc(m.level || "") + "</span></div>" +
        '<p class="note">' + esc(m.desc || "") + '</p><p class="tpl-days">' + t.days.map(function (d, i) {
          return '<span>' + (m.wd ? DS[m.wd[i]] : "") + " " + esc(d[0]) + "</span>";
        }).join("") + '</p><button class="btn small" data-tpl="' + k + '">Bu programı kullan</button></div>';
    }).join("");
  }
  function applyTpl(k, mode) {
    var t = TEMPLATES[k], m = META[k] || {};
    if (mode === "replace") plan.days = [];
    t.days.forEach(function (td, i) {
      plan.days.push({ id: uid(), name: td[0], weekday: m.wd ? String(m.wd[i]) : "", items: td[1].map(function (r) { return { id: r[0], sets: r[1], reps: r[2], kg: "" }; }) });
    });
    savePlan(); renderPlan(); renderToday(); toast("Program hazır: " + t.name);
  }
  function volumeHtml() {
    var sets = {}, tot = 0;
    plan.days.forEach(function (d) {
      if (d.weekday === "") return;
      d.items.forEach(function (it) { var e = byId[it.id]; if (!e) return; var n = parseInt(it.sets, 10) || 0; sets[e.muscle] = (sets[e.muscle] || 0) + n; tot += n; });
    });
    var keys = Object.keys(sets).sort(function (a, b) { return sets[b] - sets[a]; });
    if (!keys.length) return "";
    return '<div class="tool"><h3><span class="t-ic">' + ic("calc") + '</span>Haftalık kas hacmi</h3><p class="note">Haftaya yerleştirdiğin antrenmanlarda her kasa toplam kaç set düşüyor. Genel hedef: büyümek için kas başına haftada yaklaşık 10-20 set. Çok altındaysa kasa yeterli uyarı gitmiyor, çok üstündeyse toparlanma zorlaşır.</p>' +
      keys.map(function (k) {
        var n = sets[k], st = n < 6 ? "low" : n > 22 ? "high" : "ok";
        return '<div class="vol ' + st + '"><span class="vol-n">' + esc(M[k].label) + '</span><span class="vol-b"><i style="width:' + Math.min(100, n / 24 * 100) + '%"></i></span><span class="vol-v">' + n + " set</span></div>";
      }).join("") + "</div>";
  }
  function weekHtml() {
    var wd = new Date().getDay(), h = '<div class="week">';
    WK.forEach(function (w) {
      var ds = plan.days.filter(function (d) { return String(d.weekday) === String(w); });
      h += '<div class="wk-row' + (w === wd ? " today-r" : "") + '"><div class="wk-d"><b>' + DS[w] + "</b><span>" + DAYS[w] + (w === wd ? " · bugün" : "") + '</span></div><div class="wk-b">';
      if (!ds.length) h += '<span class="rest">Dinlenme</span>';
      ds.forEach(function (d) {
        h += '<div class="wk-card" data-day="' + d.id + '"><div><b>' + esc(d.name) + "</b><small>" + d.items.length + " hareket · " + dayMuscles(d).map(function (m) { return esc(M[m].label); }).join(", ") + "</small></div>" +
          '<span class="wk-act"><button class="btn small" data-act="start">' + ic("play") + ' Başlat</button><button class="btn small ghost" data-act="edit">Düzenle</button></span></div>';
      });
      h += '<button class="link-btn wk-add" data-assign="' + w + '">' + ic("plus") + " Antrenman ata</button></div></div>";
    });
    return h + "</div>" + volumeHtml();
  }
  function daysHtml() {
    var h = "";
    plan.days.forEach(function (d) {
      h += '<section class="day" id="day-' + d.id + '" data-day="' + d.id + '"><div class="day-h"><input class="day-name" data-f="name" value="' + esc(d.name) + '" aria-label="Antrenman adı">' +
        '<label class="wsel">Hangi gün?<select data-f="weekday" aria-label="Haftanın günü"><option value="">Seçilmedi</option>' +
        WK.map(function (w) { return '<option value="' + w + '"' + (String(d.weekday) === String(w) ? " selected" : "") + ">" + DAYS[w] + "</option>"; }).join("") +
        '</select></label></div><ul class="items">';
      d.items.forEach(function (it, i) {
        var ex = byId[it.id]; if (!ex) return;
        h += '<li class="item" data-idx="' + i + '" style="--h:' + M[ex.muscle].hue + '"><div class="it-name" data-open="' + esc(it.id) + '">' + esc(ex.name) + "<small>" + esc(M[ex.muscle].label) + "</small></div>" +
          '<div class="it-ctl"><label>Set<input type="number" inputmode="numeric" min="1" data-f="sets" value="' + esc(it.sets) + '"></label>' +
          '<label>Tekrar<input type="text" data-f="reps" value="' + esc(it.reps) + '"></label>' +
          '<label>kg<input type="number" inputmode="decimal" step="0.5" min="0" data-f="kg" value="' + esc(it.kg) + '"></label></div>' +
          '<div class="it-act"><button data-act="up" aria-label="Yukarı">' + ic("up") + '</button><button data-act="down" aria-label="Aşağı">' + ic("down") + '</button><button data-act="rm" aria-label="Sil">' + ic("trash") + "</button></div></li>";
      });
      h += '</ul><div class="day-f"><button class="btn small ghost" data-act="add">' + ic("plus") + ' Hareket ekle</button>' +
        '<button class="btn small" data-act="start">' + ic("play") + ' Başlat</button><button class="btn small danger" data-act="delday">Sil</button></div></section>';
    });
    return h;
  }
  function renderPlan() {
    var h = '<div class="plan-top"><div class="seg" role="tablist"><button data-pv="week" class="' + (ui.pv === "week" ? "on" : "") + '">Haftalık görünüm</button><button data-pv="days" class="' + (ui.pv === "days" ? "on" : "") + '">Antrenmanları düzenle</button></div>' +
      '<div class="plan-btns"><button class="btn small" data-act="newday">' + ic("plus") + ' Yeni antrenman</button><button class="btn small ghost" data-act="tplopen">Hazır programlar</button></div></div>';
    if (!plan.days.length) {
      h += '<div class="intro"><p class="eyebrow">Başlangıç</p><h3>Henüz bir programın yok</h3><p class="note">Aşağıdan hazır bir program seç; günler haftaya otomatik yerleşir ve istediğini sonradan değiştirebilirsin. Ya da yukarıdan "Yeni antrenman" ile sıfırdan kur.</p></div><div class="tpls">' + tplCards() + "</div>";
    } else h += ui.pv === "week" ? weekHtml() : daysHtml();
    if (log.length) {
      h += '<div class="tool"><h3><span class="t-ic">' + ic("check") + '</span>Son antrenmanlar</h3><ul class="log">' + log.slice(-6).reverse().map(function (l) {
        return "<li>" + esc(l.date) + " · <b>" + esc(l.name) + "</b> · " + l.sets + " set · " + (l.volume / 1000).toFixed(1) + " ton</li>";
      }).join("") + "</ul></div>";
    }
    $("planBody").innerHTML = h;
  }
  $("planBody").addEventListener("change", function (e) {
    var f = e.target.dataset.f; if (!f) return;
    var dayEl = e.target.closest(".day"); var d = findDay(dayEl.dataset.day); if (!d) return;
    var itEl = e.target.closest(".item");
    if (itEl) { d.items[+itEl.dataset.idx][f] = e.target.value; } else d[f] = e.target.value;
    savePlan(); if (f === "weekday") renderToday();
  });
  $("planBody").addEventListener("click", function (e) {
    var pv = e.target.closest("[data-pv]"); if (pv) { ui.pv = pv.dataset.pv; save("gym-planview", ui.pv); renderPlan(); return; }
    var tp = e.target.closest("[data-tpl]"); if (tp) { tplChoose(tp.dataset.tpl); return; }
    var as = e.target.closest("[data-assign]"); if (as) { openAssign(as.dataset.assign); return; }
    var op = e.target.closest("[data-open]");
    if (op) { openDetail(op.dataset.open); return; }
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act;
    if (act === "newday") { var nd = { id: uid(), name: "Antrenman " + (plan.days.length + 1), weekday: "", items: [] }; plan.days.push(nd); ui.pv = "days"; save("gym-planview", "days"); savePlan(); renderPlan(); var el = $("day-" + nd.id); if (el) el.scrollIntoView({ block: "center" }); return; }
    if (act === "tplopen") { openTpls(); return; }
    var dayEl = b.closest("[data-day]"); if (!dayEl) return;
    var d = findDay(dayEl.dataset.day); if (!d) return;
    if (act === "edit") { ui.pv = "days"; save("gym-planview", "days"); renderPlan(); var t2 = $("day-" + d.id); if (t2) t2.scrollIntoView({ block: "start" }); return; }
    var itEl = b.closest(".item"), i = itEl ? +itEl.dataset.idx : -1;
    if (act === "rm") d.items.splice(i, 1);
    else if (act === "up" && i > 0) { var x = d.items[i]; d.items[i] = d.items[i - 1]; d.items[i - 1] = x; }
    else if (act === "down" && i < d.items.length - 1) { var y = d.items[i]; d.items[i] = d.items[i + 1]; d.items[i + 1] = y; }
    else if (act === "delday") { if (!confirm('"' + d.name + '" antrenmanı silinsin mi?')) return; plan.days.splice(plan.days.indexOf(d), 1); }
    else if (act === "add") { openPicker(d.id); return; }
    else if (act === "start") { startWorkout(d.id); return; }
    savePlan(); renderPlan(); renderToday();
  });
  /* hazır program / gün atama pencereleri */
  function openTpls() {
    $("pickBody").innerHTML = '<button class="close" aria-label="Kapat">×</button><h2>Hazır programlar</h2><p class="note">Birini seç; antrenman günleri haftaya yerleşir. Sonra tüm hareketleri değiştirebilirsin.</p><div class="tpls">' + tplCards() + "</div>";
    if (!pick.open) pick.showModal(); pick.scrollTop = 0;
  }
  function tplChoose(k) {
    if (!plan.days.length) { if (pick.open) pick.close(); applyTpl(k, "add"); return; }
    $("pickBody").innerHTML = '<button class="close" aria-label="Kapat">×</button><h2>' + esc(TEMPLATES[k].name) + '</h2><p class="note">Zaten bir programın var. Ne yapalım?</p>' +
      '<div class="choice"><button class="btn" data-tplgo="replace:' + k + '">Mevcut programımı sil, bunu kullan</button><button class="btn ghost" data-tplgo="add:' + k + '">Mevcut programın yanına ekle</button><button class="link-btn" data-tplgo="cancel">Vazgeç</button></div>';
    if (!pick.open) pick.showModal();
  }
  function openAssign(w) {
    var free = plan.days.filter(function (d) { return String(d.weekday) !== String(w); });
    $("pickBody").innerHTML = '<button class="close" aria-label="Kapat">×</button><h2>' + DAYS[w] + " günü antrenmanı</h2>" +
      (free.length ? '<p class="note">Mevcut antrenmanlardan birini bu güne ata:</p><div class="choice">' + free.map(function (d) {
        return '<button class="btn ghost" data-asg="' + w + ":" + d.id + '">' + esc(d.name) + (d.weekday !== "" ? " (şu an " + DS[d.weekday] + ")" : "") + "</button>";
      }).join("") + "</div>" : "") + '<div class="choice"><button class="btn" data-asg="' + w + ':__new">+ Yeni antrenman oluştur</button></div>';
    if (!pick.open) pick.showModal();
  }

  /* hareket seçici */
  var pick = $("pick"), pickDay = null;
  function openPicker(dayId) {
    pickDay = dayId;
    $("pickBody").innerHTML = '<button class="close" aria-label="Kapat">×</button><h2>Hareket ekle</h2>' +
      '<input id="pickQ" class="field" type="search" placeholder="Ara…" autocomplete="off"><div id="pickList" style="margin-top:10px"></div>';
    renderPick(""); pick.showModal(); setTimeout(function () { var q = $("pickQ"); if (q) q.focus(); }, 50);
  }
  function renderPick(q) {
    var toks = norm(q).split(/\s+/).filter(Boolean);
    var l = LIST.filter(function (ex) {
      var hay = norm(ex.name + " " + ex.alias + " " + M[ex.muscle].label);
      return toks.every(function (t) { return hay.indexOf(t) !== -1; });
    }).slice(0, 60);
    $("pickList").innerHTML = l.map(function (ex) {
      return '<div class="item" data-pick="' + esc(ex.id) + '" style="--h:' + M[ex.muscle].hue + ';cursor:pointer;grid-template-columns:1fr"><div class="it-name">' + esc(ex.name) + "<small>" + esc(M[ex.muscle].label) + " · " + esc(EQ[ex.equipment]) + "</small></div></div>";
    }).join("") || '<p class="note">Sonuç yok.</p>';
  }
  pick.addEventListener("input", function (e) { if (e.target.id === "pickQ") renderPick(e.target.value); });
  pick.addEventListener("click", function (e) {
    if (e.target === pick || e.target.closest(".close")) { pick.close(); return; }
    var tg = e.target.closest("[data-tplgo]");
    if (tg) { var v = tg.dataset.tplgo; pick.close(); if (v !== "cancel") { var pr = v.split(":"); applyTpl(pr[1], pr[0]); } return; }
    var tc = e.target.closest("[data-tpl]"); if (tc) { tplChoose(tc.dataset.tpl); return; }
    var ag = e.target.closest("[data-asg]");
    if (ag) {
      var q = ag.dataset.asg.split(":"), wd = q[0], did = q[1]; pick.close();
      if (did === "__new") { var nd = { id: uid(), name: "Antrenman " + (plan.days.length + 1), weekday: wd, items: [] }; plan.days.push(nd); ui.pv = "days"; save("gym-planview", "days"); savePlan(); renderPlan(); renderToday(); var el = $("day-" + nd.id); if (el) el.scrollIntoView({ block: "center" }); toast("Şimdi hareket ekle"); }
      else { var dd = findDay(did); if (dd) { dd.weekday = wd; savePlan(); renderPlan(); renderToday(); } }
      return;
    }
    var p = e.target.closest("[data-pick]");
    if (p) addToPlan(pickDay, p.dataset.pick);
  });

  /* bugün kartı (ana sayfa) */
  function renderToday() {
    var wd = new Date().getDay(), d = null;
    plan.days.forEach(function (x) { if (!d && String(x.weekday) === String(wd) && x.items.length) d = x; });
    $("todayCard").innerHTML = d ?
      '<div class="today"><div><span>Bugün · ' + DAYS[wd] + "</span><b>" + esc(d.name) + "</b><span>" + d.items.length + ' hareket</span></div><button class="btn" data-start="' + d.id + '">' + ic("play") + " Başlat</button></div>" : "";
  }
  $("todayCard").addEventListener("click", function (e) { var b = e.target.closest("[data-start]"); if (b) startWorkout(b.dataset.start); });

  /* ───────── antrenman modu ───────── */
  var wo = $("wo"), W = null;
  function startWorkout(dayId) {
    var d = findDay(dayId); if (!d || !d.items.length) { toast("Bu günde hareket yok"); return; }
    W = { name: d.name, dayId: d.id, items: d.items.map(function (it) {
      var n = Math.max(1, parseInt(it.sets, 10) || 3), reps = parseInt(String(it.reps), 10) || "";
      var sets = []; for (var i = 0; i < n; i++) sets.push({ kg: it.kg, reps: reps, done: false });
      return { id: it.id, sets: sets };
    }) };
    renderWorkout(); wo.showModal();
  }
  function renderWorkout() {
    var h = '<button class="close" aria-label="Kapat">×</button><h2>' + esc(W.name) + "</h2>";
    W.items.forEach(function (it, ii) {
      var ex = byId[it.id]; if (!ex) return;
      h += '<div class="wo-ex" style="--h:' + M[ex.muscle].hue + '"><h3>' + esc(ex.name) + "</h3>";
      it.sets.forEach(function (s, si) {
        h += '<div class="setrow' + (s.done ? " ok" : "") + '" data-i="' + ii + '" data-s="' + si + '"><span>' + (si + 1) + "</span>" +
          '<input type="number" inputmode="decimal" step="0.5" placeholder="kg" data-f="kg" value="' + esc(s.kg) + '">' +
          '<input type="number" inputmode="numeric" placeholder="tekrar" data-f="reps" value="' + esc(s.reps) + '">' +
          '<button class="done" data-done aria-label="Tamamla">' + ic("check") + "</button></div>";
      });
      h += "</div>";
    });
    h += '<div class="wo-bar"><span>' + ic("timer") + ' <b class="timer-out">--</b></span><button class="btn" data-finish>Bitir</button></div>';
    $("woBody").innerHTML = h; tick();
  }
  wo.addEventListener("input", function (e) {
    var row = e.target.closest(".setrow"); if (!row || !e.target.dataset.f) return;
    W.items[+row.dataset.i].sets[+row.dataset.s][e.target.dataset.f] = e.target.value;
  });
  wo.addEventListener("click", function (e) {
    if (e.target === wo || e.target.closest(".close")) { if (!W || confirm("Antrenmanı kapat? Girdiğin veriler kaybolur.")) { wo.close(); W = null; } return; }
    var dn = e.target.closest("[data-done]");
    if (dn) {
      var row = dn.closest(".setrow"), s = W.items[+row.dataset.i].sets[+row.dataset.s];
      s.done = !s.done; row.classList.toggle("ok", s.done);
      if (s.done) timerStart(restSec());
      return;
    }
    if (e.target.closest("[data-finish]")) finishWorkout();
  });
  function finishWorkout() {
    var vol = 0, cnt = 0, d = findDay(W.dayId);
    W.items.forEach(function (it, i) {
      var lastKg = "";
      it.sets.forEach(function (s) {
        if (s.done) { cnt++; vol += (parseFloat(s.kg) || 0) * (parseFloat(s.reps) || 0); if (s.kg !== "") lastKg = s.kg; }
      });
      if (d && lastKg !== "" && d.items[i]) d.items[i].kg = lastKg;
    });
    if (cnt) {
      log.push({ date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short" }), name: W.name, sets: cnt, volume: Math.round(vol) });
      log = log.slice(-60); save("gym-log", log); savePlan();
      toast("Antrenman kaydedildi");
    } else toast("Hiç set tamamlanmadı");
    W = null; wo.close(); timerStop(); renderPlan();
  }

  /* ───────── dinlenme zamanlayıcısı ───────── */
  var timer = { end: 0, iv: null };
  function restSec() { return parseInt(load("gym-rest", 90), 10) || 90; }
  function timerStart(sec) {
    timer.end = Date.now() + sec * 1000;
    if (!timer.iv) timer.iv = setInterval(tick, 250);
    tick();
  }
  function timerStop() { clearInterval(timer.iv); timer.iv = null; timer.end = 0; tick(); }
  function tick() {
    var left = timer.end ? Math.max(0, Math.ceil((timer.end - Date.now()) / 1000)) : -1;
    var outs = document.querySelectorAll(".timer-out");
    for (var i = 0; i < outs.length; i++) outs[i].textContent = left < 0 ? "--" : fmt(left);
    $("timerPill").hidden = left < 0 || wo.open;
    if (left === 0) { timerStop(); beep(); toast("Dinlenme bitti, sıradaki set!"); }
  }
  function beep() {
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      var c = new C(), t = c.currentTime;
      [0, 0.3, 0.6].forEach(function (o) {
        var os = c.createOscillator(), g = c.createGain();
        os.frequency.value = 880; os.connect(g); g.connect(c.destination);
        g.gain.setValueAtTime(0.2, t + o); g.gain.exponentialRampToValueAtTime(0.001, t + o + 0.25);
        os.start(t + o); os.stop(t + o + 0.26);
      });
    } catch (e) {}
  }
  $("timerPill").addEventListener("click", function (e) {
    var b = e.target.closest("[data-timer]"); if (!b) return;
    if (b.dataset.timer === "stop") timerStop(); else if (timer.end) timer.end += 30000;
    tick();
  });
  wo.addEventListener("close", tick);

  /* ───────── araçlar ───────── */
  function th(icon, title) { return '<h3><span class="t-ic">' + ic(icon) + "</span>" + title + "</h3>"; }
  function what(t) { return '<p class="what">' + t + "</p>"; }
  function howto(t) { return '<details class="how"><summary>Nasıl kullanılır? Örnek</summary><div>' + t + "</div></details>"; }
  var PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  var BARS = [["Olimpik bar (düz bar)", 20], ["Kadın olimpik barı", 15], ["EZ bar (kıvrık)", 10], ["Kısa halter sapı", 2.5]];
  var weights = load("gym-weights", []);
  var pf = load("gym-profile", { w: "", h: "", a: "", s: "m", act: "1.55", g: "gain" });

  function renderTools() {
    var rs = restSec();
    var jump = [["t-rest", "Sayaç"], ["t-1rm", "1RM"], ["t-plate", "Plaka"], ["t-warm", "Isınma"], ["t-cal", "Kalori"], ["t-bw", "Kilo takibi"], ["t-guide", "Rehber"], ["t-bk", "Yedek"]];
    $("toolsBody").innerHTML =
      '<p class="lead2">Burada antrenmanda işine yarayacak küçük yardımcılar var. Her birinin altında ne işe yaradığı ve örnek yazıyor.</p>' +
      '<div class="chips jump">' + jump.map(function (j) { return '<button class="chip" data-jump="' + j[0] + '">' + j[1] + "</button>"; }).join("") + "</div>" +

      '<section class="tool" id="t-rest">' + th("timer", "Dinlenme sayacı") +
      what("Setler arasında ne kadar dinleneceğini sayar, süre bitince titreşim ve bip verir. Sayaç ekranın köşesinde durur, başka sekmede de çalışır.") +
      '<div class="pre">' + [45, 60, 90, 120, 180].map(function (s) { return '<button data-rest="' + s + '">' + fmt(s) + "</button>"; }).join("") + "</div>" +
      '<p class="note">Antrenman modunda bir seti bitirince otomatik başlayan süre: <b>' + fmt(rs) + "</b>. Bir süreye basınca bu süre varsayılan olur.</p>" +
      howto("<b>Ne kadar dinlenmeli?</b><br>Ağır ve çok eklemli hareketler (squat, bench, deadlift): 2-3 dk.<br>Normal kas geliştirme setleri: 90 sn - 2 dk.<br>Tek eklemli hareketler (curl, yan omuz): 45-60 sn.") + "</section>" +

      '<section class="tool" id="t-1rm">' + th("calc", "1RM hesaplayıcı") +
      what("1RM, bir hareketi <b>en fazla 1 kez</b> kaldırabildiğin ağırlıktır. Maksimumu denemek riskli olduğu için; 3-10 tekrar yaptığın bir setten tahmin edilir. Hangi ağırlıkla çalışacağını seçmek için kullanılır.") +
      '<div class="inline"><label>Kaldırdığın ağırlık (kg)<input id="rmW" class="field" type="number" inputmode="decimal" step="0.5"></label>' +
      '<label>Kaç tekrar yaptın<input id="rmR" class="field" type="number" inputmode="numeric"></label><button class="btn" data-act="rm1">Hesapla</button></div><div id="rmOut" class="result"></div>' +
      howto("Örnek: bench pressi 80 kg ile 8 tekrar yaptın. Tahmini 1RM yaklaşık 100 kg çıkar. Kas büyütmek için 8-12 tekrar çalışacaksan tablodaki %70-75 satırına bak: yaklaşık 70-75 kg. Güç için %85 ve üstü, 3-5 tekrar.") + "</section>" +

      '<section class="tool" id="t-plate">' + th("disc", "Bara plaka dizilimi") +
      what("Barın toplam ağırlığını istediğin sayıya getirmek için <b>her tarafa hangi plakaları takacağını</b> gösterir. Plakalar iki tarafa eşit takılır, o yüzden hesap tek taraf içindir.") +
      '<div class="inline"><label>Barda olmasını istediğin toplam (kg)<input id="plT" class="field" type="number" inputmode="decimal" step="0.5"></label>' +
      '<label>Bar türü<select id="plB" class="field">' + BARS.map(function (b) { return '<option value="' + b[1] + '">' + b[0] + " · " + b[1] + " kg</option>"; }).join("") + "</select></label>" +
      '<button class="btn" data-act="plates">Göster</button></div>' +
      '<div class="pre plset" aria-label="Salonda olan plakalar">' + PLATES.map(function (p) { return '<label class="chk"><input type="checkbox" data-plate="' + p + '" checked> ' + p + "</label>"; }).join("") + '</div><p class="note">Salonunda olmayan plakanın işaretini kaldır.</p><div id="plOut" class="result"></div>' +
      howto("Örnek: bench pressi toplam 80 kg yapacaksın, olimpik bar 20 kg. Kalan 60 kg iki tarafa bölünür: her tarafa 30 kg = 20 + 10. Altta barın çizimi de görünür.") + "</section>" +

      '<section class="tool" id="t-warm">' + th("flame", "Isınma seti planı") +
      what("Ağır bir hareketten önce kasları ve sinirleri hazırlamak için hangi hafif setleri yapacağını söyler. Yorulmadan çalışma ağırlığına çıkarsın.") +
      '<div class="inline"><label>Çalışma ağırlığın (kg)<input id="wmW" class="field" type="number" inputmode="decimal" step="0.5"></label>' +
      '<label>Bar (kg)<input id="wmB" class="field" type="number" value="20" step="0.5"></label><button class="btn" data-act="warm">Planla</button></div><div id="wmOut" class="result"></div>' +
      howto("Örnek: squat çalışma ağırlığın 100 kg. Önce boş bar x10, sonra 40 kg x8, 60 kg x5, 75 kg x3, 90 kg x1 yap, ardından 100 kg çalışma setlerine geç. Isınma setleri arasında 1 dk dinlen. Hafif izole hareketler için (curl, yan omuz) 1 hafif set yeter.") + "</section>" +

      '<section class="tool" id="t-cal">' + th("leaf", "Kalori ve protein hedefi") +
      what("Günlük harcadığın kaloriyi tahmin eder ve hedefine göre (kas kazanma, kilo koruma, yağ yakma) ne kadar kalori, protein, karbonhidrat ve yağ alman gerektiğini söyler. Bilgilerin sadece bu cihazda saklanır.") +
      '<div class="inline"><label>Kilo (kg)<input id="cW" class="field" type="number" inputmode="decimal" value="' + esc(pf.w) + '"></label>' +
      '<label>Boy (cm)<input id="cH" class="field" type="number" inputmode="numeric" value="' + esc(pf.h) + '"></label>' +
      '<label>Yaş<input id="cA" class="field" type="number" inputmode="numeric" value="' + esc(pf.a) + '"></label>' +
      '<label>Cinsiyet<select id="cS" class="field"><option value="m"' + (pf.s === "m" ? " selected" : "") + '>Erkek</option><option value="f"' + (pf.s === "f" ? " selected" : "") + ">Kadın</option></select></label></div>" +
      '<div class="inline" style="margin-top:8px"><label>Günlük hareket düzeyi<select id="cAct" class="field" style="width:230px">' +
      [["1.2", "Masabaşı, hiç spor yok"], ["1.375", "Haftada 1-3 gün antrenman"], ["1.55", "Haftada 3-5 gün antrenman"], ["1.725", "Haftada 6-7 gün, yoğun"]].map(function (o) { return '<option value="' + o[0] + '"' + (pf.act === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>" +
      '<label>Hedef<select id="cG" class="field" style="width:170px"><option value="gain"' + (pf.g === "gain" ? " selected" : "") + '>Kas kazan</option><option value="keep"' + (pf.g === "keep" ? " selected" : "") + '>Kiloyu koru</option><option value="cut"' + (pf.g === "cut" ? " selected" : "") + '>Yağ yak</option></select></label>' +
      '<button class="btn" data-act="cal">Hesapla</button></div><div id="cOut" class="result"></div>' +
      howto("Hesap Mifflin-St Jeor formülüyle yapılır; bir tahmindir, ±%10 sapabilir. Kas kazanmak için günlük harcamanın yaklaşık 300 kcal üstü, yağ yakmak için 400 kcal altı hedeflenir. Protein kilo başına ~2 g, yağ ~0,9 g, kalan kalori karbonhidrattır. 2-3 hafta kiloyu izle, değişmiyorsa kaloriyi 150-200 kcal ayarla. Öğünleri takip etmek için Nutrio sekmesine bak.") + "</section>" +

      '<section class="tool" id="t-bw">' + th("scale", "Kilo takibi") +
      what("Vücut kilonu kaydedip zaman içindeki değişimi grafikte görürsün. Aynı saatte (sabah, tuvaletten sonra) tartılmak en doğru sonucu verir; günlük dalgalanma normaldir, haftalık eğilime bak.") +
      '<div class="inline"><label>Bugünkü kilo (kg)<input id="bwW" class="field" type="number" inputmode="decimal" step="0.1"></label><button class="btn" data-act="bwadd">Kaydet</button><button class="btn ghost small" data-act="bwdel">Son kaydı sil</button></div>' +
      '<div id="bwOut" class="result">' + bwHtml() + "</div></section>" +

      '<section class="tool" id="t-guide">' + th("book", "Hızlı rehber") +
      what("Salona yeni başlayanların ve terimleri bilmeyenlerin kısa başvuru kaynağı.") +
      '<details class="how" open><summary>Hedefe göre set, tekrar ve dinlenme</summary><div><table class="table"><tr><th>Hedef</th><th>Tekrar</th><th>Set</th><th>Dinlenme</th></tr>' +
      '<tr><td>Güç</td><td>3-5</td><td>3-5</td><td>2-4 dk</td></tr><tr><td>Kas büyütme</td><td>6-12</td><td>3-4</td><td>1-2 dk</td></tr><tr><td>Dayanıklılık</td><td>15-20+</td><td>2-3</td><td>30-60 sn</td></tr></table></div></details>' +
      '<details class="how"><summary>İlk kez salona gidenler için 6 kural</summary><div><ol class="steps"><li>Haftada 2-3 gün yeter. Önce düzeni oturt.</li><li>Önce makine ve hafif ağırlıklarla formu öğren, sonra ağırlık artır.</li><li>Her antrenmanda 5-10 dk hafif kardiyo veya hareketlilikle ısın.</li><li>Her hareketten önce 1-2 hafif ısınma seti yap.</li><li>Ağrı ile kas yorgunluğunu ayır: keskin eklem ağrısında hemen bırak.</li><li>Uyku (7-9 saat) ve protein antrenman kadar önemli.</li></ol></div></details>' +
      '<details class="how"><summary>Terimler sözlüğü</summary><div><dl class="gl">' +
      [["Tekrar (rep)", "Hareketi baştan sona bir kez yapmak."], ["Set", "Aralıksız yapılan tekrar grubu. 3x10 = 3 set, her sette 10 tekrar."], ["RPE", "Setin ne kadar zorlandığı (1-10). RPE 8: bitirdiğinde 2 tekrar daha yapabilirdin."], ["Failure (tükeniş)", "Bir tekrar daha yapamayacak noktaya gelmek."], ["Progresif yüklenme", "Zamanla ağırlığı, tekrarı veya seti artırmak. Kas büyümesinin ana sebebi."], ["Süperset", "İki hareketi arada dinlenmeden art arda yapmak."], ["Drop set", "Tükenişten sonra ağırlığı düşürüp aynı hareketle devam etmek."], ["Deload", "Her 6-8 haftada bir 1 hafta ağırlığı veya hacmi yarıya indirip toparlanmak."], ["Hipertrofi", "Kas boyutunun büyümesi."], ["Konsantrik / eksantrik", "Kasın kısaldığı (kaldırma) / uzadığı (indirme) evre."], ["Tempo", "Hareketin hızı. 3-1-1: 3 sn indir, 1 sn bekle, 1 sn kaldır."]].map(function (g) { return "<dt>" + g[0] + "</dt><dd>" + g[1] + "</dd>"; }).join("") + "</dl></div></details></section>" +

      '<section class="tool" id="t-bk">' + th("save", "Yedekle / geri yükle") + what("Programın, favorilerin, antrenman geçmişin ve kilo kayıtların bu cihazın tarayıcısında saklanır. Telefon değiştirirsen veya tarayıcı verisini silersen kaybolur; bu yüzden yedeği kopyalayıp bir yere (not uygulaması, mesaj) kaydet.") +
      '<div class="row"><button class="btn ghost small" data-act="export">Yedeği göster</button><button class="btn ghost small" data-act="import">Yedeği yükle</button></div>' +
      '<textarea id="bk" class="field" placeholder="Yedek metni burada görünür. Geri yüklemek için kopyaladığın yedeği buraya yapıştır ve \'Yedeği yükle\'ye bas."></textarea></section>' +

      '<section class="tool">' + th("phone", "Uygulama olarak kur") + '<p class="note">Android/Chrome: menüden "Ana ekrana ekle" veya üstteki indirme düğmesi. iPhone/Safari: Paylaş → "Ana Ekrana Ekle". Kurduktan sonra internet olmadan da açılır.</p></section>';
  }
  function bwHtml() {
    if (!weights.length) return '<p class="note">Henüz kayıt yok.</p>';
    var l = weights.slice(-12), mn = Math.min.apply(null, l.map(function (x) { return x.kg; })), mx = Math.max.apply(null, l.map(function (x) { return x.kg; }));
    var pad = Math.max(0.5, (mx - mn) * 0.2), lo = mn - pad, hi = mx + pad, W2 = 300, H2 = 110;
    var pts = l.map(function (x, i) { return [l.length === 1 ? W2 / 2 : 10 + i * (W2 - 20) / (l.length - 1), H2 - 10 - (x.kg - lo) / (hi - lo) * (H2 - 20)]; });
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
    var diff = l[l.length - 1].kg - l[0].kg;
    return '<svg class="chart" viewBox="0 0 ' + W2 + " " + H2 + '"><path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2"/>' + pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="var(--accent)"/>'; }).join("") + "</svg>" +
      '<p class="note">Son: <b>' + l[l.length - 1].kg + " kg</b> (" + esc(l[l.length - 1].d) + ")" + (l.length > 1 ? " · ilk kayda göre " + (diff > 0 ? "+" : "") + (Math.round(diff * 10) / 10) + " kg" : "") + "</p>";
  }
  function plateSvg(per) {
    var x = 8, h = "";
    var cs = { 25: "#c0392b", 20: "#2c6fbb", 15: "#d4a72c", 10: "#2f8f5b", 5: "#e8e8e8", 2.5: "#555", 1.25: "#999" }, hs = { 25: 92, 20: 92, 15: 80, 10: 66, 5: 50, 2.5: 40, 1.25: 32 };
    var out = '<svg class="plates" viewBox="0 0 300 110"><rect x="0" y="52" width="300" height="6" rx="3" fill="var(--mute)"/><rect x="12" y="44" width="10" height="22" fill="var(--mute)"/>';
    var cx = 28;
    per.forEach(function (p) { var ph = hs[p], w = p >= 10 ? 12 : 8; out += '<rect x="' + cx + '" y="' + (55 - ph / 2) + '" width="' + w + '" height="' + ph + '" rx="2" fill="' + cs[p] + '" stroke="var(--ink)" stroke-width="1"/>'; cx += w + 2; });
    return out + "</svg>";
  }
  $("toolsBody").addEventListener("click", function (e) {
    var j = e.target.closest("[data-jump]"); if (j) { var t = $(j.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    var r = e.target.closest("[data-rest]");
    if (r) { var s = +r.dataset.rest; save("gym-rest", s); timerStart(s); renderTools(); return; }
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act;
    if (act === "rm1") {
      var w = parseFloat($("rmW").value), n = parseInt($("rmR").value, 10);
      if (!w || !n || n < 1) { $("rmOut").textContent = "Ağırlık ve tekrar gir."; return; }
      var ep = w * (1 + n / 30), br = n < 37 ? w * 36 / (37 - n) : ep, rm = n === 1 ? w : (ep + br) / 2;
      var rows = [[100, "1 tekrar"], [90, "~4 tekrar"], [85, "~6 tekrar · güç"], [80, "~8 tekrar"], [75, "~10 tekrar · kas büyütme"], [70, "~12 tekrar · kas büyütme"], [60, "~20 tekrar · dayanıklılık"]].map(function (p) {
        return "<tr><td>%" + p[0] + "</td><td><b>" + (Math.round(rm * p[0] / 100 * 2) / 2) + " kg</b></td><td>" + p[1] + "</td></tr>";
      }).join("");
      $("rmOut").innerHTML = "Tahmini 1RM: <b>" + (Math.round(rm * 10) / 10) + " kg</b>" + (n > 12 ? ' <span class="note">(12+ tekrarda tahmin güvenilirliği düşer)</span>' : "") +
        '<table class="table"><tr><th>Yüzde</th><th>Ağırlık</th><th>Yaklaşık kullanım</th></tr>' + rows + "</table>";
    } else if (act === "plates") {
      var tg = parseFloat($("plT").value), bar = parseFloat($("plB").value) || 20;
      if (!tg) { $("plOut").textContent = "Toplam ağırlığı gir."; return; }
      if (tg <= bar) { $("plOut").innerHTML = "Boş bar zaten <b>" + bar + " kg</b>. Hedef bundan büyük olmalı."; return; }
      var avail = PLATES.filter(function (p) { var c = document.querySelector('[data-plate="' + p + '"]'); return c && c.checked; });
      var side = (tg - bar) / 2, per = [], txt = [];
      avail.forEach(function (p) { var k = Math.floor(side / p + 1e-9); if (k) { txt.push(k + " × " + p + " kg"); for (var q = 0; q < k; q++) per.push(p); side -= k * p; } });
      $("plOut").innerHTML = "Her tarafa: <b>" + (txt.join(" + ") || "—") + "</b>" + plateSvg(per) +
        (side > 0.01 ? '<p class="note">Seçili plakalarla tam ' + tg + " kg olmuyor; en yakın alt değer " + (Math.round((tg - side * 2) * 100) / 100) + " kg.</p>" : '<p class="note">Toplam: ' + tg + " kg (bar " + bar + " + 2 × " + Math.round((tg - bar) / 2 * 100) / 100 + ").</p>");
    } else if (act === "warm") {
      var ww = parseFloat($("wmW").value), wb = parseFloat($("wmB").value) || 20;
      if (!ww) { $("wmOut").textContent = "Çalışma ağırlığını gir."; return; }
      var steps = ww > wb * 1.6 ? [[wb, 10, "boş bar"], [0.4, 8], [0.6, 5], [0.75, 3], [0.9, 1]] : [[0.5, 8], [0.75, 3]];
      var lines = steps.map(function (st, i) {
        var kg = st[2] ? st[0] : Math.max(wb, Math.round(ww * st[0] / 2.5) * 2.5);
        return "<tr><td>" + (i + 1) + "</td><td><b>" + kg + " kg</b>" + (st[2] ? " (" + st[2] + ")" : "") + "</td><td>" + st[1] + " tekrar</td></tr>";
      }).join("");
      $("wmOut").innerHTML = '<table class="table"><tr><th>Set</th><th>Ağırlık</th><th>Tekrar</th></tr>' + lines + "<tr><td>→</td><td><b>" + ww + ' kg</b></td><td>çalışma setleri</td></tr></table><p class="note">Isınma setleri arasında yaklaşık 1 dakika dinlen, set sonunda yorulma.</p>';
    } else if (act === "cal") {
      var kw = parseFloat($("cW").value), kh = parseFloat($("cH").value), ka = parseFloat($("cA").value), sx = $("cS").value, ac = parseFloat($("cAct").value), g = $("cG").value;
      if (!kw || !kh || !ka) { $("cOut").textContent = "Kilo, boy ve yaşı gir."; return; }
      pf = { w: kw, h: kh, a: ka, s: sx, act: $("cAct").value, g: g }; save("gym-profile", pf);
      var bmr = 10 * kw + 6.25 * kh - 5 * ka + (sx === "m" ? 5 : -161), tdee = bmr * ac, tgt = Math.round((tdee + (g === "gain" ? 300 : g === "cut" ? -400 : 0)) / 10) * 10;
      var pr = Math.round(kw * 2), fat = Math.round(kw * 0.9), carb = Math.max(0, Math.round((tgt - pr * 4 - fat * 9) / 4));
      $("cOut").innerHTML = "Günlük harcama (tahmini): <b>" + Math.round(tdee / 10) * 10 + " kcal</b><br>Hedefin için al: <b>" + tgt + " kcal</b>" +
        '<table class="table"><tr><th>Protein</th><th>Karbonhidrat</th><th>Yağ</th></tr><tr><td><b>' + pr + " g</b></td><td><b>" + carb + " g</b></td><td><b>" + fat + " g</b></td></tr></table>" +
        '<p class="note">Öğünleri takip etmek için <a href="' + esc(nutrioUrl()) + '" target="_blank" rel="noopener">Nutrio</a>\'yu aç.</p>';
    } else if (act === "bwadd") {
      var kg = parseFloat($("bwW").value); if (!kg) { toast("Kilo gir"); return; }
      weights.push({ kg: Math.round(kg * 10) / 10, d: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) }); weights = weights.slice(-120); save("gym-weights", weights);
      $("bwOut").innerHTML = bwHtml(); $("bwW").value = ""; toast("Kaydedildi");
    } else if (act === "bwdel") { weights.pop(); save("gym-weights", weights); $("bwOut").innerHTML = bwHtml(); }
    else if (act === "export") {
      $("bk").value = JSON.stringify({ v: 2, plan: plan, favs: favs, log: log, weights: weights });
      $("bk").select(); toast("Yedek hazır, kopyalayabilirsin");
    } else if (act === "import") {
      try {
        var o = JSON.parse($("bk").value);
        if (!o || !o.plan || !Array.isArray(o.plan.days)) throw 0;
        plan = o.plan; favs = Array.isArray(o.favs) ? o.favs : []; log = Array.isArray(o.log) ? o.log : []; weights = Array.isArray(o.weights) ? o.weights : [];
        save("gym-plan", plan); save("gym-favs", favs); save("gym-log", log); save("gym-weights", weights);
        renderPlan(); renderList(); renderToday(); toast("Yedek yüklendi");
      } catch (err) { toast("Geçersiz yedek"); }
    }
  });

  /* ───────── nutrio ───────── */
  function nutrioUrl() { return CFG.nutrioUrl || "https://boranaakgunn.github.io/Nutrio/"; }
  function renderNutrio() {
    var u = nutrioUrl();
    $("nutrioBody").innerHTML = '<div class="nutrio-card"><p class="eyebrow">Ayrı uygulama</p><h3>Nutrio</h3>' +
      '<p class="note">Beslenme ve kalori takibi için Nutrio\'ya geç. Antrenman planın burada, öğünlerin orada.</p>' +
      '<a class="btn" href="' + esc(u) + '" target="_blank" rel="noopener">Nutrio\'yu aç ↗</a></div>';
  }


  /* ───────── tema, PWA ───────── */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#f1ece2" : "#151412";
    $("themeBtn").innerHTML = ic(t === "light" ? "sun" : "moon");
    window.AtlasModel.setTheme(t === "light");
  }
  applyTheme(load("gym-theme", "light"));
  $("themeBtn").addEventListener("click", function () {
    var t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    save("gym-theme", t); applyTheme(t);
  });
  var deferred;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; $("installBtn").hidden = false; });
  $("installBtn").addEventListener("click", function () { if (!deferred) return; deferred.prompt(); deferred = null; $("installBtn").hidden = true; });
  window.addEventListener("appinstalled", function () { $("installBtn").hidden = true; });
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  /* başlangıç */
  $("muscles").innerHTML = chipsHtml(M, "");
  $("equipment").innerHTML = chipsHtml(EQ, "");
  renderList(); renderToday();
  document.body.dataset.tab = "home";
  var h0 = location.hash.replace("#", "");
  if (h0 && TABS.indexOf(h0) > 0) goTab(h0); else window.AtlasModel.start();
})();
