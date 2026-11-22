/* Anatogym — şablonlar (3): kol ve karın */
(function () {
  "use strict";
  var I = window.Illu, K = I.K, T = I.T, M = I.MAP, G = I.G, C = I.C, dir = I.dir, add = I.add, H = I.H;
  var stand = H.stand, P = H.P, gear = H.gear, nf = H.nf;

  /* ---- biceps varyantları ---- */
  T.cablecurl = function () {
    var pul = [112, 244];
    var scene = function () { return K.post(112, 244, G) + K.box(104, 238, 16, 10, C.metal, 3) + K.pulley(pul); };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0], j.wr[1] - 4], [j.wr[0], j.wr[1] + 4]); }
    var base = stand(200);
    return {
      a: { pose: P(base, { hand: [206, 166], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [229, 112], eh: [0, 1] }), scene: scene, front: fr },
      labels: ["Kollar aşağıda", "Dirsek sabit, yukarı kıvır"]
    };
  };
  T.inclinecurl = function () {
    var hip = [222, 205], tt = 214;
    var scene = function () {
      var d = dir(tt), n = nf(tt);
      var a = [hip[0] - n[0] * 18 - d[0] * 8, hip[1] - n[1] * 18 - d[1] * 8], b = [hip[0] - n[0] * 18 + d[0] * 76, hip[1] - n[1] * 18 + d[1] * 76];
      return K.padLine(a, b, 13) + K.box(188, 214, 72, 11, C.pad, 5.5) + K.leg([205, 222], [205, G]) + K.leg([246, 222], [246, G]) + K.leg(b, [b[0] + 16, G]);
    };
    var base = { hip: hip, t: tt, foot: [268, 254], kh: [1, 0] };
    var sho = add(hip, dir(tt), 56);
    return {
      a: { pose: P(base, { hand: [sho[0] + 4, sho[1] + 62], eh: [0, 1] }), scene: scene, front: gear("db") },
      b: { pose: P(base, { hand: [sho[0] + 32, sho[1] + 8], eh: [0, 1] }), scene: scene, front: gear("db") },
      labels: ["Kollar geride sarkık", "Dirsek sabit, yukarı kıvır"]
    };
  };
  T.preacher = function () {
    var hip = [176, 208];
    var scene = function () {
      return K.padLine([194, 150], [240, 208], 11) + K.line([[216, 190], [216, G]], 6, C.padD) + K.box(130, 216, 62, 11, C.pad, 5.5) + K.leg([148, 224], [148, G]) + K.leg([180, 224], [180, G]);
    };
    var base = { hip: hip, t: 180, foot: [226, 254], kh: [1, 0] };
    return {
      a: { pose: P(base, { hand: [236, 206], eh: [1, 0.3] }), scene: scene, front: gear("ez") },
      b: { pose: P(base, { hand: [206, 142], eh: [1, 1] }), scene: scene, front: gear("ez") },
      labels: ["Kollar pedde tam uzun", "Yukarı kıvır, dirsek pedde"]
    };
  };
  T.concentration = function () {
    var scene = function () { return K.bench(108, 206, 214); };
    var base = { hip: [160, 205], t: 138, foot: [226, 254], foot2: [236, 254], kh: [1, 0], hand2: [206, 160], eh2: [0, 1] };
    var sho = add(base.hip, dir(138), 56);
    return {
      a: { pose: P(base, { hand: [sho[0] + 8, sho[1] + 64], eh: [0, 1] }), scene: scene, front: gear("db1") },
      b: { pose: P(base, { hand: [sho[0] + 26, sho[1] + 12], eh: [0.3, 1] }), scene: scene, front: gear("db1") },
      labels: ["Dirsek uyluğa dayalı, kol uzun", "Omuza doğru kıvır"]
    };
  };

  /* ---- triceps ---- */
  T.pushdown = function () {
    var pul = [222, 40];
    var scene = function () { return K.stack(310, 52, 196) + K.line([[323, 52], [323, 40], pul], 1.8, C.cable) + K.pulley(pul); };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0] - 5, j.wr[1]], [j.wr[0] + 5, j.wr[1]]); }
    var base = stand(190, { t: 184, foot2: [208, 254] });
    return {
      a: { pose: P(base, { hand: [222, 114], eh: [-0.6, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [208, 164], eh: [-0.3, 1] }), scene: scene, front: fr },
      labels: ["Dirsekler yanda, 90°", "Kolları aşağı tam uzat"]
    };
  };
  T.ohtri = function () {
    var pul = [96, 238];
    var scene = function () { return K.post(96, 238, G) + K.box(88, 232, 16, 10, C.metal, 3) + K.pulley(pul); };
    function fr(j) { return K.rope(pul, j.wr) + K.handle([j.wr[0] - 4, j.wr[1]], [j.wr[0] + 4, j.wr[1]]); }
    var base = stand(200, { t: 176, foot: [206, 254], foot2: [182, 254] });
    return {
      a: { pose: P(base, { hand: [188, 96], eh: [0.3, -1] }), scene: scene, front: fr },
      b: { pose: P(base, { hand: [204, 44], eh: [0, 1] }), scene: scene, front: fr },
      labels: ["Dirsekler yukarıda, kollar bükük", "Kolları yukarı uzat"]
    };
  };
  T.skull = function () {
    var hip = [250, 203], tt = 270, sh = add(hip, dir(tt), 56);
    var scene = T.bench({}).a.scene;
    var base = { hip: hip, t: tt, foot: [282, 254], kh: [0, -1] };
    return {
      a: { pose: P(base, { hand: [sh[0] + 2, sh[1] - 62], eh: [0, 1] }), scene: scene, front: gear("ez") },
      b: { pose: P(base, { hand: [sh[0] - 22, sh[1] - 32], eh: [0.8, -1] }), scene: scene, front: gear("ez") },
      labels: ["Kollar yukarıda", "Dirsekler sabit, alna indir"]
    };
  };
  T.kickback = function () {
    var base = { hip: [152, 172], t: 108, foot: [186, 254], foot2: [140, 248], kh: [1, 0], kh2: [1, 0.2], hand2: [222, 214], eh2: [0, 1] };
    var sho = add(base.hip, dir(108), 56);
    return {
      a: { pose: P(base, { hand: [sho[0] - 30, sho[1] + 34], eh: [-1, 0.4] }), front: gear("db1") },
      b: { pose: P(base, { hand: [sho[0] - 62, sho[1] + 12], eh: [-1, 0.6] }), front: gear("db1") },
      labels: ["Dirsek geride, ön kol aşağıda", "Dirseği sabit tutup kolu uzat"]
    };
  };
  T.wrist = function (o) {
    var rev = !!o.rev;
    var scene = function () { return K.bench(110, 204, 214); };
    var base = { hip: [162, 205], t: 142, foot: [220, 254], foot2: [232, 254], kh: [1, 0], hand2: [212, 168], eh2: [0, 1] };
    function mk(dy) {
      return function (j) {
        var w = j.wr, d = [w[0] + 9, w[1] + dy];
        return K.line([w, d], 9, C.skin) + K.db(add(d, [1, 0], 4), 7);
      };
    }
    var hand = [240, 186];
    return {
      a: { pose: P(base, { hand: hand, eh: [0, 1] }), scene: scene, front: mk(rev ? -15 : 15) },
      b: { pose: P(base, { hand: hand, eh: [0, 1] }), scene: scene, front: mk(rev ? 15 : -15) },
      labels: rev ? ["Bilek aşağı", "Bileği yukarı kaldır (dıştan tutuş)"] : ["Bilek aşağı, parmaklar açık", "Bileği yukarı kıvır"]
    };
  };
  T.deadhang = function () {
    var scene = function () { return K.line([[110, 40], [300, 40]], 5, C.metal) + K.post(112, 40, G) + K.post(298, 40, G); };
    return {
      a: { pose: { hip: [203, 163], t: 181, hand: [214, 40], eh: [-0.4, 1], foot: [196, 232], kh: [-1, 0.2] }, scene: scene },
      b: { pose: { hip: [203, 158], t: 181, hand: [214, 40], eh: [-0.4, 1], foot: [196, 228], kh: [-1, 0.2] }, scene: scene },
      labels: ["Rahat askıda", "Omuzlar aşağı çekili, aktif"]
    };
  };

  /* ---- karın / core ---- */
  function plankPose(ang, ankleY, o) {
    var a = ang * Math.PI / 180, ax = 96;
    var p = { hip: [ax + 94 * Math.cos(a), ankleY - 94 * Math.sin(a)], t: 90 + ang, foot: [ax, ankleY], kh: [0, -1], ft: 150 };
    for (var k in o) p[k] = o[k];
    return p;
  }
  T.plank = function () {
    return {
      a: { pose: plankPose(24, 247, { hand: [241, 257], eh: [-1, 0.4] }) },
      b: { pose: plankPose(9, 247, { hand: [276, 256], eh: [0, 1], us: 0.9 }) },
      labels: ["Düz kol pozisyonu", "Dirsekler omuz altında, vücut düz"]
    };
  };
  T.sideplank = function () {
    return {
      a: { pose: plankPose(7, 246, { hand: [276, 256], eh: [0, 1], hand2: [206, 214], eh2: [-1, 1] }) },
      b: { pose: plankPose(10, 246, { hand: [276, 256], eh: [0, 1], hand2: [244, 66], eh2: [0, -1] }) },
      labels: ["Kalça yerde, üst el belde", "Kalçayı kaldır, üst kol tavana"]
    };
  };
  T.mountain = function () {
    var b = plankPose(24, 247, { hand: [241, 257], eh: [-1, 0.4] });
    var a = {}, c = {}, k;
    for (k in b) { a[k] = b[k]; c[k] = b[k]; }
    a.foot2 = [96, 247]; c.foot2 = [188, 240]; c.kh2 = [0, -1]; c.ft2 = 150; a.ft2 = 150;
    a.foot = [176, 238]; a.kh = [0, -1]; a.ft = 150; c.foot = [96, 247]; c.kh = [0, -1];
    return { a: { pose: a }, b: { pose: c }, labels: ["Sağ diz göğse", "Bacak değiştir, hızlı tempo"] };
  };
  T.crunch = function (o) {
    var bike = !!o.bike;
    var base = { hip: [244, 246], foot: [286, 254], kh: [0, -1] };
    var a = P(base, { t: 270, hr: [18, -6], eh: [0, -1] });
    var b = P(base, { t: 242, hd: 8, hr: [17, -7], eh: [0, -1] });
    if (bike) {
      a.foot = [262, 220]; a.kh = [0, -1]; a.foot2 = [318, 244];
      b.t = 244; b.foot = [318, 244]; b.foot2 = [262, 220]; b.kh2 = [0, -1];
    }
    return { a: { pose: a }, b: { pose: b }, labels: bike ? ["Sağ diz göğse, sol bacak uzun", "Dirsek-karşı diz, değiştir"] : ["Sırt üstü, diz bükük", "Omuzları yerden kaldır, karnı sık"] };
  };
  T.cablecrunch = function () {
    var pul = [214, 40];
    var scene = function () { return K.line([[214, 40], [330, 40]], 1.8, C.cable) + K.pulley(pul) + K.stack(330, 44, 200); };
    function fr(j) { return K.rope(pul, j.wr); }
    var base = { hip: [172, 206], foot: [118, 252], kh: [1, 0.7], ft: 270 };
    return {
      a: { pose: P(base, { t: 186, hand: [196, 96], eh: [0, 1] }), scene: scene, front: fr },
      b: { pose: P(base, { t: 138, hd: -6, hand: [226, 178], eh: [0, 1] }), scene: scene, front: fr },
      labels: ["Diz üstü, halat başın yanında", "Belden kıvrıl, karnı sık"]
    };
  };
  T.hangleg = function () {
    var scene = function () { return K.line([[110, 40], [300, 40]], 5, C.metal) + K.post(112, 40, G) + K.post(298, 40, G); };
    return {
      a: { pose: { hip: [203, 160], t: 182, hand: [214, 40], eh: [-0.4, 1], foot: [206, 250], kh: [1, 0] }, scene: scene },
      b: { pose: { hip: [203, 160], t: 188, hand: [214, 40], eh: [-0.4, 1], foot: [296, 166], kh: [0, 1], ft: 130 }, scene: scene },
      labels: ["Bacaklar aşağıda", "Bacakları yatay hizaya kaldır"]
    };
  };
  T.abwheel = function () {
    function fr(j) { var c = [j.wr[0] + 4, 248]; return K.line([j.wr, c], 5, C.dark) + K.circ(c, 14, C.dark) + K.circ(c, 7, C.dark2) + K.circ(c, 2, C.steel); }
    return {
      a: { pose: { hip: [150, 204], t: 136, foot: [100, 252], kh: [1, 0.7], ft: 270, hand: [200, 228], eh: [0, 1] }, front: fr },
      b: { pose: { hip: [112, 208], t: 98, foot: [66, 252], kh: [1, 0.7], ft: 270, hand: [232, 236], eh: [0, 0.5] }, front: fr },
      labels: ["Dizüstü, tekerlek omuz altında", "Vücudu düz tutarak ileri uzan"]
    };
  };
  T.twist = function () {
    var base = { hip: [196, 246], t: 214, foot: [262, 212], kh: [0, -1] };
    var sho = add(base.hip, dir(214), 56);
    function fr(j) { return K.db(add(j.wr, [1, 0], 2), 9); }
    return {
      a: { pose: P(base, { hand: [sho[0] + 38, sho[1] + 36], eh: [0, 1] }), front: fr },
      b: { pose: P(base, { hand: [sho[0] + 12, sho[1] + 14], us: 0.55, fs: 0.6, eh: [0, 1] }), front: fr },
      labels: ["Gövde geride, ağırlık bir yanda", "Gövdeyi döndür, diğer yana"]
    };
  };
  T.deadbug = function () {
    var base = { hip: [240, 246], t: 270, foot: [284, 202], foot2: [284, 202], kh: [0, -1], hand: [186, 188], hand2: [188, 190], eh: [0, 1] };
    return {
      a: { pose: base },
      b: { pose: P(base, { hand2: [124, 246], foot2: [334, 246], kh2: [0, -1] }) },
      labels: ["Kollar yukarı, dizler 90°", "Karşı kol ve bacağı uzat"]
    };
  };
  T.hyper = function () {
    var scene = function () {
      return K.padLine([168, 158], [212, 202], 12) + K.line([[196, 196], [196, G]], 6, C.padD) + K.line([[136, 224], [140, G]], 6, C.padD) + K.circ([128, 232], 9, C.padD);
    };
    var base = { hip: [194, 172], foot: [126, 238], kh: [1, 0], ft: 200 };
    var a = P(base, { t: 56, hr: [38, 12], eh: [0, 1] });
    var b = P(base, { t: 134, hr: [38, 12], eh: [0, 1] });
    return { a: { pose: a, scene: scene }, b: { pose: b, scene: scene }, labels: ["Gövde aşağı sarkık", "Vücut düz çizgiye gelene kadar kalk"] };
  };
  T.goodmorning = function () {
    var base = stand(200);
    function bar(j) { return K.plate(add(add(j.sho, dir(j.t), 3), nf(j.t), -9), 14); }
    return {
      a: { pose: P(base, { hr: [3, -9], eh: [-1, 0.6] }), front: bar },
      b: { pose: { hip: [160, 172], t: 100, foot: [202, 254], kh: [1, 0], hr: [3, -9], eh: [-1, 0.6] }, front: bar },
      labels: ["Ayakta, bar omuzlarda", "Kalçayı geri it, sırt düz"]
    };
  };
  T.birddog = function () {
    var base = { hip: [150, 200], t: 95, foot: [102, 252], kh: [1, 0.7], ft: 270, hand: [208, 257], eh: [0, 1] };
    return {
      a: { pose: P(base, { hand2: [212, 257], foot2: [108, 252], kh2: [1, 0.7], ft2: 270 }) },
      b: { pose: P(base, { hand2: [270, 196], foot2: [58, 198], kh2: [0, 1], ft2: 270 }) },
      labels: ["Eller-dizler üzerinde", "Karşı kol ve bacağı uzat"]
    };
  };

  M["ez-bar-curl"] = ["curl", { kind: "ez" }];
  M["db-curl"] = ["curl", { kind: "db" }];
  M["hammer-curl"] = ["curl", { kind: "db" }];
  M["reverse-curl"] = ["curl", { kind: "ez" }];
  M["cable-curl"] = ["cablecurl", {}];
  M["incline-curl"] = ["inclinecurl", {}];
  M["preacher-curl"] = ["preacher", {}];
  M["concentration-curl"] = ["concentration", {}];
  M["triceps-pushdown"] = ["pushdown", {}];
  M["single-arm-pushdown"] = ["pushdown", {}];
  M["overhead-triceps"] = ["ohtri", {}];
  M["skullcrusher"] = ["skull", {}];
  M["db-kickback"] = ["kickback", {}];
  M["diamond-push-up"] = ["pushup", {}];
  M["wrist-curl"] = ["wrist", {}];
  M["reverse-wrist-curl"] = ["wrist", { rev: 1 }];
  M["dead-hang"] = ["deadhang", {}];
  M["plank"] = ["plank", {}];
  M["side-plank"] = ["sideplank", {}];
  M["mountain-climber"] = ["mountain", {}];
  M["crunch"] = ["crunch", {}];
  M["bicycle-crunch"] = ["crunch", { bike: 1 }];
  M["cable-crunch"] = ["cablecrunch", {}];
  M["hanging-leg-raise"] = ["hangleg", {}];
  M["ab-wheel"] = ["abwheel", {}];
  M["russian-twist"] = ["twist", {}];
  M["dead-bug"] = ["deadbug", {}];
  M["back-extension"] = ["hyper", {}];
  M["good-morning"] = ["goodmorning", {}];
  M["bird-dog"] = ["birddog", {}];
})();
