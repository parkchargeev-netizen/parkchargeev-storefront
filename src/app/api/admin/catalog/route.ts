import { NextResponse } from "next/server";

import { listAdminCatalog } from "@/server/admin/repository";
import { requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const catalog = await listAdminCatalog();
  return NextResponse.json({ ok: true, ...catalog });
}
