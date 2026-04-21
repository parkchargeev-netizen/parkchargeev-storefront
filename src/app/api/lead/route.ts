import { NextResponse } from "next/server";
import { z } from "zod";

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

    /*
      TODO:
      1. customers veya service_leads tablosuna yaz
      2. CRM / e-posta / WhatsApp bilgilendirme akışını tetikle
      3. lead source bilgisini request headers / utm alanlarından zenginleştir
      4. spam ve rate limit katmanı ekle
    */

    return NextResponse.json({
      ok: true,
      message: `${body.fullName} için talep kaydı oluşturuldu. Ekip en kısa sürede dönüş yapacak.`
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Talep işlenirken beklenmeyen bir hata oluştu."
      },
      { status: 400 }
    );
  }
}
