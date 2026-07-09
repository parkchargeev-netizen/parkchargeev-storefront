import type { HomePageDataSource } from "@/features/home/application/home-page-data-source";
import { publicMerchandisingSlotKeys } from "@/server/admin/repository";
import type {
  ArticleModel,
  ProductModel,
  TestimonialModel
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

export type HomePageData = {
  featuredProducts: ProductModel[];
  featuredArticles: ArticleModel[];
  testimonials: TestimonialModel[];
  whatsappHref: string;
};

export async function getHomePageData(
  dataSource: HomePageDataSource
): Promise<HomePageData> {
  const [products, articles, testimonials] = await Promise.all([
    dataSource.listProducts(),
    dataSource.listArticles(),
    dataSource.listTestimonials()
  ]);

  const featuredProducts = dataSource.listProductsForSlot
    ? await dataSource.listProductsForSlot(
        publicMerchandisingSlotKeys.homeProductPortfolio,
        products,
        4
      )
    : products.slice(0, 4);

  return {
    featuredProducts,
    featuredArticles: articles.slice(0, 3),
    testimonials: testimonials.slice(0, 3),
    whatsappHref: `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
      "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
    )}`
  };
}
