import type { HomePageDataSource } from "@/features/home/application/home-page-data-source";
import { publicMerchandisingSlotKeys, publicProductMerchandisingSections } from "@/features/home/domain/product-merchandising";
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

  const homeProductPortfolioLimit =
    publicProductMerchandisingSections.find(
      (section) => section.slotKey === publicMerchandisingSlotKeys.homeProductPortfolio
    )?.maxItems ?? 12;

  const featuredProducts = dataSource.listProductsForSlot
    ? await dataSource.listProductsForSlot(
        publicMerchandisingSlotKeys.homeProductPortfolio,
        products,
        homeProductPortfolioLimit
      )
    : products.slice(0, homeProductPortfolioLimit);

  return {
    featuredProducts,
    featuredArticles: articles.slice(0, 3),
    testimonials: testimonials.slice(0, 3),
    whatsappHref: `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
      "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
    )}`
  };
}
