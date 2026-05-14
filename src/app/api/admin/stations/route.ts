import { NextResponse } from "next/server";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { listAdminStations, saveAdminStation } from "@/server/admin/stations";
import { adminStationSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "operations", "technician"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const items = await listAdminStations({
    q: searchParams.get("q") ?? undefined
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  try {
    const authenticatedAdmin = await requireAdminRole(["superadmin", "operations"]);

    if (!authenticatedAdmin) {
      return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
    }

    const payload = adminStationSchema.parse(await request.json());
    const requestMeta = await getRequestMeta();
    const station = await saveAdminStation(payload, authenticatedAdmin.session, requestMeta);

    return NextResponse.json({ ok: true, station });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), { status: 503 });
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "İstasyon kaydedilirken beklenmeyen bir hata oluştu."
      },
      { status: 400 }
    );
  }
}
