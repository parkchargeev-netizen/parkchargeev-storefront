import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  customerLoginSchema,
  expireCustomerSessionCookie,
  loginCustomer,
  setCustomerSessionCookie
} from "@/server/customer/auth";
import {
  consumeCustomerAuthAttempt,
  getCustomerAuthRateLimitKey
} from "@/server/customer/auth-rate-limit";

function failedLoginResponse(message: string, status: number, headers?: HeadersInit) {
  return expireCustomerSessionCookie(
    NextResponse.json(
      {
        ok: false,
        message
      },
      {
        status,
        headers
      }
    )
  );
}

export async function POST(request: Request) {
  try {
    const payload = customerLoginSchema.parse(await request.json());

    const rateLimit = consumeCustomerAuthAttempt(
      getCustomerAuthRateLimitKey(request, "login", payload.email)
    );

    if (!rateLimit.allowed) {
      return failedLoginResponse(
        "Çok fazla giriş denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.",
        429,
        {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      );
    }

    const customer = await loginCustomer(payload);

    if (!customer) {
      return failedLoginResponse("E-posta veya şifre hatalı.", 401);
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
      return failedLoginResponse("Lütfen e-posta ve şifre alanlarını kontrol edin.", 400);
    }

    return failedLoginResponse("Müşteri girişi sırasında beklenmeyen bir hata oluştu.", 500);
  }
}
