import { NextResponse } from "next/server";

import { getCustomerAccountSnapshot } from "@/server/customer/account-repository";

export async function GET() {
  const snapshot = await getCustomerAccountSnapshot();

  if (!snapshot) {
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
      id: snapshot.customer.id,
      email: snapshot.customer.email,
      firstName: snapshot.customer.firstName,
      lastName: snapshot.customer.lastName,
      phone: snapshot.customer.phone
    },
    addresses: snapshot.addresses,
    recentOrders: snapshot.recentOrders,
    recentQuoteRequests: snapshot.recentQuoteRequests,
    recentServiceLeads: snapshot.recentServiceLeads
  });
}
