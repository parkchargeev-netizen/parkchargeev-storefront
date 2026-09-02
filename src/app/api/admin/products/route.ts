import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import { csvResponse } from "@/server/admin/csv";
import {
  deleteAdminProducts,
  getProductLookupOptions,
  listAdminProducts,
  updateAdminProductStatuses,
  updateAdminProductSortOrders,
  upsertAdminProduct
} from "@/server/admin/repository";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import {
  getAdminProductDatabaseConflictMessage,
  isAdminProductConflictError
} from "@/server/admin/product-errors";
import {
  adminListQuerySchema,
  adminProductBulkActionSchema,
  adminProductReorderSchema,
  adminProductSchema
} from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function revalidateCommerceProductSurfaces() {
  revalidatePath("/");
  revalidatePath("/magaza");
  revalidatePath("/sitemap.xml");
  revalidatePath("/image-sitemap.xml");
}
function productConflictResponse(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 409 });
}

function formatKurusForExport(value: number | null | undefined) {
  return typeof value === "number" ? (value / 100).toFixed(2) : "";
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    stock: searchParams.get("stock") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });

  const result = await listAdminProducts(query);
  const lookupOptions = await getProductLookupOptions();

  if (query.format === "csv") {
    return csvResponse("products.csv", result.items, [
      { header: "product_id", value: (item) => item.id },
      { header: "sku", value: (item) => item.defaultVariant?.sku ?? "" },
      { header: "slug", value: (item) => item.slug },
      { header: "name", value: (item) => item.name },
      {
        header: "price",
        value: (item) => formatKurusForExport(item.defaultVariant?.priceKurus ?? item.defaultPriceKurus)
      },
      {
        header: "sale_price",
        value: (item) => formatKurusForExport(item.defaultVariant?.compareAtKurus ?? item.discountedPriceKurus)
      },
      { header: "stock", value: (item) => item.defaultVariant?.stockQuantity ?? 0 },
      { header: "status", value: (item) => item.status }
    ]);
  }

  return NextResponse.json({
    ok: true,
    ...result,
    lookupOptions
  });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const payload = adminProductSchema.parse(
      normalizeAdminProductPayload(await request.json())
    );
    const requestMeta = await getRequestMeta();
    const product = await upsertAdminProduct(payload, authenticatedAdmin.session, requestMeta);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: "Ürün oluşturulamadı." },
        { status: 500 }
      );
    }

    revalidateCommerceProductSurfaces();

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    if (isAdminProductConflictError(error)) {
      return productConflictResponse(error.message);
    }

    const conflictMessage = getAdminProductDatabaseConflictMessage(error);

    if (conflictMessage) {
      return productConflictResponse(conflictMessage);
    }

    throw error;
  }
}

export async function PATCH(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json();
  const requestMeta = await getRequestMeta();

  if (body?.action === "reorder") {
    const payload = adminProductReorderSchema.parse(body);
    const result = await updateAdminProductSortOrders(
      payload.items,
      authenticatedAdmin.session,
      requestMeta
    );

    revalidateCommerceProductSurfaces();

    return NextResponse.json({ ok: true, ...result });
  }

  const payload = adminProductBulkActionSchema.parse(body);
  const statusByAction = {
    archive: "archived",
    activate: "active",
    draft: "draft"
  } as const;
  const result = await updateAdminProductStatuses(
    payload.ids,
    statusByAction[payload.action],
    authenticatedAdmin.session,
    requestMeta
  );

  revalidateCommerceProductSurfaces();

  return NextResponse.json({ ok: true, ...result });
}

export async function DELETE(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id").filter(Boolean);
  const payload = adminProductBulkActionSchema.parse({ ids, action: "archive" });
  const requestMeta = await getRequestMeta();
  const mode = searchParams.get("mode");

  if (mode === "delete") {
    const result = await deleteAdminProducts(payload.ids, authenticatedAdmin.session, requestMeta);
    const blockedCount = result.blocked.length;
    revalidateCommerceProductSurfaces();

    return NextResponse.json({
      ok: true,
      ...result,
      message:
        blockedCount > 0
          ? `${result.deletedCount} ürün silindi, ${blockedCount} ürün sipariş/sepet geçmişi nedeniyle silinemedi.`
          : `${result.deletedCount} ürün kalıcı olarak silindi.`
    });
  }

  const result = await updateAdminProductStatuses(
    payload.ids,
    "archived",
    authenticatedAdmin.session,
    requestMeta
  );

  revalidateCommerceProductSurfaces();

  return NextResponse.json({ ok: true, ...result });
}



