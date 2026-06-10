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
  paid: "Ödeme alindi",
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

export function getCustomerPanelStage(snapshot: AccountSnapshot) {
  const openOrders = getOpenOrders(snapshot.recentOrders);
  const activeQuote = snapshot.recentQuoteRequests.find((quote) =>
    ["new", "reviewing", "proposal_sent", "negotiation"].includes(quote.status)
  );
  const activeService = snapshot.recentServiceLeads.find((lead) =>
    ["new", "contacted", "qualified", "scheduled"].includes(lead.status)
  );

  if (openOrders.length > 0) {
    return {
      label: "Sipariş takipte",
      detail: `${openOrders[0].orderNumber} için ödeme, kargo veya onay akışını izleyin.`,
      href: "#siparisler"
    };
  }

  if (activeService) {
    return {
      label: "Saha süreci açık",
      detail: `${activeService.city ?? "Saha"} talebiniz keşif, servis veya kurulum ekibinde görünür.`,
      href: "#destek"
    };
  }

  if (activeQuote) {
    return {
      label: "Teklif süreci açık",
      detail: `${activeQuote.segment ?? "Çözüm"} talebiniz teklif masasinda değerlendiriliyor.`,
      href: "#destek"
    };
  }

  if (getProfileScore(snapshot) < 100) {
    return {
      label: "Profil tamamlanmali",
      detail: "Telefon ve kurulum adresi tamamlanirsa teklif ve saha planlama hızlanır.",
      href: "#profil"
    };
  }

  return {
    label: "Yeni çözüm secilebilir",
    detail: "Aracınız veya otoparkınız için doğru cihazı ürün seçiciyle netleştirin.",
    href: "/urun-secici"
  };
}

export function getCustomerSegmentLabel(snapshot: AccountSnapshot) {
  const quoteSegment = snapshot.recentQuoteRequests[0]?.segment?.toLowerCase();
  const serviceProjectType = snapshot.recentServiceLeads[0]?.projectType?.toLowerCase();

  if (quoteSegment?.includes("site") || serviceProjectType?.includes("apartman")) {
    return "Site / apartman karar vericisi";
  }

  if (quoteSegment?.includes("kurumsal") || serviceProjectType?.includes("ofis")) {
    return "KOBI / ofis kullanıcısı";
  }

  if (quoteSegment?.includes("ticari") || serviceProjectType?.includes("dc")) {
    return "Ticari lokasyon yatirimcisi";
  }

  if (
    snapshot.recentOrders.some((order) =>
      order.items.some((item) => item.productName.toLowerCase().includes("kablo"))
    )
  ) {
    return "Aksesuar alıcısi";
  }

  return "Ev tipi AC şarj alıcısi";
}

export function getActionItems(snapshot: AccountSnapshot) {
  const openOrders = getOpenOrders(snapshot.recentOrders);
  const actions = [];

  if (openOrders.length > 0) {
    actions.push({
      title: "Açık siparişi takip et",
      detail: `${openOrders[0].orderNumber} su an ${
        orderStatusLabel[openOrders[0].status] ?? openOrders[0].status
      }.`,
      href: "#siparisler"
    });
  }

  if (snapshot.addresses.length === 0) {
    actions.push({
      title: "Kurulum adresi ekle",
      detail: "Adres defteri boş oldugu için checkout ve saha planlama yavaslayabilir.",
      href: "#adresler"
    });
  }

  if (!snapshot.customer.phone) {
    actions.push({
      title: "Telefon bilgisini tamamla",
      detail: "Saha ekibi keşif ve teslimat için telefon numarasina ihtiyac duyar.",
      href: "#profil"
    });
  }

  if (snapshot.recentQuoteRequests.some((quote) => quote.status === "new")) {
    actions.push({
      title: "Teklif talebini izle",
      detail: "Yeni teklif talebiniz operasyon kuyrugunda görünüyor.",
      href: "#destek"
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "Panel güncel",
      detail: "Profil, adres ve sipariş takip alanlarinda bekleyen kritik aksiyon yok.",
      href: "/magaza"
    });
  }

  return actions.slice(0, 4);
}
