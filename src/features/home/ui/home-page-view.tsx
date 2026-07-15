import { EnterpriseCommerceSection } from "@/components/commerce/enterprise-commerce-section";
import { MotionGroup } from "@/components/ui/premium-section";
import type { HomePageData } from "@/features/home/application/get-home-page-data";
import { DecisionSystemSection } from "@/features/home/ui/decision-system-section";
import { HomeFinalCta } from "@/features/home/ui/home-final-cta";
import { HomeHero } from "@/features/home/ui/home-hero";
import { InstallationSection } from "@/features/home/ui/installation-section";
import { ProductShowcase } from "@/features/home/ui/product-showcase";
import { ProofResourcesSection } from "@/features/home/ui/proof-resources-section";

export function HomePageView({
  featuredProducts,
  featuredArticles,
  testimonials,
  whatsappHref
}: HomePageData) {
  return (
    <MotionGroup as="main" className="premium-home-page">
      <HomeHero whatsappHref={whatsappHref} />
      <ProductShowcase products={featuredProducts} />
      <EnterpriseCommerceSection />
      <DecisionSystemSection />
      <InstallationSection />
      <ProofResourcesSection
        articles={featuredArticles}
        testimonials={testimonials}
      />
      <HomeFinalCta whatsappHref={whatsappHref} />
    </MotionGroup>
  );
}
