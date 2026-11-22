/*
  Atlas: dönen insan modeli.
  Kütüphanesiz, canvas ile çizilen basit bir 3D model. Vücut elipsoitlerden oluşur;
  Y ekseninde döndürülünce her elipsoit yine bir elips olarak izdüşür (yarı genişlik = sqrt((rx·cosθ)² + (rz·sinθ)²)),
  bu yüzden derinliğe göre sıralayıp çizmek yeterlidir. Kas bölgeleri gövdenin üstünde duran küçük elipsoitlerdir.
*/
(function () {
  "use strict";
  var M = window.MUSCLES;
  var parts = [];
  function add(x, y, z, rx, ry, rz, m) { parts.push({ x: x, y: y, z: z, rx: rx, ry: ry, rz: rz, m: m || null }); }
  function sym(x, y, z, rx, ry, rz, m) { add(-x, y, z, rx, ry, rz, m); add(x, y, z, rx, ry, rz, m); }

  /* gövde (kas olmayan) */
  add(0, 160, 0, 20, 24, 22);          // baş
  add(0, 130, 0, 9, 12, 9);            // boyun
  add(0, 92, 0, 42, 38, 21);           // göğüs kafesi / omuz hattı
  add(0, 38, 0, 30, 42, 18);           // karın / bel
  add(0, -12, 0, 34, 24, 21);          // leğen
  sym(58, 82, 0, 11, 36, 11);          // üst kol
  sym(62, 22, 0, 9, 34, 9);            // ön kol
  sym(63, -18, 0, 7, 11, 6);           // el
  sym(20, -62, 0, 18, 50, 18);         // uyluk
  sym(21, -152, 0, 12, 42, 12);        // baldır
  sym(21, -198, 7, 10, 6, 16);         // ayak

  /* kas bölgeleri */
  sym(51, 112, 0, 14, 14, 14, "omuz");
  sym(17, 95, 14, 17, 14, 9, "gogus");
  add(0, 40, 12, 14, 28, 7, "karin");
  sym(56, 84, 8, 9, 24, 7, "biceps");
  sym(56, 84, -8, 9, 24, 7, "triceps");
  sym(62, 22, 0, 10.5, 30, 10.5, "onkol");
  sym(20, -62, 10, 14, 42, 9, "onbacak");
  add(0, 106, -14, 24, 24, 8, "trapez");
  sym(24, 78, -12, 15, 24, 7, "sirt");
  add(0, 22, -11.5, 15, 16, 7, "bel");
  sym(16, -10, -14, 17, 18, 9, "kalca");
  sym(20, -62, -10, 14, 42, 9, "arkabacak");
  sym(21, -148, -8, 10, 32, 8, "baldir");

  var canvas, ctx, label, onSelect;
  var W = 300, H = 400, dpr = 1, S = 1;
  var theta = 0.5, down = null, dragged = false, resumeAt = 0, hover = null, picked = null, running = false, raf = 0, last = 0;
  var proj = [];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var light = false;

  function hsl(h, s, l) { return "hsl(" + h + "," + s + "%," + l + "%)"; }
  function colors(p) {
    var active = p.m && (p.m === hover || p.m === picked);
    if (!p.m) return light ? [hsl(225, 22, 84), hsl(225, 22, 70)] : [hsl(228, 20, 30), hsl(228, 22, 17)];
    var h = M[p.m].hue;
    if (active) return [hsl(h, 95, 68), hsl(h, 85, 48)];
    return light ? [hsl(h, 55, 72), hsl(h, 45, 56)] : [hsl(h, 38, 44), hsl(h, 38, 28)];
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(200, r.width); H = Math.max(260, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    S = H / 460;
    draw();
  }

  function project() {
    var c = Math.cos(theta), s = Math.sin(theta);
    proj = parts.map(function (p) {
      var xr = p.x * c + p.z * s, zr = -p.x * s + p.z * c;
      return {
        p: p, z: zr,
        sx: W / 2 + xr * S, sy: H * 0.46 - (p.y + 13) * S,
        rw: Math.sqrt(p.rx * p.rx * c * c + p.rz * p.rz * s * s) * S, rh: p.ry * S
      };
    });
    proj.sort(function (a, b) { return a.z - b.z; });
  }

  function draw() {
    if (!ctx) return;
    project();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* zemin gölgesi */
    var gy = H * 0.46 + 219 * S;
    var sg = ctx.createRadialGradient(W / 2, gy, 2, W / 2, gy, W * 0.36);
    sg.addColorStop(0, light ? "rgba(60,70,120,.22)" : "rgba(124,92,255,.35)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.save(); ctx.translate(W / 2, gy); ctx.scale(1, 0.22); ctx.translate(-W / 2, -gy);
    ctx.beginPath(); ctx.arc(W / 2, gy, W * 0.36, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    for (var i = 0; i < proj.length; i++) {
      var q = proj[i], col = colors(q.p);
      var g = ctx.createRadialGradient(q.sx - q.rw * 0.35, q.sy - q.rh * 0.4, Math.min(q.rw, q.rh) * 0.1, q.sx, q.sy, Math.max(q.rw, q.rh) * 1.05);
      g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
      ctx.beginPath(); ctx.ellipse(q.sx, q.sy, q.rw, q.rh, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      var active = q.p.m && (q.p.m === hover || q.p.m === picked);
      if (active) { ctx.shadowColor = hsl(M[q.p.m].hue, 95, 60); ctx.shadowBlur = 16; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.strokeStyle = light ? "rgba(30,40,80,.28)" : "rgba(0,0,0,.45)";
      ctx.stroke();
    }
  }

  /* en öndeki parçayı bul; kas ise adını döndürür */
  function hit(px, py) {
    for (var i = proj.length - 1; i >= 0; i--) {
      var q = proj[i], dx = (px - q.sx) / q.rw, dy = (py - q.sy) / q.rh;
      if (dx * dx + dy * dy <= 1) return q.p.m;
    }
    return null;
  }
  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  function setLabel(m) {
    if (!label) return;
    label.textContent = m ? M[m].label + "  →" : "Döndürmek için sürükle · kasa dokun";
    label.classList.toggle("on", !!m);
    if (m) label.style.setProperty("--h", M[m].hue);
  }

  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    if (!down && !reduce && t > resumeAt) theta += dt * 0.5;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function bind() {
    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      var p = pos(e); down = { x: p.x, lx: p.x, y: p.y }; dragged = false;
    });
    canvas.addEventListener("pointermove", function (e) {
      var p = pos(e);
      if (down) {
        var dx = p.x - down.lx; down.lx = p.x;
        if (Math.abs(p.x - down.x) > 5) dragged = true;
        if (dragged) { theta += dx * 0.012; draw(); }
      } else {
        project();
        var m = hit(p.x, p.y);
        if (m !== hover) { hover = m; setLabel(m); canvas.style.cursor = m ? "pointer" : "grab"; if (!running) draw(); }
      }
    });
    canvas.addEventListener("pointerup", function (e) {
      var p = pos(e), wasDrag = dragged;
      down = null; resumeAt = performance.now() + 2500;
      if (wasDrag) return;
      project();
      var m = hit(p.x, p.y);
      if (m) {
        picked = m; hover = m; setLabel(m); draw();
        setTimeout(function () { picked = null; hover = null; setLabel(null); if (onSelect) onSelect(m); }, 260);
      }
    });
    canvas.addEventListener("pointerleave", function () { if (!down) { hover = null; setLabel(null); } });
    canvas.addEventListener("pointercancel", function () { down = null; });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas); else window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });
  }

  function start() {
    if (!canvas || running) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  window.AtlasModel = {
    init: function (c, l, cb) {
      canvas = c; label = l; onSelect = cb; ctx = c.getContext("2d");
      light = document.documentElement.getAttribute("data-theme") === "light";
      bind(); resize();
    },
    start: start, stop: stop,
    setTheme: function (isLight) { light = isLight; draw(); },
    /* test için: açıyı ayarla, bir noktanın hangi kasa denk geldiğini sor */
    _test: {
      setAngle: function (a) { theta = a; project(); draw(); },
      screen: function (m) { project(); for (var i = proj.length - 1; i >= 0; i--) if (proj[i].p.m === m) return { x: proj[i].sx, y: proj[i].sy, z: proj[i].z }; return null; },
      hit: function (x, y) { project(); return hit(x, y); },
      stopAuto: function () { reduce = true; }
    }
  };
})();
