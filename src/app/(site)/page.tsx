import { PremiumHomepage } from "@/components/home/premium-homepage";
import { products, testimonials, trustMetrics } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";
import { listPublicBlogArticles } from "@/server/blog/repository";

export default async function HomePage() {
  const featuredProducts = products.slice(0, 4);
  const featuredArticles = (await listPublicBlogArticles()).slice(0, 3);
  const whatsappHref = `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
  )}`;

  return (
    <PremiumHomepage
      featuredProducts={featuredProducts}
      featuredArticles={featuredArticles}
      testimonials={testimonials}
      trustMetrics={trustMetrics}
      whatsappHref={whatsappHref}
    />
  );
}
