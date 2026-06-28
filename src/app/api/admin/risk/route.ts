import { NextResponse } from "next/server";

import { getAdminRiskSnapshot } from "@/server/admin/operations";
import { requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const risk = await getAdminRiskSnapshot();
  return NextResponse.json({ ok: true, risk });
}
