import type { PublicMerchandisingSlotKey } from "@/server/admin/repository";
import type {
  ArticleModel,
  ProductModel,
  TestimonialModel
} from "@/lib/mock-data";

export interface HomePageDataSource {
  listProducts(): Promise<ProductModel[]>;
  listProductsForSlot?(
    slotKey: PublicMerchandisingSlotKey,
    fallbackProducts: ProductModel[],
    limit: number
  ): Promise<ProductModel[]>;
  listArticles(): Promise<ArticleModel[]>;
  listTestimonials(): Promise<TestimonialModel[]>;
}
