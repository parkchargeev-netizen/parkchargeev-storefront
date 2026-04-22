import { NextResponse } from "next/server";

import { getAdminOrderById, updateAdminOrder } from "@/server/admin/repository";
import { adminOrderUpdateSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type OrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return NextResponse.json({ ok: false, message: "Siparis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}

export async function PATCH(request: Request, { params }: OrderRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const payload = adminOrderUpdateSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const order = await updateAdminOrder(id, payload, authenticatedAdmin.session, requestMeta);

  if (!order) {
    return NextResponse.json({ ok: false, message: "Siparis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}
