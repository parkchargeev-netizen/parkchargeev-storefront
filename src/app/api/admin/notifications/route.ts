import { NextResponse } from "next/server";

import {
  listAdminNotifications,
  updateAdminNotifications
} from "@/server/admin/operations";
import {
  adminListQuerySchema,
  adminNotificationPatchSchema
} from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

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
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const result = await listAdminNotifications(parseListQuery(request));
  return NextResponse.json({ ok: true, ...result });
}

export async function PATCH(request: Request) {
  const authenticatedAdmin = await requireAdminRole([
    "superadmin",
    "admin",
    "product_manager",
    "order_manager",
    "support_agent"
  ]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminNotificationPatchSchema.parse(await request.json());
  const result = await updateAdminNotifications(payload, authenticatedAdmin.session);
  return NextResponse.json({ ok: true, ...result });
}
