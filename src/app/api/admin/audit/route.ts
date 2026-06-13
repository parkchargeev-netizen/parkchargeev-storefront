import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminAuditLogs } from "@/server/admin/repository";
import { adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

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
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const query = parseListQuery(request);
  const result = await listAdminAuditLogs(query);

  if (query.format === "csv") {
    return csvResponse("audit-logs.csv", result.items, [
      { header: "Aktör", value: (item) => item.actorEmail },
      { header: "Varlik", value: (item) => item.entityType },
      { header: "Varlik ID", value: (item) => item.entityId },
      { header: "Aksiyon", value: (item) => item.action },
      { header: "Özet", value: (item) => item.summary },
      { header: "Tarih", value: (item) => item.createdAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
