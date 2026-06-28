import { NextResponse } from "next/server";

import {
  archiveAdminCampaign,
  listAdminCampaigns,
  upsertAdminCampaign
} from "@/server/admin/operations";
import { adminCampaignSchema, adminListQuerySchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole([
    "superadmin",
    "admin",
    "product_manager",
    "readonly"
  ]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const result = await listAdminCampaigns(parseListQuery(request));
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminCampaignSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const campaign = await upsertAdminCampaign(payload, authenticatedAdmin.session, requestMeta);
  return NextResponse.json({ ok: true, campaign }, { status: payload.id ? 200 : 201 });
}

export async function PATCH(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ ok: false, message: "Geçerli bir kayıt gerekli." }, { status: 400 });
  }

  const requestMeta = await getRequestMeta();
  const result = await archiveAdminCampaign(id, authenticatedAdmin.session, requestMeta);
  return NextResponse.json({ ok: true, ...result });
}
