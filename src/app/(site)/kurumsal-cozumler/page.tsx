import type { Metadata } from "next";

import { getCorporateSolutionsPageData } from "@/features/corporate/application/get-corporate-solutions-page-data";
import { CorporateSolutionsView } from "@/features/corporate/ui/corporate-solutions-view";

export const metadata: Metadata = {
  title: "Site ve İşletme Şarj Çözümleri",
  description:
    "Site, apartman, iş yeri, ofis, filo ve otopark projeleri için kurumsal EV şarj altyapısı çözümleri.",
  alternates: {
    canonical: "/kurumsal-cozumler"
  }
};

export default function CorporateSolutionsPage() {
  return <CorporateSolutionsView {...getCorporateSolutionsPageData()} />;
}
