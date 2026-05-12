import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminUsers, upsertAdminUser } from "@/server/admin/repository";
import { adminListQuerySchema, adminUserSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const query = parseListQuery(request);
  const result = await listAdminUsers(query);

  if (query.format === "csv") {
    return csvResponse("admin-users.csv", result.items, [
      { header: "Ad", value: (item) => item.fullName },
      { header: "E-posta", value: (item) => item.email },
      { header: "Rol", value: (item) => item.role },
      { header: "Durum", value: (item) => item.status },
      { header: "Son giris", value: (item) => item.lastLoginAt },
      { header: "Guncelleme", value: (item) => item.updatedAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const payload = adminUserSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const adminUser = await upsertAdminUser(payload, authenticatedAdmin.session, requestMeta);

  return NextResponse.json({ ok: true, adminUser }, { status: 201 });
}
