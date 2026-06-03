import type { ProductModel } from "@/lib/mock-data";

export type ProductStoreProfile = {
  powerTier: "11 kW" | "22 kW" | "DC" | "Aksesuar";
  phaseHint: string;
  connectorHint: string;
  installationHint: string;
  installationMode: "Tak-çalıştır" | "Sabit kurulum" | "Keşif gerekli" | "Kurulum gerekmez";
  decisionBadge: string;
  primaryFit: string;
  chargeSpeedHint: string;
  trustSignals: string[];
};

function productCorpus(product: ProductModel) {
  return [
    product.name,
    product.category,
    product.summary,
    product.description,
    product.powerLabel,
    product.highlights.join(" "),
    product.useCases.join(" "),
    product.seoIntent.join(" "),
    product.specs.map((spec) => `${spec.label} ${spec.value}`).join(" ")
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
}

export function getProductStoreProfile(product: ProductModel): ProductStoreProfile {
  const corpus = productCorpus(product);
  const category = product.category.toLocaleLowerCase("tr-TR");
  const isAccessory = category.includes("aksesuar") || corpus.includes("kablo");
  const isDc = corpus.includes("dc") || corpus.includes("60kw");
  const is22Kw = corpus.includes("22") || product.powerLabel.includes("22");
  const isPortable = corpus.includes("taşınabilir") || corpus.includes("portable");
  const hasLoadManagement =
    corpus.includes("yük") ||
    corpus.includes("load") ||
    corpus.includes("ocpp") ||
    corpus.includes("rfid") ||
    corpus.includes("wifi") ||
    corpus.includes("wi-fi");

  const powerTier = isAccessory ? "Aksesuar" : isDc ? "DC" : is22Kw ? "22 kW" : "11 kW";
  const installationMode = isAccessory
    ? "Kurulum gerekmez"
    : isDc
      ? "Keşif gerekli"
      : is22Kw
        ? "Sabit kurulum"
        : isPortable
          ? "Tak-çalıştır"
          : "Sabit kurulum";
  const connectorHint = corpus.includes("ccs")
    ? "CCS2"
    : corpus.includes("type 2") || corpus.includes("tip 2")
      ? "Type 2"
      : isAccessory
        ? "Type 2 uyumlu"
        : "Type 2 / araç uyumlu";
  const phaseHint = isAccessory
    ? "Araç soketi"
    : isDc
      ? "DC hızlı şarj"
      : is22Kw
        ? "Trifaze 32A"
        : "Monofaze / trifaze uyumlu";

  return {
    powerTier,
    phaseHint,
    connectorHint,
    installationHint: isAccessory
      ? "Montaj gerektirmez"
      : isDc
        ? "Saha keşfi ile projelendirilir"
        : is22Kw
          ? "Pano ve hat uygunluğu kontrol edilir"
          : "Ev ve küçük işletme için hızlı kurulum",
    installationMode,
    decisionBadge: isAccessory
      ? "Tamamlayıcı ürün"
      : hasLoadManagement
        ? "Akıllı yönetim"
        : is22Kw
          ? "Hızlı AC"
          : "Ev için ideal",
    primaryFit: isAccessory
      ? "Kablo ve adaptör ihtiyacı"
      : isDc
        ? "Ticari lokasyon ve filo"
        : is22Kw
          ? "Site, ofis ve yüksek AC ihtiyacı"
          : "Ev, villa ve günlük şarj",
    chargeSpeedHint: isAccessory
      ? "Şarj altyapısını tamamlar"
      : isDc
        ? "Kısa duraklamalı ticari şarj"
        : is22Kw
          ? "Togg ve 22 kW AC destekli araçlarda avantajlı"
          : "Gece şarjı ve günlük kullanım için dengeli",
    trustSignals: [
      product.stockLabel === "Stokta Yok" ? "Stok bekleniyor" : "Stok kontrolü hazır",
      hasLoadManagement ? "Yük / erişim yönetimi" : "Kurulum danışmanlığı",
      isAccessory ? "Uyumluluk kontrolü" : "Keşif desteği"
    ]
  };
}

export function getStoreFilterOptions(products: ProductModel[]) {
  const profiles = products.map((product) => getProductStoreProfile(product));

  return {
    powerTiers: Array.from(new Set(profiles.map((profile) => profile.powerTier))),
    installationModes: Array.from(new Set(profiles.map((profile) => profile.installationMode)))
  };
}
