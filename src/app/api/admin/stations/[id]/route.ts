import { NextResponse } from "next/server";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { saveAdminStation } from "@/server/admin/stations";
import { adminStationSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type StationRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: StationRouteProps) {
  try {
    const authenticatedAdmin = await requireAdminRole(["superadmin", "operations"]);

    if (!authenticatedAdmin) {
      return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;
    const payload = adminStationSchema.parse({
      ...(await request.json()),
      id
    });
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
            : "İstasyon güncellenirken beklenmeyen bir hata oluştu."
      },
      { status: 400 }
    );
  }
}
