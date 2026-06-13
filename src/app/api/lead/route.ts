import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { logError } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { quoteRequests, serviceLeads } from "@/server/db/schema";

const leadSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı."),
  company: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Geçerli bir e-posta adresi yazın."),
  phone: z.string().trim().min(10, "Telefon numarası en az 10 haneli olmalı."),
  city: z.string().trim().min(2, "Lütfen ilinizi belirtin."),
  reason: z.string().trim().min(3, "Lütfen talep tipini seçin."),
  message: z.string().trim().min(10, "İhtiyaç özeti en az 10 karakter olmalı."),
  privacyConsent: z
    .string()
    .refine((value) => value === "true", "İletişim iznini onaylamanız gerekiyor.")
});

function getQuoteSegment(reason: string) {
  const normalized = reason.toLocaleLowerCase("tr-TR");

  if (normalized.includes("site") || normalized.includes("apartman")) {
    return "site_apartment" as const;
  }

  if (normalized.includes("filo") || normalized.includes("otopark")) {
    return "fleet" as const;
  }

  if (
    normalized.includes("iş yeri") ||
    normalized.includes("is yeri") ||
    normalized.includes("ofis") ||
    normalized.includes("kurumsal")
  ) {
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
      logError("lead.create.runtime_configuration", error);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Talep sistemi geçici olarak kullanılamıyor. Lütfen kısa süre sonra yeniden deneyin."
        },
        { status: 503 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            error.issues[0]?.message ??
            "Formdaki eksik veya hatalı alanları kontrol edip yeniden deneyin."
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Gönderilen form bilgileri okunamadı. Lütfen yeniden deneyin."
        },
        { status: 400 }
      );
    }

    logError("lead.create.failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Talep kaydedilirken beklenmeyen bir sorun oluştu. Lütfen kısa süre sonra yeniden deneyin."
      },
      { status: 500 }
    );
  }
}
