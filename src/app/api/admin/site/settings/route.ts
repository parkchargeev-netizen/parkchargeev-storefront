import { NextResponse } from "next/server";

import {
  getAdminSiteSettings,
  upsertAdminSiteSettings
} from "@/server/admin/site-management";
import { adminSiteSettingsSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const settings = await getAdminSiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = adminSiteSettingsSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const settings = await upsertAdminSiteSettings(
    payload,
    authenticatedAdmin.session,
    requestMeta
  );

  if (!settings) {
    return NextResponse.json(
      { ok: false, message: "Site ayarları kaydedilemedi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, settings });
}
