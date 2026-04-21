# Tasarım Sistemi Rehberi: Luminous Eco-Tech

Bu döküman, modern mobilite ve sürdürülebilir enerji vizyonunu yansıtan, yüksek segmentli bir dijital deneyim oluşturmak için hazırlanmıştır. Standart SaaS şablonlarının ötesine geçerek; editoryal bir derinlik, teknolojik bir hafiflik ve çevreci bir ruhu bir araya getirmeyi hedefler.

## 1. Tasarım Vizyonu: "Luminous Eco-Tech"

Bu tasarım sisteminin "Kuzey Yıldızı", **Luminous Eco-Tech** felsefesidir. Bu yaklaşım, teknolojinin soğukluğunu doğanın organik geçişleriyle yumuşatır. Rijit ızgara yapılarının (grid) yerine; kasıtlı asimetri, geniş negatif alanlar ve üst üste binen katmanlar kullanarak "nefes alan" bir arayüz oluştururuz. Amacımız sadece bir araç sunmak değil, kullanıcıya temiz enerjinin hafifliğini hissettirmektir.

## 2. Renk Stratejisi ve Tonal Derinlik

Renk kullanımı, bu sistemde sadece dekoratif değil, fonksiyonel bir hiyerarşi aracıdır.

### Ana Renk Paleti
*   **Primary (`primary` / `#0044d3`):** Güven veren, teknolojik derinlik.
*   **Secondary (`secondary` / `#006e2f`):** Sürdürülebilirlik ve büyüme.
*   **Gradient (İmza Geçiş):** `primary` -> `secondary` geçişi, enerji akışını ve dönüşümü temsil eder. Sadece ana aksiyon butonlarında (CTA) ve Hero alanlarında kullanılmalıdır.

### "No-Line" (Çizgisiz Tasarım) Kuralı
Bu sistemde bölümleme yapmak için asla 1px kalınlığında düz çizgiler/kenarlıklar kullanmayın. Alanları birbirinden ayırmak için sadece arka plan renk değişimlerini tercih edin:
*   `surface` ana zemin üzerine, bir üst kademe önemli içerik için `surface-container-low` kullanın.
*   Hiyerarşiyi yüzeylerin ton farkıyla (tonal shifting) sağlayın.

### Cam Dokusu ve Geçişler (Glassmorphism)
Yüzen panellerde ve modal yapılarında yarı saydam yüzeyler (`surface` %80 opaklık) ve `backdrop-blur (20px)` efektini birleştirin. Bu, arayüze derinlik katarken "modern SaaS" estetiğini imza bir dokunuşa dönüştürür.

## 3. Tipografi: Editoryal Otorite

Inter font ailesini, bir dergi mizanpajı disipliniyle kullanıyoruz. Tipografi, markanın sesidir; güçlü, net ve hiyerarşik olmalıdır.

*   **Display (`display-lg` - 3.5rem):** Kahraman (Hero) mesajlar için. Geniş harf arası boşluğu ile otoriter bir duruş.
*   **Headline (`headline-lg` - 2rem):** Bölüm başlıkları. Kısa, öz ve çarpıcı.
*   **Body (`body-lg` - 1rem):** Okunabilirlik önceliğimiz. 1.5 - 1.6 line-height değeriyle metinlere nefes aldırın.
*   **Label (`label-md` - 0.75rem):** Teknik veriler ve alt bilgiler için kompakt, genellikle "all-caps" kullanımıyla modern bir dokunuş sağlar.

## 4. Elevasyon ve Derinlik Katmanları

Derinliği geleneksel gölgelerle değil, "Tonal Katmanlama" ile sağlıyoruz.

*   **Katmanlama Prensibi:** İç içe geçen kart yapılarında, en alttaki katmandan en üsttekine doğru `surface-container-low` -> `surface-container-high` -> `surface-container-highest` sırasını takip edin. Bu, gölgeye ihtiyaç duymadan doğal bir yükselti illüzyonu yaratır.
*   **Ambient Shadows (Ortam Gölgeleri):** Eğer bir nesnenin "yüzmesi" gerekiyorsa, keskin olmayan, çok geniş dağılımlı (blur: 40px+) ve düşük opaklıklı (%4-%8) gölgeler kullanın. Gölge rengi saf siyah değil, `on-surface` renginin çok açık bir tonu olmalıdır.
*   **Ghost Border (Hayalet Kenarlık):** Erişilebilirlik için sınır belirlemek zorunluysa, `outline-variant` token'ını %10-20 opaklıkta kullanın. Asla tam opak kenarlık kullanmayın.

## 5. Bileşenler (Components)

### Butonlar
*   **Primary:** Mavi-Yeşil gradyan dolgulu, `md` (12px) radius. Metinler her zaman `on-primary` (Beyaz).
*   **Secondary:** `surface-container-high` dolgulu, `primary` renkte metin içeren butonlar.
*   **Tertiary:** Arka plansız, sadece `primary` renkte metin. Yanında minimal bir ok ikonu ile yönlendirme hissi pekiştirilir.

### Kartlar ve Listeler
*   **İlke:** Liste öğeleri arasında ayırıcı çizgi (divider) kullanmayın. Bunun yerine `spacing-scale` üzerinden dikey boşlukları veya çok hafif arka plan değişimlerini kullanın.
*   **Görünüm:** 12px radius, `surface-container-lowest` dolgu ve çok hafif bir "Ghost Border".

### Giriş Alanları (Inputs)
*   Odaklanmamış durumda `surface-variant` ile yumuşak bir zemin. Odaklanıldığında (focus), `primary` renkte 2px kalınlığında bir alt çizgi veya yumuşak bir dış parıltı (glow).

### Sektöre Özel Bileşenler
*   **Enerji Akış Kartı:** Glassmorphism detaylı, anlık şarj hızını gösteren animasyonlu gradyan çizgiler.
*   **Menzil Çipi (Range Chip):** Kalan batarya yüzdesine göre `secondary` (yeşil) veya `error` (kırmızı) tonuna bürünen dinamik mikro-bileşenler.

## 6. Yapılması Gerekenler ve Pitfall'lar (Do's & Don'ts)

| Yapın (Do) | Yapmayın (Don't) |
| :--- | :--- |
| Bölümleri ayırmak için geniş beyaz boşluk (whitespace) kullanın. | Her içeriği kutular içine hapsedip kenarlıklarla boğmayın. |
| Önemli metinlerde yüksek kontrastlı `on-surface` kullanın. | Gri üzerine gri metin kullanarak okunabilirliği düşürmeyin. |
| İkonları minimal ve `outline` stilinde tercih edin. | Karmaşık, çok renkli ve "clip-art" benzeri ikonlar kullanmayın. |
| Glassmorphism'i sadece odak noktalarında (overlay) kullanın. | Tüm arayüzü şeffaf yaparak görsel gürültü yaratmayın. |

Bu sistem, ParkChargeEV kullanıcılarına sadece bir şarj istasyonu bulma aracı değil; çevre dostu bir geleceğin parçası olduklarını hissettiren, premium bir dijital sığınak sunar.