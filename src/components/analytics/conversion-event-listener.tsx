"use client";

import { useEffect } from "react";

import {
  trackConversionEvent,
  type ConversionEventName
} from "@/lib/conversion-events";

function isConversionEventName(value: string): value is ConversionEventName {
  return [
    "add_to_cart",
    "checkout_start",
    "contact_submit",
    "hero_cta_click",
    "persona_route_click",
    "product_filter_apply",
    "purchase_mode_select"
  ].includes(value);
}

function parsePayload(value: string | null | undefined) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function ConversionEventListener() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const conversionTarget = target?.closest<HTMLElement>("[data-conversion-event]");
      const eventName = conversionTarget?.dataset.conversionEvent;

      if (!eventName || !isConversionEventName(eventName)) {
        return;
      }

      trackConversionEvent(
        eventName,
        parsePayload(conversionTarget.dataset.conversionPayload)
      );
    }

    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
