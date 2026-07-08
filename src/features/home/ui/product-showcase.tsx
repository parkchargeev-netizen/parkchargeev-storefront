import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PremiumSection } from "@/components/ui/premium-section";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/features/home/ui/section-heading";
import { conversionDataAttributes } from "@/lib/conversion-events";
import type { ProductModel } from "@/lib/mock-data";

type ProductShowcaseProps = {
  products: ProductModel[];
};

export function ProductShowcase({ products }: ProductShowcaseProps) {
  return (
    <PremiumSection id="one-cikan-urunler" className="premium-product-spotlight">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Ürün portföyü"
            title="Evden işletmeye, sahada karşılığı olan şarj ürünleri."
            body="Güç, bağlantı, kullanım alanı ve kurulum ihtiyacını açıkça karşılaştırın."
          />
          <Link
            href="/magaza"
            className="btn-secondary shrink-0"
            {...conversionDataAttributes("persona_route_click", {
              route: "product_showcase",
              href: "/magaza"
            })}
          >
            Tüm ürünler
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="premium-product-spotlight__grid mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
    </PremiumSection>
  );
}
