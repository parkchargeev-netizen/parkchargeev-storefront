import { NextResponse } from "next/server";

import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import { getAdminQuoteById, updateAdminQuote } from "@/server/admin/repository";
import { adminQuoteUpdateSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type QuoteRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: QuoteRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "order_manager", "support_agent", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getAdminQuoteById(id);

  if (!quote) {
    return NextResponse.json({ ok: false, message: "Teklif kaydı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, quote });
}

export async function PATCH(request: Request, { params }: QuoteRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "order_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const payload = adminQuoteUpdateSchema.parse(await request.json());
    const requestMeta = await getRequestMeta();
    const quote = await updateAdminQuote(id, payload, authenticatedAdmin.session, requestMeta);

    if (!quote) {
      return NextResponse.json({ ok: false, message: "Teklif kaydı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    throw error;
  }
}
