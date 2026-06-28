import { NextResponse } from "next/server";

import {
  adjustInventory,
  listInventoryMovements
} from "@/server/admin/operations";
import {
  adminInventoryAdjustmentSchema,
  adminListQuerySchema
} from "@/server/admin/validators";
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
    "order_manager",
    "readonly"
  ]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const result = await listInventoryMovements(parseListQuery(request));
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminInventoryAdjustmentSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const movement = await adjustInventory(payload, authenticatedAdmin.session, requestMeta);

  if (!movement) {
    return NextResponse.json({ ok: false, message: "Varyant bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, movement });
}
