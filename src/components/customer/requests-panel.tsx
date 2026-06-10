import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import {
  type AccountSnapshot,
  formatAccountDate
} from "@/components/customer/account-view-model";

const requestStatusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "Iletisime gecildi",
  qualified: "Nitelikli",
  scheduled: "Planlandi",
  reviewing: "Inceleniyor",
  proposal_sent: "Teklif gonderildi",
  negotiation: "Muzakere",
  won: "Kazanildi",
  lost: "Kaybedildi"
};

export function RequestsPanel({ snapshot }: { snapshot: AccountSnapshot }) {
  const requests = [
    ...snapshot.recentQuoteRequests.map((request) => ({
      id: request.id,
      title: "Teklif talebi",
      detail: [request.city, request.district].filter(Boolean).join(" / ") || "Lokasyon bekleniyor",
      status: request.status,
      date: request.createdAt
    })),
    ...snapshot.recentServiceLeads.map((lead) => ({
      id: lead.id,
      title: lead.leadType,
      detail: [lead.city, lead.district].filter(Boolean).join(" / ") || lead.projectType || "Servis kaydi",
      status: lead.status,
      date: lead.createdAt
    }))
  ].slice(0, 6);

  return (
    <section id="destek" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">
              Teklif ve servis
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-on-surface">
              Kesif, kurulum ve destek talepleri
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Talep durumlari, lokasyon ve son hareket tarihi tek listede gorunur.
            </p>
          </div>
        </div>
        <Link
          href={`/iletisim?konu=${encodeURIComponent("Teknik servis ve bakim")}`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
        >
          Yeni talep olustur
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="grid gap-3 rounded-[24px] bg-surface-container-low p-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="font-black text-on-surface">{request.title}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {request.detail} - {formatAccountDate(request.date)}
                </p>
              </div>
              <span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-black text-primary">
                {requestStatusLabels[request.status] ?? request.status}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
            Acik teklif veya servis kaydi yok. Yeni kesif, bakim veya kurulum ihtiyaci icin hizli
            talep olusturabilirsiniz.
          </div>
        )}
      </div>
    </section>
  );
}
