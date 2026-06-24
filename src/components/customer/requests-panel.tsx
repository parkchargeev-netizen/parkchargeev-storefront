import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import {
  type AccountSnapshot,
  formatAccountDate
} from "@/components/customer/account-view-model";

const requestStatusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  qualified: "Nitelikli",
  scheduled: "Planlandı",
  reviewing: "İnceleniyor",
  proposal_sent: "Teklif gönderildi",
  negotiation: "Müzakere",
  won: "Kazanıldı",
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
      detail: [lead.city, lead.district].filter(Boolean).join(" / ") || lead.projectType || "Servis kaydı",
      status: lead.status,
      date: lead.createdAt
    }))
  ].slice(0, 6);

  return (
    <section id="destek" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-primary">
              Teklif ve servis
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
              Keşif, kurulum ve destek talepleri
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Talep durumları, lokasyon ve son hareket tarihi tek listede görünür.
            </p>
          </div>
        </div>
        <Link
          href={`/iletisim?konu=${encodeURIComponent("Teknik servis ve bakım")}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          Yeni talep oluştur
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="grid gap-3 rounded-lg bg-surface-container-low p-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="font-bold text-on-surface">{request.title}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {request.detail} - {formatAccountDate(request.date)}
                </p>
              </div>
              <span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
                {requestStatusLabels[request.status] ?? request.status}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
            Açık teklif veya servis kaydı yok. Yeni keşif, bakım veya kurulum ihtiyacı için hızlı
            talep oluşturabilirsiniz.
          </div>
        )}
      </div>
    </section>
  );
}
