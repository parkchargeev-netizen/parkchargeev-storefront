import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Headphones,
  ReceiptText,
  RotateCcw,
  Truck
} from "lucide-react";

import {
  type AccountOrder,
  type AccountSnapshot,
  formatAccountDate,
  getOrderProgress,
  orderStatusLabel,
  paymentStatusLabel
} from "@/components/customer/account-view-model";
import { formatPriceTRY } from "@/lib/format";

function StatusStepper({ order }: { order: AccountOrder }) {
  const progress = getOrderProgress(order.status);
  const steps = ["Ödeme", "Onay", "Hazırlık", "Kargo", "Teslim"];

  return (
    <div className="mt-5 grid grid-cols-5 gap-2" aria-label="Sipariş ilerleme durumu">
      {steps.map((step, index) => {
        const isActive = index + 1 <= progress;

        return (
          <div key={step} className="grid gap-2">
            <div
              className={`h-2 rounded-full ${
                isActive ? "bg-primary" : "bg-outline-variant/45"
              }`}
            />
            <span
              className={`text-[11px] font-black ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderActionLink({
  href,
  icon,
  label
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/60 bg-white px-4 py-3 text-sm font-black text-on-surface transition hover:border-primary/30 hover:text-primary"
    >
      {icon}
      {label}
    </Link>
  );
}

export function OrdersSection({ orders }: { orders: AccountSnapshot["recentOrders"] }) {
  return (
    <section id="siparisler" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">
            Siparişler
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
            Sipariş, kargo ve belgeler
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Ödeme, onay, kargo, fatura ve servis adımları tek listede takip edilir.
          </p>
        </div>
        <Link
          href="/magaza"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
        >
          Tekrar alışveriş yap
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <article key={order.id} className="rounded-[26px] bg-surface-container-low p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black tracking-[-0.03em] text-on-surface">
                      {order.orderNumber}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                      {orderStatusLabel[order.status] ?? order.status}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-on-surface-variant">
                      {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {formatAccountDate(order.createdAt)}
                    {order.shippingCarrier ? ` - ${order.shippingCarrier}` : ""}
                    {order.trackingNumber ? ` - Takip no: ${order.trackingNumber}` : ""}
                  </p>
                  {order.statusNote ? (
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-on-surface-variant">
                      {order.statusNote}
                    </p>
                  ) : null}
                </div>
                <p className="text-2xl font-black tracking-[-0.04em] text-primary">
                  {formatPriceTRY(order.totalKurus)}
                </p>
              </div>

              <StatusStepper order={order} />

              {order.items.length > 0 ? (
                <div className="mt-5 grid gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={`${order.id}-${item.productName}-${item.quantity}`}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-on-surface-variant"
                    >
                      <span>
                        {item.productName}
                        {item.variantName ? ` - ${item.variantName}` : ""}
                      </span>
                      <span className="font-black">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {order.trackingUrl ? (
                  <OrderActionLink
                    href={order.trackingUrl}
                    icon={<Truck className="h-4 w-4" />}
                    label="Kargo takibi"
                  />
                ) : null}
                <OrderActionLink
                  href={`/iletisim?konu=siparis&siparis=${order.orderNumber}`}
                  icon={<Headphones className="h-4 w-4" />}
                  label="Destek al"
                />
                <OrderActionLink
                  href={`/iletisim?konu=fatura&siparis=${order.orderNumber}`}
                  icon={<ReceiptText className="h-4 w-4" />}
                  label="Fatura iste"
                />
                {["delivered", "fulfilled"].includes(order.status) ? (
                  <OrderActionLink
                    href={`/iletisim?konu=iade&siparis=${order.orderNumber}`}
                    icon={<RotateCcw className="h-4 w-4" />}
                    label="İade / servis"
                  />
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[26px] bg-surface-container-low p-6">
            <p className="font-black text-on-surface">Henüz sipariş görünmüyor.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Aynı e-posta adresiyle ödeme yaptığınızda siparişler, ödeme ve kargo durumuyla
              birlikte burada listelenir.
            </p>
            <Link
              href="/magaza"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
            >
              Mağazaya git
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
