import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  addCustomerAddress,
  customerAddressSchema
} from "@/server/customer/account-repository";

export async function POST(request: Request) {
  try {
    const payload = customerAddressSchema.parse(await request.json());
    const address = await addCustomerAddress(payload);

    if (!address) {
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
      address
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Lütfen adres alanlarını kontrol edin."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Adres kaydedilirken beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
