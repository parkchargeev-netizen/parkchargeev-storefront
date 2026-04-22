import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { serviceLeads } from "@/server/db/schema";

const leadSchema = z.object({
  fullName: z.string().min(3),
  company: z.string().optional().or(z.literal("")),
  email: z.string().email(),
  phone: z.string().min(10),
  city: z.string().min(2),
  reason: z.string().min(3),
  message: z.string().min(10),
  privacyConsent: z.string().refine((value) => value === "true")
});

export async function POST(request: Request) {
  try {
    const body = leadSchema.parse(await request.json());
    const db = getDb();

    await db.insert(serviceLeads).values({
      leadType: body.reason,
      projectType: body.reason,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      city: body.city,
      message: body.message,
      payload: {
        company: body.company || null,
        privacyConsent: true
      }
    });

    return NextResponse.json({
      ok: true,
      message: `${body.fullName} için talep kaydı oluşturuldu. Ekip en kısa sürede dönüş yapacak.`
    });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    const status = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Talep işlenirken beklenmeyen bir hata oluştu."
      },
      { status }
    );
  }
}
