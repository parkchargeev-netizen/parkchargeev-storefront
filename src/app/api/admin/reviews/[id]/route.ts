import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isRuntimeConfigError } from "@/lib/runtime-config";
import { logError } from "@/lib/server-logger";
import { requireAdminRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { productReviews, products } from "@/server/db/schema";

type AdminReviewRouteContext = {
  params: Promise<{ id: string }>;
};

const adminReviewUpdateSchema = z.object({
  title: z.string().trim().max(160).optional().or(z.literal("")),
  body: z.string().trim().min(10).max(1200),
  status: z.enum(["pending", "approved", "rejected"])
});

function adminReviewError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function selectAdminReview(id: string) {
  const db = getDb();
  const [review] = await db
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
    .where(eq(productReviews.id, id))
    .limit(1);

  return review
    ? {
        ...review,
        productName: review.productName ?? "Ürün",
        createdAt: review.createdAt.toISOString()
      }
    : null;
}

export async function PATCH(request: Request, context: AdminReviewRouteContext) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return adminReviewError("Yetkisiz erişim.", 401);
  }

  const { id } = await context.params;

  try {
    const payload = adminReviewUpdateSchema.parse(await request.json());
    const db = getDb();

    await db
      .update(productReviews)
      .set({
        title: payload.title || null,
        body: payload.body,
        status: payload.status,
        updatedAt: new Date()
      })
      .where(eq(productReviews.id, id));

    const review = await selectAdminReview(id);

    if (!review) {
      return adminReviewError("Yorum bulunamadı.", 404);
    }

    return NextResponse.json({
      ok: true,
      message: "Yorum güncellendi.",
      review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return adminReviewError(error.issues[0]?.message ?? "Yorum bilgilerini kontrol edin.");
    }

    if (isRuntimeConfigError(error)) {
      return adminReviewError("Veritabanı bağlantısı yapılandırılmamış.", 503);
    }

    logError("admin.review.update.failed", error);
    return adminReviewError("Yorum güncellenemedi.", 500);
  }
}

export async function DELETE(_request: Request, context: AdminReviewRouteContext) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return adminReviewError("Yetkisiz erişim.", 401);
  }

  const { id } = await context.params;

  try {
    const db = getDb();
    await db.delete(productReviews).where(eq(productReviews.id, id));

    return NextResponse.json({
      ok: true,
      message: "Yorum silindi."
    });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return adminReviewError("Veritabanı bağlantısı yapılandırılmamış.", 503);
    }

    logError("admin.review.delete.failed", error);
    return adminReviewError("Yorum silinemedi.", 500);
  }
}
