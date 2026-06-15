import { PremiumHomepage } from "@/components/home/premium-homepage";
import { testimonials } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";
import { listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";

export default async function HomePage() {
  const [publicProducts, publicArticles] = await Promise.all([
    listPublicProducts(),
    listPublicBlogArticles()
  ]);
  const featuredProducts = publicProducts.slice(0, 4);
  const featuredArticles = publicArticles.slice(0, 3);
  const whatsappHref = `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
  )}`;

  return (
    <PremiumHomepage
      featuredProducts={featuredProducts}
      featuredArticles={featuredArticles}
      testimonials={testimonials}
      whatsappHref={whatsappHref}
    />
  );
}
