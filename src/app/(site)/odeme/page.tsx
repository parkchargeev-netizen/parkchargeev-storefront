import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/shop/checkout-page-client";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "PayTR ile güvenli ödeme adımı."
};

type CheckoutPageProps = {
  searchParams: Promise<{
    status?: string;
    oid?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { status, oid } = await searchParams;

  return <CheckoutPageClient initialStatus={status} initialMerchantOid={oid} />;
}
