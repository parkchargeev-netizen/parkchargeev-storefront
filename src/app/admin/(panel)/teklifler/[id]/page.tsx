import { notFound } from "next/navigation";

import { QuoteStatusForm } from "@/components/admin/quote-status-form";
import { listAssignableAdmins } from "@/server/admin/auth-service";
import { getAdminQuoteById } from "@/server/admin/repository";

type QuoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminQuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  const [quote, assignableAdmins] = await Promise.all([
    getAdminQuoteById(id),
    listAssignableAdmins()
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Teklif Detayi
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{quote.fullName}</h1>
          <p className="mt-3 text-sm text-slate-600">
            {quote.companyName || "Bireysel talep"} · {quote.segment}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Talep notlari</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {quote.requestNotes || "Talep notu bulunmuyor."}
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Aktivite gecmisi</h2>
          <div className="mt-5 space-y-3">
            {quote.activities.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-slate-50 px-4 py-4">
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
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Iletisim</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>E-posta</span>
              <span>{quote.email || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Telefon</span>
              <span>{quote.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lokasyon</span>
              <span>{[quote.city, quote.district].filter(Boolean).join(" / ") || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Atanan</span>
              <span>{quote.assignedAdminName || "Atanmamis"}</span>
            </div>
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum Guncelle</h2>
          <div className="mt-5">
            <QuoteStatusForm
              quoteId={quote.id}
              assignableAdmins={assignableAdmins.map((admin) => ({
                id: admin.id,
                fullName: admin.fullName,
                role: admin.role
              }))}
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
