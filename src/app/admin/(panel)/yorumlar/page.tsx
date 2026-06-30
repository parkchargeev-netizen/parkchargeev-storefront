import { desc, eq } from "drizzle-orm";

import { ProductReviewsAdminPanel } from "@/components/admin/product-reviews-admin-panel";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { isRuntimeConfigError } from "@/lib/runtime-config";
import { logError } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { productReviews, products } from "@/server/db/schema";

async function listProductReviewsForAdmin() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: productReviews.id,
        productName: products.name,
        authorName: productReviews.authorName,
        authorEmail: productReviews.authorEmail,
        title: productReviews.title,
        body: productReviews.body,
        status: productReviews.status,
        createdAt: productReviews.createdAt
      })
      .from(productReviews)
      .leftJoin(products, eq(productReviews.productId, products.id))
      .orderBy(desc(productReviews.createdAt))
      .limit(100);

    return rows.map((review) => ({
      ...review,
      productName: review.productName ?? "Ürün",
      createdAt: review.createdAt.toISOString()
    }));
  } catch (error) {
    if (!isRuntimeConfigError(error)) {
      logError("admin.reviews.list.failed", error);
    }

    return [];
  }
}

export default async function AdminProductReviewsPage() {
  const reviews = await listProductReviewsForAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Yorum Moderasyonu"
        title="Ürün yorumları"
        description="Ürün sayfalarına gelen yorumları onaylayın, düzenleyin, reddedin veya güvenli şekilde silin."
      />

      <ProductReviewsAdminPanel initialReviews={reviews} />
    </div>
  );
}
