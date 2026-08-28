import { notFound } from "next/navigation";

import { QuoteStatusForm } from "@/components/admin/quote-status-form";
import { ServiceLeadStatusForm } from "@/components/admin/service-lead-status-form";
import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { listAssignableAdmins } from "@/server/admin/auth-service";
import { leadStatusOptions } from "@/server/admin/constants";
import { getAdminQuoteById, getAdminServiceLeadById } from "@/server/admin/repository";

type RequestDetailView = "teklif" | "saha";

type QuoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    view?: string;
  }>;
};

type AdminQuote = NonNullable<Awaited<ReturnType<typeof getAdminQuoteById>>>;
type AdminServiceLead = NonNullable<Awaited<ReturnType<typeof getAdminServiceLeadById>>>;
type AssignableAdmin = Awaited<ReturnType<typeof listAssignableAdmins>>[number];

function parseView(view?: string): RequestDetailView {
  return view === "saha" ? "saha" : "teklif";
}

function getPayloadObject(payload: unknown) {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function formatQuoteSegment(segment: string) {
  const labels: Record<string, string> = {
    site_apartment: "Site / Apartman",
    business: "İş Yeri",
    fleet: "Filo",
    individual: "Bireysel"
  };

  return labels[segment] ?? segment;
}

function formatLeadStatus(status: string) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? status;
}

function mapAssignableAdmins(assignableAdmins: AssignableAdmin[]) {
  return assignableAdmins.map((admin) => ({
    id: admin.id,
    fullName: admin.fullName,
    role: admin.role
  }));
}

function DetailSwitch({ activeView, id }: { activeView: RequestDetailView; id: string }) {
  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm sm:grid-cols-2">
      <AdminPrefetchLink
        href={`/admin/teklifler/${id}`}
        aria-current={activeView === "teklif" ? "page" : undefined}
        className={activeView === "teklif"
          ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[#063326] shadow-sm"
          : "rounded-xl border border-transparent px-4 py-3 text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"}
      >
        <span className="block text-sm font-bold">Teklif detayı</span>
        <span className="mt-1 block text-xs font-medium opacity-75">Satış ve teklif kaydı</span>
      </AdminPrefetchLink>
      <AdminPrefetchLink
        href={`/admin/teklifler/${id}?view=saha`}
        aria-current={activeView === "saha" ? "page" : undefined}
        className={activeView === "saha"
          ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[#063326] shadow-sm"
          : "rounded-xl border border-transparent px-4 py-3 text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"}
      >
        <span className="block text-sm font-bold">Saha detayı</span>
        <span className="mt-1 block text-xs font-medium opacity-75">Keşif, servis ve kurulum kaydı</span>
      </AdminPrefetchLink>
    </div>
  );
}

function QuoteDetail({
  quote,
  assignableAdmins
}: {
  quote: AdminQuote;
  assignableAdmins: AssignableAdmin[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#0f8f6f]">
            Teklif Detayı
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{quote.fullName}</h1>
          <p className="mt-3 text-sm text-slate-600">
            {quote.companyName || "Bireysel talep"} · {formatQuoteSegment(quote.segment)}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Talep notları</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {quote.requestNotes || "Talep notu bulunmuyor."}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Aktivite geçmişi</h2>
          <div className="mt-5 space-y-3">
            {quote.activities.length > 0 ? (
              quote.activities.map((activity) => (
                <div key={activity.id} className="rounded-lg bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{activity.activityType}</p>
                      <p className="mt-1 text-sm text-slate-600">{activity.note || "Not yok"}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{activity.adminName || "Sistem"}</p>
                      <p>{new Date(activity.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Henüz aktivite yok.</p>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">İletişim</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>E-posta</span>
              <span className="text-right">{quote.email || "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Telefon</span>
              <span className="text-right">{quote.phone}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Lokasyon</span>
              <span className="text-right">{[quote.city, quote.district].filter(Boolean).join(" / ") || "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Atanan</span>
              <span className="text-right">{quote.assignedAdminName || "Atanmamış"}</span>
            </div>
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum Güncelle</h2>
          <div className="mt-5">
            <QuoteStatusForm
              quoteId={quote.id}
              assignableAdmins={mapAssignableAdmins(assignableAdmins)}
              initialValues={{
                status: quote.status,
                assignedAdminId: quote.assignedAdminId ?? null,
                note: ""
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function ServiceLeadDetail({
  lead,
  assignableAdmins
}: {
  lead: AdminServiceLead;
  assignableAdmins: AssignableAdmin[];
}) {
  const payload = getPayloadObject(lead.payload);
  const notes = Array.isArray(payload.adminNotes) ? payload.adminNotes : [];
  const assignedAdminId =
    typeof payload.assignedAdminId === "string" ? payload.assignedAdminId : null;
  const assignedAdmin = assignableAdmins.find((admin) => admin.id === assignedAdminId);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#0f8f6f]">
            Saha Talebi
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{lead.fullName}</h1>
          <p className="mt-3 text-sm text-slate-600">
            {lead.leadType} / {lead.projectType ?? "Genel"} / {new Date(lead.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Talep detayı</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-normal text-slate-500">Telefon</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{lead.phone}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-normal text-slate-500">E-posta</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{lead.email ?? "-"}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-normal text-slate-500">Lokasyon</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{[lead.city, lead.district].filter(Boolean).join(" / ") || "-"}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-normal text-slate-500">Atanan</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{assignedAdmin?.fullName ?? "Atanmamış"}</dd>
            </div>
          </dl>
          <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {lead.message || "Mesaj bulunmuyor."}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Operasyon notları</h2>
          <div className="mt-5 space-y-3">
            {notes.length > 0 ? (
              notes.map((note, index) => {
                const item = getPayloadObject(note);
                return (
                  <div key={`${String(item.createdAt ?? index)}-${index}`} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">{String(item.note ?? "")}</p>
                    <p className="mt-2 text-xs text-slate-500">{String(item.createdAt ?? "")}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">Henüz operasyon notu yok.</p>
            )}
          </div>
        </div>

        <details className="surface-card border border-slate-200 bg-white/95 p-6">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">Ham veri</summary>
          <pre className="mt-4 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      </section>

      <aside className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum</h2>
          <div className="mt-5">
            <AdminStatusBadge label={formatLeadStatus(lead.status)} tone="info" />
          </div>
        </div>
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Talebi güncelle</h2>
          <div className="mt-5">
            <ServiceLeadStatusForm
              leadId={lead.id}
              assignableAdmins={mapAssignableAdmins(assignableAdmins)}
              initialValues={{
                status: lead.status,
                assignedAdminId
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

export default async function AdminQuoteDetailPage({ params, searchParams }: QuoteDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const activeView = parseView(query.view);
  const assignableAdminsPromise = listAssignableAdmins();

  if (activeView === "saha") {
    const [lead, assignableAdmins] = await Promise.all([
      getAdminServiceLeadById(id),
      assignableAdminsPromise
    ]);

    if (!lead) {
      notFound();
    }

    return (
      <div>
        <DetailSwitch activeView="saha" id={id} />
        <ServiceLeadDetail lead={lead} assignableAdmins={assignableAdmins} />
      </div>
    );
  }

  const [quote, assignableAdmins] = await Promise.all([
    getAdminQuoteById(id),
    assignableAdminsPromise
  ]);

  if (!quote) {
    const lead = await getAdminServiceLeadById(id);

    if (!lead) {
      notFound();
    }

    return (
      <div>
        <DetailSwitch activeView="saha" id={id} />
        <ServiceLeadDetail lead={lead} assignableAdmins={assignableAdmins} />
      </div>
    );
  }

  return (
    <div>
      <DetailSwitch activeView="teklif" id={id} />
      <QuoteDetail quote={quote} assignableAdmins={assignableAdmins} />
    </div>
  );
}