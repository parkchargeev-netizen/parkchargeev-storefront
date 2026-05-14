import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import {
  type AccountSnapshot,
  formatAccountDate
} from "@/components/customer/account-view-model";

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
  ].slice(0, 5);

  return (
    <section id="destek" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Headphones className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
            Teklif ve servis
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Teklif, keşif, kurulum ve servis talepleriniz tek listede takip edilir.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="grid gap-3 rounded-[24px] bg-surface-container-low p-5 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-semibold text-on-surface">{request.title}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {request.detail} · {formatAccountDate(request.date)}
                </p>
              </div>
              <span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                {request.status}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
            Açık teklif veya servis kaydı yok. Yeni keşif, bakım veya kurulum ihtiyacı için hızlı
            talep oluşturabilirsiniz.
          </div>
        )}
      </div>

      <Link
        href="/iletisim?konu=servis"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
      >
        Talep oluştur
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
