import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  customerLoginSchema,
  loginCustomer,
  setCustomerSessionCookie
} from "@/server/customer/auth";
import {
  consumeCustomerAuthAttempt,
  getCustomerAuthRateLimitKey
} from "@/server/customer/auth-rate-limit";

export async function POST(request: Request) {
  try {
    const payload = customerLoginSchema.parse(await request.json());
    const rateLimit = consumeCustomerAuthAttempt(
      getCustomerAuthRateLimitKey(request, "login", payload.email)
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla giriş denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const customer = await loginCustomer(payload);

    if (!customer) {
      return NextResponse.json(
        {
          ok: false,
          message: "E-posta veya şifre hatalı."
        },
        { status: 401 }
      );
    }

    await setCustomerSessionCookie({
      sub: customer.id,
      email: customer.email,
      name: `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || customer.email
    });

    return NextResponse.json({
      ok: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Lütfen e-posta ve şifre alanlarını kontrol edin."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Müşteri girişi sırasında beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
