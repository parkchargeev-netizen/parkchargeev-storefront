# Master Technical QA Checklist

Bu checklist ParkChargeEV için her büyük teknik değişiklikten sonra uygulanır.

## 1. Mimari

- [ ] Repo yapısı okunabilir
- [ ] `src/app`, `src/components`, `src/server`, `src/lib` sorumlulukları net
- [ ] Site, admin, API ve DB bounded contextleri karışmıyor
- [ ] Bootstrap ve composition root temiz
- [ ] Integration boundary var
- [ ] Büyük route/component/service dosyaları not edildi
- [ ] Shared/lib klasörü çöp kutusuna dönüşmüyor

## 2. Backend

- [ ] Endpoint isimlendirmesi tutarlı
- [ ] Route handler dosyaları HTTP method export ediyor
- [ ] Public ve admin API yüzeyi ayrılmış
- [ ] Admin endpointlerinde guard/role kontrolü var
- [ ] Validation var
- [ ] Error contract tutarlı
- [ ] Response contract tutarlı
- [ ] Pagination/filtering davranışı net
- [ ] Runtime hata davranışı net

## 3. Frontend

- [ ] Page logic dağınık değil
- [ ] Client component sınırları bilinçli
- [ ] State yönetimi açık
- [ ] Cart, checkout, admin command ve route warmup akışları izole
- [ ] Event binding kırılgan değil
- [ ] Responsive mantık net
- [ ] UI/UX gate geçiyor

## 4. Veritabanı

- [ ] Source of truth belli
- [ ] Drizzle schema savunulabilir
- [ ] Migration riski not edildi
- [ ] Index mantığı makul
- [ ] Duplicate truth riski not edildi
- [ ] Audit log ve session verisi operasyonel ihtiyaçları karşılıyor

## 5. Entegrasyonlar

- [ ] PayTR provider bağımlılığı soyutlanmış
- [ ] Callback/webhook güvenliği var
- [ ] Retry/idempotency düşünülmüş
- [ ] Queue/worker yoksa serverless limitleri not edilmiş
- [ ] External provider hataları kullanıcıya güvenli dönüyor

## 6. Güvenlik

- [ ] Auth akışı net
- [ ] Session güvenli
- [ ] Role/permission modeli çalışıyor
- [ ] Rate limit veya abuse kontrolü var
- [ ] Secret sızıntısı yok
- [ ] Upload/webhook/input riskleri not edildi
- [ ] Admin noindex/no-store ve güvenlik başlıkları doğru

## 7. Performans ve Gözlemlenebilirlik

- [ ] Health endpoint var
- [ ] Build route boyutları takip edildi
- [ ] Admin link geçişleri prefetch/warmup ile destekleniyor
- [ ] DB darboğazları not edildi
- [ ] Cache/revalidation ihtiyacı not edildi
- [ ] Logging ve runtime smoke kontrolü var

## 8. Test ve Release

- [ ] `npm run verify:runtime`
- [ ] `npm run verify:architecture`
- [ ] `npm run verify:uiux`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run verify:admin`
- [ ] Release gate ve rollback notları güncel

## 9. Sonuç

- [ ] Teknik olarak güven veriyor
- [ ] Güçlü ama riskli alanlar var
- [ ] Refactor öncesi daha fazla koruma gerek
- [ ] Release öncesi kritik düzeltmeler var
