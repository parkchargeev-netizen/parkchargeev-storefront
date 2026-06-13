import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminQuotes } from "@/server/admin/repository";
import { adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });

  const result = await listAdminQuotes(query);

  if (query.format === "csv") {
    return csvResponse("quotes.csv", result.items, [
      { header: "Ad", value: (item) => item.fullName },
      { header: "Sirket", value: (item) => item.companyName },
      { header: "Telefon", value: (item) => item.phone },
      { header: "Segment", value: (item) => item.segment },
      { header: "Durum", value: (item) => item.status },
      { header: "Atanan", value: (item) => item.assignedAdminName },
      { header: "Tarih", value: (item) => item.createdAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
