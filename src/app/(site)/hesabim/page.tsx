import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { AccountDashboard } from "@/components/customer/account-dashboard";
import { ActionLink } from "@/components/ui/action";
import { PageHeader } from "@/components/ui/page-header";
import { getCustomerAccountSnapshot } from "@/server/customer/account-repository";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Profil, adres, sipariş, teklif, servis ve güvenlik ayarlarınız.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPage() {
  const snapshot = await getCustomerAccountSnapshot();

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <PageHeader
          align="center"
          eyebrow="Müşteri paneli"
          title="Hesabınızı görüntülemek için giriş yapın"
          body="Siparişler, fatura talepleri, kurulum adresleri ve servis kayıtları güvenli müşteri oturumu ile gösterilir."
          actions={
            <ActionLink
              href="/giris"
              className="mt-4"
            >
              Müşteri girişine git
              <ArrowRight className="h-4 w-4" />
            </ActionLink>
          }
        />
      </main>
    );
  }

  return <AccountDashboard snapshot={snapshot} />;
}
