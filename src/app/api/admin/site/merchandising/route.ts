import { NextResponse } from "next/server";

import {
  listAdminProductMerchandising,
  updateAdminProductMerchandising
} from "@/server/admin/site-management";
import { adminMerchandisingSlotsSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const data = await listAdminProductMerchandising();
  return NextResponse.json({ ok: true, ...data });
}

export async function PATCH(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminMerchandisingSlotsSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const data = await updateAdminProductMerchandising(
    payload,
    authenticatedAdmin.session,
    requestMeta
  );

  return NextResponse.json({ ok: true, ...data });
}
