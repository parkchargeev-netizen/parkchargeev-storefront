import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { generateAdminAiInsight } from "@/server/admin/ai-operations";
import { adminAiGenerateSchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole([
    "superadmin",
    "admin",
    "product_manager",
    "order_manager"
  ]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const payload = adminAiGenerateSchema.parse(await request.json());
    const result = await generateAdminAiInsight(payload, authenticatedAdmin.session);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, message: "AI isteği geçersiz.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "AI önerisi üretilemedi." },
      { status: 500 }
    );
  }
}
