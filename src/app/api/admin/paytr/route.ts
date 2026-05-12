import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminPaytrTransactions } from "@/server/admin/repository";
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
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const query = parseListQuery(request);
  const result = await listAdminPaytrTransactions(query);

  if (query.format === "csv") {
    return csvResponse("paytr-transactions.csv", result.items, [
      { header: "Merchant OID", value: (item) => item.merchantOid },
      { header: "Siparis", value: (item) => item.orderNumber },
      { header: "Durum", value: (item) => item.status },
      { header: "Odeme", value: (item) => item.paymentStatus },
      { header: "Tutar", value: (item) => item.paymentAmountKurus },
      { header: "Tarih", value: (item) => item.createdAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
