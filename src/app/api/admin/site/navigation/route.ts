import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteAdminNavigationItem,
  listAdminNavigationItems,
  upsertAdminNavigationItem
} from "@/server/admin/site-management";
import {
  adminListQuerySchema,
  adminNavigationItemSchema
} from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

const deleteNavigationItemSchema = z.object({
  id: z.string().uuid()
});

function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });
}

async function handleUpsert(request: Request, status = 200) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "readonly"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminNavigationItemSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const item = await upsertAdminNavigationItem(payload, authenticatedAdmin.session, requestMeta);

  return NextResponse.json({ ok: true, item }, { status });
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const result = await listAdminNavigationItems(parseListQuery(request));
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return handleUpsert(request, 201);
}

export async function PATCH(request: Request) {
  return handleUpsert(request);
}

export async function DELETE(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = deleteNavigationItemSchema.safeParse({
    id: searchParams.get("id")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Geçerli bir navigasyon kimliği gerekli." },
      { status: 400 }
    );
  }

  const requestMeta = await getRequestMeta();
  const item = await deleteAdminNavigationItem(
    parsed.data.id,
    authenticatedAdmin.session,
    requestMeta
  );

  if (!item) {
    return NextResponse.json({
      ok: true,
      alreadyDeleted: true,
      message: "Navigasyon kaydı zaten silinmiş veya bulunamadı."
    });
  }

  return NextResponse.json({ ok: true, item });
}
