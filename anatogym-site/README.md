# Anatogym · Gym Rehberi (PWA)

Statik site: build gerekmez. Dosyaları GitHub reposunun köküne yükle → Settings → Pages → "Deploy from a branch" → main / root.

## Yapı
- `index.html`, `style.css`, `app.js`: arayüz ve uygulama mantığı
- `model3d.js` + `data/mannequin.bin`: dönen 3D manken (WebGL, ~35 bin köşe, bölge bazlı kas id). Mesh önceden üretilip ikili dosya olarak gömülüdür; WebGL yoksa `model.js` (basit model) devreye girer.
- `illu.js`, `illu-data*.js`: hareket çizimleri (SVG, kodla çizilir, iki anlı: başlangıç / bitiş)
- `data/*.js`: hareket verileri (kas grubuna göre dosyalar)
- `sw.js`, `manifest.webmanifest`, `icons/`: PWA / çevrimdışı

## Hareket ekleme
1. İlgili kas dosyasına (örn. `data/gogus.js`) bir satır ekle (format `data/core.js` başında yazılı).
2. Çizim için `illu-data*.js` içinde `M["yeni-id"] = ["sablon", {seçenekler}];` satırı ekle. Mevcut şablonlar: curl, bench, ohp, squat, deadlift, pullup, pushup, pulldown, bentrow, dbrow, cablerow, lateral, plank, lunge, legpress … (`T.` ile tanımlananlar). Yeni bir şablon: `T.ad = function(){ return {a:{pose,scene,front}, b:{...}, labels:[..,..]} }`; pozlar `hip, t, hand, foot` koordinatlarıyla (400x300 panel) verilir.
3. `sw.js` içindeki `VERSION` değerini artır (örn. `anatogym-v2`) ki telefonlar yeni sürümü alsın.

## Nutrio
`data/config.js` içindeki `nutrioUrl` adresine gider: https://boranaakgunn.github.io/Nutrio/

## Ad / ikon
Ad "Anatogym": `index.html`, `manifest.webmanifest`. İkonlar `icons/` altında (192, 512, maskable, apple-touch, favicon).
