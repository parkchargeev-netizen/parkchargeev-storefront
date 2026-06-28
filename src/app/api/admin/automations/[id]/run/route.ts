import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { runAdminAutomation } from "@/server/admin/ai-operations";
import { adminAutomationRunSchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager", "order_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payload = adminAutomationRunSchema.parse(await request.json().catch(() => ({})));
    const result = await runAdminAutomation(id, payload, authenticatedAdmin.session);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, message: "Otomasyon çalıştırma isteği geçersiz.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Otomasyon çalıştırılamadı."
      },
      { status: 500 }
    );
  }
}
