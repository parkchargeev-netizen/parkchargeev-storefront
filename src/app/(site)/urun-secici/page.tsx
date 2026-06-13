import type { Metadata } from "next";

import { ProductSelectorClient } from "@/components/site/product-selector-client";
import { products } from "@/lib/mock-data";
import {
  getBreadcrumbJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Akıllı EV Şarj Ürün Seçici",
  description:
    "Aracınız, otoparkınız, elektrik altyapınız ve kullanım ihtiyacınıza göre ev, site, işletme veya ticari saha için doğru şarj ürününü bulun.",
  alternates: {
    canonical: "/urun-secici"
  }
};

export default function ProductSelectorPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Akıllı Ürün Seçici", path: "/urun-secici" }
  ]);

  return (
    <div className="selector-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <ProductSelectorClient products={products} />
    </div>
  );
}
