import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const [rootLayout, siteShell, premiumSection, scrollMotion, globalCss] = await Promise.all([
  source("src/app/layout.tsx"),
  source("src/components/layout/site-shell.tsx"),
  source("src/components/ui/premium-section.tsx"),
  source("src/components/layout/scroll-motion.tsx"),
  Promise.all([
    source("src/app/globals.css"),
    source("src/app/premium-motion-intensity.css")
  ]).then((parts) => parts.join("\n"))
]);

assert(
  !rootLayout.includes("GlobalAmbientLayer") && !rootLayout.includes("ScrollMotion"),
  "Root layout admin/checkout/sepet rotalarina ambiyans veya scroll runtime tasimamali."
);
assert(
  (siteShell.match(/<SiteAmbientLayer\s*\/>/g) ?? []).length === 1,
  "Public site tam olarak bir global ambiyans katmani render etmeli."
);
assert(
  (siteShell.match(/<ScrollMotion\s*\/>/g) ?? []).length === 1,
  "Scroll runtime yalnizca public site shell icinde calismali."
);
assert(
  premiumSection.includes("{ambient ? <PremiumSectionAtmosphere /> : null}"),
  "ambient=false iken atmosfer DOM'u uretilmemeli."
);
assert(
  scrollMotion.includes("requestAnimationFrame(syncPointerLight)") &&
    scrollMotion.includes("requestAnimationFrame(syncScrollProgress)"),
  "Pointer ve scroll islemleri animation-frame ile throttle edilmeli."
);
assert(
  scrollMotion.includes("if (document.hidden) return"),
  "Sekme gorunmezken motion runtime yeni frame planlamamali."
);
+assert(
+  scrollMotion.indexOf("document.documentElement.dataset.motionPerformance") <
+    scrollMotion.indexOf("new IntersectionObserver"),
+  "Lite/reduced-motion modu observer olusturulmadan once runtime dan cikmali."
);
assert(
  /prefers-reduced-motion:\s*reduce[\s\S]*\.site-ambient-circuit[\s\S]*display:\s*none/.test(
    globalCss
  ),
  "Reduced-motion altinda public ambiyans DOM'u gorunur/animasyonlu kalmamali."
);

console.log("Motion performance gate passed: public-only runtime, single ambient layer, reduced-motion guard.");
