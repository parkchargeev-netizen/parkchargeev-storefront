import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminUserSessions } from "@/server/admin/repository";
import { adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
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
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const query = parseListQuery(request);
  const result = await listAdminUserSessions(query);

  if (query.format === "csv") {
    return csvResponse("admin-sessions.csv", result.items, [
      { header: "Admin", value: (item) => item.adminName },
      { header: "E-posta", value: (item) => item.adminEmail },
      { header: "IP", value: (item) => item.ipAddress },
      { header: "Son gorulme", value: (item) => item.lastSeenAt },
      { header: "Bitis", value: (item) => item.expiresAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
