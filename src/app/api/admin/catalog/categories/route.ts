import { NextResponse } from "next/server";

import { upsertAdminCategory } from "@/server/admin/repository";
import { adminCategorySchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

async function handleUpsert(request: Request, status = 200) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminCategorySchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const category = await upsertAdminCategory(payload, authenticatedAdmin.session, requestMeta);

  return NextResponse.json({ ok: true, category }, { status });
}

export async function POST(request: Request) {
  return handleUpsert(request, 201);
}

export async function PATCH(request: Request) {
  return handleUpsert(request);
}
