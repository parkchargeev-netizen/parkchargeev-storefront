import { NextResponse } from "next/server";

import { requireAdminRole } from "@/server/auth/guards";

export async function GET() {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message: "Oturum bulunamadi."
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    admin: {
      id: authenticatedAdmin.admin.id,
      email: authenticatedAdmin.admin.email,
      fullName: authenticatedAdmin.admin.fullName,
      role: authenticatedAdmin.admin.role
    }
  });
}
