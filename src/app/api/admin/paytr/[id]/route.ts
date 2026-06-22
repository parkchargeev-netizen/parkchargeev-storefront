import { NextResponse } from "next/server";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import {
  PaytrReconciliationError,
  runAdminPaytrOperation
} from "@/server/admin/order-repository";
import { adminPaytrOperationSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type PaytrRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: PaytrRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const payload = adminPaytrOperationSchema.parse(await request.json());
    const requestMeta = await getRequestMeta();
    const order = await runAdminPaytrOperation(id, payload, authenticatedAdmin.session, requestMeta);

    if (!order) {
      return NextResponse.json({ ok: false, message: "PayTR kaydı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    if (error instanceof PaytrReconciliationError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    throw error;
  }
}
