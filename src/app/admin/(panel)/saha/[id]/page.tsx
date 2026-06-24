import { notFound } from "next/navigation";

import { ServiceLeadStatusForm } from "@/components/admin/service-lead-status-form";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { listAssignableAdmins } from "@/server/admin/auth-service";
import { leadStatusOptions } from "@/server/admin/constants";
import { getAdminServiceLeadById } from "@/server/admin/repository";

type ServiceLeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getPayloadObject(payload: unknown) {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function formatLeadStatus(status: string) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export default async function ServiceLeadDetailPage({ params }: ServiceLeadDetailPageProps) {
  const { id } = await params;
  const [lead, assignableAdmins] = await Promise.all([
    getAdminServiceLeadById(id),
    listAssignableAdmins()
  ]);

  if (!lead) {
    notFound();
  }

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
              assignableAdmins={assignableAdmins.map((admin) => ({
                id: admin.id,
                fullName: admin.fullName,
                role: admin.role
              }))}
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
