import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  customerProfileUpdateSchema,
  updateCustomerProfile
} from "@/server/customer/account-repository";

export async function PATCH(request: Request) {
  try {
    const payload = customerProfileUpdateSchema.parse(await request.json());
    const customer = await updateCustomerProfile(payload);

    if (!customer) {
      return NextResponse.json(
        {
          ok: false,
          message: "Müşteri oturumu bulunamadı."
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        marketingConsent: customer.marketingConsent
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Lütfen profil alanlarını kontrol edin."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Profil güncellenirken beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
