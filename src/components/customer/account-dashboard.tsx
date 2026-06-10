import Link from "next/link";
import type { ReactNode } from "react";
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
  Truck,
  UserRound,
  Wrench,
  Zap
} from "lucide-react";

import { AccountActionForms } from "@/components/customer/account-action-forms";
import {
  type AccountSnapshot,
  getActionItems,
  getCustomerPanelStage,
  getCustomerSegmentLabel,
  getOpenOrders,
  getProfileScore
} from "@/components/customer/account-view-model";
import { CustomerLogoutButton } from "@/components/customer/customer-logout-button";
import { OrdersSection } from "@/components/customer/orders-section";
import { RequestsPanel } from "@/components/customer/requests-panel";
import {
  customerSelfServiceCards,
  customerTrustTimeline
} from "@/lib/panel-experience";
import { serviceCoverageSummary } from "@/lib/service-coverage";

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return email?.slice(0, 2).toUpperCase() ?? "PC";
}

function PanelMetric({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-on-surface">{value}</p>
        </div>
        <span className="rounded-2xl bg-primary/10 p-2 text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{detail}</p>
    </div>
  );
}

export function AccountDashboard({ snapshot }: { snapshot: AccountSnapshot }) {
  const { customer, addresses, recentOrders } = snapshot;
  const fullName = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
  const initials = getInitials(customer.firstName, customer.lastName, customer.email);
  const openOrders = getOpenOrders(recentOrders);
  const profileScore = getProfileScore(snapshot);
  const actionItems = getActionItems(snapshot);
  const currentStage = getCustomerPanelStage(snapshot);
  const customerSegment = getCustomerSegmentLabel(snapshot);
  const openRequests =
    snapshot.recentQuoteRequests.filter((request) => request.status !== "lost").length +
    snapshot.recentServiceLeads.filter((lead) => !["won", "lost"].includes(lead.status)).length;
  const accountNavItems = [
    { href: "#genel", label: "Genel", icon: Home },
    { href: "#siparisler", label: "Siparisler", icon: Package },
    { href: "#destek", label: "Teklif ve servis", icon: Headphones },
    { href: "#profil", label: "Profil", icon: UserRound },
    { href: "#adresler", label: "Adresler", icon: MapPin },
    { href: "#guvenlik", label: "Guvenlik", icon: ShieldCheck }
  ];
  const journeyCards = [
    {
      title: "Dogru urunu sec",
      detail: "Arac, kullanim alani ve altyapiya gore wallbox veya aksesuar secin.",
      href: "/urun-secici",
      icon: Zap
    },
    {
      title: "Hizmet kapsamni gor",
      detail: "81 il kargo, Sakarya kesif, Sakarya + Kocaeli kurulum bilgisini kontrol edin.",
      href: "/hizmetler",
      icon: Truck
    },
    {
      title: "Teklif ve kesfi izle",
      detail: "Site, ofis ve kurulum talepleriniz destek alaninda listelenir.",
      href: "#destek",
      icon: ClipboardCheck
    },
    {
      title: "Servis destegi al",
      detail: "Garanti, bakim ve teknik destek icin hizli talep olusturun.",
      href: `/iletisim?konu=${encodeURIComponent("Teknik servis ve bakim")}`,
      icon: Wrench
    }
  ];
  const accountFlowCards = [
    {
      label: "1. Ihtiyaci sec",
      detail: "Ev, site, isletme veya aksesuar ihtiyacina gore urun secici ya da magazaya gidin.",
      href: "/urun-secici",
      icon: Zap
    },
    {
      label: "2. Sureci takip et",
      detail: "Siparis, kargo, teklif, kesif ve servis taleplerinizi tek ekrandan izleyin.",
      href: "#siparisler",
      icon: ClipboardCheck
    },
    {
      label: "3. Eksigi tamamla",
      detail: "Telefon, adres ve destek talepleri tamamlandikca operasyon daha hizli ilerler.",
      href: "#profil",
      icon: UserRound
    }
  ];

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <section className="surface-card overflow-hidden p-5">
          <div className="rounded-[26px] bg-[#063326] p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-sm font-black">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{fullName || customer.email}</p>
                <p className="truncate text-xs text-white/60">{customer.email}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                Musteri segmenti
              </p>
              <p className="mt-2 text-sm font-black">{customerSegment}</p>
            </div>
          </div>

          <nav className="mt-5 grid gap-2" aria-label="Musteri paneli">
            {accountNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-5">
            <CustomerLogoutButton />
          </div>
        </section>

        <section className="surface-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
            Hizli islemler
          </p>
          <div className="mt-4 grid gap-2">
            {[
              { href: "/magaza", label: "Magazaya git", icon: Package },
              { href: "/urun-secici", label: "Urun secici", icon: Zap },
              { href: "/karsilastir", label: "Karsilastir", icon: FileText },
              {
                href: `/iletisim?konu=${encodeURIComponent("Kurulum destegi")}`,
                label: "Kurulum destegi",
                icon: Headphones
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface transition hover:bg-surface-container hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>
      </aside>

      <main id="genel" className="min-w-0 space-y-6">
        <header className="surface-card overflow-hidden p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">
                Musteri hesap merkezi
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.05em] text-on-surface md:text-5xl">
                {fullName ? `Merhaba ${fullName}` : "Hesabiniz hazir"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                Siparis, teklif, kesif, kurulum adresi ve servis desteklerinizi tek panelden takip
                edin. Urunler 81 ile kargo; ucretsiz kesif Sakarya, kurulum Sakarya ve Kocaeli
                odaklidir.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  serviceCoverageSummary.shipping,
                  serviceCoverageSummary.freeSurvey,
                  serviceCoverageSummary.installation
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/urun-secici"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
                >
                  Dogru cihazi sec
                  <Zap className="h-4 w-4" />
                </Link>
                <Link
                  href={`/iletisim?reason=${encodeURIComponent("Ucretsiz kesif talebi")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white px-5 py-3 text-sm font-black text-primary"
                >
                  Sakarya kesfi iste
                  <MapPin className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#063326] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                Siradaki en iyi adim
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                {currentStage.label}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{currentStage.detail}</p>
              <Link
                href={currentStage.href}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary"
              >
                Siradaki adima git
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PanelMetric
            label="Acik siparis"
            value={openOrders.length}
            detail="Kargo, odeme veya onay sureci devam eden siparisler."
            icon={<Package className="h-5 w-5" />}
          />
          <PanelMetric
            label="Acik talep"
            value={openRequests}
            detail="Teklif, kesif, servis veya kurulum akislari."
            icon={<Headphones className="h-5 w-5" />}
          />
          <PanelMetric
            label="Adres"
            value={addresses.length}
            detail="Teslimat ve kurulum planinda kullanilacak adresler."
            icon={<MapPin className="h-5 w-5" />}
          />
          <PanelMetric
            label="Profil"
            value={`%${profileScore}`}
            detail="Telefon ve adres tamamlandikca operasyon hizlanir."
            icon={<CreditCard className="h-5 w-5" />}
          />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {accountFlowCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="surface-card group p-5 transition hover:-translate-y-0.5 hover:border-primary/20"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-black text-on-surface">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-on-surface-variant">{item.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">
                  Ac
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="surface-card p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-secondary">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                  Bugunun aksiyonlari
                </h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Paneliniz siparis, adres ve destek kayitlarina gore yapilacaklari siralar.
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
                    <span className="block font-black text-on-surface">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                      {item.detail}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </a>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                  Self servis merkezi
                </h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Dogru cihaz, sehir kapsami, siparis ve servis ihtiyacina gore hizli rota secin.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {customerSelfServiceCards.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-[24px] bg-surface-container-low p-5 transition hover:bg-surface-container"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-primary">
                      {item.signal}
                    </span>
                    <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-4 font-black text-on-surface">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-6 lg:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-secondary">
              <Cable className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                Sarj yol haritaniz
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Yeni EV sahibi, site yoneticisi veya isletme kullanicisi olun; sonraki adim burada
                netlesir.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {journeyCards.map((item) => {
              const Icon = item.icon;

              return (
                <Link
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
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="surface-card p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
                  Guvenli sarj sureci
                </h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Urun, sepet, kargo, kesif ve kurulum adimlari karismadan takip edilir.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {customerTrustTimeline.map((item, index) => (
                <div key={item.label} className="rounded-[24px] bg-surface-container-low p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sm font-black text-primary">
                    {index + 1}
                  </span>
                  <p className="mt-4 font-black text-on-surface">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="surface-card p-5">
              <h2 className="text-xl font-black tracking-[-0.03em] text-on-surface">
                Hizmet kapsami
              </h2>
              <div className="mt-4 grid gap-3">
                {[
                  {
                    label: "Urun kargosu",
                    value: "81 il",
                    detail: "Wallbox, Type 2 kablo ve aksesuarlar Turkiye geneline gonderilir.",
                    icon: Truck
                  },
                  {
                    label: "Ucretsiz kesif",
                    value: "Sakarya",
                    detail: "Pano, faz ve hat uygunlugu icin on degerlendirme planlanir.",
                    icon: MapPin
                  },
                  {
                    label: "Kurulum",
                    value: "Sakarya + Kocaeli",
                    detail: "Montaj, test ve teslim sureci planli ilerler.",
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

            <section id="guvenlik" className="surface-card scroll-mt-28 p-5">
              <h2 className="text-xl font-black tracking-[-0.03em] text-on-surface">
                Guvenlik ozeti
              </h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-on-surface-variant">
                {[
                  "httpOnly musteri oturumu",
                  "SameSite cookie korumasi",
                  "No-store ve noindex basliklari",
                  "Profil ve adres islemlerinde oturum kontrolu"
                ].map((item) => (
                  <div key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <OrdersSection orders={recentOrders} />
        <RequestsPanel snapshot={snapshot} />
        <AccountActionForms customer={customer} addresses={addresses} />
      </main>
    </div>
  );
}
