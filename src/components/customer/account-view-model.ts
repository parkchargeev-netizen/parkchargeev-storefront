import type { getCustomerAccountSnapshot } from "@/server/customer/account-repository";

export type AccountSnapshot = NonNullable<Awaited<ReturnType<typeof getCustomerAccountSnapshot>>>;
export type AccountOrder = AccountSnapshot["recentOrders"][number];

export const orderStatusLabel: Record<string, string> = {
  draft: "Taslak",
  pending_payment: "Ödeme bekliyor",
  payment_processing: "Ödeme işleniyor",
  pending_confirmation: "Onay bekliyor",
  paid: "Ödendi",
  confirmed: "Onaylandı",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  failed: "Başarısız",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
  fulfilled: "Tamamlandı"
};

export const paymentStatusLabel: Record<string, string> = {
  pending: "Ödeme bekliyor",
  paid: "Ödeme alındı",
  success: "Ödeme başarılı",
  failed: "Ödeme başarısız",
  refunded: "İade edildi"
};

export function formatAccountDate(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(value);
}

export function getOrderProgress(status: string) {
  if (["draft", "pending_payment", "payment_processing"].includes(status)) {
    return 1;
  }

  if (["pending_confirmation", "paid"].includes(status)) {
    return 2;
  }

  if (status === "confirmed") {
    return 3;
  }

  if (status === "shipped") {
    return 4;
  }

  if (["delivered", "fulfilled"].includes(status)) {
    return 5;
  }

  return 1;
}

export function getOpenOrders(orders: AccountSnapshot["recentOrders"]) {
  return orders.filter(
    (order) => !["delivered", "fulfilled", "cancelled", "refunded", "failed"].includes(order.status)
  );
}

export function getProfileScore(snapshot: AccountSnapshot) {
  const checks = [
    Boolean(snapshot.customer.firstName),
    Boolean(snapshot.customer.lastName),
    Boolean(snapshot.customer.phone),
    snapshot.addresses.length > 0
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function getActionItems(snapshot: AccountSnapshot) {
  const openOrders = getOpenOrders(snapshot.recentOrders);
  const actions = [];

  if (openOrders.length > 0) {
    actions.push({
      title: "Açık siparişi takip et",
      detail: `${openOrders[0].orderNumber} şu an ${orderStatusLabel[openOrders[0].status] ?? openOrders[0].status}.`,
      href: "#siparisler"
    });
  }

  if (snapshot.addresses.length === 0) {
    actions.push({
      title: "Kurulum adresi ekle",
      detail: "Adres defteri boş olduğu için checkout ve saha planlama yavaşlayabilir.",
      href: "#adresler"
    });
  }

  if (!snapshot.customer.phone) {
    actions.push({
      title: "Telefon bilgisini tamamla",
      detail: "Saha ekibi keşif ve teslimat için telefon numarasına ihtiyaç duyar.",
      href: "#profil"
    });
  }

  if (snapshot.recentQuoteRequests.some((quote) => quote.status === "new")) {
    actions.push({
      title: "Teklif talebini izle",
      detail: "Yeni teklif talebiniz operasyon kuyruğunda görünüyor.",
      href: "#destek"
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "Panel güncel",
      detail: "Profil, adres ve sipariş takip alanlarında bekleyen kritik aksiyon yok.",
      href: "/magaza"
    });
  }

  return actions.slice(0, 4);
}
