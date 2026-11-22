/* Anatogym — gerçekçi 3D manken (WebGL).
   Gövde, tools offline üretildi (SDF → surface nets) ve data/mannequin.js içinde gömülü: pürüzsüz bir mesh.
   Her köşenin bir kas bölgesi var; dokunulunca CPU ışın testi ile bölge bulunur. */
(function () {
  "use strict";
  var legacy = window.AtlasModel;
  var MU = window.MUSCLES;
  var gl, canvas, label, onPick, prog, buf = {}, nIdx = 0, nEdg = 0;
  var pos, nor, col, hot, reg, idx, edg, nv, nt, regKeys;
  var yaw = 0.35, pitch = 0.06, tYaw = null, auto = true, idleT = 0, running = false, raf = 0, light = false;
  var hover = 0, pulse = 0, pulseReg = 0, dragging = false, moved = 0, lastX = 0, lastY = 0, downX = 0, downY = 0, W = 1, Hh = 1;
  var FOV = 26 * Math.PI / 180, CY = 0.9, reduce = false, usingLegacy = false, lastMove = 0;

  function b64(s, T) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); }
  function hsl(h, s, l) {
    h /= 360; var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    return [f(0), f(8), f(4)];
  }

  function prepare(ab) {
    var dv = new DataView(ab);
    nv = dv.getUint32(0, true); nt = dv.getUint32(4, true);
    var o = 8, q = new Int16Array(ab, o, nv * 3); o += nv * 6;
    var nq = new Int8Array(ab, o, nv * 3); o += nv * 3; o += (4 - ((nv * 3) % 4)) % 4;
    reg = new Uint8Array(ab, o, nv); o += nv; o += (4 - (nv % 4)) % 4;
    idx = new Uint16Array(ab, o, nt * 3); o += nt * 6; o += (4 - ((nt * 6) % 4)) % 4;
    var ne = new DataView(ab).getUint32(o, true); o += 4; edg = new Uint16Array(ab.slice(o, o + ne * 4));
    regKeys = ["", "gogus", "omuz", "biceps", "onkol", "karin", "onbacak", "sirt", "trapez", "triceps", "bel", "kalca", "arkabacak", "baldir"];
    pos = new Float32Array(nv * 3); nor = new Float32Array(nv * 3);
    for (var i = 0; i < nv * 3; i++) pos[i] = q[i] / 16000;
    for (i = 0; i < nv; i++) {
      var x = nq[i * 3], y = nq[i * 3 + 1], z = nq[i * 3 + 2], l = Math.sqrt(x * x + y * y + z * z) || 1;
      nor[i * 3] = x / l; nor[i * 3 + 1] = y / l; nor[i * 3 + 2] = z / l;
    }
    col = new Float32Array(nv * 3); hot = new Float32Array(nv);
    var clay = [0.90, 0.90, 0.92];
    for (i = 0; i < nv; i++) {
      var m = MU[regKeys[reg[i]]], c3 = clay;
      if (m) { var h = hsl(m.hue, 0.7, 0.62); c3 = [clay[0] * 0.88 + h[0] * 0.12, clay[1] * 0.88 + h[1] * 0.12, clay[2] * 0.88 + h[2] * 0.12]; }
      col[i * 3] = c3[0]; col[i * 3 + 1] = c3[1]; col[i * 3 + 2] = c3[2];
    }
  }

  var VS = "attribute vec3 aP,aN,aC;attribute float aH;uniform mat4 uM;uniform vec2 uS;uniform float uD;varying vec3 vN,vC,vV,vP,vO;varying float vH;" +
    "void main(){vec3 p=aP-vec3(0.,.9,0.);float cy=cos(uM[0][0]),sy=sin(uM[0][0]),cp=cos(uM[0][1]),sp=sin(uM[0][1]);" +
    "p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);vec3 n=vec3(cy*aN.x+sy*aN.z,aN.y,-sy*aN.x+cy*aN.z);" +
    "p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);n=vec3(n.x,cp*n.y-sp*n.z,sp*n.y+cp*n.z);" +
    "vec3 v=p+vec3(0.,0.,-uD);float t=tan(uM[0][2]*.5);float w=-v.z;gl_Position=vec4(v.x/(t*uS.x),v.y/t,1.1053*w-2.1053,w);" +
    "vN=n;vC=aC;vV=v;vH=aH;vP=aP;vO=aN;}";
  var FS = "#extension GL_OES_standard_derivatives : enable\nprecision mediump float;varying vec3 vN,vC,vV,vP,vO;varying float vH;uniform float uL,uT,uW;" +
    "float ln(float u,float k){float a=u*k;float d=abs(fract(a-.5)-.5);float w=max(fwidth(a),.0001);return 1.-smoothstep(0.,w*1.3,d);}" +
    "void main(){vec3 n=normalize(vN);vec3 V=normalize(-vV);" +
    "vec3 k=normalize(vec3(-.45,.6,.7)),f=normalize(vec3(.75,.1,.4)),r=normalize(vec3(.1,.5,-.9));" +
    "float dk=max(dot(n,k),0.),df=max(dot(n,f),0.),dr=max(dot(n,r),0.);" +
    "float hemi=.5+.5*n.y;float ao=smoothstep(-.9,.4,n.y)*.3+.7;" +
    "vec3 hc=vec3(1.,.33,.17);vec3 base=mix(vC,hc,vH*.7);if(uL>.5)base*=vec3(.93,.83,.70);" +
    "vec3 amb=uL>.5?mix(vec3(.50,.50,.54),vec3(.80,.80,.84),hemi):mix(vec3(.30,.31,.36),vec3(.62,.64,.72),hemi);" +
    "vec3 c=base*(amb*ao+vec3(1.,.96,.9)*dk*.8+vec3(.6,.66,.85)*df*.28);" +
    "float sp=pow(max(dot(n,normalize(k+V)),0.),38.)*.2;c+=sp;float fr=pow(1.-max(dot(n,V),0.),3.);c+=vec3(.7,.75,1.)*(fr*.18+dr*.1);" +
    "vec3 ao3=abs(normalize(vO));float u2=ao3.z>ao3.x?vP.x:vP.z;" +
    "float g=0.;vec3 lc=uL>.5?vec3(.28,.14,.08):vec3(.05,.06,.1);" +
    "c=mix(c,lc,g*(uL>.5?.5:.34)*(1.+vH*.5));c+=hc*vH*(.1+.08*uT);" +
    "if(uW>.5)c=c*(uL>.5?.52:.40);gl_FragColor=vec4(c,1.);}";

  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  function mkbuf(target, data, usage) { var b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, usage || gl.STATIC_DRAW); return b; }

  function setup(ab) {
    gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true }) || canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("no webgl");
    gl.getExtension("OES_standard_derivatives");
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    prepare(ab);
    buf.p = mkbuf(gl.ARRAY_BUFFER, pos); buf.n = mkbuf(gl.ARRAY_BUFFER, nor); buf.c = mkbuf(gl.ARRAY_BUFFER, col);
    buf.h = mkbuf(gl.ARRAY_BUFFER, hot, gl.DYNAMIC_DRAW); buf.i = mkbuf(gl.ELEMENT_ARRAY_BUFFER, idx);
    nIdx = idx.length; buf.e = mkbuf(gl.ELEMENT_ARRAY_BUFFER, edg); nEdg = edg.length;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 300, h = canvas.clientHeight || 400;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    W = canvas.width; Hh = canvas.height;
  }
  function dist() { return (1.0 * 1.12) / Math.tan(FOV / 2) * (Hh > 0 ? 1 : 1) + 0; }

  function setHot(r, v) {
    var i;
    for (i = 0; i < nv; i++) hot[i] = (r && reg[i] === r) ? v : 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.h); gl.bufferData(gl.ARRAY_BUFFER, hot, gl.DYNAMIC_DRAW);
  }

  function draw() {
    if (!gl) return;
    resize();
    gl.viewport(0, 0, W, Hh);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.useProgram(prog);
    function at(n, b, s) { var l = gl.getAttribLocation(prog, n); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 0, 0); }
    at("aP", buf.p, 3); at("aN", buf.n, 3); at("aC", buf.c, 3); at("aH", buf.h, 1);
    var asp = W / Hh;
    // dikey sığdırma: hem boy hem en
    var d = (1.0 / Math.tan(FOV / 2)) * 1.04;
    if (asp < 0.62) d *= 0.62 / asp * 0.92 + 0.08;
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "uM"), false, new Float32Array([yaw, pitch, FOV, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    gl.uniform2f(gl.getUniformLocation(prog, "uS"), asp, 1);
    gl.uniform1f(gl.getUniformLocation(prog, "uD"), d);
    gl.uniform1f(gl.getUniformLocation(prog, "uL"), light ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(prog, "uT"), Math.sin(performance.now() / 260));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.i);
    gl.uniform1f(gl.getUniformLocation(prog, "uW"), 0);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 1.5);
    gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.uniform1f(gl.getUniformLocation(prog, "uW"), 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.e);
    gl.drawElements(gl.LINES, nEdg, gl.UNSIGNED_SHORT, 0);
    draw._d = d;
  }

  /* ---- ışın testi ---- */
  function pick(cx, cy) {
    var r = canvas.getBoundingClientRect();
    var nx = ((cx - r.left) / r.width) * 2 - 1, ny = 1 - ((cy - r.top) / r.height) * 2;
    var asp = W / Hh, t = Math.tan(FOV / 2), d = draw._d || 3;
    var dv = [nx * t * asp, ny * t, -1], l = Math.hypot(dv[0], dv[1], dv[2]); dv = [dv[0] / l, dv[1] / l, dv[2] / l];
    // model uzayı: p_view = Rp*Ry*(p-c) + (0,0,-d)  ->  p = Ry^T Rp^T (p_view - (0,0,-d)) + c
    function inv(v) {
      var cp = Math.cos(pitch), sp = Math.sin(pitch), cy_ = Math.cos(yaw), sy = Math.sin(yaw);
      // Rp^T
      var x = v[0], y = cp * v[1] + sp * v[2], z = -sp * v[1] + cp * v[2];
      // Ry^T
      return [cy_ * x - sy * z, y, sy * x + cy_ * z];
    }
    var o = inv([0, 0, d]); o[1] += CY;
    var dm = inv(dv);
    var best = 1e9, bi = -1;
    for (var i = 0; i < nt; i++) {
      var a = idx[i * 3] * 3, b = idx[i * 3 + 1] * 3, c = idx[i * 3 + 2] * 3;
      var e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2];
      var e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
      var px = dm[1] * e2z - dm[2] * e2y, py = dm[2] * e2x - dm[0] * e2z, pz = dm[0] * e2y - dm[1] * e2x;
      var det = e1x * px + e1y * py + e1z * pz;
      if (det < 1e-9) continue; // yalnızca ön yüzler
      var id = 1 / det, tx = o[0] - pos[a], ty = o[1] - pos[a + 1], tz = o[2] - pos[a + 2];
      var u = (tx * px + ty * py + tz * pz) * id; if (u < 0 || u > 1) continue;
      var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
      var v = (dm[0] * qx + dm[1] * qy + dm[2] * qz) * id; if (v < 0 || u + v > 1) continue;
      var tt = (e2x * qx + e2y * qy + e2z * qz) * id;
      if (tt > 0 && tt < best) { best = tt; bi = i; }
    }
    if (bi < 0) return 0;
    // üçgenin köşelerinden en yaygın bölge
    var rs = [reg[idx[bi * 3]], reg[idx[bi * 3 + 1]], reg[idx[bi * 3 + 2]]];
    return rs[0] === rs[1] || rs[0] === rs[2] ? rs[0] : (rs[1] === rs[2] ? rs[1] : rs[0]);
  }

  function setLabel(r, extra) {
    if (!label) return;
    var m = r ? MU[regKeys[r]] : null;
    label.textContent = m ? m.label + (extra || "") : "Döndürmek için sürükle · kasa dokun";
    if (m) label.style.setProperty("--h", m.hue);
    label.classList.toggle("on", !!m);
  }
  function setHover(r) {
    if (r === hover) return;
    hover = r; setHot(r, 1); setLabel(r, " · hareketleri gör");
    canvas.style.cursor = r ? "pointer" : "grab";
  }

  function loop(t) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    var now = performance.now();
    if (tYaw != null) {
      var d = tYaw - yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      yaw += d * 0.14; if (Math.abs(d) < 0.003) { yaw = tYaw; tYaw = null; }
    } else if (auto && !dragging && !reduce && now - idleT > 2500) yaw += 0.006;
    draw();
  }

  function bind() {
    canvas.style.touchAction = "pan-y"; canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; lastX = downX = e.clientX; lastY = downY = e.clientY; idleT = performance.now(); tYaw = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) { }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (dragging) {
        var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 4) { yaw += dx * 0.012; pitch = Math.max(-0.35, Math.min(0.4, pitch + dy * 0.004)); idleT = performance.now(); }
      } else if (e.pointerType === "mouse" && performance.now() - lastMove > 50) { lastMove = performance.now(); setHover(pick(e.clientX, e.clientY)); }
    });
    function up(e) {
      if (!dragging) return; dragging = false; idleT = performance.now();
      if (moved < 6) {
        var r = pick(e.clientX, e.clientY);
        if (r) { setHover(r); var k = regKeys[r]; setTimeout(function () { if (onPick) onPick(k); }, 140); }
        else setHover(0);
      }
    }
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", function () { dragging = false; });
    canvas.addEventListener("pointerleave", function (e) { if (!dragging) setHover(0); });
    canvas.addEventListener("dblclick", function () { pitch = 0.06; tYaw = 0; });
  }

  var wantRun = false;
  function init(c, l, cb) {
    canvas = c; label = l; onPick = cb;
    reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function fallback(err) {
      if (window.console) console.warn("3D model fallback:", err && err.message);
      usingLegacy = true; legacy.init(c, l, cb); if (wantRun) legacy.start();
    }
    try {
      fetch("data/mannequin.bin").then(function (r) { if (!r.ok) throw new Error("bin " + r.status); return r.arrayBuffer(); })
        .then(function (ab) {
          setup(ab); bind(); canvas.classList.add("ready");
          window.addEventListener("resize", function () { if (running) draw(); });
          draw(); if (wantRun) start();
        }).catch(fallback);
    } catch (err) { fallback(err); }
  }
  function start() { wantRun = true; if (usingLegacy) return legacy.start(); if (running || !gl) return; running = true; idleT = performance.now(); raf = requestAnimationFrame(loop); }
  function stop() { wantRun = false; if (usingLegacy) return legacy.stop(); running = false; cancelAnimationFrame(raf); }

  window.AtlasModel = {
    init: init, start: start, stop: stop,
    setTheme: function (isLight) { light = isLight; if (usingLegacy) legacy.setTheme(isLight); else if (gl) draw(); },
    view: function (side) { if (usingLegacy) return; tYaw = side === "back" ? Math.PI : 0; idleT = performance.now(); },
    _test: {
      setYaw: function (a) { yaw = a; tYaw = null; auto = false; draw(); },
      pickAt: function (x, y) { var r = pick(x, y); return regKeys ? regKeys[r] : null; },
      legacy: function () { return usingLegacy; }
    }
  };
})();
