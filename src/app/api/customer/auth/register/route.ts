import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  customerRegisterSchema,
  registerCustomer,
  setCustomerSessionCookie
} from "@/server/customer/auth";
import {
  consumeCustomerAuthAttempt,
  getCustomerAuthRateLimitKey
} from "@/server/customer/auth-rate-limit";

export async function POST(request: Request) {
  try {
    const payload = customerRegisterSchema.parse(await request.json());
    const rateLimit = consumeCustomerAuthAttempt(
      getCustomerAuthRateLimitKey(request, "register", payload.email),
      5
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla kayıt denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const result = await registerCustomer(payload);

    if (!result?.customer) {
      return NextResponse.json(
        {
          ok: false,
          message: "Müşteri kaydı için veritabanı bağlantısı gerekiyor."
        },
        { status: 503 }
      );
    }

    if (result.alreadyRegistered) {
      return NextResponse.json(
        {
          ok: false,
          message: "Bu e-posta adresiyle kayıt var. Giriş yapabilirsiniz."
        },
        { status: 409 }
      );
    }

    await setCustomerSessionCookie({
      sub: result.customer.id,
      email: result.customer.email,
      name:
        `${result.customer.firstName ?? ""} ${result.customer.lastName ?? ""}`.trim() ||
        result.customer.email
    });

    return NextResponse.json({
      ok: true,
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        firstName: result.customer.firstName,
        lastName: result.customer.lastName
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Lütfen kayıt formundaki alanları kontrol edin."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Müşteri kaydı sırasında beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
