import { NextResponse } from "next/server";

import {
  listAdminSitePages,
  upsertAdminSitePage
} from "@/server/admin/site-management";
import { adminListQuerySchema, adminSitePageSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

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
