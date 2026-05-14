import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CustomerAuthPanel } from "@/components/customer/customer-auth-panel";
import { getCustomerAccountSnapshot } from "@/server/customer/auth";

export const metadata: Metadata = {
  title: "Müşteri Girişi",
  description: "Siparişlerinizi, cihazlarınızı ve servis taleplerinizi yönetin."
};

export default async function LoginPage() {
  const snapshot = await getCustomerAccountSnapshot();

  if (snapshot) {
    redirect("/hesabim");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <CustomerAuthPanel />
    </div>
  );
}
