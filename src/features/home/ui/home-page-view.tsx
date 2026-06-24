import type { HomePageData } from "@/features/home/application/get-home-page-data";
import { DecisionSystemSection } from "@/features/home/ui/decision-system-section";
import { HomeFinalCta } from "@/features/home/ui/home-final-cta";
import { HomeHero } from "@/features/home/ui/home-hero";
import { InstallationSection } from "@/features/home/ui/installation-section";
import { ProductShowcase } from "@/features/home/ui/product-showcase";
import { ProofResourcesSection } from "@/features/home/ui/proof-resources-section";
import { SolutionRoutesSection } from "@/features/home/ui/solution-routes-section";

export function HomePageView({
  featuredProducts,
  featuredArticles,
  testimonials,
  whatsappHref
}: HomePageData) {
  return (
    <main className="premium-home-page">
      <HomeHero whatsappHref={whatsappHref} />
      <SolutionRoutesSection />
      <DecisionSystemSection />
      <ProductShowcase products={featuredProducts} />
      <InstallationSection />
      <ProofResourcesSection
        articles={featuredArticles}
        testimonials={testimonials}
      />
      <HomeFinalCta whatsappHref={whatsappHref} />
    </main>
  );
}
