import { NextResponse } from "next/server";

import {
  getAdminServiceLeadById,
  updateAdminServiceLead
} from "@/server/admin/repository";
import { adminServiceLeadUpdateSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type ServiceLeadRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ServiceLeadRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "operations", "technician"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const lead = await getAdminServiceLeadById(id);

  if (!lead) {
    return NextResponse.json({ ok: false, message: "Saha talebi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function PATCH(request: Request, { params }: ServiceLeadRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "operations", "technician"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  const { id } = await params;
  const payload = adminServiceLeadUpdateSchema.parse(await request.json());
  const requestMeta = await getRequestMeta();
  const lead = await updateAdminServiceLead(id, payload, authenticatedAdmin.session, requestMeta);

  if (!lead) {
    return NextResponse.json({ ok: false, message: "Saha talebi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}
