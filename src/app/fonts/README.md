# Yazı tipleri

`Fraunces-tr.woff2` ve `InstrumentSans-tr.woff2`: Google Fonts'taki **Fraunces** ve **Instrument Sans** değişken
fontlarının, sitede kullanılan karakterlere (Temel Latin, Latin-1, Türkçe ğ ş ı İ Ğ Ş, tipografik noktalama, oklar)
indirgenmiş alt kümeleridir. Google'ın hazır "latin-ext" dosyası Türkçe için yalnızca 6 harf gerektirirken yüzlerce
glif taşıdığından, bu alt küme yazı tipi indirmesini ~167 KB'tan ~87 KB'a düşürür.

- Fraunces: `opsz` (optik boyut) ve `wght` 300–600 aralığı korunur; `SOFT` ve `WONK` eksenleri sabitlenmiştir.
- Instrument Sans: `wght` 400–700 korunur; `wdth` sabitlenmiştir.
- Lisans: SIL Open Font License 1.1 (Fraunces © The Fraunces Project Authors, Instrument Sans © The Instrument Sans Project Authors). Yeniden dağıtım ve alt küme üretimi lisans gereği serbesttir.
- Subset dışında kalan bir karakter (ör. Orta Avrupa harfleri) yazılırsa tarayıcı onu otomatik olarak yedek sistem fontuyla gösterir.
- Yeniden üretmek için: kaynak TTF'leri `google/fonts` deposundan indirip `fonttools` (`varLib.instancer` + `subset`) ile aynı eksen/karakter ayarlarıyla işleyin.
