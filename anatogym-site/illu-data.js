/* Anatogym — hareket şablonları ve hareket → şablon eşlemesi */
(function () {
  "use strict";
  var I = window.Illu, K = I.K, T = I.T, M = I.MAP, G = I.G, dir = I.dir, add = I.add;
  function nf(t) { var d = dir(t); return [-d[1], d[0]]; }

  /* ---- ayakta duran temel poz ---- */
  function stand(x, o) {
    o = o || {};
    var p = { hip: [x, 160], t: 180, foot: [x, 254], kh: [1, 0] };
    for (var k in o) p[k] = o[k];
    return p;
  }
  function P(base, o) { var p = {}, k; for (k in base) p[k] = base[k]; for (k in o) p[k] = o[k]; return p; }

  /* ---- ağırlık seçici: bar plakası / dumbbell ---- */
  function gear(kind) {
    return function (j) {
      var s = "";
      if (kind === "barbell") s = K.plate(j.wr, 15);
      else if (kind === "ez") s = K.plate(j.wr, 12);
      else if (kind === "db") s = K.db(j.wr2, 7) + K.db(j.wr, 8);
      else if (kind === "db1") s = K.db(j.wr, 8);
      else if (kind === "plate-s") s = K.plate(j.wr, 11);
      return s;
    };
  }

  I.H = { stand: stand, P: P, gear: gear, nf: nf };

  /* ===== BİCEPS KIVIRMA (ayakta) ===== */
  T.curl = function (o) {
    var kind = o.kind || "barbell";
    var base = stand(200);
    return {
      a: { pose: P(base, { hand: [206, 166], eh: [0, 1] }), front: gear(kind) },
      b: { pose: P(base, { hand: [229, 112], eh: [0, 1] }), front: gear(kind) },
      labels: ["Kollar aşağıda", "Dirsek sabit, yukarı kıvır"]
    };
  };

  /* ===== YATAY / EĞİMLİ BENCH PRES ===== */
  T.bench = function (o) {
    var kind = o.kind || "barbell", inc = o.incline || 0; // inc: 0 düz, + eğimli, - decline
    var tt = 270 - inc;
    var hip = [250, 203];
    var shoulder = add(hip, dir(tt), 56);
    var scene = function () {
      var dd = dir(tt), n = nf(tt);
      var A = [hip[0] - dd[0] * 38 - n[0] * 19, hip[1] - dd[1] * 38 - n[1] * 19];
      var B = [hip[0] + dd[0] * 80 - n[0] * 19, hip[1] + dd[1] * 80 - n[1] * 19];
      var s = K.post(150, 130, G) + K.box(141, 128, 18, 6, I.C.steel, 3);
      s += K.padLine(A, B, 13) + K.leg([A[0], A[1] + 6], [A[0], G]) + K.leg([B[0], B[1] + 6], [B[0], G]);
      return s;
    };
    var up = [shoulder[0] + 2, shoulder[1] - 62];
    var downp = add(add(shoulder, nf(tt), 26), dir(tt), -10);
    var base = { hip: hip, t: tt, foot: [282, 254], kh: [0, -1], hd: 0 };
    function fr(j) { return gear(kind)(j); }
    return {
      a: { pose: P(base, { hand: up, eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: downp, eh: [0, 1], us: 0.5 }), scene: scene, front: fr },
      labels: ["Kolları uzat", "Göğse indir"]
    };
  };
  function C_METAL() { return I.C.steel; }

  /* ===== OMUZ PRES (ayakta, barbell/dumbbell) ===== */
  T.ohp = function (o) {
    var kind = o.kind || "barbell", base = stand(200);
    return {
      a: { pose: P(base, { hand: [212, 100], eh: [0, 1] }), front: gear(kind) },
      b: { pose: P(base, { hand: [204, 40], eh: [0, 1] }), front: gear(kind) },
      labels: ["Omuz hizası", "Kolları yukarı uzat"]
    };
  };

  /* ===== SQUAT ===== */
  T.squat = function (o) {
    var kind = o.kind || "barbell";
    var rack = function () { return K.post(120, 110, G) + K.box(112, 108, 22, 6, I.C.steel, 3); };
    var back = [3, -9];
    function bar(j) { return K.plate(add(add(j.sho, dir(j.t), 3), nf(j.t), -9), 15); }
    return {
      a: { pose: stand(200, { hr: back, eh: [-1, 0.6] }), scene: rack, front: bar },
      b: { pose: { hip: [166, 208], t: 146, foot: [200, 254], kh: [1, 0], hr: back, eh: [-1, 0.6] }, scene: rack, front: bar },
      labels: ["Ayakta", "Kalçayı geri, paralele in"]
    };
  };

  /* ===== DEADLIFT ===== */
  T.deadlift = function () {
    function pl(j) { return K.plate(j.wr, 17); }
    return {
      a: { pose: { hip: [142, 198], t: 121, foot: [205, 254], kh: [1, 0], hand: [208, 245], eh: [0, 1], us: 1.15, fs: 1.2 }, front: pl },
      b: { pose: stand(205, { t: 184, hand: [214, 222], eh: [0, 1] }), front: pl },
      labels: ["Bar yerde, sırt düz", "Kalçayı öne it, dik dur"]
    };
  };

  /* ===== PULL-UP ===== */
  T.pullup = function () {
    var scene = function () {
      return K.line([[110, 40], [300, 40]], 5, I.C.metal) + K.post(112, 40, G) + K.post(298, 40, G);
    };
    return {
      a: { pose: { hip: [203, 161], t: 181, hand: [214, 40], eh: [-0.4, 1], foot: [192, 218], kh: [-1, 0.2] }, scene: scene },
      b: { pose: { hip: [206, 108], t: 181, hand: [222, 42], eh: [-0.5, 1], foot: [192, 164], kh: [-1, 0.2] }, scene: scene },
      labels: ["Kollar uzun, askıda", "Çene bar üstüne"]
    };
  };

  /* ===== PUSH-UP ===== */
  T.pushup = function () {
    function body(angDeg, ankleY) {
      var a = angDeg * Math.PI / 180, ax = 96;
      var hip = [ax + 94 * Math.cos(a), ankleY - 94 * Math.sin(a)];
      return { hip: hip, t: 90 + angDeg, foot: [ax, ankleY], kh: [0, -1], ft: 150 };
    }
    var a = body(24, 247), b = body(9, 247);
    a.hand = [241, 257]; a.eh = [-1, 0.4];
    b.hand = [252, 257]; b.eh = [-1, 0.4];
    return { a: { pose: a }, b: { pose: b }, labels: ["Kollar uzun", "Göğüs yere yakın"] };
  };

  /* ===== LAT PULLDOWN ===== */
  T.pulldown = function () {
    var scene = function (j) {
      var s = K.stack(330, 38, 206) + K.line([[343, 38], [343, 30], [205, 30]], 1.8, I.C.cable) + K.pulley([205, 30]);
      s += K.box(165, 214, 62, 11, I.C.pad, 5.5) + K.leg([180, 222], [180, G]);
      s += K.padLine([228, 186], [262, 186], 12);
      return s;
    };
    function fr(j) {
      var l = K.line([[205, 30], j.wr], 1.8, I.C.cable);
      return l + K.line([[j.wr[0], j.wr[1]], [j.wr[0] - 1, j.wr[1] - 0]], 5, I.C.dark) + K.bar([j.wr[0], j.wr[1] - 3], [j.wr[0], j.wr[1] + 3], 3);
    }
    var base = { hip: [190, 205], t: 187, foot: [244, 254], kh: [1, 0] };
    return {
      a: { pose: P(base, { hand: [208, 88], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [214, 130], eh: [-1, 0.9] }), scene: scene, front: fr },
      labels: ["Kollar yukarıda", "Barı üst göğse çek"]
    };
  };

  /* ---- eşleme ---- */
  M["barbell-curl"] = ["curl", { kind: "barbell" }];
  M["bench-press"] = ["bench", { kind: "barbell" }];
  M["overhead-press"] = ["ohp", { kind: "barbell" }];
  M["squat"] = ["squat", {}];
  M["deadlift"] = ["deadlift", {}];
  M["pull-up"] = ["pullup", {}];
  M["push-up"] = ["pushup", {}];
  M["lat-pulldown"] = ["pulldown", {}];
})();
