import type { HomePageDataSource } from "@/features/home/application/home-page-data-source";
import { testimonials } from "@/lib/mock-data";
import { listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";

export const parkChargeHomeDataSource: HomePageDataSource = {
  listProducts: listPublicProducts,
  listArticles: listPublicBlogArticles,
  async listTestimonials() {
    return testimonials;
  }
};
