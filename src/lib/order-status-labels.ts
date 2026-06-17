export const orderStatusLabels: Record<string, string> = {
  draft: "Taslak",
  pending_payment: "Ödeme bekliyor",
  payment_processing: "Ödeme işleniyor",
  pending_confirmation: "Ödeme alındı, onay bekliyor",
  paid: "Ödendi",
  confirmed: "Onaylandı",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  failed: "Başarısız",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
  fulfilled: "Tamamlandı"
};

export const paymentStatusLabels: Record<string, string> = {
  pending: "Ödeme bekliyor",
  paid: "Ödeme alındı",
  success: "Ödeme başarılı",
  authorized: "Ödeme yetkilendirildi",
  failed: "Ödeme başarısız",
  setup_failed: "Ödeme başlatılamadı",
  token_failed: "Ödeme oturumu açılamadı",
  refunded: "İade edildi"
};

export const transactionStatusLabels: Record<string, string> = {
  created: "Ödeme kaydı oluşturuldu",
  token_requested: "Ödeme oturumu isteniyor",
  token_received: "PayTR ekranı hazır",
  token_failed: "PayTR ekranı açılamadı",
  callback_success: "PayTR ödemeyi onayladı",
  callback_failed: "PayTR ödeme hatası bildirdi"
};

export function formatOrderStatusLabel(
  status?: string | null,
  fallback = "Hazırlanıyor"
) {
  return status ? orderStatusLabels[status] ?? status : fallback;
}

export function formatPaymentStatusLabel(
  status?: string | null,
  fallback = "Bekleniyor"
) {
  return status ? paymentStatusLabels[status] ?? status : fallback;
}

export function formatTransactionStatusLabel(
  status?: string | null,
  fallback = "Henüz PayTR bildirimi yok"
) {
  return status ? transactionStatusLabels[status] ?? status : fallback;
}
