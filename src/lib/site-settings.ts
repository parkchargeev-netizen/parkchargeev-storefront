import { siteConfig } from "@/lib/site";

export type SiteSettingsSocials = {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
};

export type PublicSiteSettings = {
  id?: string;
  brandName: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  phone: string;
  email: string;
  whatsappPhone: string;
  supportHours: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  mapEmbedUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  shippingSettings: {
    freeShippingThresholdKurus?: number;
    defaultShippingKurus?: number;
    carrierName?: string;
  };
  taxSettings: {
    vatRate?: number;
    pricesIncludeVat?: boolean;
  };
  paymentSettings: {
    provider?: string;
    testMode?: boolean;
    installmentEnabled?: boolean;
  };
  serviceAreas: string[];
  socials: SiteSettingsSocials;
  updatedAt?: Date;
};

export function getFallbackSiteSettings(): PublicSiteSettings {
  return {
    brandName: siteConfig.name,
    description: siteConfig.description,
    logoUrl: "",
    logoAlt: siteConfig.name,
    phone: siteConfig.phone,
    email: siteConfig.email,
    whatsappPhone: siteConfig.whatsappPhone,
    supportHours: siteConfig.supportHours,
    address: {
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry
    },
    mapEmbedUrl: "",
    maintenanceMode: false,
    maintenanceMessage: "",
    shippingSettings: {},
    taxSettings: {},
    paymentSettings: {},
    serviceAreas: [...siteConfig.serviceAreas],
    socials: { ...siteConfig.socials }
  };
}

export function normalizePublicSiteSettings(
  value: Partial<PublicSiteSettings> | null | undefined
): PublicSiteSettings {
  const fallback = getFallbackSiteSettings();

  if (!value) {
    return fallback;
  }

  return {
    ...fallback,
    ...value,
    logoAlt: value.logoAlt || value.brandName || fallback.logoAlt,
    address: {
      ...fallback.address,
      ...(value.address ?? {})
    },
    shippingSettings: {
      ...fallback.shippingSettings,
      ...(value.shippingSettings ?? {})
    },
    taxSettings: {
      ...fallback.taxSettings,
      ...(value.taxSettings ?? {})
    },
    paymentSettings: {
      ...fallback.paymentSettings,
      ...(value.paymentSettings ?? {})
    },
    serviceAreas:
      Array.isArray(value.serviceAreas) && value.serviceAreas.length > 0
        ? value.serviceAreas.filter(Boolean)
        : fallback.serviceAreas,
    socials: {
      ...fallback.socials,
      ...(value.socials ?? {})
    }
  };
}

export function formatSiteAddress(settings: PublicSiteSettings) {
  return [
    settings.address.streetAddress,
    [settings.address.addressLocality, settings.address.addressRegion].filter(Boolean).join(" / ")
  ]
    .filter(Boolean)
    .join(", ");
}
