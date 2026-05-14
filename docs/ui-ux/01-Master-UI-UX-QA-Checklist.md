# Master UI/UX QA Checklist

Bu checklist ParkChargeEV mağaza, teklif, harita ve admin operasyon akışlarını bütünsel olarak denetlemek için kullanılır.

## 1. Bilgi Mimarisi

- [ ] Ana menü, mağaza, ürün seçici, karşılaştırma, harita, blog ve iletişim hedeflerini net ayırıyor mu?
- [ ] Admin sidebar görev odaklı mı: gösterge paneli, ürünler, siparişler, teklifler, saha, istasyonlar, site, audit?
- [ ] Kullanıcı ilk bakışta alışveriş mi, teklif mi, kurulum bilgisi mi alacağını anlayabiliyor mu?
- [ ] Sayfa başlıkları teknik değil, kullanıcı diliyle mi yazılmış?
- [ ] Breadcrumb, sayfa başlığı, filtre ve tablo başlıkları aynı bağlamı mı anlatıyor?

## 2. Satış Aksiyonu Hiyerarşisi

- [ ] Ürün detayında birincil aksiyon net mi: sepete ekle, teklif al veya kurulum bilgisi?
- [ ] Teklif formu ve iletişim CTA'ları ürün satın alma akışını gölgelemiyor mu?
- [ ] Ürün seçici sonuçtan ürüne veya teklif formuna kesintisiz götürüyor mu?
- [ ] Sepet, ödeme ve PayTR adımları kullanıcının nerede olduğunu açık gösteriyor mu?
- [ ] Admin dashboard bugünün aksiyonlarını gerçekten önceliklendiriyor mu?

## 3. Bileşen Tutarlılığı

- [ ] Buton aileleri site ve admin içinde tutarlı mı?
- [ ] Input, textarea, select, checkbox ve filtre davranışları ortak mı?
- [ ] Kart, tablo, liste, detay paneli ve form boşlukları aynı ritimde mi?
- [ ] Badge, durum etiketi, stok/teklif/sipariş statüleri tek dil kullanıyor mu?
- [ ] Empty, loading, error ve success state'leri aksiyon öneriyor mu?

## 4. Çalışırlılık

- [ ] Görünen her butonun gerçek etkisi var mı?
- [ ] Arama, filtre, pagination ve sıralama sonuçları beklenen URL/state ile uyumlu mu?
- [ ] Admin global arama doğru modüle götürüyor mu?
- [ ] Sepet, checkout, teklif, lead ve admin form submit akışları feedback veriyor mu?
- [ ] Geri, kapat, iptal ve düzenle akışları kullanıcıyı kaybettirmiyor mu?

## 5. Typography

- [ ] Başlık, gövde, label, helper text ve tablo metni ölçekleri tutarlı mı?
- [ ] Hero ölçeği yalnızca gerçek hero alanlarında mı kullanılıyor?
- [ ] Admin kartları ve panelleri operasyonel yoğunluğa uygun sıkılıkta mı?
- [ ] Mobilde uzun Türkçe kelimeler taşmadan kırılıyor mu?

## 6. Spacing / Layout Rhythm

- [ ] Form grup araları, kart iç boşlukları ve tablo satır yükseklikleri tutarlı mı?
- [ ] Mobilde site "küçülmüş desktop" gibi görünmüyor mu?
- [ ] Admin sidebar, üst arama ve içerik alanı farklı ekranlarda çakışmıyor mu?
- [ ] Harita ve ürün galeri alanları stabil boyutlarla yerleşiyor mu?

## 7. Görsel Tutarlılık

- [ ] Renk rolleri satış, uyarı, başarı, risk ve bilgi için tutarlı mı?
- [ ] Icon dili lucide ağırlıklı ve aynı çizgi kalınlığında mı?
- [ ] Border radius ve shadow kullanımı gereksiz çeşitlenmiyor mu?
- [ ] Hover, active, selected ve disabled state farkları anlaşılır mı?

## 8. Responsive / Mobile

- [ ] 390px genişlikte mağaza, ürün detay, sepet, ödeme ve harita kullanılabiliyor mu?
- [ ] Admin kritik aksiyonları mobilde erişilebilir mi?
- [ ] Touch hedefleri en az 44px hissi veriyor mu?
- [ ] Tablo/listeler mobilde yatay kaydırma veya kart görünümüyle kırılmadan duruyor mu?

## 9. SEO ve Güven

- [ ] Ürün, blog, il landing, kurumsal çözüm ve harita sayfaları metadata ile uyumlu mu?
- [ ] FAQ, Product, Breadcrumb ve LocalBusiness schema akışı bozulmamış mı?
- [ ] Güvenlik başlıkları admin ve site için noindex/no-store beklentisine uyuyor mu?
- [ ] Kritik form ve ödeme hatalarında recovery yolu var mı?

## 10. Kapanış Kararı

- [ ] Release-ready
- [ ] Güçlü ama polish gerekli
- [ ] Kullanılabilir ama sürtünmeli
- [ ] Bilgi mimarisi sorunlu
- [ ] Önce sistemik düzeltme gerekli
