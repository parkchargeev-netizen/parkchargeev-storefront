import { NextResponse } from "next/server";

import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import {
  getAdminProductById,
  getProductLookupOptions,
  updateAdminProductStatuses,
  upsertAdminProduct
} from "@/server/admin/repository";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import {
  getAdminProductDatabaseConflictMessage,
  isAdminProductConflictError
} from "@/server/admin/product-errors";
import { adminProductSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function productConflictResponse(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 409 });
}

type ProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ProductRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) {
    return NextResponse.json({ ok: false, message: "Ürün bulunamadı." }, { status: 404 });
  }

  const lookupOptions = await getProductLookupOptions();
  return NextResponse.json({ ok: true, product, lookupOptions });
}

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = adminProductSchema.parse({
      ...normalizeAdminProductPayload(await request.json()),
      id
    });
    const requestMeta = await getRequestMeta();
    const product = await upsertAdminProduct(payload, authenticatedAdmin.session, requestMeta);

    if (!product) {
      return NextResponse.json({ ok: false, message: "Ürün bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, product });
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

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const requestMeta = await getRequestMeta();
  const result = await updateAdminProductStatuses(
    [id],
    "archived",
    authenticatedAdmin.session,
    requestMeta
  );

  if (result.updatedCount === 0) {
    return NextResponse.json({ ok: false, message: "Ürün bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
