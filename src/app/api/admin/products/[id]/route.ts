import { NextResponse } from "next/server";

import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import {
  getAdminProductById,
  getProductLookupOptions,
  upsertAdminProduct
} from "@/server/admin/repository";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import { adminProductSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type ProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ProductRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

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
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

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

    throw error;
  }
}
