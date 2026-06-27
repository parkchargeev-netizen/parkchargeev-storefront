import Link from "next/link";

import { PaytrOperationForm } from "@/components/admin/paytr-operation-form";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { formatPriceTRY } from "@/lib/format";
import { listAdminPaytrTransactions } from "@/server/admin/order-repository";

type AdminPaytrPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
  }>;
};

const paytrStatusOptions = ["created", "token_received", "callback_success", "callback_failed"];
const paytrStatusLabels: Record<string, string> = {
  created: "Oluşturuldu",
  token_received: "Ödeme ekranı hazır",
  callback_success: "Ödeme doğrulandı",
  callback_failed: "PayTR ödeme hatası"
};
const paymentStatusLabels: Record<string, string> = {
  paid: "Ödendi",
  failed: "Başarısız",
  pending: "Beklemede",
  processing: "İşleniyor",
  refunded: "İade edildi",
  cancelled: "İptal edildi"
};

function formatPaytrStatus(status: string) {
  return paytrStatusLabels[status] ?? status;
}

function formatPaymentStatus(status?: string | null) {
  return status ? paymentStatusLabels[status] ?? status : "-";
}

function buildExportHref(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("format", "csv");
  params.set("limit", "50");
  return `/api/admin/paytr?${params.toString()}`;
}

function getPaytrTone(status: string) {
  if (status === "callback_success") {
    return "success" as const;
  }

  if (status === "callback_failed") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default async function AdminPaytrPage({ searchParams }: AdminPaytrPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminPaytrTransactions({ ...query, limit: 12 });
  const paytrEnvStatus = [
    { key: "PAYTR_MERCHANT_ID", configured: Boolean(process.env.PAYTR_MERCHANT_ID?.trim()) },
    { key: "PAYTR_MERCHANT_KEY", configured: Boolean(process.env.PAYTR_MERCHANT_KEY?.trim()) },
    { key: "PAYTR_MERCHANT_SALT", configured: Boolean(process.env.PAYTR_MERCHANT_SALT?.trim()) },
    {
      key: "PAYTR_TEST_MODE",
      configured: process.env.PAYTR_TEST_MODE?.trim() === "1",
      configuredLabel: "Test modu açık",
      missingLabel: "Canlı mod"
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="PayTR Operasyonları"
        title="Ödeme mutabakatı ve iade takibi"
        description="PayTR işlem kayıtlarını inceleyin. Mutabakat yalnızca PayTR tarafında başarılı ödeme bulunursa durumu değiştirir; başarısız sorgu callback olarak kaydedilmez."
        action={
          <a href={buildExportHref(query)} className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
            CSV indir
          </a>
        }
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {result.items.length} işlem
          </span>
        }
      />

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Canlı ödeme ayarları</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {paytrEnvStatus.map((item) => (
            <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-normal text-slate-500">{item.key}</p>
              <p className={`mt-2 text-sm font-semibold ${item.configured ? "text-emerald-700" : item.missingLabel ? "text-amber-700" : "text-rose-700"}`}>
                {item.configured
                  ? item.configuredLabel ?? "Tanımlı"
                  : item.missingLabel ?? "Eksik"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_170px_170px_auto]">
          <input name="q" defaultValue={query.q ?? ""} placeholder="Üye iş yeri OID, sipariş veya e-posta ara" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
          <select name="status" defaultValue={query.status ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm">
            <option value="">Tüm durumlar</option>
            {paytrStatusOptions.map((status) => (
              <option key={status} value={status}>
                {formatPaytrStatus(status)}
              </option>
            ))}
          </select>
          <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
          <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
        </form>
      </AdminFilterBar>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="space-y-4">
          {result.items.map((transaction) => (
            <div key={transaction.id} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-slate-950">{transaction.merchantOid}</p>
                  <AdminStatusBadge label={formatPaytrStatus(transaction.status)} tone={getPaytrTone(transaction.status)} />
                </div>
                <dl className="mt-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-normal text-slate-500">Sipariş</dt>
                    <dd className="mt-1 text-sm text-slate-700">
                      {transaction.orderId ? (
                        <Link href={`/admin/siparisler/${transaction.orderId}`} className="font-semibold text-emerald-800">
                          {transaction.orderNumber ?? transaction.orderId}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-normal text-slate-500">Tutar</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatPriceTRY(transaction.paymentAmountKurus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-normal text-slate-500">Ödeme</dt>
                    <dd className="mt-1 text-sm text-slate-700">{formatPaymentStatus(transaction.paymentStatus)}</dd>
                  </div>
                </dl>
                {transaction.failedReasonCode || transaction.failedReasonMsg ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <p className="font-semibold">PayTR hata nedeni</p>
                    <p className="mt-1">
                      {transaction.failedReasonCode ? `${transaction.failedReasonCode}: ` : ""}
                      {transaction.failedReasonMsg ?? "PayTR basarisiz odeme bildirdi."}
                    </p>
                  </div>
                ) : null}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">Callback ve istek verisi</summary>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                    {JSON.stringify(
                      { rawRequest: transaction.rawRequest, rawCallback: transaction.rawCallback },
                      null,
                      2
                    )}
                  </pre>
                </details>
              </div>
              <PaytrOperationForm transactionId={transaction.id} />
            </div>
          ))}
          {result.items.length === 0 ? (
            <p className="text-sm text-slate-500">PayTR işlem kaydı bulunamadı.</p>
          ) : null}
        </div>
        <div className="mt-5">
          {result.nextCursor ? (
            <Link href={`/admin/paytr?cursor=${encodeURIComponent(result.nextCursor)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Sonraki sayfa
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
