/* Anatogym — şablonlar (4): bacak ve kalça */
(function () {
  "use strict";
  var I = window.Illu, K = I.K, T = I.T, M = I.MAP, G = I.G, C = I.C, dir = I.dir, add = I.add, H = I.H;
  var stand = H.stand, P = H.P, gear = H.gear, nf = H.nf;

  T.hipthrust = function (o) {
    var bridge = !!o.bridge;
    var scene = bridge ? "" : function () { return K.bench(70, 150, 214); };
    function pl(j) { return bridge ? "" : K.plate(add(j.hip, nf(j.t), 14), 14); }
    var a, b;
    if (bridge) {
      a = { hip: [212, 247], t: 270, foot: [262, 254], kh: [0, -1], hand: [190, 252], eh: [0, 1] };
      b = { hip: [198, 216], t: 300, foot: [262, 254], kh: [0, -1], hand: [190, 252], eh: [0, 1] };
    } else {
      a = { hip: [180, 236], t: 238, foot: [240, 254], kh: [0.3, -1] };
      b = { hip: [192, 202], t: 270, foot: [240, 254], kh: [0.3, -1] };
      [a, b].forEach(function (p) { var n = nf(p.t); p.hand = add(p.hip, n, 14); p.eh = [0, 1]; });
    }
    return { a: { pose: a, scene: scene, front: pl }, b: { pose: b, scene: scene, front: pl }, labels: ["Kalça yere yakın", "Kalçayı yukarı it, gluteus'u sık"] };
  };
  T.kickback = T.kickback;
  T.cablekick = function () {
    var pul = [268, 244];
    var scene = function () { return K.post(268, 244, G) + K.box(260, 238, 16, 10, C.metal, 3) + K.pulley(pul) + K.line([[262, 140], [262, 150]], 8, C.padD) + K.post(262, 140, G); };
    function fr(j) { return K.rope(pul, j.an); }
    var base = { hip: [186, 166], t: 156, foot2: [200, 254], kh2: [1, 0], hand: [258, 138], hand2: [258, 140], eh: [0, 1] };
    return {
      a: { pose: P(base, { foot: [216, 238], kh: [1, 0] }), scene: scene, front: fr },
      b: { pose: P(base, { foot: [112, 214], kh: [1, 0] }), scene: scene, front: fr },
      labels: ["Diz bükük, öne", "Bacağı geriye ve yukarı it"]
    };
  };
  T.abduct = function () {
    var seatScene = function () { return K.box(158, 214, 84, 11, C.pad, 5.5) + K.post(200, 224, G) + K.padLine([150, 140], [150, 214], 12); };
    var fr = function (j) { return ""; };
    function pads(sp) { return function (j) { return K.padLine([200 - 30 - sp, 200], [200 - 30 - sp, 232], 9) + K.padLine([200 + 30 + sp, 200], [200 + 30 + sp, 232], 9); }; }
    return {
      a: { front_view: 1, pose: { dy: 36, seated: 1, spread: 0, L: [3, 3], R: [3, 3] }, scene: seatScene, front: pads(0) },
      b: { front_view: 1, pose: { dy: 36, seated: 1, spread: 22, L: [3, 3], R: [3, 3] }, scene: seatScene, front: pads(22) },
      labels: ["Dizler bitişik", "Bacakları yanlara aç"]
    };
  };
  T.sumo = function () {
    function pl(j) { return K.plate(j.wr, 17); }
    return {
      a: { pose: { hip: [168, 232], t: 150, foot: [214, 254], kh: [1, 0], hand: [206, 245], eh: [0, 1] }, front: pl },
      b: { pose: stand(206, { t: 184, hand: [214, 222], eh: [0, 1] }), front: pl },
      labels: ["Geniş duruş, bar yerde", "Kalçayı öne it, dik dur"]
    };
  };
  T.frontsquat = function () {
    var rack = function () { return K.post(120, 110, G) + K.box(112, 108, 22, 6, C.steel, 3); };
    function bar(j) { return K.plate(add(add(j.sho, dir(j.t), 4), nf(j.t), 14), 14); }
    var hr = [6, 14];
    return {
      a: { pose: stand(200, { hr: hr, eh: [0.5, -1] }), scene: rack, front: bar },
      b: { pose: { hip: [172, 208], t: 160, foot: [200, 254], kh: [1, 0], hr: hr, eh: [0.5, -1] }, scene: rack, front: bar },
      labels: ["Bar ön omuzlarda", "Gövde dik, derine in"]
    };
  };
  T.hack = function () {
    var scene = function () { return K.line([[203, 262], [150, 116]], 9, C.padD) + K.line([[190, 262], [170, 262]], 6, C.padD); };
    var d = dir(200);
    function pad(j) { return ""; }
    var hA = [192, 166], hB = [hA[0] + 0.34 * 52, hA[1] + 0.94 * 52];
    return {
      a: { pose: { hip: hA, t: 200, foot: [216, 254], kh: [1, 0], hr: [20, 14], eh: [0, 1] }, scene: scene },
      b: { pose: { hip: hB, t: 200, foot: [216, 254], kh: [1, 0], hr: [20, 14], eh: [0, 1] }, scene: scene },
      labels: ["Sırt pedde, bacaklar uzun", "Diz 90°'ye kadar in"]
    };
  };
  T.legpress = function (o) {
    var calf = !!o.calf;
    var scene = function () {
      return K.line([[110, 238], [250, 100]], 8, C.padD) + K.line([[84, 214], [130, 262]], 5, C.padD) +
        K.padLine([114, 228], [70, 184], 13) + K.padLine([114, 228], [150, 240], 11);
    };
    function plat(j) {
      var c = add(j.an, [1, -1], 12);
      return K.padLine([c[0] - 22, c[1] - 22], [c[0] + 22, c[1] + 22], 10);
    }
    var base = { hip: [130, 214], t: 225, kh: [0, -1], hand: [128, 196], eh: [0, 1], ft: 225 };
    var a = P(base, { foot: calf ? [205, 160] : [186, 196] }), b = P(base, { foot: [205, 160] });
    if (calf) { a.ft = 255; b.ft = 205; }
    return { a: { pose: a, scene: scene, front: plat }, b: { pose: b, scene: scene, front: plat }, labels: calf ? ["Topuk geride, baldır gergin", "Parmak ucuyla it"] : ["Dizler bükük", "Platformu it, dizleri kilitleme"] };
  };
  T.goblet = function () {
    function db(j) { return K.db(add(add(j.sho, dir(j.t), -8), nf(j.t), 16), 9); }
    var hr = [-8, 15];
    return {
      a: { pose: stand(200, { hr: hr, eh: [0, 1] }), front: db },
      b: { pose: { hip: [170, 214], t: 164, foot: [200, 254], kh: [1, 0], hr: hr, eh: [0, 1] }, front: db },
      labels: ["Ayakta, dumbbell göğüste", "Gövde dik, derine çömel"]
    };
  };
  T.bulgarian = function () {
    var scene = function () { return K.bench(62, 128, 204); };
    var base = { foot: [218, 254], foot2: [112, 202], kh: [1, 0], kh2: [0, 1], ft2: 270, t: 182, hand: [204, 164], hand2: [200, 164], eh: [0, 1] };
    var fr = gear("db");
    function mk(y) { var p = P(base, { hip: [190, y] }); var sho = [190 - 2, y - 56]; p.hand = [sho[0] + 6, sho[1] + 62]; p.hand2 = [sho[0] + 2, sho[1] + 62]; return p; }
    return { a: { pose: mk(164), scene: scene, front: fr }, b: { pose: mk(206), scene: scene, front: fr }, labels: ["Arka ayak bankta, ayakta", "Ön diz 90°'ye in"] };
  };
  T.lunge = function () {
    var fr = gear("db");
    function mk(hip, f, f2, o) {
      var sho = [hip[0] - 2, hip[1] - 56];
      return P({ hip: hip, t: 182, foot: f, foot2: f2, kh: [1, 0], kh2: [0, 1], hand: [sho[0] + 6, sho[1] + 62], hand2: [sho[0] + 2, sho[1] + 62], eh: [0, 1] }, o || {});
    }
    return {
      a: { pose: mk([200, 160], [205, 254], [195, 254], {}), front: fr },
      b: { pose: mk([186, 202], [244, 254], [122, 250], { ft2: 150 }), front: fr },
      labels: ["Ayakta, ayaklar yan yana", "Büyük adım, iki diz 90°"]
    };
  };
  T.legext = function () {
    var hip = [150, 208];
    var scene = function () { return K.padLine([138, 146], [138, 214], 12) + K.box(126, 216, 62, 11, C.pad, 5.5) + K.leg([144, 224], [144, G]) + K.leg([180, 224], [180, G]); };
    function roller(j) { return K.circ(add(j.an, [0, 1], -2), 8, C.padD) + K.line([[170, 232], j.an], 4, C.padD); }
    var base = { hip: hip, t: 182, hand: [172, 198], eh: [0, 1] };
    return {
      a: { pose: P(base, { foot: [200, 252], kh: [0, -1] }), scene: scene, front: roller },
      b: { pose: P(base, { foot: [240, 208], kh: [0, -1] }), scene: scene, front: roller },
      labels: ["Dizler 90°", "Bacağı tam uzat, quadriceps'i sık"]
    };
  };
  T.stepup = function () {
    var scene = function () { return K.box(212, 222, 70, 40, C.pad, 6) + K.box(212, 222, 70, 7, C.padD, 3); };
    var fr = gear("db");
    function mk(hip, f, f2) { var sho = [hip[0] - 2, hip[1] - 56]; return { hip: hip, t: 182, foot: f, foot2: f2, kh: [1, 0], kh2: [1, -0.2], hand: [sho[0] + 6, sho[1] + 62], hand2: [sho[0] + 2, sho[1] + 62], eh: [0, 1] }; }
    return {
      a: { pose: mk([216, 174], [244, 220], [196, 254]), scene: scene, front: fr },
      b: { pose: mk([240, 130], [244, 220], [226, 190]), scene: scene, front: fr },
      labels: ["Ayak kutuda", "Kutuya çık, diz yukarı"]
    };
  };
  T.rdl = function () {
    function pl(j) { return K.plate(j.wr, 15); }
    return {
      a: { pose: stand(200, { t: 182, hand: [208, 169], eh: [0, 1] }), front: pl },
      b: { pose: { hip: [156, 172], t: 108, foot: [200, 254], kh: [1, 0], hand: [212, 214], eh: [0, 1] }, front: pl },
      labels: ["Ayakta, bar kalçada", "Kalçayı geri it, bar bacağa yakın in"]
    };
  };
  T.legcurl = function (o) {
    var seated = !!o.seated;
    if (!seated) {
      var scene = function () { return K.padLine([116, 230], [268, 230], 13) + K.leg([128, 236], [128, G]) + K.leg([256, 236], [256, G]); };
      function ro(j) { return K.circ(j.an, 8, C.padD); }
      var base = { hip: [186, 206], t: 90, hand: [236, 214], eh: [0, 1], kh: [-0.2, 1] };
      return {
        a: { pose: P(base, { foot: [98, 208] }), scene: scene, front: ro },
        b: { pose: P(base, { foot: [150, 150] }), scene: scene, front: ro },
        labels: ["Bacaklar düz", "Topukları kalçaya çek"]
      };
    }
    var hip = [160, 208];
    var scene2 = function () { return K.padLine([148, 146], [148, 214], 12) + K.box(136, 216, 64, 11, C.pad, 5.5) + K.leg([150, 224], [150, G]) + K.leg([190, 224], [190, G]) + K.padLine([188, 192], [228, 192], 9); };
    function ro2(j) { return K.circ(add(j.an, [0, 1], -2), 8, C.padD); }
    var b2 = { hip: hip, t: 182, hand: [182, 196], eh: [0, 1] };
    return {
      a: { pose: P(b2, { foot: [250, 222], kh: [0, -1] }), scene: scene2, front: ro2 },
      b: { pose: P(b2, { foot: [186, 252], kh: [1, 0] }), scene: scene2, front: ro2 },
      labels: ["Bacaklar uzanmış", "Topukları aşağı-geri çek"]
    };
  };
  T.nordic = function () {
    var scene = function () { return K.box(120, 252, 70, 10, C.pad, 5) + K.padLine([84, 236], [84, 258], 9); };
    function kn(ang) {
      var r = ang * Math.PI / 180, knee = [150, 250];
      var hip = [knee[0] + 48 * Math.sin(r), knee[1] - 48 * Math.cos(r)];
      return { hip: hip, t: 180 - ang, foot: [96, 252], kh: [1, 1], ft: 270 };
    }
    var a = kn(0), b = kn(68);
    a.hand = [206, 160]; a.eh = [0, 1]; b.hand = [276, 248]; b.eh = [0, 1];
    return { a: { pose: a, scene: scene }, b: { pose: b, scene: scene }, labels: ["Dizüstü, gövde dik", "Vücudu düz tutup öne kontrollü düş"] };
  };
  T.slrdl = function () {
    var fr = gear("db1");
    return {
      a: { pose: { hip: [200, 160], t: 182, foot: [200, 254], foot2: [180, 232], kh: [1, 0], kh2: [-1, 0], hand: [206, 224], eh: [0, 1] }, front: fr },
      b: { pose: { hip: [170, 172], t: 95, foot: [196, 254], foot2: [78, 172], kh: [1, 0], hand: [230, 226], eh: [0, 1] }, front: fr },
      labels: ["Tek bacak üstünde", "Kalçadan eğil, diğer bacak geriye"]
    };
  };
  T.calf = function (o) {
    var seated = !!o.seated;
    if (!seated) {
      var scene = function (j) { return K.box(204, 246, 66, 16, C.pad, 4) + K.padLine([j.sho[0] - 12, j.sho[1] - 6], [j.sho[0] + 14, j.sho[1] - 6], 12) + K.line([[j.sho[0] - 24, j.sho[1] - 6], [j.sho[0] - 24, G]], 7, C.padD); };
      return {
        a: { pose: { hip: [198, 158], t: 181, foot: [198, 252], kh: [1, 0], ft: 105, hand: [208, 108], eh: [0, -1] }, scene: scene },
        b: { pose: { hip: [198, 142], t: 181, foot: [198, 236], kh: [1, 0], ft: 40, hand: [208, 92], eh: [0, -1] }, scene: scene }, labels: ["Topuklar aşağıda", "Parmak ucuna yüksel"]
      };
    }
    var scene2 = function () { return K.box(208, 246, 66, 16, C.pad, 4) + K.padLine([186, 192], [244, 192], 11) + K.line([[150, 150], [150, 214]], 12, C.pad) + K.box(134, 216, 64, 11, C.pad, 5.5); };
    return {
      a: { pose: { hip: [166, 206], t: 182, foot: [214, 252], kh: [0, -1], ft: 105, hand: [190, 200], eh: [0, 1] }, scene: scene2 },
      b: { pose: { hip: [166, 206], t: 182, foot: [214, 238], kh: [0, -1], ft: 40, hand: [190, 200], eh: [0, 1] }, scene: scene2 },
      labels: ["Topuklar aşağıda", "Parmak ucuna yüksel"]
    };
  };

  M["hip-thrust"] = ["hipthrust", {}];
  M["glute-bridge"] = ["hipthrust", { bridge: 1 }];
  M["cable-kickback"] = ["cablekick", {}];
  M["hip-abduction"] = ["abduct", {}];
  M["sumo-deadlift"] = ["sumo", {}];
  M["front-squat"] = ["frontsquat", {}];
  M["hack-squat"] = ["hack", {}];
  M["leg-press"] = ["legpress", {}];
  M["leg-press-calf"] = ["legpress", { calf: 1 }];
  M["goblet-squat"] = ["goblet", {}];
  M["bulgarian-split-squat"] = ["bulgarian", {}];
  M["lunge"] = ["lunge", {}];
  M["leg-extension"] = ["legext", {}];
  M["step-up"] = ["stepup", {}];
  M["rdl"] = ["rdl", {}];
  M["lying-leg-curl"] = ["legcurl", {}];
  M["seated-leg-curl"] = ["legcurl", { seated: 1 }];
  M["nordic-curl"] = ["nordic", {}];
  M["single-leg-rdl"] = ["slrdl", {}];
  M["standing-calf-raise"] = ["calf", {}];
  M["seated-calf-raise"] = ["calf", { seated: 1 }];
})();
