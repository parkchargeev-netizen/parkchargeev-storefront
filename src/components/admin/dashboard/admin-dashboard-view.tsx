import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  FileText,
  Gauge,
  Home,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wrench,
  Zap
} from "lucide-react";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { formatPriceTRY } from "@/lib/format";
import {
  adminOpsChecklist,
  adminRevenuePlays
} from "@/lib/panel-experience";
import type { AdminDashboardSnapshot } from "@/server/admin/dashboard";
import type { AdminRole } from "@/server/auth/authorization";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type AdminDashboardViewProps = {
  snapshot: AdminDashboardSnapshot;
  role?: AdminRole;
  databaseEnabled: boolean;
  paytrReady: boolean;
};

const orderStatusLabels: Record<string, string> = {
  draft: "Taslak",
  pending_payment: "Ödeme bekliyor",
  payment_processing: "Ödeme işleniyor",
  pending_confirmation: "Onay bekliyor",
  paid: "Ödendi",
  confirmed: "Onaylandı",
  payment_failed: "Ödeme başarısız",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  failed: "Başarısız",
  cancelled: "İptal",
  refunded: "İade",
  fulfilled: "Tamamlandı"
};

const quoteStatusLabels: Record<string, string> = {
  new: "Yeni talep",
  reviewing: "İnceleniyor",
  proposal_sent: "Teklif gönderildi",
  negotiation: "Müzakere",
  won: "Kazanıldı",
  lost: "Kaybedildi"
};

const leadStatusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  qualified: "Nitelikli",
  scheduled: "Planlandı",
  won: "Kazanıldı",
  lost: "Kaybedildi"
};

const personaCards: Array<{
  href: string;
  label: string;
  detail: string;
  signal: string;
  tone: Tone;
  icon: ReactNode;
}> = [
  {
    href: "/admin/teklifler",
    label: "Ev tipi AC alıcısi",
    detail: "7.4/11 kW wallbox, araç uyumu sağlar.",
    signal: "Hızlı dönüşüm",
    tone: "success",
    icon: <Home className="h-5 w-5" />
  },
  {
    href: "/admin/teklifler?view=saha",
    label: "Site / apartman",
    detail: "RFID, adil kullanım ve yönetim sunumu teknik planla ilerler.",
    signal: "Toplu karar",
    tone: "info",
    icon: <Building2 className="h-5 w-5" />
  },
  {
    href: "/admin/teklifler",
    label: "KOBİ / ofis",
    detail: "22 kW AC, misafir deneyimi, servis ve fatura akışı birlikte sunulur.",
    signal: "Kurumsal teklif",
    tone: "warning",
    icon: <Users className="h-5 w-5" />
  },
  {
    href: "/admin/teklifler?view=saha",
    label: "Ticari lokasyon",
    detail: "DC veya çoklu AC saha için enerji kapasitesi ve fizibilite notu gerekir.",
    signal: "Fizibilite",
    tone: "danger",
    icon: <MapPin className="h-5 w-5" />
  },
  {
    href: "/admin/urunler",
    label: "Kablo / aksesuar",
    detail: "Type 2 uyumu, stok görünürlüğü ve hızlı sepet dönüşümü takip edilir.",
    signal: "Hızlı satış",
    tone: "neutral",
    icon: <Cable className="h-5 w-5" />
  }
];

const moduleCards: Array<{
  href: string;
  label: string;
  detail: string;
  icon: ReactNode;
  roles: AdminRole[];
}> = [
  {
    href: "/admin/urunler",
    label: "Ürün merkezi",
    detail: "Fiyat, stok, varyant, SEO, görsel ve teknik özellikleri yönet.",
    icon: <Package className="h-5 w-5" />,
    roles: ["superadmin", "admin", "product_manager"]
  },
  {
    href: "/admin/siparisler",
    label: "Sipariş operasyonu",
    detail: "Ödeme, kargo, fatura, not ve teslimat adımlarını takip et.",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklif CRM",
    detail: "Bireysel, site, işletme ve filo taleplerini aksiyona çevir.",
    icon: <FileText className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  },
  {
    href: "/admin/teklifler?view=saha",
    label: "Saha planlama",
    detail: "Keşif, kurulum, servis ve lokasyon kapsamlarını netleştir.",
    icon: <Wrench className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager", "support_agent"]
  },
  {
    href: "/admin/blog",
    label: "İçerik ve SEO",
    detail: "Blog, rehber, arama niyeti ve satış destekli içerikleri yayınla.",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["superadmin", "admin"]
  },
  {
    href: "/admin/paytr",
    label: "Ödeme merkezi",
    detail: "PayTR kayıtları, callback ve ödeme kontrolünü incele.",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  }
];

const adminWorkflowCards = [
  {
    label: "1. Bul",
    detail: "Komut aramasıyla sipariş, teklif, ürün veya müşteri kaydına hızlı ulaşın.",
    icon: <Database className="h-5 w-5" />
  },
  {
    label: "2. Onceliklendir",
    detail: "Bekleyen sipariş, teklif ve saha taleplerini açık kuyruk kartlarından seçin.",
    icon: <Target className="h-5 w-5" />
  },
  {
    label: "3. Güncelle",
    detail: "Durum, not, stok, fiyat, kargo, teklif veya servis adımını tek kayıtta güncelleyin.",
    icon: <CheckCircle2 className="h-5 w-5" />
  },
  {
    label: "4. Denetle",
    detail: "PayTR, rol, audit ve oturum sinyalleriyle operasyon güvenini kontrol edin.",
    icon: <ShieldCheck className="h-5 w-5" />
  }
] as const;

const commerceAdminStandards: Array<{
  href: string;
  label: string;
  detail: string;
  proof: string;
  icon: ReactNode;
  roles: AdminRole[];
}> = [
  {
    href: "/admin/urunler",
    label: "Katalog kalitesi",
    detail: "Başlık, fiyat, stok, varyant, medya, SEO, AI ve teknik özellikler eksiksiz tutulur.",
    proof: "Shopify + Woo ürün standardı",
    icon: <Package className="h-5 w-5" />,
    roles: ["superadmin", "admin", "product_manager"]
  },
  {
    href: "/admin/siparisler",
    label: "Sipariş ve teslimat",
    detail: "Ödeme, onay, kargo, iade, not ve durum akışı tek operasyon ekranından izlenir.",
    proof: "Fulfillment akışı",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  },
  {
    href: "/admin/teklifler",
    label: "Müşteri ve segment",
    detail: "Ev, site, KOBİ ve ticari lokasyon talepleri persona bazlı takip edilir.",
    proof: "CRM + segment",
    icon: <Users className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  },
  {
    href: "/admin/teklifler?view=saha",
    label: "Keşif ve kurulum",
    detail: "Türkiye geneli keşif, kurulum ve servis aksiyonları saha uygunluğuna göre ayrışır.",
    proof: "Saha iş emri",
    icon: <Wrench className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager", "support_agent"]
  },
  {
    href: "/admin/blog",
    label: "İçerik ve pazarlama",
    detail: "Blog, rehber, kampanya metni ve satış destekli açıklamalar zengin editörle üretilir.",
    proof: "SEO + CRO içerik",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["superadmin", "admin", "product_manager"]
  },
  {
    href: "/admin/paytr",
    label: "Ödeme güveni",
    detail: "PayTR kayıtları, ödeme callback sinyalleri ve sipariş kapanışı kontrol edilir.",
    proof: "Ödeme denetimi",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["superadmin", "admin", "order_manager"]
  },
  {
    href: "/admin/katalog",
    label: "Toplu operasyon",
    detail: "Katalog düzeni, kanal görünürlüğü ve yinelenen ürün kontrolleri hızlanır.",
    proof: "Bulk yönetim",
    icon: <Database className="h-5 w-5" />,
    roles: ["superadmin", "admin", "product_manager"]
  },
  {
    href: "/admin/audit",
    label: "Rol ve denetim",
    detail: "Rol bazlı erişim, oturum, audit ve güvenlik kayıtları iş sürecine bağlanır.",
    proof: "Admin güvenligi",
    icon: <ShieldCheck className="h-5 w-5" />,
    roles: ["superadmin"]
  }
];

function toneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "danger":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function iconToneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "danger":
      return "bg-red-100 text-red-700";
    case "info":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function riskToneClass(score: number) {
  if (score >= 80) {
    return {
      card: "border-red-200 bg-red-50 text-red-950",
      pill: "bg-red-700 text-white",
      bar: "bg-red-600",
      link: "border-red-200 bg-white text-red-800 hover:bg-red-100"
    };
  }

  if (score >= 60) {
    return {
      card: "border-orange-200 bg-orange-50 text-orange-950",
      pill: "bg-orange-700 text-white",
      bar: "bg-orange-500",
      link: "border-orange-200 bg-white text-orange-800 hover:bg-orange-100"
    };
  }

  if (score >= 35) {
    return {
      card: "border-amber-200 bg-amber-50 text-amber-950",
      pill: "bg-amber-600 text-white",
      bar: "bg-amber-500",
      link: "border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
    };
  }

  return {
    card: "border-emerald-200 bg-emerald-50 text-emerald-950",
    pill: "bg-emerald-700 text-white",
    bar: "bg-emerald-600",
    link: "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100"
  };
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function KpiCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="surface-card border border-white/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${iconToneClass(tone)}`}>{icon}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function QueueCard({
  href,
  label,
  value,
  detail,
  action,
  icon,
  tone
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  action: string;
  icon: ReactNode;
  tone: Tone;
}) {
  return (
    <AdminPrefetchLink
      href={href}
      className="surface-card group flex h-full flex-col justify-between border border-white/70 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-lg p-2 ${iconToneClass(tone)}`}>{icon}</span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass(tone)}`}>
          {value > 0 ? "Aksiyon var" : "Temiz"}
        </span>
      </div>
      <div className="mt-6">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="mt-2 text-4xl font-bold tracking-normal text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#063326]">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </AdminPrefetchLink>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm font-semibold text-slate-500">
      {label}
    </div>
  );
}

export function AdminDashboardView({
  snapshot,
  role,
  databaseEnabled,
  paytrReady
}: AdminDashboardViewProps) {
  const canSee = (roles: AdminRole[]) => (role ? roles.includes(role) : false);
  const openQueueTotal =
    snapshot.kpis.pendingOrders +
    snapshot.kpis.pendingQuotes +
    snapshot.kpis.openServiceRequests;
  const targetProgress = Math.min(snapshot.kpis.targetProgress, 100);
  const targetTone: Tone =
    snapshot.kpis.targetProgress >= 85
      ? "success"
      : snapshot.kpis.targetProgress >= 45
        ? "info"
        : "warning";
  const queueCards = [
    {
      href: "/admin/siparisler?status=pending_confirmation",
      label: "Sipariş onayı",
      value: snapshot.kpis.pendingOrders,
      detail: "Ödeme, stok, kargo ve fatura kontrolü bekleyen kayıtlar.",
      action: "Siparişleri aç",
      icon: <ShoppingCart className="h-5 w-5" />,
      tone: snapshot.kpis.pendingOrders > 0 ? "warning" : "success",
      roles: ["superadmin", "admin", "product_manager"] as AdminRole[]
    },
    {
      href: "/admin/teklifler",
      label: "Teklif aksiyonu",
      value: snapshot.kpis.pendingQuotes,
      detail: "Yeni, inceleme veya müzakeredeki satış fırsatları.",
      action: "Teklif masasına git",
      icon: <FileText className="h-5 w-5" />,
      tone: snapshot.kpis.pendingQuotes > 0 ? "info" : "success",
      roles: ["superadmin", "admin", "order_manager"] as AdminRole[]
    },
    {
      href: "/admin/teklifler?view=saha",
      label: "Saha planlama",
      value: snapshot.kpis.openServiceRequests,
      detail: "Keşif, kurulum ve teknik servis ekibine aktarılacak işler.",
      action: "Saha taleplerini aç",
      icon: <Wrench className="h-5 w-5" />,
      tone: snapshot.kpis.openServiceRequests > 0 ? "warning" : "success",
      roles: ["superadmin", "admin", "order_manager", "support_agent"] as AdminRole[]
    },
    {
      href: role === "superadmin" ? "/admin/adminler" : "/admin/erisim",
      label: "Güvenlik",
      value: snapshot.security.activeSessions,
      detail: "Aktif admin oturumları, rol kapsamı ve denetim kayıtları.",
      action: role === "superadmin" ? "Oturumlari denetle" : "Erişim haritasi",
      icon: <ShieldCheck className="h-5 w-5" />,
      tone: snapshot.security.activeSessions > 1 ? "info" : "neutral",
      roles: ["superadmin", "admin", "product_manager", "order_manager", "support_agent", "readonly"] as AdminRole[]
    }
  ];
  const visibleQueueCards = queueCards.filter((card) => canSee(card.roles));
  const visibleModules = moduleCards.filter((card) => canSee(card.roles));
  const visibleCommerceStandards = commerceAdminStandards.filter((card) => canSee(card.roles));
  const todayActions = [
    {
      label: "Ödeme ve sipariş onayı",
      count: snapshot.kpis.pendingOrders,
      href: "/admin/siparisler?status=pending_confirmation",
      detail: "Müşteri bekletmeden ödeme ve stok kontrolünü kapat."
    },
    {
      label: "Teklif dönüşü",
      count: snapshot.kpis.pendingQuotes,
      href: "/admin/teklifler",
      detail: "Ev, site ve işletme taleplerinde hızlı ilk temas kur."
    },
    {
      label: "Saha takvimi",
      count: snapshot.kpis.openServiceRequests,
      href: "/admin/teklifler?view=saha",
      detail: "Keşif ve kurulum taleplerini saha uygunluğu ve planlama durumuna göre ayır."
    }
  ].filter((action) => action.count > 0);

  return (
    <div className="space-y-6">
      {!databaseEnabled ? (
        <section className="surface-card border border-amber-200 bg-amber-50/85 p-5">
          <p className="text-sm font-bold uppercase tracking-normal text-amber-700">
            Yerel yedek mod
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Veritabanı bağlantısı olmadığında panel yerel yedek veriyle açılır. Canlı operasyon için
            Supabase ortam degiskenlerini kontrol edin.
          </p>
        </section>
      ) : null}

      <section className="surface-card overflow-hidden border border-white/70 p-6 lg:p-8">
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:items-stretch">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
              Admin operasyon merkezi
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-normal text-slate-950 lg:text-5xl">
              Satılabilir ürün, doğru teklif ve saha aksiyonu tek masada.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              ParkChargeEV paneli; e-ticaret siparişlerini, teklif CRM akışını, Türkiye geneli saha
              taleplerini, içerik operasyonunu ve güvenlik sinyallerini aynı karar ekranında toplar.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                  Açık kuyruk
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{openQueueTotal}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                  7 gun yeni müşteri
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {snapshot.kpis.newCustomers}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                  Operasyon kapsamı
                </p>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-950">
                  Ürün, stok, sipariş ve ödeme takibi tek merkezden yönetilir.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#063326] p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-white/84">
                  Aylik hedef
                </p>
                <p className="mt-3 text-5xl font-bold tracking-normal">
                  %{snapshot.kpis.targetProgress.toFixed(1)}
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-200" />
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#7eecc9]"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="mt-6 grid gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass(targetTone)}`}>
                Hedef sinyali
              </span>
              <AdminPrefetchLink
                href="/admin/siparisler"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#063326]"
              >
                Sipariş performansi
                <ArrowRight className="h-4 w-4" />
              </AdminPrefetchLink>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {adminWorkflowCards.map((item) => (
          <div key={item.label} className="surface-card border border-white/70 p-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-[#063326]">
              {item.icon}
            </span>
            <p className="mt-4 text-sm font-bold text-slate-950">{item.label}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
              E-ticaret admin standardı
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
              Panel, satışın bütün arka ofisini tek akışta toplar.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Ürün katalog kalitesi, sipariş/fulfillment, müşteri segmentleri, pazarlama içeriği,
              ödeme güveni ve rol denetimi ayni operasyon ritminde ilerler.
            </p>
          </div>
          <AdminPrefetchLink
            href="/admin/urunler"
            className="rounded-lg bg-[#063326] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0b4b39]"
          >
            Ürün merkezini ac
          </AdminPrefetchLink>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleCommerceStandards.map((item) => (
            <AdminPrefetchLink
              key={item.label}
              href={item.href}
              className="group rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-[#d8fff0] p-2 text-[#063326]">{item.icon}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              <span className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#063326]">
                {item.proof}
              </span>
            </AdminPrefetchLink>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleQueueCards.map((card) => (
          <QueueCard
            key={card.label}
            href={card.href}
            label={card.label}
            value={card.value}
            detail={card.detail}
            action={card.action}
            icon={card.icon}
            tone={card.tone as Tone}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Bugunku ciro"
          value={formatPriceTRY(snapshot.kpis.todayRevenue)}
          detail="Bugun olusan onaylı sipariş toplami."
          icon={<Zap className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Bu ayki ciro"
          value={formatPriceTRY(snapshot.kpis.monthRevenue)}
          detail="Aylik hedef karsilastirmasi için ana metrik."
          icon={<Gauge className="h-5 w-5" />}
          tone={targetTone}
        />
        <KpiCard
          label="Tamamlanan is"
          value={String(snapshot.kpis.completedInstallations)}
          detail="Bu hafta teslim edilen veya tamamlanan kayıtlar."
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Aktif oturum"
          value={String(snapshot.security.activeSessions)}
          detail="Admin oturumları ve güvenlik izleme sinyali."
          icon={<LockKeyhole className="h-5 w-5" />}
          tone="info"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface-card border border-white/70 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
                Bugunun aksiyonlari
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                Panel once bekleyen isi kapatsin.
              </h2>
            </div>
            <AdminPrefetchLink
              href="/admin/erisim"
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              Tüm modüller
            </AdminPrefetchLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(todayActions.length > 0
              ? todayActions
              : [
                  {
                    label: "Kritik kuyruk yok",
                    count: 0,
                    href: "/admin",
                    detail: "Yeni sipariş, teklif veya saha talebi gelince bu alan otomatik dolacak."
                  }
                ]
            ).map((action) => (
              <AdminPrefetchLink
                key={action.label}
                href={action.href}
                className="group rounded-lg border border-slate-200 bg-white/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <p className="text-sm font-bold text-slate-950">{action.label}</p>
                <p className="mt-3 text-4xl font-bold tracking-normal text-[#063326]">
                  {action.count}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-600">{action.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#063326]">
                  Islemi ac
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>

        <div className="surface-card border border-white/70 bg-[#063326] p-6 text-white">
          <p className="text-sm font-bold uppercase tracking-normal text-emerald-200">
            Sistem sagligi
          </p>
          <div className="mt-5 grid gap-3">
            {[
              {
                label: "Veri kaynagi",
                status: databaseEnabled ? "Canlı" : "Yerel",
                tone: databaseEnabled ? "success" : "warning",
                icon: <Database className="h-4 w-4" />
              },
              {
                label: "PayTR",
                status: paytrReady ? "Hazir" : "Eksik",
                tone: paytrReady ? "success" : "danger",
                icon: <CreditCard className="h-4 w-4" />
              },
              {
                label: "Rol bazlı erişim",
                status: "Aktif",
                tone: "success",
                icon: <ShieldCheck className="h-4 w-4" />
              },
              {
                label: "Oturum denetimi",
                status: "Aktif",
                tone: "success",
                icon: <LockKeyhole className="h-4 w-4" />
              }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.12] px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold">
                  {item.icon}
                  {item.label}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass(item.tone as Tone)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
              Persona satış rotaları
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
              Her müşteri tipi doğru modüle düşsün.
            </h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {personaCards.map((item) => (
            <AdminPrefetchLink
              key={item.label}
              href={item.href}
              className="group rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-lg p-2 ${iconToneClass(item.tone)}`}>{item.icon}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${toneClass(item.tone)}`}>
                {item.signal}
              </span>
            </AdminPrefetchLink>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="surface-card border border-white/70 p-6">
          <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
            Modul kisayollari
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            Admin panelde beklenen ana özellikler.
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {visibleModules.map((item) => (
              <AdminPrefetchLink
                key={item.href}
                href={item.href}
                className="group rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-emerald-100 p-2 text-[#063326]">{item.icon}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-950">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
            Pazar playbook
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            Satış ekibinin günlük rehberi.
          </h2>
          <div className="mt-5 grid gap-3">
            {adminRevenuePlays.map((play) => (
              <AdminPrefetchLink
                key={play.label}
                href={play.href}
                className="rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass(play.tone)}`}>
                  {play.signal}
                </span>
                <p className="mt-3 text-sm font-bold text-slate-950">{play.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{play.detail}</p>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>
      </section>

      <DashboardCharts
        revenueTrend={snapshot.charts.revenueTrend}
        quoteDistribution={snapshot.charts.quoteDistribution}
        orderDistribution={snapshot.charts.orderDistribution}
      />

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-bold text-slate-950">Son 10 sipariş</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentOrders.length > 0 ? (
              snapshot.activity.recentOrders.map((order) => (
                <AdminPrefetchLink
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  className="block rounded-lg bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {order.customerName || "Misafir müşteri"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950">
                        {formatPriceTRY(order.totalKurus)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {orderStatusLabels[order.status] ?? order.status}
                      </p>
                    </div>
                  </div>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henüz sipariş hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-bold text-slate-950">Son 5 teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.length > 0 ? (
              snapshot.activity.recentQuotes.map((quote) => (
                <AdminPrefetchLink
                  key={quote.id}
                  href={`/admin/teklifler/${quote.id}`}
                  className="block rounded-lg bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <p className="text-sm font-bold text-slate-950">{quote.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {quote.companyName || "Bireysel talep"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {quoteStatusLabels[quote.status] ?? quote.status}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henüz teklif hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-bold text-slate-950">Son saha talepleri</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.length > 0 ? (
              snapshot.activity.recentServiceRequests.map((item) => (
                <AdminPrefetchLink
                  key={item.id}
                  href={`/admin/teklifler/${item.id}?view=saha`}
                  className="block rounded-lg bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.leadType}</p>
                    </div>
                    <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {leadStatusLabels[item.status] ?? item.status} - {formatDate(item.createdAt)}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henüz saha talebi yok." />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card border border-emerald-200 bg-white p-6 text-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
                Risk radarı
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                Genel skor {snapshot.risk.score}/100 · {snapshot.risk.level}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Kritik stok, ödeme, gecikme, güvenlik ve ürün kalitesi sinyalleri okunabilir aksiyon kartlarına ayrıldı.
              </p>
            </div>
            <span className="rounded-lg bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {snapshot.risk.items.map((risk) => {
              const classes = riskToneClass(risk.score);

              return (
                <div key={risk.key} className={`rounded-lg border p-4 ${classes.card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{risk.label}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-normal opacity-80">
                        {risk.level}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${classes.pill}`}>
                      {risk.score}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full ${classes.bar}`}
                      style={{ width: `${Math.min(100, Math.max(0, risk.score))}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 opacity-90">{risk.description}</p>
                  <p className="mt-2 text-xs font-semibold leading-5">{risk.action}</p>
                  <AdminPrefetchLink
                    href={risk.href}
                    className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold transition ${classes.link}`}
                  >
                    Aksiyona git
                  </AdminPrefetchLink>
                </div>
              );
            })}
            {snapshot.risk.items.length === 0 ? (
              <EmptyState label="Risk sinyali yok." />
            ) : null}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#0f8f6f]">
                Operasyon checklist
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                Satış, saha, içerik ve güvenlik kapanislari.
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#063326]">
              Günlük rutin
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {adminOpsChecklist.map((item, index) => (
              <AdminPrefetchLink
                key={item.label}
                href={item.href}
                className="group rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-sm font-bold text-[#063326]">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-bold text-slate-950">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#063326]">
                  Modulu ac
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
