import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { quoteRequests, serviceLeads } from "@/server/db/schema";

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

function getQuoteSegment(reason: string) {
  const normalized = reason.toLocaleLowerCase("tr-TR");

  if (normalized.includes("site") || normalized.includes("apartman")) {
    return "site_apartment" as const;
  }

  if (normalized.includes("filo") || normalized.includes("otopark")) {
    return "fleet" as const;
  }

  if (normalized.includes("is yeri") || normalized.includes("ofis") || normalized.includes("kurumsal")) {
    return "business" as const;
  }

  return "individual" as const;
}

function isServiceLead(reason: string) {
  const normalized = reason.toLocaleLowerCase("tr-TR");
  return normalized.includes("servis") || normalized.includes("bakim") || normalized.includes("destek");
}

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

    if (!isServiceLead(body.reason)) {
      await db.insert(quoteRequests).values({
        fullName: body.fullName,
        companyName: body.company || null,
        segment: getQuoteSegment(body.reason),
        email: body.email,
        phone: body.phone,
        city: body.city,
        estimatedLocation: body.city,
        requestNotes: body.message,
        source: "website-contact-form",
        metadata: {
          reason: body.reason,
          privacyConsent: true
        }
      });
    }

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
