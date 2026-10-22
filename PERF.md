# Performans notları

Ölçüm: yerelde üretim derlemesi (`npm run build && npx next start -p 3100`) üzerinde Lighthouse, mobil profil, her sayfa için
3-5 tekrarın medyanı. İki mod birlikte okunur (`scripts/lighthouse.mjs`):

- **simulate** (PageSpeed Insights'ın kullandığı model, `THROTTLE` verilmezse)
- **devtools** (tarayıcıda uygulanan gerçek yavaş-4G kısıtlaması, `THROTTLE=devtools`)

Bir değişiklik, taban ölçümünü gürültünün üstünde geçmiyorsa geri alınır. İki mod çelişirse, ikisinde de bozulma
olmayan değişiklik tutulur.

## Sonuç (başlangıç → son)

| Sayfa | simulate skor | devtools LCP |
|---|---|---|
| Ana sayfa | 89 → 93 | 2694 → 1907 ms |
| Hizmetlerimiz | 88 → 93 | 2620 → 1933 ms |
| Blog yazısı | 91 → 96 | 1612 → 1588 ms |
| Psikologlar | 93 → 96 | (2948 → 1597 ms, F deneyi öncesi) |

Sayfa başına indirilen veri: ana sayfa 688 KB → 562 KB. CLS her sayfada 0.

## Deney kaydı

| # | Fikir | Sonuç | Karar |
|---|---|---|---|
| A | Hero ilk fotoğrafa `fetchPriority=high`, 2. ve 3. slayt sayfa yüklendikten sonra | devtools LCP 2694 → 2364 ms; simulate nötr | **Tutuldu** (standart iyi uygulama, gerçek ağda kazanç) |
| B | `experimental.inlineCss` (CSS'i HTML'e göm) | devtools FCP 1,6 → 0,8 sn; simulate nötr/hafif negatif (HTML büyüdü) | **Geri alındı** (deneysel bayrak, PSI'da kazancı yok) |
| C | Favicon 512 px → 192 px | −17 KB | **Tutuldu** |
| D | Hero kalitesi 85 → 75 | LCP 2290 → 2106 ms, 695 KB'a düştü | **Tutuldu** |
| E | Fontların `preload` kapatılması | devtools LCP −300…−530 ms; simulate'te metin sayfalarının FCP'si 0,9 → 2,1 sn | **Geri alındı** (PSI'ı bozuyor, yazı tipi yanıp sönmesi) |
| F | İlk ekip fotoğrafı `priority` + `Photo` `fetchPriority` | `/psikologlarimiz` LCP 2948 → 1429 ms | **Tutuldu** |
| G | Fraunces + Instrument Sans'ı Türkçe alt kümeye indirgemek (`src/app/fonts`) | −80 KB; simulate skorlar +4…+5; devtools LCP −300…−700 ms | **Tutuldu** |
| G2 | Alt küme fontlarda yedek font ölçülerini eski değerlere sabitlemek | CLS 0,036 → 0 | **Tutuldu** |

## Denenmeyen / ileriye kalanlar

- Gerçek kullanıcı verisi (CrUX / `web-vitals`): lab ölçümü yalnızca taban çizgisi verir. Search Console > Core Web Vitals
  raporu 28 günlük alan verisiyle doğrular.
- `/hakkimizda` (LCP ~2,1 sn) ve `/iletisim` (~1,9 sn) ana görselleri henüz `priority` değil; "iyi" eşiğin (2,5 sn) altındalar.
- Kalan en büyük kalem: birinci taraf JS (~120 KB, Next/React çalışma zamanı) ve hero'daki 3 fotoğraf (~150 KB, ilk ikisi sonradan).
