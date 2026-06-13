import { NextResponse } from "next/server";

import { upsertAdminUser } from "@/server/admin/repository";
import { adminUserSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type AdminUserRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminUserRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const payload = adminUserSchema.parse({
    ...(await request.json()),
    id
  });
  const requestMeta = await getRequestMeta();
  const adminUser = await upsertAdminUser(payload, authenticatedAdmin.session, requestMeta);

  if (!adminUser) {
    return NextResponse.json({ ok: false, message: "Admin kullanıcı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, adminUser });
}
