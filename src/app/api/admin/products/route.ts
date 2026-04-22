import { NextResponse } from "next/server";

import {
  getProductLookupOptions,
  listAdminProducts,
  upsertAdminProduct
} from "@/server/admin/repository";
import { adminListQuerySchema, adminProductSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });

  const result = await listAdminProducts(query);
  const lookupOptions = await getProductLookupOptions();

  return NextResponse.json({
    ok: true,
    ...result,
    lookupOptions
  });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const payload = adminProductSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const product = await upsertAdminProduct(payload, authenticatedAdmin.session, requestMeta);

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
