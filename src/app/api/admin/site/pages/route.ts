import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteAdminSitePage,
  listAdminSitePages,
  upsertAdminSitePage
} from "@/server/admin/site-management";
import { adminListQuerySchema, adminSitePageSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

const deleteSitePageSchema = z.object({
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
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const payload = adminSitePageSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const page = await upsertAdminSitePage(payload, authenticatedAdmin.session, requestMeta);

  return NextResponse.json({ ok: true, page }, { status });
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const result = await listAdminSitePages(parseListQuery(request));
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return handleUpsert(request, 201);
}

export async function PATCH(request: Request) {
  return handleUpsert(request);
}

export async function DELETE(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = deleteSitePageSchema.safeParse({
    id: searchParams.get("id")
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Geçerli bir sayfa kimliği gerekli." }, { status: 400 });
  }

  const requestMeta = await getRequestMeta();
  const page = await deleteAdminSitePage(parsed.data.id, authenticatedAdmin.session, requestMeta);

  if (!page) {
    return NextResponse.json({
      ok: true,
      alreadyDeleted: true,
      message: "Sayfa zaten silinmiş veya bulunamadı."
    });
  }

  return NextResponse.json({ ok: true, page });
}
