import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AccountDashboard } from "@/components/customer/account-dashboard";
import { getCustomerAccountSnapshot } from "@/server/customer/account-repository";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Profil, adres, sipariş, teklif, servis ve güvenlik ayarlariniz.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPage() {
  const snapshot = await getCustomerAccountSnapshot();

  if (!snapshot) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">
          Müşteri paneli
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
          Hesabinizi görüntülemek için giris yapin
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
          Siparişler, fatura talepleri, kurulum adresleri ve servis kayıtları güvenli müşteri
          oturumu ile gosterilir.
        </p>
        <Link
          href="/giris"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-black text-white"
        >
          Müşteri girisine git
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return <AccountDashboard snapshot={snapshot} />;
}
