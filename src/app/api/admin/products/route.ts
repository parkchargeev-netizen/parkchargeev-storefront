import { NextResponse } from "next/server";

import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import { csvResponse } from "@/server/admin/csv";
import {
  getProductLookupOptions,
  listAdminProducts,
  updateAdminProductStatuses,
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
  adminProductSchema
} from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function productConflictResponse(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 409 });
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
      { header: "Ürün", value: (item) => item.name },
      { header: "Slug", value: (item) => item.slug },
      { header: "Durum", value: (item) => item.status },
      { header: "Fiyat", value: (item) => item.defaultVariant?.priceKurus ?? item.defaultPriceKurus },
      { header: "Stok", value: (item) => item.defaultVariant?.stockQuantity ?? 0 },
      { header: "Kategoriler", value: (item) => item.categories.join(", ") },
      { header: "Güncelleme", value: (item) => item.updatedAt }
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

  const payload = adminProductBulkActionSchema.parse(await request.json());
  const statusByAction = {
    archive: "archived",
    activate: "active",
    draft: "draft"
  } as const;
  const requestMeta = await getRequestMeta();
  const result = await updateAdminProductStatuses(
    payload.ids,
    statusByAction[payload.action],
    authenticatedAdmin.session,
    requestMeta
  );

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
  const result = await updateAdminProductStatuses(
    payload.ids,
    "archived",
    authenticatedAdmin.session,
    requestMeta
  );

  return NextResponse.json({ ok: true, ...result });
}
