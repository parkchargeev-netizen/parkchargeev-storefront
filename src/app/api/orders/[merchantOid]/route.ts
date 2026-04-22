import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { orders, paytrTransactions } from "@/server/db/schema";

type OrderStatusRouteProps = {
  params: Promise<{
    merchantOid: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: OrderStatusRouteProps
) {
  try {
    const { merchantOid } = await params;
    const db = getDb();

    const [order] = await db
      .select({
        status: orders.status,
        paymentStatus: orders.paymentStatus
      })
      .from(orders)
      .where(eq(orders.merchantOid, merchantOid))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          message: "Sipariş bulunamadı."
        },
        { status: 404 }
      );
    }

    const [transaction] = await db
      .select({
        status: paytrTransactions.status
      })
      .from(paytrTransactions)
      .where(eq(paytrTransactions.merchantOid, merchantOid))
      .limit(1);

    return NextResponse.json({
      ok: true,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      transactionStatus: transaction?.status ?? null
    });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Sipariş durumu alınırken beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
