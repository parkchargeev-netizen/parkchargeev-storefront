import type { HomePageDataSource } from "@/features/home/application/home-page-data-source";
import { testimonials } from "@/lib/mock-data";
import { listPublicMerchandisingProducts, listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";

export const parkChargeHomeDataSource: HomePageDataSource = {
  listProducts: listPublicProducts,
  listProductsForSlot: listPublicMerchandisingProducts,
  listArticles: listPublicBlogArticles,
  async listTestimonials() {
    return testimonials;
  }
};
