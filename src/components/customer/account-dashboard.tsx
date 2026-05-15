import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  Headphones,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Zap
} from "lucide-react";

import { AccountActionForms } from "@/components/customer/account-action-forms";
import {
  type AccountSnapshot,
  getActionItems,
  getOpenOrders,
  getProfileScore
} from "@/components/customer/account-view-model";
import { CustomerLogoutButton } from "@/components/customer/customer-logout-button";
import { OrdersSection } from "@/components/customer/orders-section";
import { RequestsPanel } from "@/components/customer/requests-panel";

export function AccountDashboard({ snapshot }: { snapshot: AccountSnapshot }) {
  const { customer, addresses, recentOrders } = snapshot;
  const fullName = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
  const openOrders = getOpenOrders(recentOrders);
  const profileScore = getProfileScore(snapshot);
  const actionItems = getActionItems(snapshot);
  const openRequests =
    snapshot.recentQuoteRequests.filter((request) => request.status !== "lost").length +
    snapshot.recentServiceLeads.filter((lead) => !["won", "lost"].includes(lead.status)).length;
  const accountNavItems = [
    { href: "#genel", label: "Genel", icon: Home },
    { href: "#siparisler", label: "Siparişler", icon: Package },
    { href: "#profil", label: "Profil", icon: CreditCard },
    { href: "#adresler", label: "Adresler", icon: MapPin },
    { href: "#destek", label: "Teklif ve servis", icon: Headphones },
    { href: "#guvenlik", label: "Güvenlik", icon: ShieldCheck }
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr_340px] lg:px-8">
      <aside className="surface-card h-fit p-5 lg:sticky lg:top-24">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Müşteri paneli
        </p>
        <nav className="mt-6 grid gap-2" aria-label="Müşteri paneli">
          {accountNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="mt-6">
          <CustomerLogoutButton />
        </div>
      </aside>

      <main id="genel" className="space-y-6">
        <header className="surface-card p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Hoş geldiniz
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.06em] text-on-surface md:text-5xl">
                {fullName || customer.email}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                Sipariş, iade, fatura, kurulum adresi, teklif ve servis süreçlerini tek güvenli
                panelden yönetin.
              </p>
            </div>
            <Link
              href="/urun-secici"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Doğru cihazı seç
              <Zap className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Açık sipariş", openOrders.length],
            ["Adres", addresses.length],
            ["Açık talep", openRequests],
            ["Profil", `%${profileScore}`]
          ].map(([label, value]) => (
            <div key={label} className="surface-card p-5">
              <p className="text-sm text-on-surface-variant">{label}</p>
              <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="surface-card p-6 lg:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                Bugünün aksiyonları
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Panel, açık sipariş ve eksik profil bilgilerine göre öncelikli adımları çıkarır.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {actionItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="grid gap-3 rounded-[24px] bg-surface-container-low p-5 transition hover:bg-surface-container md:grid-cols-[1fr_auto] md:items-center"
              >
                <span>
                  <span className="block font-semibold text-on-surface">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                    {item.detail}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-primary" />
              </a>
            ))}
          </div>
        </section>

        <OrdersSection orders={recentOrders} />
        <RequestsPanel snapshot={snapshot} />
        <AccountActionForms customer={customer} addresses={addresses} />
      </main>

      <aside className="space-y-6">
        <section className="surface-card p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
            Güvenlik özeti
          </h2>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-on-surface-variant">
            {[
              "httpOnly müşteri oturumu",
              "SameSite cookie koruması",
              "No-store ve noindex başlıkları",
              "Profil ve adres işlemlerinde oturum kontrolü"
            ].map((item) => (
              <div key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
            Hızlı işlemler
          </h2>
          <div className="mt-5 grid gap-2">
            {[
              { href: "/magaza", label: "Ürünlere dön", icon: Package },
              { href: "/karsilastir", label: "Ürün karşılaştır", icon: FileText },
              { href: "/iletisim?konu=kurulum", label: "Kurulum desteği", icon: Headphones }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-4 text-sm font-semibold text-on-surface transition hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
