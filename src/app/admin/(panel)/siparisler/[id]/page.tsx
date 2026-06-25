import { notFound } from "next/navigation";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatPriceTRY } from "@/lib/format";
import { formatOrderStatusLabel } from "@/server/admin/constants";
import { getAdminOrderById } from "@/server/admin/order-repository";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const paytrStatusLabels: Record<string, string> = {
  created: "Oluşturuldu",
  token_received: "Ödeme ekranı hazır",
  callback_success: "Ödeme doğrulandı",
  callback_failed: "PayTR ödeme hatası"
};

function formatPaytrStatus(status?: string | null) {
  return status ? paytrStatusLabels[status] ?? status : "Kayıt yok";
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#0f8f6f]">
            Sipariş Detayı
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{order.orderNumber}</h1>
          <p className="mt-3 text-sm text-slate-600">
            PayTR durum kaydı ve sipariş geçmişi tek ekranda.
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Sipariş kalemleri</h2>
          <div className="mt-5 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-lg bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-600">
                      {item.variantName || "-"} · {item.sku || "-"} · {item.quantity} adet
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPriceTRY(item.lineTotalKurus)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum geçmişi</h2>
          <div className="mt-5 space-y-3">
            {order.history.map((item) => (
              <div key={item.id} className="rounded-lg bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.fromStatus ? formatOrderStatusLabel(item.fromStatus) : "İlk"} → {formatOrderStatusLabel(item.toStatus)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.note || "Not yok"}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{item.adminName || "Sistem"}</p>
                    <p>{new Date(item.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Özet</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Müşteri</span>
              <span className="font-semibold text-slate-950">{order.customerName || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>E-posta</span>
              <span>{order.customerEmail || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Telefon</span>
              <span>{order.customerPhone || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Toplam</span>
              <span className="font-semibold text-slate-950">{formatPriceTRY(order.totalKurus)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PayTR</span>
              <span>{formatPaytrStatus(order.transaction?.status)}</span>
            </div>
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum Güncelle</h2>
          <div className="mt-5">
            <OrderStatusForm
              orderId={order.id}
              initialValues={{
                status: order.status,
                note: order.statusNote ?? "",
                shippingCarrier: order.shippingCarrier ?? "",
                trackingNumber: order.trackingNumber ?? "",
                trackingUrl: order.trackingUrl ?? ""
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
