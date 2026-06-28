import { NextResponse } from "next/server";

import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import { getAdminOrderById, updateAdminOrder } from "@/server/admin/order-repository";
import { adminOrderUpdateSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type OrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "order_manager", "support_agent", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return NextResponse.json({ ok: false, message: "Sipariş bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}

export async function PATCH(request: Request, { params }: OrderRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "order_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const payload = adminOrderUpdateSchema.parse(await request.json());
    const requestMeta = await getRequestMeta();
    const order = await updateAdminOrder(id, payload, authenticatedAdmin.session, requestMeta);

    if (!order) {
      return NextResponse.json({ ok: false, message: "Sipariş bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    throw error;
  }
}
