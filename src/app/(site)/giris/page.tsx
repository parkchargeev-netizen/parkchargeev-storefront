import type { Metadata } from "next";

import { CustomerAuthPanel } from "@/components/customer/customer-auth-panel";

export const metadata: Metadata = {
  title: "Müşteri Girişi",
  description: "Siparişlerinizi, cihazlarınızı ve servis taleplerinizi yönetin.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function LoginPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8" data-motion-scope>
      <CustomerAuthPanel />
    </main>
  );
}
