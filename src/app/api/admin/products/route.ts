import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
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
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });

  const result = await listAdminProducts(query);
  const lookupOptions = await getProductLookupOptions();

  if (query.format === "csv") {
    return csvResponse("products.csv", result.items, [
      { header: "Urun", value: (item) => item.name },
      { header: "Slug", value: (item) => item.slug },
      { header: "Durum", value: (item) => item.status },
      { header: "Fiyat", value: (item) => item.defaultVariant?.priceKurus ?? item.defaultPriceKurus },
      { header: "Stok", value: (item) => item.defaultVariant?.stockQuantity ?? 0 },
      { header: "Kategoriler", value: (item) => item.categories.join(", ") },
      { header: "Guncelleme", value: (item) => item.updatedAt }
    ]);
  }

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

  if (!product) {
    return NextResponse.json(
      { ok: false, message: "Ürün oluşturulamadı." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
