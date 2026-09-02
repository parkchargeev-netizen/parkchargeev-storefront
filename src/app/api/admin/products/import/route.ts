import { NextResponse } from "next/server";

import type { ProductImportPreviewRow } from "@/lib/admin-product-import-contract";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import {
  confirmProductImport,
  getProductImportTemplateCsv,
  listProductImportHistory,
  normalizeImportFields,
  previewProductImport,
  ProductImportError
} from "@/server/admin/product-import";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
}

function productImportErrorResponse(error: ProductImportError) {
  return NextResponse.json(
    {
      ok: false,
      message: error.message,
      details: error.details
    },
    { status: 400 }
  );
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);

  if (searchParams.get("history") === "1") {
    return NextResponse.json({ ok: true, history: await listProductImportHistory() });
  }

  return new Response(getProductImportTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"'
    }
  });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const selectedFields = normalizeImportFields(["price"]);

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "CSV veya XLSX dosyasi secin." },
        { status: 400 }
      );
    }

    const preview = await previewProductImport({
      fileName: file.name,
      mimeType: file.type,
      buffer: Buffer.from(await file.arrayBuffer()),
      selectedFields
    });

    return NextResponse.json(preview);
  } catch (error) {
    if (error instanceof ProductImportError) {
      return productImportErrorResponse(error);
    }

    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), { status: 503 });
    }

    throw error;
  }
}

export async function PATCH(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return unauthorizedResponse();
  }

  try {
    const payload = (await request.json()) as {
      fileName?: string;
      selectedFields?: unknown;
      rows?: ProductImportPreviewRow[];
    };
    const selectedFields = normalizeImportFields(["price"]);

    if (!payload.fileName || !Array.isArray(payload.rows)) {
      return NextResponse.json(
        { ok: false, message: "Onay icin gecersiz import verisi." },
        { status: 400 }
      );
    }

    const requestMeta = await getRequestMeta();
    const result = await confirmProductImport({
      fileName: payload.fileName,
      selectedFields,
      rows: payload.rows,
      actor: authenticatedAdmin.session,
      requestMeta
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProductImportError) {
      return productImportErrorResponse(error);
    }

    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), { status: 503 });
    }

    throw error;
  }
}
