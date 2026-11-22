/* Anatogym — şablonlar (2): göğüs, sırt, omuz */
(function () {
  "use strict";
  var I = window.Illu, K = I.K, T = I.T, M = I.MAP, G = I.G, C = I.C, dir = I.dir, add = I.add, H = I.H;
  var stand = H.stand, P = H.P, gear = H.gear, nf = H.nf;

  /* ---- Dumbbell fly (düz bank) ---- */
  T.dbfly = function () {
    var hip = [250, 203], tt = 270, sh = add(hip, dir(tt), 56);
    var scene = T.bench({}).a.scene;
    var base = { hip: hip, t: tt, foot: [282, 254], kh: [0, -1] };
    var fr = gear("db");
    return {
      a: { pose: P(base, { hand: [sh[0] + 2, sh[1] - 62], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [sh[0] + 6, sh[1] - 14], eh: [0, 1], us: 0.45, fs: 0.6 }), scene: scene, front: fr },
      labels: ["Kollar üstte", "Yana aç, göğüs gerilsin"]
    };
  };

  /* ---- Kablo fly (yüksek makara, ayakta) ---- */
  T.cablefly = function (o) {
    var low = !!o.low;
    var base = stand(200, { t: 172, hip: [196, 160], foot: [190, 254], foot2: [222, 254] });
    var pul = low ? [100, 238] : [100, 36];
    var scene = function () {
      return K.post(100, low ? 238 : 36, G) + K.box(92, low ? 232 : 30, 16, 10, C.metal, 3) + K.pulley(pul);
    };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0], j.wr[1] - 4], [j.wr[0], j.wr[1] + 4]); }
    var ha, hb;
    if (low) { ha = [178, 178]; hb = [246, 112]; } else { ha = [138, 98]; hb = [252, 124]; }
    return {
      a: { pose: P(base, { hand: ha, eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: hb, eh: [0, 1] }), scene: scene, front: fr },
      labels: low ? ["Kollar aşağıda yanlarda", "Yukarı doğru birleştir"] : ["Kollar geride, açık", "Önde birleştir"]
    };
  };

  /* ---- Pec deck / reverse pec deck / göğüs makinesi (oturarak) ---- */
  function seatedMachine(hip) {
    return function () {
      return K.padLine([hip[0] - 22, hip[1] - 92], [hip[0] - 22, hip[1] + 4], 12) +
        K.box(hip[0] - 34, hip[1] + 8, 76, 11, C.pad, 5.5) + K.leg([hip[0] - 10, hip[1] + 16], [hip[0] - 10, G]) + K.leg([hip[0] + 32, hip[1] + 16], [hip[0] + 32, G]);
    };
  }
  T.pecdeck = function (o) {
    var hip = [178, 205], rev = !!o.rev;
    var sc = seatedMachine(hip);
    var base = { hip: hip, t: rev ? 168 : 180, foot: [228, 254], kh: [1, 0] };
    function fr(j) {
      var s = ""; var w = j.wr;
      s += K.padLine([w[0] + 2, w[1] - 20], [w[0] + 2, w[1] + 20], 9);
      return s;
    }
    var sho = add(base.hip, dir(base.t), 56);
    var a, b;
    if (!rev) { a = { hand: [sho[0] - 14, sho[1] - 6], us: 0.6, fs: 0.7, eh: [0, 1] }; b = { hand: [sho[0] + 44, sho[1] - 16], eh: [0, 1] }; }
    else { a = { hand: [sho[0] + 62, sho[1] - 2], eh: [0, 1] }; b = { hand: [sho[0] - 2, sho[1] - 8], us: 0.55, fs: 0.7, eh: [0, 1] }; }
    return {
      a: { pose: P(base, a), scene: sc, front: fr }, b: { pose: P(base, b), scene: sc, front: fr },
      labels: rev ? ["Kollar önde", "Geriye ve yana aç"] : ["Dirsekler geride", "Önde birleştir"]
    };
  };
  T.chestmachine = function () {
    var hip = [178, 205], sc = seatedMachine(hip);
    var base = { hip: hip, t: 182, foot: [228, 254], kh: [1, 0] };
    var sho = add(hip, dir(182), 56);
    function fr(j) { return K.line([[132, j.wr[1] - 4], j.wr], 4, C.padD) + K.line([j.wr, [j.wr[0] + 8, j.wr[1]]], 7, C.dark); }
    return {
      a: { pose: P(base, { hand: [sho[0] + 16, sho[1] + 4], eh: [-1, 0.6] }), scene: sc, front: fr },
      b: { pose: P(base, { hand: [sho[0] + 62, sho[1] + 2], eh: [0, 1] }), scene: sc, front: fr },
      labels: ["Eller göğüs hizasında", "İleri it, kolları uzat"]
    };
  };

  /* ---- Paralel bar dips ---- */
  T.dips = function (o) {
    var lean = o.lean == null ? 155 : o.lean;
    var scene = function () {
      return K.line([[190, 144], [262, 144]], 6, C.metal) + K.post(194, 144, G) + K.post(258, 144, G);
    };
    return {
      a: { pose: { hip: [190, 134], t: lean, hand: [212, 142], eh: [-1, 0.3], foot: [176, 226], kh: [-1, 0] }, scene: scene },
      b: { pose: { hip: [189, 163], t: lean, hand: [212, 142], eh: [-1, 0.3], foot: [174, 236], kh: [-1, 0] }, scene: scene },
      labels: ["Kollar uzun, destekte", "Dirsekler 90°'ye in"]
    };
  };
  T.benchdips = function () {
    var scene = function () { return K.bench(80, 184, 215); };
    var base = { t: 178, foot: [270, 254], kh: [0, -1], hand: [166, 211], eh: [-1, 0.2] };
    return {
      a: { pose: P(base, { hip: [192, 204] }), scene: scene },
      b: { pose: P(base, { hip: [190, 232], foot: [268, 254] }), scene: scene },
      labels: ["Kollar uzun, kalça bankta değil", "Dirsekleri bük, aşağı in"]
    };
  };

  /* ---- Öne eğilmiş kürek çekişleri ---- */
  T.bentrow = function (o) {
    var kind = o.kind || "barbell", floor = !!o.floor, tbar = !!o.tbar;
    var base = floor ? { hip: [145, 190], t: 92, foot: [182, 254], kh: [1, 0] } : { hip: [150, 170], t: 115, foot: [182, 254], kh: [1, 0] };
    var fr = function (j) {
      var s = "";
      if (tbar) s += K.line([[70, 252], j.wr], 5, C.metal) + K.plate(add(j.wr, [1, 0], 6), 13);
      else s += K.plate(j.wr, 15);
      return s;
    };
    var a = floor ? { hand: [208, 245], eh: [0, 1] } : { hand: [204, 208], eh: [0, 1] };
    var b = floor ? { hand: [196, 207], eh: [-1, 0.6] } : { hand: [192, 180], eh: [-1, 0.3] };
    return {
      a: { pose: P(base, a), front: fr }, b: { pose: P(base, b), front: fr },
      labels: floor ? ["Bar yerde, sırt düz", "Barı karna çek, geri bırak"] : ["Kollar aşağıda, sırt düz", "Dirsekleri geriye çek"]
    };
  };
  T.dbrow = function () {
    var scene = function () { return K.bench(188, 292, 215); };
    var base = { hip: [166, 168], t: 105, foot: [150, 254], foot2: [138, 202], kh: [1, 0], kh2: [0.3, 1], hand2: [240, 206], eh2: [0, 1] };
    var fr = gear("db1");
    return {
      a: { pose: P(base, { hand: [224, 210], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [210, 174], eh: [-1, 0.3] }), scene: scene, front: fr },
      labels: ["Kol aşağıda", "Dirseği kalçaya doğru çek"]
    };
  };
  T.cablerow = function () {
    var pul = [322, 190];
    var scene = function () {
      return K.stack(326, 120, 142) + K.line([[326, 196], pul], 1.8, C.cable) + K.pulley(pul) +
        K.box(150, 232, 70, 11, C.pad, 5.5) + K.leg([170, 240], [170, G]) + K.leg([205, 240], [205, G]) +
        K.box(268, 232, 10, 30, C.padD, 3);
    };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0], j.wr[1] - 4], [j.wr[0], j.wr[1] + 4]); }
    var base = { hip: [180, 226], foot: [266, 238], kh: [0, -1] };
    return {
      a: { pose: P(base, { t: 166, hand: [250, 190], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { t: 190, hand: [212, 214], eh: [-1, 0.2] }), scene: scene, front: fr },
      labels: ["Kollar uzanmış", "Dirsekleri geri, kürekleri sık"]
    };
  };
  T.chestrow = function (o) {
    var curl = !!o.curl;
    var base = { hip: [136, 206], t: 135, foot: [132, 254], kh: [1, 0] };
    var scene = function () {
      var d = dir(135), n = nf(135);
      var a = [136 + n[0] * 20 - d[0] * 20, 206 + n[1] * 20 - d[1] * 20], b = [136 + n[0] * 20 + d[0] * 78, 206 + n[1] * 20 + d[1] * 78];
      return K.padLine(a, b, 13) + K.leg([a[0], a[1] + 6], [a[0], G]) + K.leg([b[0] - 4, b[1] + 6], [b[0] - 4, G]);
    };
    var fr = gear(curl ? "ez" : "db1");
    var A = { hand: [188, 232], eh: [0, 1] }, B = curl ? { hand: [208, 160], eh: [0, 1] } : { hand: [182, 192], eh: [-1, 0.3] };
    return {
      a: { pose: P(base, A), scene: scene, front: fr }, b: { pose: P(base, B), scene: scene, front: fr },
      labels: curl ? ["Kollar aşağı sarkık", "Dirsekler sabit, yukarı kıvır"] : ["Kollar aşağıda", "Dirsekleri yukarı-geri çek"]
    };
  };
  T.straightarm = function () {
    var pul = [284, 34];
    var scene = function () { return K.stack(300, 48, 200) + K.line([[313, 48], [313, 34], pul], 1.8, C.cable) + K.pulley(pul); };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0] - 4, j.wr[1]], [j.wr[0] + 4, j.wr[1]]); }
    var base = { hip: [192, 170], t: 160, foot: [196, 254], kh: [1, 0] };
    return {
      a: { pose: P(base, { hand: [254, 78], eh: [0, -0.5] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [226, 178], eh: [0, 1] }), scene: scene, front: fr },
      labels: ["Kollar öne-yukarı uzanmış", "Düz kollarla uyluğa indir"]
    };
  };
  T.invrow = function () {
    var scene = function () { return K.post(206, 168, G) + K.box(194, 166, 24, 6, C.steel, 3) + K.line([[150, G], [262, G]], 5, C.padD); };
    function fr(j) { return K.plate(j.wr, 5); }
    return {
      a: { pose: { hip: [247, 238], t: 264, foot: [340, 248], kh: [0, -1], hand: [208, 170], eh: [0, 1], ft: 40 }, scene: scene, front: fr },
      b: { pose: { hip: [255, 208], t: 245, foot: [340, 248], kh: [0, -1], hand: [210, 172], eh: [-1, 0.8], ft: 40 }, scene: scene, front: fr },
      labels: ["Kollar uzun, vücut düz", "Göğüs bara kadar çek"]
    };
  };

  /* ---- Omuz ---- */
  T.dbpress = function (o) {
    var arnold = !!o.arnold, base = stand(200);
    var A = arnold ? { hand: [224, 114], eh: [0, 1] } : { hand: [214, 106], eh: [0, 1] };
    return {
      a: { pose: P(base, A), front: gear("db") },
      b: { pose: P(base, { hand: [206, 42], eh: [0, 1] }), front: gear("db") },
      labels: arnold ? ["Avuçlar sana dönük", "Döndürerek yukarı it"] : ["Dumbbell omuz hizasında", "Kolları yukarı uzat"]
    };
  };
  T.mpress = function () {
    var hip = [180, 205], sc = seatedMachine(hip);
    var base = { hip: hip, t: 180, foot: [232, 254], kh: [1, 0] };
    function fr(j) { return K.line([[150, j.wr[1]], j.wr], 4, C.padD) + K.line([[j.wr[0] - 6, j.wr[1]], [j.wr[0] + 6, j.wr[1]]], 7, C.dark); }
    return {
      a: { pose: P(base, { hand: [196, 140], eh: [0, 1] }), scene: sc, front: fr },
      b: { pose: P(base, { hand: [192, 90], eh: [0, 1] }), scene: sc, front: fr },
      labels: ["Kollar omuz hizasında", "Yukarı it"]
    };
  };
  T.frontraise = function () {
    var base = stand(200);
    return {
      a: { pose: P(base, { hand: [208, 168], eh: [0, 1] }), front: gear("db1") },
      b: { pose: P(base, { hand: [264, 108], eh: [0, 1] }), front: gear("db1") },
      labels: ["Kollar önde aşağıda", "Omuz hizasına kaldır"]
    };
  };
  T.lateral = function (o) {
    var cable = !!o.cable;
    function front(j) {
      var s = "";
      if (cable) { s += K.rope([360, 250], j.wr[0]) ; }
      s += K.db(j.wr[0], 8) + K.db(j.wr[1], 8);
      return s;
    }
    var fr = function (j) {
      var s = "";
      if (cable) { s += K.rope([60, 252], j.wr[0]) + K.rope([340, 252], j.wr[1]); }
      return s + K.db(j.wr[0], 8) + K.db(j.wr[1], 8);
    };
    var scene = cable ? function () { return K.post(60, 244, G) + K.post(340, 244, G) + K.pulley([60, 252]) + K.pulley([340, 252]); } : "";
    return {
      a: { front_view: 1, pose: { L: [6, 6], R: [6, 6] }, scene: scene, front: fr },
      b: { front_view: 1, pose: { L: [84, 84], R: [84, 84] }, scene: scene, front: fr },
      labels: ["Kollar yanda", "Yanlara omuz hizasına"]
    };
  };
  T.rearfly = function () {
    var fr = function (j) { return K.db(j.wr[0], 8) + K.db(j.wr[1], 8); };
    return {
      a: { front_view: 1, pose: { bend: 1, L: [4, 2], R: [4, 2] }, front: fr },
      b: { front_view: 1, pose: { bend: 1, L: [78, 80], R: [78, 80] }, front: fr },
      labels: ["Öne eğik, kollar sarkık", "Yanlara aç, kürekleri sık"]
    };
  };
  T.facepull = function () {
    var pul = [304, 92];
    var scene = function () { return K.post(318, 92, G) + K.box(310, 86, 16, 12, C.metal, 3) + K.pulley(pul); };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0], j.wr[1] - 4], [j.wr[0], j.wr[1] + 4]); }
    var base = stand(190, { t: 184, foot2: [208, 254] });
    return {
      a: { pose: P(base, { hand: [250, 100], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [206, 90], eh: [0.2, -1] }), scene: scene, front: fr },
      labels: ["Kollar öne uzanmış", "Yüze çek, dirsekler yukarıda"]
    };
  };
  T.upright = function () {
    var base = stand(200);
    return {
      a: { pose: P(base, { hand: [208, 168], eh: [0, 1] }), front: gear("ez") },
      b: { pose: P(base, { hand: [218, 124], eh: [0.3, -1] }), front: gear("ez") },
      labels: ["Bar uyluk önünde", "Dirsekler yukarı, göğse çek"]
    };
  };
  T.shrug = function (o) {
    var db = o.kind === "db";
    var fr = function (j) {
      if (db) return K.db(j.wr[0], 8) + K.db(j.wr[1], 8);
      return K.line([[j.wr[0] - 48, j.wr[1]], [j.wr[1][0] + 48, j.wr[1][1]]], 4, C.metal) + K.plate([j.wr[0][0] - 48, j.wr[0][1]], 14);
    };
    var fr2 = function (j) {
      if (db) return K.db(j.wr[0], 8) + K.db(j.wr[1], 8);
      return K.line([[j.wr[0][0] - 44, j.wr[0][1]], [j.wr[1][0] + 44, j.wr[1][1]]], 4, C.metal) + K.plate([j.wr[0][0] - 44, j.wr[0][1]], 14) + K.plate([j.wr[1][0] + 44, j.wr[1][1]], 14);
    };
    return {
      a: { front_view: 1, pose: { L: [10, 4], R: [10, 4] }, front: fr2 },
      b: { front_view: 1, pose: { raise: 9, L: [10, 4], R: [10, 4] }, front: fr2 },
      labels: ["Omuzlar aşağıda", "Omuzları kulaklara kaldır"]
    };
  };
  T.farmer = function () {
    var base = { hip: [200, 163], t: 181, hand: [204, 168], eh: [0, 1], hand2: [200, 168], kh: [1, 0] };
    return {
      a: { pose: P(base, { foot: [224, 254], foot2: [176, 254] }), front: gear("db") },
      b: { pose: P(base, { foot: [176, 254], foot2: [224, 254] }), front: gear("db") },
      labels: ["Adım at, dik dur", "Karşı adım, dumbbell sabit"]
    };
  };

  /* ---- eşleme ---- */
  M["incline-bench-press"] = ["bench", { kind: "barbell", incline: 52 }];
  M["decline-bench-press"] = ["bench", { kind: "barbell", incline: -18 }];
  M["db-bench-press"] = ["bench", { kind: "db" }];
  M["incline-db-press"] = ["bench", { kind: "db", incline: 52 }];
  M["close-grip-bench"] = ["bench", { kind: "barbell" }];
  M["db-fly"] = ["dbfly", {}];
  M["cable-fly"] = ["cablefly", {}];
  M["low-cable-fly"] = ["cablefly", { low: 1 }];
  M["pec-deck"] = ["pecdeck", {}];
  M["reverse-pec-deck"] = ["pecdeck", { rev: 1 }];
  M["chest-press-machine"] = ["chestmachine", {}];
  M["chest-dips"] = ["dips", { lean: 150 }];
  M["dips"] = ["dips", { lean: 178 }];
  M["bench-dips"] = ["benchdips", {}];
  M["close-grip-pulldown"] = ["pulldown", {}];
  M["chin-up"] = ["pullup", {}];
  M["barbell-row"] = ["bentrow", {}];
  M["pendlay-row"] = ["bentrow", { floor: 1 }];
  M["t-bar-row"] = ["bentrow", { tbar: 1 }];
  M["db-row"] = ["dbrow", {}];
  M["seated-cable-row"] = ["cablerow", {}];
  M["chest-supported-row"] = ["chestrow", {}];
  M["spider-curl"] = ["chestrow", { curl: 1 }];
  M["straight-arm-pulldown"] = ["straightarm", {}];
  M["inverted-row"] = ["invrow", {}];
  M["db-shoulder-press"] = ["dbpress", {}];
  M["arnold-press"] = ["dbpress", { arnold: 1 }];
  M["machine-shoulder-press"] = ["mpress", {}];
  M["front-raise"] = ["frontraise", {}];
  M["lateral-raise"] = ["lateral", {}];
  M["cable-lateral-raise"] = ["lateral", { cable: 1 }];
  M["rear-delt-fly"] = ["rearfly", {}];
  M["face-pull"] = ["facepull", {}];
  M["upright-row"] = ["upright", {}];
  M["barbell-shrug"] = ["shrug", {}];
  M["db-shrug"] = ["shrug", { kind: "db" }];
  M["farmers-walk"] = ["farmer", {}];
})();
