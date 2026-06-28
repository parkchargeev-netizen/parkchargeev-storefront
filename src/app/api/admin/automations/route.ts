import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { listAdminAutomations, upsertAdminAutomation } from "@/server/admin/ai-operations";
import { adminAutomationSchema, adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const url = new URL(request.url);
  return adminListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
}

export async function GET(request: Request) {
  await requireAdminRole(["superadmin", "admin", "product_manager", "order_manager", "readonly"]);
  const result = await listAdminAutomations(parseListQuery(request));

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const payload = adminAutomationSchema.parse(await request.json());
    const automation = await upsertAdminAutomation(payload, authenticatedAdmin.session);

    return NextResponse.json({ ok: true, automation }, { status: payload.id ? 200 : 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, message: "Otomasyon isteği geçersiz.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Otomasyon kaydedilemedi."
      },
      { status: 500 }
    );
  }
}
