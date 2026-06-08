import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  Cable,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Headphones,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Wrench,
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
import { serviceCoverageSummary } from "@/lib/service-coverage";

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
  const journeyCards = [
    {
      title: "Doğru ürünü seç",
      detail: "Ev, site, işletme veya aksesuar ihtiyacına göre ürün seçiciye gidin.",
      href: "/urun-secici",
      icon: Zap
    },
    {
      title: "Hizmet kapsamını kontrol et",
      detail: `${serviceCoverageSummary.freeSurvey}; ${serviceCoverageSummary.installation}.`,
      href: `/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`,
      icon: MapPin
    },
    {
      title: "Teklif ve keşif akışını izle",
      detail: "Site/apartman, ofis ve kurulum talepleriniz bu panelde görünür.",
      href: "#destek",
      icon: ClipboardCheck
    },
    {
      title: "Kurulum sonrası destek al",
      detail: "Garanti, servis ve bakım taleplerinizi tek kayıtta takip edin.",
      href: `/iletisim?konu=${encodeURIComponent("Teknik servis ve bakım")}`,
      icon: Wrench
    }
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
                Ürün seçimi, şehir kapsamı, sipariş, kurulum adresi, teklif ve servis süreçlerini tek güvenli panelden yönetin.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[serviceCoverageSummary.freeSurvey, serviceCoverageSummary.installation].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/urun-secici"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Doğru cihazı seç
                <Zap className="h-4 w-4" />
              </Link>
              <Link
                href={`/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white px-5 py-3 text-sm font-semibold text-primary"
              >
                Sakarya keşfi
                <MapPin className="h-4 w-4" />
              </Link>
            </div>
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
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-secondary">
              <Cable className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                Şarj yol haritanız
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Yeni EV sahibi, site yöneticisi veya işletme kullanıcısı olun; doğru adım bu panelde netleşir.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {journeyCards.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] bg-surface-container-low p-5 transition hover:bg-surface-container"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-4 font-black text-on-surface">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.detail}</p>
                </a>
              );
            })}
          </div>
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
            Hizmet kapsamı
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              {
                label: "Ücretsiz keşif",
                value: "Sakarya",
                detail: "Saha ziyareti ve ön değerlendirme Sakarya için planlanır.",
                icon: MapPin
              },
              {
                label: "Kurulum",
                value: "Sakarya + Kocaeli",
                detail: "Montaj, devreye alma ve saha planı bu iki şehir için yürütülür.",
                icon: Building2
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-on-surface">{item.label}</p>
                      <p className="mt-1 text-lg font-black text-primary">{item.value}</p>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
              {
                href: `/iletisim?konu=${encodeURIComponent("Ev tipi kurulum talebi")}`,
                label: "Kurulum desteği",
                icon: Headphones
              }
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
