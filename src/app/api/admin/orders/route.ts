import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { listAdminOrders } from "@/server/admin/order-repository";
import { adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

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
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });

  const result = await listAdminOrders(query);

  if (query.format === "csv") {
    return csvResponse("orders.csv", result.items, [
      { header: "Siparis", value: (item) => item.orderNumber },
      { header: "Musteri", value: (item) => item.customerName },
      { header: "E-posta", value: (item) => item.customerEmail },
      { header: "Durum", value: (item) => item.status },
      { header: "Odeme", value: (item) => item.paymentStatus },
      { header: "Toplam", value: (item) => item.totalKurus },
      { header: "Tarih", value: (item) => item.createdAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}
