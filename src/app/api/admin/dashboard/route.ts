import { NextResponse } from "next/server";

import { getAdminDashboardSnapshot } from "@/server/admin/repository";
import { requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message: "Yetkisiz erisim."
      },
      { status: 401 }
    );
  }

  const snapshot = await getAdminDashboardSnapshot();
  return NextResponse.json({ ok: true, snapshot });
}
