import { NextResponse } from "next/server";

import {
  clearCustomerSessionCookie,
  expireCustomerSessionCookie
} from "@/server/customer/auth";

export async function POST() {
  await clearCustomerSessionCookie();

  return expireCustomerSessionCookie(NextResponse.json({ ok: true }));
}
