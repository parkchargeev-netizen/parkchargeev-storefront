import { NextResponse } from "next/server";

import { generateAdminAiInsight } from "@/server/admin/ai-operations";
import { requireAdminRole } from "@/server/auth/guards";

export async function POST() {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "order_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const result = await generateAdminAiInsight(
    {
      moduleKey: "daily_report",
      entityType: "admin",
      entityId: authenticatedAdmin.session.sub,
      prompt: "Bugünün gelir, sipariş, risk, stok ve ödeme sinyallerini yönetici raporu olarak özetle."
    },
    authenticatedAdmin.session
  );

  return NextResponse.json({ ok: true, ...result });
}
