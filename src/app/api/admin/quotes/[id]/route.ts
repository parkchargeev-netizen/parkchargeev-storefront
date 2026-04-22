import { NextResponse } from "next/server";

import { getAdminQuoteById, updateAdminQuote } from "@/server/admin/repository";
import { adminQuoteUpdateSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type QuoteRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: QuoteRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getAdminQuoteById(id);

  if (!quote) {
    return NextResponse.json({ ok: false, message: "Teklif kaydi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, quote });
}

export async function PATCH(request: Request, { params }: QuoteRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const payload = adminQuoteUpdateSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const quote = await updateAdminQuote(id, payload, authenticatedAdmin.session, requestMeta);

  if (!quote) {
    return NextResponse.json({ ok: false, message: "Teklif kaydi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, quote });
}
