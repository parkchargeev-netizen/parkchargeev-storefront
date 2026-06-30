import { desc, eq, and, avg, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isRuntimeConfigError } from "@/lib/runtime-config";
import { logError } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { productReviews, products } from "@/server/db/schema";

type ProductReviewRouteContext = {
  params: Promise<{ slug: string }>;
};

const productReviewSchema = z.object({
  authorName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(120),
  authorEmail: z.string().trim().email("Geçerli bir e-posta yazın.").optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(160).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Yorum en az 10 karakter olmalı.").max(1200)
});

function reviewError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(_request: Request, context: ProductReviewRouteContext) {
  const { slug } = await context.params;

  try {
    const db = getDb();
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);

    if (!product) {
      return NextResponse.json({ ok: true, reviews: [], summary: { count: 0, average: 0 } });
    }

    const [summary] = await db
      .select({
        count: count(productReviews.id),
        average: avg(productReviews.rating)
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, product.id), eq(productReviews.status, "approved")));

    const rows = await db
      .select({
        id: productReviews.id,
        authorName: productReviews.authorName,
        rating: productReviews.rating,
        title: productReviews.title,
        body: productReviews.body,
        createdAt: productReviews.createdAt
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, product.id), eq(productReviews.status, "approved")))
      .orderBy(desc(productReviews.createdAt))
      .limit(30);

    return NextResponse.json({
      ok: true,
      reviews: rows.map((review) => ({
        ...review,
        createdAt: review.createdAt.toISOString()
      })),
      summary: {
        count: Number(summary?.count ?? 0),
        average: Number(summary?.average ?? 0)
      }
    });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json({ ok: true, reviews: [], summary: { count: 0, average: 0 } });
    }

    logError("product_reviews.list.failed", error);
    return NextResponse.json({ ok: true, reviews: [], summary: { count: 0, average: 0 } });
  }
}

export async function POST(request: Request, context: ProductReviewRouteContext) {
  const { slug } = await context.params;

  try {
    const payload = productReviewSchema.parse(await request.json());
    const db = getDb();
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);

    if (!product) {
      return reviewError("Ürün bulunamadı.", 404);
    }

    await db
      .insert(productReviews)
      .values({
        productId: product.id,
        authorName: payload.authorName,
        authorEmail: payload.authorEmail || null,
        rating: payload.rating,
        title: payload.title || null,
        body: payload.body,
        status: "pending"
      });

    return NextResponse.json({
      ok: true,
      message: "Yorumunuz onaydan sonra yayınlanacak."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reviewError(error.issues[0]?.message ?? "Yorum bilgilerini kontrol edin.");
    }

    if (isRuntimeConfigError(error)) {
      return reviewError("Yorum sistemi geçici olarak kullanılamıyor.", 503);
    }

    logError("product_reviews.create.failed", error);
    return reviewError("Yorum kaydedilemedi. Lütfen kısa süre sonra tekrar deneyin.", 500);
  }
}
