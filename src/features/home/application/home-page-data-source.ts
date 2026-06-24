import type {
  ArticleModel,
  ProductModel,
  TestimonialModel
} from "@/lib/mock-data";

export interface HomePageDataSource {
  listProducts(): Promise<ProductModel[]>;
  listArticles(): Promise<ArticleModel[]>;
  listTestimonials(): Promise<TestimonialModel[]>;
}
