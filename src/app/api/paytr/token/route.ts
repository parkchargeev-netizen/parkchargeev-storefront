import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { buildPaytrIframePayload } from "@/lib/paytr";
import { absoluteUrl } from "@/lib/site";

const tokenRequestSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userAddress: z.string().min(5),
  userPhone: z.string().min(10),
  paymentAmountKurus: z.number().int().positive(),
  items: z.array(
    z.object({
      title: z.string().min(1),
      unitPrice: z.string().min(1),
      quantity: z.number().int().positive()
    })
  )
});

export async function POST(request: Request) {
  try {
    const body = tokenRequestSchema.parse(await request.json());
    const forwardedFor = request.headers.get("x-forwarded-for");
    const userIp = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";

    const payload = buildPaytrIframePayload({
      email: body.email,
      paymentAmountKurus: body.paymentAmountKurus,
      userIp,
      userName: body.userName,
      userAddress: body.userAddress,
      userPhone: body.userPhone,
      okUrl: absoluteUrl("/odeme?status=success"),
      failUrl: absoluteUrl("/odeme?status=failed"),
      items: body.items,
      merchantOid: `PCEV-${randomUUID()}`
    });

    const formData = new URLSearchParams(payload);

    const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
      cache: "no-store"
    });

    const result = (await response.json()) as
      | { status: "success"; token: string }
      | { status: "failed"; reason?: string };

    if (result.status !== "success") {
      return NextResponse.json(
        {
          ok: false,
          message: "PayTR token alınamadı.",
          details: result
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      iframeToken: result.token,
      merchantOid: payload.merchant_oid
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}

