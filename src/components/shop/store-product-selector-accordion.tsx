"use client";

import { ExternalLink, Sparkles } from "lucide-react";

import { conversionDataAttributes } from "@/lib/conversion-events";

const selectorHref = "/urun-secici?source=magaza-secici";

export function StoreProductSelectorAccordion() {
  return (
    <a
      href={selectorHref}
      target="_blank"
      rel="noopener noreferrer"
      className="store-selector-launch"
      {...conversionDataAttributes("selector_open", {
        source: "store_new_window",
        href: selectorHref
      })}
    >
      <span className="store-selector-launch__icon">
        <Sparkles className="h-5 w-5" aria-hidden />
      </span>
      <span className="store-selector-launch__copy">
        <strong>Elektrikli araç şarj seçicisi</strong>
        <small>Yeni pencerede açılır; araç, güç ve kurulum yolunu hızlıca netleştirir.</small>
      </span>
      <b>
        Yeni Pencerede Aç
        <ExternalLink className="h-4 w-4" aria-hidden />
      </b>
    </a>
  );
}
