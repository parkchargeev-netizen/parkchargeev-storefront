import { notFound } from "next/navigation";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatPriceTRY } from "@/lib/format";
import { getAdminOrderById } from "@/server/admin/repository";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Siparis Detayi
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{order.orderNumber}</h1>
          <p className="mt-3 text-sm text-slate-600">
            PayTR durum kaydi ve siparis gecmisi tek ekranda.
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Siparis kalemleri</h2>
          <div className="mt-5 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
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
          <h2 className="text-xl font-semibold text-slate-950">Durum gecmisi</h2>
          <div className="mt-5 space-y-3">
            {order.history.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.fromStatus || "ilk"} → {item.toStatus}
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
          <h2 className="text-xl font-semibold text-slate-950">Ozet</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Musteri</span>
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
              <span>{order.transaction?.status || "Kayit yok"}</span>
            </div>
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Durum Guncelle</h2>
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
