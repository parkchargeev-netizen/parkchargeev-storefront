# Regression And Release Gate

Bu checklist ParkChargeEV için her büyük kodlama batch'i sonrası uygulanır.

## A. Teknik Kontrol

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run verify:uiux`
- [ ] Kritik konsol hatası yok

## B. Site UI Smoke

- [ ] ana sayfa
- [ ] mağaza
- [ ] ürün detay
- [ ] ürün seçici
- [ ] karşılaştırma
- [ ] sepet
- [ ] ödeme
- [ ] harita
- [ ] blog ve il landing sayfası
- [ ] iletişim / teklif formu

## C. Admin UI Smoke

- [ ] login
- [ ] gösterge paneli
- [ ] ana admin navigasyonu
- [ ] global admin arama
- [ ] ürün yönetimi
- [ ] sipariş yönetimi
- [ ] teklif yönetimi
- [ ] saha talepleri
- [ ] istasyon yönetimi
- [ ] site yönetimi
- [ ] audit ve admin kullanıcıları

## D. Broken-State Gate

- [ ] saf `#` link yok
- [ ] etkisiz görünen buton yok
- [ ] submit sonrası feedback var
- [ ] empty/no-result state aksiyon veya çıkış yolu veriyor
- [ ] error state recovery yolu gösteriyor
- [ ] modal/editör kapatma akışı kayıp yaratmıyor

## E. Consistency Gate

- [ ] yeni alanlar mevcut design language ile uyumlu
- [ ] font boyutları rastgele değil
- [ ] spacing düzeni bozulmamış
- [ ] buton stilleri standarda uyuyor
- [ ] yeni ikonlar mevcut ikon diliyle uyumlu
- [ ] mobilde metin ve aksiyonlar taşmıyor

## F. Release Kararı

- [ ] release-ready
- [ ] caution: polish gerekli
- [ ] hold: broken-state riski var
- [ ] hold: bilgi mimarisi veya interaction regresyonu var
