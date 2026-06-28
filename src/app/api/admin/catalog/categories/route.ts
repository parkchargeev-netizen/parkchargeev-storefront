import { NextResponse } from "next/server";

import { deleteAdminCategory, upsertAdminCategory } from "@/server/admin/repository";
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

export async function DELETE(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ ok: false, message: "Geçerli bir kategori gerekli." }, { status: 400 });
  }

  const requestMeta = await getRequestMeta();
  const result = await deleteAdminCategory(id, authenticatedAdmin.session, requestMeta);

  if (result.blockedReason) {
    return NextResponse.json({ ok: false, message: result.blockedReason }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    ...result,
    message: "Kategori kalıcı olarak silindi."
  });
}
