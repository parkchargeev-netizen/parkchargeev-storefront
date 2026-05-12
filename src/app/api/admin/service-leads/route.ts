import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminServiceLeads } from "@/server/admin/repository";
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
  const authenticatedAdmin = await requireAdminRole(["superadmin", "operations", "technician"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const query = parseListQuery(request);
  const result = await listAdminServiceLeads(query);

  if (query.format === "csv") {
    return csvResponse("service-leads.csv", result.items, [
      { header: "Ad", value: (item) => item.fullName },
      { header: "Telefon", value: (item) => item.phone },
      { header: "E-posta", value: (item) => item.email },
      { header: "Tip", value: (item) => item.leadType },
      { header: "Durum", value: (item) => item.status },
      { header: "Sehir", value: (item) => item.city },
      { header: "Tarih", value: (item) => item.createdAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
