import { NextResponse } from "next/server";

import { runAdminPaytrOperation } from "@/server/admin/repository";
import { adminPaytrOperationSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type PaytrRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: PaytrRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const payload = adminPaytrOperationSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const order = await runAdminPaytrOperation(id, payload, authenticatedAdmin.session, requestMeta);

  if (!order) {
    return NextResponse.json({ ok: false, message: "PayTR kaydi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}
