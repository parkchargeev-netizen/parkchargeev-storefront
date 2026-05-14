import { NextResponse } from "next/server";

import { searchAdminWorkspace } from "@/server/admin/global-search";
import { requireAdminRole } from "@/server/auth/guards";

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const items = await searchAdminWorkspace(q, authenticatedAdmin.session.role);

  return NextResponse.json({ ok: true, items });
}
