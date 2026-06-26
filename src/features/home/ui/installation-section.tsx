import Link from "next/link";

import { PremiumSection } from "@/components/ui/premium-section";
import { installationSteps } from "@/features/home/domain/home-content";
import { HomeIcon } from "@/features/home/ui/home-icon";
import { conversionDataAttributes } from "@/lib/conversion-events";

export function InstallationSection() {
  return (
    <PremiumSection
      className="premium-install-section"
      containerClassName="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"
      tone="dark"
    >
        <div>
          <p className="premium-eyebrow text-emerald-300">Mühendislik ve kurulum</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-normal text-white md:text-4xl">
            Cihazdan önce altyapıyı, teslimden önce işletimi planlayın.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-base">
            Keşif, koruma ekipmanları, hat planı ve devreye alma adımları tek teknik
            kapsam altında ilerler.
          </p>
          <Link
            href="/hizmetler"
            className="premium-btn premium-btn--primary mt-7"
            {...conversionDataAttributes("installation_quote_click", {
              placement: "installation",
              href: "/hizmetler"
            })}
          >
            Kurulum hizmetleri
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {installationSteps.map((item) => (
            <article key={item.step} className="premium-install-card">
              <div className="flex items-center justify-between">
                <HomeIcon
                  icon={item.icon}
                  className="h-11 w-11 bg-white/[0.14] text-emerald-300"
                />
                <span className="text-sm font-bold text-white/76">{item.step}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/76">{item.body}</p>
            </article>
          ))}
        </div>
    </PremiumSection>
  );
}
