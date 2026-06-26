import Link from "next/link";
import Script from "next/script";

import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";
import { formatPublicNavigationLabel } from "@/lib/public-navigation-labels";

type SitePrimaryNavigationProps = {
  items: ReadonlyArray<PublicNavigationItem>;
};

const navLabelMap: Record<string, string> = {
  "/": "Anasayfa",
  "/magaza": "Mağaza",
  "/urun-secici": "Seçici",
  "/kurumsal-cozumler": "Site & İşletme",
  "/hizmetler": "Kurulum",
  "/blog": "Blog",
  "/iletisim": "İletişim"
};

const baseNavigationClassName =
  "rounded-full px-3.5 py-2 transition hover:bg-[#e5fff5] hover:text-primary";

const activeNavigationClassName =
  "bg-[#063326] text-[#7eecc9] shadow-[0_10px_28px_rgba(6,51,38,0.16)] hover:bg-linear-to-r hover:from-[#063326] hover:via-[#0f8f6f] hover:to-[#7eecc9] hover:text-white hover:shadow-[0_14px_34px_rgba(6,51,38,0.24)]";

function getPrimaryNavigationSyncScript() {
  const activeClassJson = JSON.stringify(activeNavigationClassName.split(/\s+/));

  return `
    (function(){
      if (window.__parkchargeevPrimaryNavigationReady) return;
      window.__parkchargeevPrimaryNavigationReady = true;
      var activeClasses = ${activeClassJson};

      function isActiveNavigationItem(pathname, href) {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.indexOf(href + "/") === 0;
      }

      function syncPrimaryNavigation() {
        var pathname = window.location.pathname || "/";
        document.querySelectorAll("[data-site-primary-nav-link]").forEach(function(link) {
          var href = link.getAttribute("data-href") || link.getAttribute("href") || "/";
          var isActive = isActiveNavigationItem(pathname, href);
          link.classList.remove.apply(link.classList, activeClasses);

          if (isActive) {
            link.classList.add.apply(link.classList, activeClasses);
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }

      function patchHistoryMethod(methodName) {
        var original = window.history[methodName];
        if (typeof original !== "function") return;
        window.history[methodName] = function() {
          var result = original.apply(this, arguments);
          window.setTimeout(syncPrimaryNavigation, 0);
          return result;
        };
      }

      patchHistoryMethod("pushState");
      patchHistoryMethod("replaceState");
      window.addEventListener("popstate", syncPrimaryNavigation);
      window.addEventListener("pageshow", syncPrimaryNavigation);
      document.addEventListener("click", function(event) {
        if (event.target instanceof Element && event.target.closest("[data-site-primary-nav-link]")) {
          window.setTimeout(syncPrimaryNavigation, 80);
        }
      }, true);
      syncPrimaryNavigation();
    })();
  `;
}

export function SitePrimaryNavigation({ items }: SitePrimaryNavigationProps) {
  return (
    <>
      <nav
        aria-label="Birincil navigasyon"
        className="hidden min-w-0 items-center gap-1 rounded-full border border-outline-variant/35 bg-white/76 p-1 text-sm font-bold text-on-surface-variant shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] xl:flex"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={item.opensInNewTab ? "_blank" : undefined}
            rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
            className={baseNavigationClassName}
            data-site-primary-nav-link
            data-href={item.href}
          >
            {navLabelMap[item.href] ?? formatPublicNavigationLabel(item)}
          </Link>
        ))}
      </nav>
      <Script id="parkchargeev-primary-navigation-sync" strategy="afterInteractive">
        {getPrimaryNavigationSyncScript()}
      </Script>
    </>
  );
}
