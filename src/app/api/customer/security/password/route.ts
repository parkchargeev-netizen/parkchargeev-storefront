import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  changeCustomerPassword,
  customerPasswordChangeSchema
} from "@/server/customer/account-repository";

export async function POST(request: Request) {
  try {
    const payload = customerPasswordChangeSchema.parse(await request.json());
    const result = await changeCustomerPassword(payload);

    if (result === null) {
      return NextResponse.json(
        {
          ok: false,
          message: "Müşteri oturumu bulunamadı."
        },
        { status: 401 }
      );
    }

    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          message: "Mevcut şifre hatalı."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Yeni şifre en az 10 karakter, bir harf ve bir rakam içermeli."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Şifre değiştirilirken beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
