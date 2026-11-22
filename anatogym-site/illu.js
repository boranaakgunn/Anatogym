/* Anatogym — hareket çizim motoru
   Her hareket iki ana andan oluşur (A: başlangıç, B: bitiş). Figür iskelet (IK) ile çizilir.
   Pose alanları (hepsi 400x300'lük panel koordinatında):
     hip:[x,y]  t:gövde açısı (0=aşağı, 90=sağ, 180=yukarı, 270=sol)  hd: baş eğimi
     hand:[x,y] hand2:[x,y]  eh:[dx,dy] dirsek yönü ipucu
     foot:[x,y] foot2:[x,y]  kh:[dx,dy] diz yönü ipucu   ft/ft2: ayak açısı (90=düz)
*/
(function () {
  "use strict";
  var G = 262;
  var C = {
    skin: "#f4b890", skinD: "#dd9a72", shirt: "#3b82f6", shirtD: "#2f6bd6",
    short: "#f97316", shortD: "#e0640b", shoe: "#2563eb", sole: "#eef2ff",
    hair: "#3b2a22", dark: "#2a2f3a", dark2: "#454d5e", steel: "#a6aebd",
    pad: "#64748b", padD: "#475569", metal: "#cbd5e1", cable: "#475569"
  };
  var L = { torso: 56, neck: 7, head: 12.5, ua: 34, fa: 31, th: 48, sh: 46, foot: 20 };

  function rad(a) { return a * Math.PI / 180; }
  function dir(a) { return [Math.sin(rad(a)), Math.cos(rad(a))]; }
  function add(p, d, l) { return [p[0] + d[0] * l, p[1] + d[1] * l]; }
  function f1(n) { return Math.round(n * 10) / 10; }
  function P(p) { return f1(p[0]) + "," + f1(p[1]); }

  /* iki parçalı IK: origin → target, ipucu yönüne doğru bükülür */
  function ik(o, t, l1, l2, hint) {
    var dx = t[0] - o[0], dy = t[1] - o[1];
    var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
    var maxd = l1 + l2 - 0.4, mind = Math.abs(l1 - l2) + 0.5;
    var dd = Math.min(Math.max(d, mind), maxd);
    var base = Math.atan2(dx, dy); // dir() ile aynı kural
    var ca = (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd);
    ca = Math.max(-1, Math.min(1, ca));
    var al = Math.acos(ca);
    var c1 = [o[0] + Math.sin(base + al) * l1, o[1] + Math.cos(base + al) * l1];
    var c2 = [o[0] + Math.sin(base - al) * l1, o[1] + Math.cos(base - al) * l1];
    var h = hint || [0, 1];
    var e = ((c1[0] - o[0]) * h[0] + (c1[1] - o[1]) * h[1]) >= ((c2[0] - o[0]) * h[0] + (c2[1] - o[1]) * h[1]) ? c1 : c2;
    var u = [dx / d, dy / d];
    var end = d > maxd || d < mind ? [o[0] + u[0] * dd, o[1] + u[1] * dd] : t;
    return { mid: e, end: end };
  }

  /* pozdan eklem noktalarını çıkar */
  function solve(p) {
    var hip = p.hip, t = p.t == null ? 180 : p.t;
    var sho = add(hip, dir(t), L.torso);
    var hd = p.hd || 0;
    var hc = add(sho, dir(t + hd), L.neck + L.head);
    var j = { hip: hip, sho: sho, head: hc, t: t, hd: hd };
    function arm(target, hint) { return ik(sho, target, L.ua * (p.us || 1), L.fa * (p.fs || 1), hint); }
    var dd = dir(t), nn = [-dd[1], dd[0]];
    function rel(r) { return add(add(sho, dd, r[0]), nn, r[1]); }
    var h1 = p.hr ? rel(p.hr) : (p.hand || add(sho, [0, 1], 60));
    var h2 = p.hr2 ? rel(p.hr2) : (p.hand2 || [h1[0] - 2, h1[1] + 1]);
    var a1 = arm(h1, p.eh), a2 = arm(h2, p.eh2 || p.eh);
    j.el = a1.mid; j.wr = a1.end; j.el2 = a2.mid; j.wr2 = a2.end;
    var f1p = p.foot || [hip[0], hip[1] + 94];
    var f2p = p.foot2 || f1p;
    var l1 = ik(hip, f1p, L.th, L.sh, p.kh || [1, 0]);
    var l2 = ik(hip, f2p, L.th, L.sh, p.kh2 || p.kh || [1, 0]);
    j.kn = l1.mid; j.an = l1.end; j.kn2 = l2.mid; j.an2 = l2.end;
    j.ft = p.ft == null ? 90 : p.ft; j.ft2 = p.ft2 == null ? j.ft : p.ft2;
    return j;
  }

  function line(pts, w, col, extra) {
    return '<polyline points="' + pts.map(P).join(" ") + '" fill="none" stroke="' + col +
      '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + '/>';
  }
  function circ(c, r, col, extra) {
    return '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + r + '" fill="' + col + '"' + (extra || "") + '/>';
  }
  function lerp(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }


  /* ---------- vücut parçaları (konik, kaslı, gölgeli) ---------- */
  var LIGHT = [-0.55, -0.83];
  function limbPts(a, b, wa, wb, bulge, bt, off) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l, ny = dx / l, N = 10, L = [], R = [], i;
    for (i = 0; i <= N; i++) {
      var t = i / N, w = wa + (wb - wa) * t + (bulge || 0) * Math.pow(Math.sin(Math.PI * Math.pow(t, Math.log(0.5) / Math.log(bt || 0.5))), 1.3);
      var cx = a[0] + dx * t + (off ? off[0] : 0), cy = a[1] + dy * t + (off ? off[1] : 0);
      L.push([cx + nx * w / 2, cy + ny * w / 2]); R.push([cx - nx * w / 2, cy - ny * w / 2]);
    }
    return L.concat(R.reverse());
  }
  function poly(pts, col, extra) { return '<polygon points="' + pts.map(P).join(" ") + '" fill="' + col + '"' + (extra || "") + '/>'; }
  function limb(a, b, wa, wb, bulge, bt, col, shade) {
    var s = poly(limbPts(a, b, wa, wb, bulge, bt), shade);
    s += circ(a, wa / 2, shade) + circ(b, wb / 2, shade);
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    var sg = (nx * LIGHT[0] + ny * LIGHT[1]) >= 0 ? 1 : -1;
    var o = [nx * sg * 0.17 * Math.max(wa, wb), ny * sg * 0.17 * Math.max(wa, wb)];
    s += poly(limbPts(a, b, wa * 0.72, wb * 0.72, (bulge || 0) * 0.72, bt, o), col);
    s += circ([a[0] + o[0], a[1] + o[1]], wa * 0.36, col) + circ([b[0] + o[0], b[1] + o[1]], wb * 0.36, col);
    return s;
  }
  function leg(hip, kn, an, ft, far) {
    var skin = far ? C.skinD : C.skin, skinS = far ? "#c98660" : C.skinD;
    var sh = far ? C.shortD : C.short, shS = far ? "#c5570a" : C.shortD;
    var s = "";
    s += limb(kn, an, 21, 13, 6, 0.3, skin, skinS);
    s += limb(hip, kn, 31, 20, 4, 0.45, skin, skinS);
    var mid = lerp(hip, kn, 0.64);
    s += limb(hip, mid, 34, 28, 0, 0.5, sh, shS);
    // ayakkabı
    var fd = dir(ft), nrm = [-fd[1], fd[0]];
    var heel = add(an, fd, -8), toe = add(an, fd, L.foot - 4), up = add(an, [-fd[1] * -1, fd[0] * -1], 0);
    var shoe = far ? "#1d4fc0" : C.shoe, shoeS = far ? "#173f9a" : "#1d4ed8";
    s += limb(add(heel, nrm, -1), add(toe, nrm, -1), 13, 10, 0, 0.5, shoe, shoeS);
    s += limb(add(heel, nrm, 5.5), add(toe, nrm, 5.5), 4, 4, 0, 0.5, C.sole, "#c7d2fe");
    s += circ(add(an, nrm, -3), 2, "#dbe4ff");
    return s;
  }
  function arm(sho, el, wr, far) {
    var skin = far ? C.skinD : C.skin, skinS = far ? "#c98660" : C.skinD;
    var s = limb(el, wr, 15.5, 10, 3.2, 0.3, skin, skinS) + limb(sho, el, 19.5, 15, 4.8, 0.5, skin, skinS);
    var d = [wr[0] - el[0], wr[1] - el[1]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1]) || 1;
    s += limb(wr, [wr[0] + d[0] / l * 8, wr[1] + d[1] / l * 8], 10.5, 9.5, 0, 0.5, skin, skinS);
    return s;
  }
  function torsoPoly(j, from, to, col, shade) {
    var d = dir(j.t), nf = [-d[1], d[0]];
    var prof = [[0, 15, 17], [0.28, 14.5, 17.5], [0.62, 18.5, 23], [0.9, 18, 20], [1, 12, 13]];
    function at(u) {
      for (var i = 1; i < prof.length; i++) {
        if (u <= prof[i][0]) {
          var a = prof[i - 1], b = prof[i], k = (u - a[0]) / (b[0] - a[0]);
          return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
        }
      }
      return [prof[4][1], prof[4][2]];
    }
    function build(sc, off) {
      var front = [], back = [], n = 8;
      for (var i = 0; i <= n; i++) {
        var u = from + (to - from) * i / n, w = at(u), c = add(j.hip, d, L.torso * u);
        front.push(add(c, nf, w[1] * sc + off));
        back.push(add(c, nf, -w[0] * sc + off));
      }
      return front.concat(back.reverse());
    }
    var s = poly(build(1, 0), shade, ' stroke="' + shade + '" stroke-width="4" stroke-linejoin="round"');
    var sg = (nf[0] * LIGHT[0] + nf[1] * LIGHT[1]) >= 0 ? 1 : -1;
    s += poly(build(0.8, sg * 2.2), col, ' stroke="' + col + '" stroke-width="3" stroke-linejoin="round"');
    return s;
  }
  function headSvg(j) {
    var d = dir(j.t + j.hd), nf = [-d[1], d[0]], c = j.head, r = L.head;
    var s = limb(add(j.sho, d, -2), add(j.sho, d, L.neck + 6), 12, 11, 0, 0.5, C.skin, C.skinD);
    s += circ(c, r, C.skinD) + circ(add(c, LIGHT, -0.0), r - 1.2, C.skin);
    s += circ(add(add(c, d, -3.5), nf, r * 0.2), r * 0.7, C.skin); // çene / yanak
    // saç
    var pts = [], k;
    for (k = 0; k <= 14; k++) {
      var ph = rad(66 - (66 + 160) * k / 14);
      var v = [Math.cos(ph) * r * 1.1, Math.sin(ph) * r * 1.1];
      pts.push([c[0] + d[0] * v[0] + nf[0] * v[1], c[1] + d[1] * v[0] + nf[1] * v[1]]);
    }
    s += poly(pts, C.hair);
    s += poly([add(add(c, d, r * 0.95), nf, r * 0.35), add(add(c, d, r * 0.7), nf, r * 0.9), add(add(c, d, r * 0.5), nf, r * 0.75)], "#5a4033", ' opacity=".7"');
    s += circ(add(add(c, d, -1.5), nf, -3), 3, C.skinD);                       // kulak
    s += circ(add(add(c, d, 1.5), nf, r * 0.58), 1.7, C.dark);                 // göz
    s += line([add(add(c, d, 4), nf, r * 0.35), add(add(c, d, 4), nf, r * 0.85)], 1.6, C.hair); // kaş
    s += circ(add(add(c, d, -1), nf, r + 0.8), 2.6, C.skin);                   // burun
    s += line([add(add(c, d, -6), nf, r * 0.55), add(add(c, d, -6), nf, r * 0.9)], 1.3, C.skinD); // ağız
    return s;
  }

  function figure(p, o) {
    var j = solve(p), s = "";
    s += leg(j.hip, j.kn2, j.an2, j.ft2, true);
    s += arm(j.sho, j.el2, j.wr2, true);
    s += torsoPoly(j, 0.18, 1, C.shirt, C.shirtD);
    s += torsoPoly(j, 0, 0.3, C.short, C.shortD);
    s += leg(j.hip, j.kn, j.an, j.ft, false);
    s += headSvg(j);
    return { svg: s, j: j };
  }

  /* ---------- ÖNDEN GÖRÜNÜŞ ---------- */
  function fdir(side, a) { var r = rad(a); return [side * Math.sin(r), Math.cos(r)]; }
  function figureFront(p) {
    var cx = 200, dy = p.dy || 0, hipY = 160 + dy, raise = p.raise || 0, bend = p.bend || 0;
    var shoY = (bend ? 122 : 104) + dy - raise, spread = p.spread || 0, seated = !!p.seated;
    var j = { sho: [], el: [], wr: [], hip: [cx, hipY], head: [cx, bend ? shoY + 16 : shoY - 21] };
    var s = "", side, i;
    j.an = [];
    for (i = 0; i < 2; i++) {
      side = i ? 1 : -1;
      var hp = [cx + side * 11, hipY], kn, an;
      if (seated) { kn = [cx + side * (17 + spread), hipY + 10]; an = [cx + side * (19 + spread), hipY + 56]; }
      else { kn = [cx + side * (13 + spread * 0.55), hipY + 48]; an = [cx + side * (14 + spread), hipY + 94]; }
      j.an.push([an[0], an[1] + 10]);
      s += limb(kn, an, 17, 11.5, 5, 0.3, C.skin, C.skinD) + limb(hp, kn, 25, 17, 3, 0.4, C.skin, C.skinD) + limb(hp, lerp(hp, kn, 0.7), 28, 24, 0, 0.5, C.short, C.shortD);
      s += '<rect x="' + f1(an[0] - 12 + side * 2) + '" y="' + f1(an[1] - 2) + '" width="24" height="11" rx="5.5" fill="' + C.shoe + '"/>' +
        '<rect x="' + f1(an[0] - 12 + side * 2) + '" y="' + f1(an[1] + 7) + '" width="24" height="3.5" rx="1.7" fill="' + C.sole + '"/>';
    }
    var sw = 27 + (p.wide || 0);
    s += poly([[cx - 18, hipY - 8], [cx + 18, hipY - 8], [cx + 21, hipY + 10], [cx - 21, hipY + 10]], C.short, ' stroke="' + C.short + '" stroke-width="4" stroke-linejoin="round"');
    s += poly([[cx - sw, shoY - 2], [cx + sw, shoY - 2], [cx + 19, hipY - 4], [cx - 19, hipY - 4]], C.shirtD, ' stroke="' + C.shirtD + '" stroke-width="5" stroke-linejoin="round"');
    s += poly([[cx - sw + 3, shoY], [cx + sw - 3, shoY], [cx + 17, hipY - 6], [cx - 17, hipY - 6]], C.shirt, ' stroke="' + C.shirt + '" stroke-width="3" stroke-linejoin="round"');
    s += '<path d="M ' + P([cx - 9, shoY - 3]) + " Q " + P([cx, shoY + 12]) + " " + P([cx + 9, shoY - 3]) + '" fill="' + C.skin + '"/>';
    if (!bend) s += limb([cx, shoY - 2], [cx, shoY - 16], 13, 12, 0, 0.5, C.skin, C.skinD);
    var hc = j.head;
    for (i = 0; i < 2; i++) {
      side = i ? 1 : -1;
      var A = i ? p.R : p.L; A = A || p.L || [0, 0];
      var o = [cx + side * (sw - 2), shoY + 5];
      var e = add(o, fdir(side, A[0]), L.ua * (p.us || 1)), w = add(e, fdir(side, A[1]), L.fa);
      if (p.wrAt && p.wrAt[i]) w = p.wrAt[i];
      j.sho[i] = o; j.el[i] = e; j.wr[i] = w;
      s += circ(o, 9.5, C.skin) + limb(e, w, 13, 9, 2.8, 0.3, C.skin, C.skinD) + limb(o, e, 16, 13, 4.2, 0.5, C.skin, C.skinD) + circ(w, 6.6, C.skin);
    }
    var hr = L.head;
    s += circ(hc, hr, C.skinD) + circ([hc[0] - 0.6, hc[1] - 0.8], hr - 1.2, C.skin);
    s += '<path d="M ' + P([hc[0] - hr - 0.5, hc[1] - 1]) + " A " + (hr + 0.5) + " " + (hr + 0.5) + " 0 0 1 " + P([hc[0] + hr + 0.5, hc[1] - 1]) +
      " C " + P([hc[0] + hr - 2, hc[1] - 7]) + " " + P([hc[0] + 4, hc[1] - 9]) + " " + P([hc[0] - hr + 1, hc[1] - 3]) + ' Z" fill="' + C.hair + '"/>';
    s += circ([hc[0] - hr - 0.2, hc[1] + 2], 2.6, C.skinD) + circ([hc[0] + hr + 0.2, hc[1] + 2], 2.6, C.skinD);
    s += circ([hc[0] - 5, hc[1] + 1.5], 1.7, C.dark) + circ([hc[0] + 5, hc[1] + 1.5], 1.7, C.dark);
    s += line([[hc[0] - 8, hc[1] - 2.5], [hc[0] - 3, hc[1] - 3.2]], 1.5, C.hair) + line([[hc[0] + 8, hc[1] - 2.5], [hc[0] + 3, hc[1] - 3.2]], 1.5, C.hair);
    s += '<path d="M ' + P([hc[0] - 3.5, hc[1] + 7]) + " Q " + P([hc[0], hc[1] + 9.5]) + " " + P([hc[0] + 3.5, hc[1] + 7]) + '" stroke="#b9694a" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    return { svg: s, j: j };
  }

  /* ---------- aksesuarlar ---------- */
  var K = {
    plate: function (c, r) {
      r = (r || 17) * 1.38;
      return circ(c, r, "#17191f") + circ(c, r * 0.93, C.dark) + circ(c, r * 0.64, "#3a4150") + circ(c, r * 0.58, C.dark) + circ(c, r * 0.12, "#0c0d10") + circ(add(c, [-1, -1], r * 0.1), r * 0.06, C.steel);
    },
    db: function (c, r) {
      r = r || 8;
      var pts = [], i;
      for (i = 0; i < 6; i++) pts.push([c[0] + Math.cos(i * Math.PI / 3) * r, c[1] + Math.sin(i * Math.PI / 3) * r]);
      return '<polygon points="' + pts.map(P).join(" ") + '" fill="' + C.dark + '" stroke="' + C.dark + '" stroke-width="2" stroke-linejoin="round"/>' + circ(c, 2.2, C.steel);
    },
    bar: function (a, b, w) { return line([a, b], w || 4, C.metal); },
    handle: function (a, b) { return line([a, b], 5, C.dark); },
    rope: function (a, b) { return line([a, b], 1.6, C.cable); },
    pulley: function (c) { return circ(c, 7, C.metal) + circ(c, 7, "none", ' stroke="' + C.cable + '" stroke-width="2"') + circ(c, 2, C.cable); },
    bench: function (x1, x2, y, h) { // düz bank
      h = h || (G - y);
      return '<rect x="' + x1 + '" y="' + y + '" width="' + (x2 - x1) + '" height="11" rx="5.5" fill="' + C.pad + '"/>' +
        line([[x1 + 14, y + 8], [x1 + 14, G]], 5, C.padD) + line([[x2 - 14, y + 8], [x2 - 14, G]], 5, C.padD);
    },
    padLine: function (a, b, w) { return line([a, b], w || 11, C.pad); },
    leg: function (a, b) { return line([a, b], 5, C.padD); },
    post: function (x, y1, y2) { return line([[x, y1], [x, y2]], 6, C.steel); },
    box: function (x, y, w, h, col, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r == null ? 4 : r) + '" fill="' + (col || C.pad) + '"/>'; },
    stack: function (x, y, h) { // kablo ağırlık bloğu
      var s = '<rect x="' + x + '" y="' + y + '" width="26" height="' + h + '" rx="3" fill="' + C.dark2 + '"/>';
      for (var yy = y + 6; yy < y + h - 4; yy += 9) s += '<rect x="' + (x + 3) + '" y="' + yy + '" width="20" height="5" rx="1.5" fill="' + C.dark + '"/>';
      return s;
    },
    line: line, circ: circ
  };

  function panel(inner, vb, flip) {
    var x = vb[0], y = vb[1], w = vb[2], h = vb[3];
    var bg = '<defs><linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f3f6fd"/></linearGradient>' +
      '<linearGradient id="gfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f8"/><stop offset="1" stop-color="#e4e9f4"/></linearGradient></defs>' +
      '<rect x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + (w + 4) + '" height="' + (h + 4) + '" fill="url(#gbg)"/>';
    var floor = '<rect x="' + (x - 200) + '" y="' + (G - 2) + '" width="' + (w + 400) + '" height="260" fill="url(#gfl)"/><rect x="' + (x - 200) + '" y="' + (G - 2) + '" width="' + (w + 400) + '" height="2" fill="#cfd6e8"/>' +
      '<ellipse cx="' + (x + w / 2) + '" cy="' + (G + 2) + '" rx="' + (w * 0.34) + '" ry="5" fill="#7f90c2" opacity=".22"/>';
    var g = floor + inner;
    if (flip) g = '<g transform="translate(' + (2 * x + w) + ' 0) scale(-1 1)">' + g + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + f1(x) + " " + f1(y) + " " + f1(w) + " " + f1(h) + '" class="illu-svg" role="img" preserveAspectRatio="xMidYMid slice">' + bg + g + '</svg>';
  }

  var T = {}; // şablonlar
  var MAP = {};

  function figOf(ph) { return ph.front_view ? figureFront(ph.pose) : figure(ph.pose); }
  function pts(j) {
    var a = [j.hip, j.sho, j.head, j.el, j.wr, j.kn, j.an, j.el2, j.wr2, j.kn2, j.an2], out = [];
    a.forEach(function (p) { if (!p) return; if (typeof p[0] === "number") out.push(p); else p.forEach(function (q) { if (q) out.push(q); }); });
    return out;
  }
  function viewBox(figs) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    figs.forEach(function (f) { pts(f.j).forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); });
    x0 -= 48; x1 += 48; y0 -= 32; y1 += 24;
    if (y1 > G - 40) y1 = Math.max(y1, G + 10);
    var w = x1 - x0, h = y1 - y0, ar = 4 / 3;
    if (w / h < ar) { var nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { var nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
    if (w < 230) { x0 -= (230 - w) / 2; h = h * 230 / w; w = 230; }
    return [x0, y0, w, h];
  }
  function prep(id) {
    var m = MAP[id]; if (!m || !T[m[0]]) return null;
    var d = T[m[0]](m[1] || {});
    var fa = figOf(d.a), fb = figOf(d.b);
    d._f = [fa, fb]; d._vb = viewBox([fa, fb]);
    return d;
  }
  function renderPhase(ph, fig, vb, flip) {
    var back = ph.scene ? (typeof ph.scene === "function" ? ph.scene(fig.j) : ph.scene) : "";
    var front = ph.front ? ph.front(fig.j) : "";
    return panel(back + fig.svg + front, vb, flip);
  }

  window.Illu = {
    figureFront: figureFront, K: K, C: C, L: L, G: G, T: T, MAP: MAP, ik: ik, solve: solve, dir: dir, add: add, figure: figure, panel: panel,
    has: function (id) { return !!MAP[id]; },
    phase: function (id, which) { var d = prep(id); if (!d) return ""; var b = which === "b"; return renderPhase(b ? d.b : d.a, d._f[b ? 1 : 0], d._vb, d.flip); },
    pair: function (id) {
      var d = prep(id); if (!d) return "";
      var lb = d.labels || ["Başlangıç", "Bitiş"];
      return '<div class="illu-pair"><figure>' + renderPhase(d.a, d._f[0], d._vb, d.flip) + '<figcaption><b>1</b> ' + lb[0] + '</figcaption></figure>' +
        '<span class="illu-arrow" aria-hidden="true">→</span>' +
        '<figure>' + renderPhase(d.b, d._f[1], d._vb, d.flip) + '<figcaption><b>2</b> ' + lb[1] + '</figcaption></figure></div>';
    },
    thumb: function (id) { var d = prep(id); if (!d) return ""; return renderPhase(d.b, d._f[1], d._vb, d.flip); }
  };
})();
