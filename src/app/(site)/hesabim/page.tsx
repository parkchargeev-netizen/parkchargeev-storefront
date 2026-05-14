import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, MapPin, Package, ShieldCheck } from "lucide-react";

import { CustomerLogoutButton } from "@/components/customer/customer-logout-button";
import { formatPriceTRY } from "@/lib/format";
import { getCustomerAccountSnapshot } from "@/server/customer/auth";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Profil, adres, sipariş ve güvenlik ayarlarınız."
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(value);
}

export default async function AccountPage() {
  const snapshot = await getCustomerAccountSnapshot();

  if (!snapshot) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Müşteri paneli
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
          Hesabınızı görüntülemek için giriş yapın
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
          Siparişler, kurulum adresleri ve servis talepleri güvenli müşteri oturumu ile
          gösterilir.
        </p>
        <Link
          href="/giris"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white"
        >
          Müşteri Girişine Git
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { customer, addresses, recentOrders } = snapshot;
  const fullName = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[280px_1fr_360px] lg:px-8">
      <aside className="surface-card h-fit p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Kullanıcı paneli
        </p>
        <div className="mt-6 space-y-2">
          {[
            ["Panel", Package],
            ["Siparişler", CreditCard],
            ["Adresler", MapPin],
            ["Güvenlik", ShieldCheck]
          ].map(([item, Icon], index) => {
            const MenuIcon = Icon as typeof Package;

            return (
              <div
                key={String(item)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-medium ${
                  index === 0
                    ? "bg-surface-container-low text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                <MenuIcon className="h-4 w-4" />
                {String(item)}
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <CustomerLogoutButton />
        </div>
      </aside>

      <section className="space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Hoş geldiniz
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.08em] text-on-surface">
            {fullName || customer.email}
          </h1>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            Sipariş, adres ve servis bilgileriniz artık müşteri hesabınıza bağlı olarak
            görüntülenir.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Sipariş", recentOrders.length],
            ["Kayıtlı adres", addresses.length],
            ["Profil", customer.phone ? "Tamam" : "Eksik"]
          ].map(([label, value]) => (
            <div key={label} className="surface-card p-5">
              <p className="text-sm text-on-surface-variant">{label}</p>
              <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Profil Bilgileri
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Ad", customer.firstName || "-"],
              ["Soyad", customer.lastName || "-"],
              ["E-posta", customer.email],
              ["Telefon", customer.phone || "-"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-surface-container-low px-4 py-4">
                <p className="text-sm text-on-surface-variant">{label}</p>
                <p className="mt-2 font-semibold text-on-surface">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Son Siparişler
          </h2>
          <div className="mt-6 grid gap-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 rounded-[24px] bg-surface-container-low p-5 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-on-surface">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {formatDate(order.createdAt)} · {order.status} · {order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-lg font-black text-primary">
                    {formatPriceTRY(order.totalKurus)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-surface-container-low p-6 text-on-surface-variant">
                Henüz hesabınıza bağlı sipariş görünmüyor. Ödeme sırasında aynı e-posta
                adresini kullandığınızda siparişler burada listelenir.
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Adresler
          </h2>
          <div className="mt-6 grid gap-4">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <div key={address.id} className="rounded-[24px] bg-surface-container-low p-5">
                  <p className="font-semibold text-on-surface">{address.label}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""} · {address.district} /{" "}
                    {address.city}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
                Kayıtlı adres bulunmuyor. İlk sipariş veya kurulum talebinizden sonra adres
                defteriniz oluşacak.
              </div>
            )}
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Güvenlik
          </h2>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Oturumunuz güvenli, httpOnly cookie ile tutulur. Şifre değişikliği ve iki aşamalı
            doğrulama bir sonraki müşteri paneli turuna hazır altyapı ile eklenecek.
          </p>
        </div>
      </aside>
    </div>
  );
}
