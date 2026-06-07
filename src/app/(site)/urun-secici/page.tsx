import type { Metadata } from "next";

import { ProductSelectorClient } from "@/components/site/product-selector-client";
import { products } from "@/lib/mock-data";
import {
  getBreadcrumbJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Akıllı Şarj Cihazı Seçici",
  description:
    "Kurulum yeri, elektrik altyapısı, araç sayısı ve kullanım önceliğine göre ParkChargeEV ürünleri arasından doğru şarj cihazını bulun.",
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
    <div className="selector-page mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <ProductSelectorClient products={products} />
    </div>
  );
}
