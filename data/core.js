/*
  HAREKET EKLEMEK İÇİN: ilgili kas dosyasını aç (data/gogus.js gibi) ve listenin sonuna bir satır ekle:

  ["id", "Hareket Adı", "ekipman", "seviye", "Yardımcı kaslar",
    ["adım 1", "adım 2", ...],      // nasıl yapılır
    ["ipucu 1", ...],               // ipuçları
    ["hata 1", ...],                // sık yapılan hatalar
    "arama için takma adlar",       // Türkçe/İngilizce isimler, virgülle (opsiyonel)
    "YOUTUBE_ID"                    // opsiyonel; boşsa "Video ara" linki çıkar
  ]

  ekipman : barbell | dumbbell | cable | machine | bodyweight
  seviye  : Başlangıç | Orta | İleri
*/
window.EXERCISES = [];
window.MUSCLES = {
  gogus:     { label: "Göğüs",       view: "front", hue: 12  },
  omuz:      { label: "Omuz",        view: "front", hue: 32  },
  biceps:    { label: "Biceps",      view: "front", hue: 48  },
  onkol:     { label: "Ön kol",      view: "front", hue: 70  },
  karin:     { label: "Karın",       view: "front", hue: 95  },
  onbacak:   { label: "Ön bacak",    view: "front", hue: 150 },
  sirt:      { label: "Sırt",        view: "back",  hue: 190 },
  trapez:    { label: "Trapez",      view: "back",  hue: 210 },
  triceps:   { label: "Triceps",     view: "back",  hue: 235 },
  bel:       { label: "Bel",         view: "back",  hue: 260 },
  kalca:     { label: "Kalça",       view: "back",  hue: 285 },
  arkabacak: { label: "Arka bacak",  view: "back",  hue: 315 },
  baldir:    { label: "Baldır",      view: "back",  hue: 340 }
};
window.EQUIPMENT = {
  barbell: "Barbell", dumbbell: "Dumbbell", cable: "Kablo",
  machine: "Makine", bodyweight: "Vücut ağırlığı"
};
/* X(kasGrubu, [satırlar]) — satırları hareket nesnelerine çevirir */
window.X = function (muscle, rows) {
  rows.forEach(function (r) {
    window.EXERCISES.push({
      id: r[0], name: r[1], muscle: muscle, equipment: r[2], level: r[3],
      secondary: r[4] || "", steps: r[5] || [], tips: r[6] || [], mistakes: r[7] || [],
      alias: r[8] || "", video: r[9] || ""
    });
  });
};
