import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { SitePageDeleteButton } from "@/components/admin/site-page-delete-button";
import { SiteManagementFormSlot } from "@/components/admin/site-management-form-slot";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import {
  getAdminNavigationItemById,
  getAdminSitePageById,
  listAdminNavigationItems,
  listAdminSitePages
} from "@/server/admin/site-management";

type SiteManagementPanelProps = {
  query?: {
    editNav?: string;
    editPage?: string;
    newNav?: string;
    newPage?: string;
    q?: string;
    status?: string;
  };
  basePath?: string;
};

const pageFrequencies = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

function areaLabel(area: string) {
  switch (area) {
    case "primary":
      return "Üst menü";
    case "footer":
      return "Footer";
    case "legal":
      return "Destek";
    default:
      return area;
  }
}

function pageStatusLabel(status: string) {
  switch (status) {
    case "published":
      return "Yayında";
    case "draft":
      return "Taslak";
    case "archived":
      return "Arşiv";
    default:
      return status;
  }
}

function normalizeFrequency(value: string) {
  return pageFrequencies.includes(value as (typeof pageFrequencies)[number])
    ? (value as (typeof pageFrequencies)[number])
    : "monthly";
}

function siteHref(basePath: string, status?: string) {
  return status ? `${basePath}?status=${status}#site-management` : `${basePath}#site-management`;
}

function editHref(basePath: string, type: "editNav" | "editPage", id: string) {
  const anchor = type === "editNav" ? "navigation-editor" : "site-page-editor";
  return `${basePath}?${type}=${id}#${anchor}`;
}

function createHref(basePath: string, type: "newNav" | "newPage") {
  const anchor = type === "newNav" ? "new-navigation" : "new-site-page";
  return `${basePath}?${type}=1#${anchor}`;
}

export async function SiteManagementPanel({
  query = {},
  basePath = "/admin"
}: SiteManagementPanelProps) {
  const [navigation, pages, selectedNavigationItem, selectedPage] = await Promise.all([
    listAdminNavigationItems({ q: query.q, status: query.status, limit: 50 }),
    listAdminSitePages({ q: query.q, status: query.status, limit: 50 }),
    query.editNav ? getAdminNavigationItemById(query.editNav) : Promise.resolve(null),
    query.editPage ? getAdminSitePageById(query.editPage) : Promise.resolve(null)
  ]);
  const activeNavigationCount = navigation.items.filter((item) => item.isActive).length;
  const publishedPageCount = pages.items.filter((page) => page.status === "published").length;
  const draftPageCount = pages.items.filter((page) => page.status === "draft").length;
  const showNewNavigationForm = query.newNav === "1";
  const showNewPageForm = query.newPage === "1";
  const globalControlLinks = [
    {
      href: createHref(basePath, "newNav"),
      title: "Menü ve footer",
      body: "Üst menü, footer ve destek linklerini düzenleyin. Kısa etiket, doğru URL ve sıralama yeterlidir.",
      action: "Link yönet"
    },
    {
      href: createHref(basePath, "newPage"),
      title: "Sayfa ve SEO",
      body: "Hakkımızda, hizmet, kampanya ve özel landing sayfalarının başlık, içerik, SEO ve sitemap kararlarını yönetin.",
      action: "Sayfa yönet"
    },
    {
      href: "/admin/urunler",
      title: "Ürün vitrini",
      body: "Ürün adı, fiyat, stok, teknik özellik, görsel, video, araç uyumu ve detay sayfası içeriklerini güncelleyin.",
      action: "Ürünlere git"
    },
    {
      href: "/admin/blog",
      title: "Blog ve rehberler",
      body: "SEO odaklı rehberleri, satın alma itirazlarını azaltan içerikleri ve yayın durumunu düzenleyin.",
      action: "İçerikleri yönet"
    },
    {
      href: "/admin/siparisler",
      title: "Sipariş ve ödeme",
      body: "Sepet sonrası siparişleri, ödeme akışını ve PayTR durumlarını operasyon ekranlarından takip edin.",
      action: "Siparişlere git"
    },
    {
      href: "/admin/teklifler",
      title: "Keşif ve teklif",
      body: "Ücretsiz keşif, kurumsal teklif, saha planı ve müşteri taleplerini satış sürecine bağlayın.",
      action: "Talepleri yönet"
    }
  ];
  const adminWritingGuide = [
    "Menü etiketi 1-2 kelime olsun: Mağaza, Kurulum, Blog gibi.",
    "Sayfa başlığı müşterinin aradığı niyeti söylesin: Ev tipi şarj cihazı kurulumu gibi.",
    "Kısa özet tek paragraf olsun; kim için, ne fayda sağlar ve sonraki adım nedir cevaplasın.",
    "SEO açıklaması 140-160 karakter aralığında, şehir/hizmet/ürün niyetini net taşısın.",
    "Yayınlamadan önce önizleme, sitemap ve noindex kararlarını mutlaka kontrol edin."
  ];

  return (
    <section id="site-management" className="scroll-mt-6 space-y-6">
      <AdminPageHeader
        eyebrow="Site Yönetimi"
        title="Tek ekrandan navbar, sayfa ve SEO kontrolü"
        description="Üst menü, footer, destek linkleri, yönetilebilir sayfalar, sitemap ve noindex kararlarını aynı operasyon ekranından yönetin."
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {navigation.items.length} link
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {pages.items.length} sayfa
            </span>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="surface-card border border-emerald-100 bg-white/95 p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Site genel kontrol merkezi
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Tüm siteye buradan müdahale edin.
              </h2>
            </div>
            <AdminPrefetchLink
              href="/admin/audit"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
            >
              Değişiklik geçmişi
            </AdminPrefetchLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {globalControlLinks.map((item) => (
              <AdminPrefetchLink
                key={item.href}
                href={item.href}
                className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.body}</p>
                <span className="mt-4 inline-flex text-xs font-semibold text-emerald-800">
                  {item.action}
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </section>

        <aside className="surface-card border border-slate-200 bg-slate-950 p-5 text-white lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
            Yazım rehberi
          </p>
          <h2 className="mt-2 text-xl font-semibold">Nereye, ne, nasıl yazılır?</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
            {adminWritingGuide.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: siteHref(basePath, "primary"),
            label: "Üst menü",
            value: String(navigation.items.filter((item) => item.area === "primary").length),
            detail: "Header navigasyonu"
          },
          {
            href: siteHref(basePath, "footer"),
            label: "Footer",
            value: String(navigation.items.filter((item) => item.area === "footer").length),
            detail: "Alt navigasyon linkleri"
          },
          {
            href: siteHref(basePath, "published"),
            label: "Yayındaki sayfalar",
            value: String(publishedPageCount),
            detail: "Yayında görünen CMS sayfaları"
          },
          {
            href: siteHref(basePath, "draft"),
            label: "Taslak sayfalar",
            value: String(draftPageCount),
            detail: "Hazırlıktaki sayfalar"
          }
        ].map((item) => (
          <AdminPrefetchLink
            key={item.href}
            href={item.href}
            className="surface-card border border-slate-200 bg-white/95 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/70"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
          </AdminPrefetchLink>
        ))}
      </div>

      <AdminFilterBar>
        <form action={`${basePath}#site-management`} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Link, sayfa veya slug ara"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm durum / alanlar</option>
            <option value="published">Yayında sayfalar</option>
            <option value="draft">Taslak sayfalar</option>
            <option value="primary">Üst menü</option>
            <option value="footer">Footer</option>
            <option value="legal">Destek</option>
          </select>
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Filtrele
          </button>
        </form>
      </AdminFilterBar>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { href: siteHref(basePath), label: "Tüm alanlar" },
          { href: siteHref(basePath, "primary"), label: "Üst menü" },
          { href: siteHref(basePath, "footer"), label: "Footer" },
          { href: siteHref(basePath, "legal"), label: "Destek linkleri" },
          { href: siteHref(basePath, "published"), label: "Yayındaki sayfalar" },
          { href: siteHref(basePath, "draft"), label: "Taslak sayfalar" }
        ].map((item) => (
          <AdminPrefetchLink
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
          >
            {item.label}
          </AdminPrefetchLink>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(320px,0.85fr)_minmax(520px,1.15fr)]">
        <section id="new-navigation" className="surface-card scroll-mt-6 border border-slate-200 bg-white/95 p-5 lg:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Yeni navigasyon linki</h2>
              <p className="mt-1 text-sm text-slate-600">
                Aktif linkler kaydedildikten sonra yayındaki navbar/footer önbelleği yenilenir.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {activeNavigationCount} aktif
            </span>
          </div>
          {showNewNavigationForm ? (
            <div className="mt-5">
              <SiteManagementFormSlot kind="navigation" mode="create" />
            </div>
          ) : (
            <AdminPrefetchLink
              href={createHref(basePath, "newNav")}
              className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Menü linki ekle
            </AdminPrefetchLink>
          )}
        </section>

        <section id="new-site-page" className="surface-card scroll-mt-6 border border-slate-200 bg-white/95 p-5 lg:p-6">
          <h2 className="text-xl font-semibold text-slate-950">Yeni detaylı sayfa</h2>
          <p className="mt-1 text-sm text-slate-600">
            Slug, hero, HTML içerik, SEO, sosyal görsel, sitemap ve yayın kararlarını birlikte girin.
          </p>
          {showNewPageForm ? (
            <div className="mt-5">
              <SiteManagementFormSlot kind="page" mode="create" />
            </div>
          ) : (
            <AdminPrefetchLink
              href={createHref(basePath, "newPage")}
              className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Detaylı sayfa ekle
            </AdminPrefetchLink>
          )}
        </section>
      </div>

      {selectedNavigationItem ? (
        <section id="navigation-editor" className="surface-card scroll-mt-6 border border-emerald-200 bg-emerald-50/80 p-5 lg:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Navigasyon düzenle
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {selectedNavigationItem.label}
              </h2>
            </div>
            <AdminPrefetchLink
              href={`${basePath}#site-management`}
              className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
            >
              Kapat
            </AdminPrefetchLink>
          </div>
          <SiteManagementFormSlot
            kind="navigation"
            mode="edit"
            item={{
              id: selectedNavigationItem.id,
              area: selectedNavigationItem.area,
              label: selectedNavigationItem.label,
              href: selectedNavigationItem.href,
              sortOrder: selectedNavigationItem.sortOrder,
              isActive: selectedNavigationItem.isActive,
              opensInNewTab: selectedNavigationItem.opensInNewTab,
              rel: selectedNavigationItem.rel ?? ""
            }}
          />
        </section>
      ) : null}

      {selectedPage ? (
        <section id="site-page-editor" className="surface-card scroll-mt-6 border border-emerald-200 bg-emerald-50/80 p-5 lg:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Sayfa düzenle
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedPage.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminPrefetchLink
                href={`${basePath}#site-management`}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
              >
                Kapat
              </AdminPrefetchLink>
              <SitePageDeleteButton
                id={selectedPage.id}
                title={selectedPage.title}
                returnHref={`${basePath}#site-management`}
              />
            </div>
          </div>
          <SiteManagementFormSlot
            kind="page"
            mode="edit"
            page={{
              id: selectedPage.id,
              slug: selectedPage.slug,
              title: selectedPage.title,
              eyebrow: selectedPage.eyebrow ?? "",
              excerpt: selectedPage.excerpt,
              body: selectedPage.body,
              seoTitle: selectedPage.seoTitle ?? "",
              seoDescription: selectedPage.seoDescription ?? "",
              canonicalUrl: selectedPage.canonicalUrl ?? "",
              ogImageUrl: selectedPage.ogImageUrl ?? "",
              status: selectedPage.status,
              showInSitemap: selectedPage.showInSitemap,
              noIndex: selectedPage.noIndex,
              sitemapPriority: selectedPage.sitemapPriority,
              changeFrequency: normalizeFrequency(selectedPage.changeFrequency)
            }}
          />
        </section>
      ) : null}

      <section className="surface-card border border-slate-200 bg-white/95 p-5 lg:p-6">
        <h2 className="text-xl font-semibold text-slate-950">Navigasyon linkleri</h2>
        <div className="mt-5 space-y-4">
          {navigation.items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 break-all text-sm text-slate-600">{item.href}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={areaLabel(item.area)} tone="info" />
                  <AdminStatusBadge label={item.isActive ? "Aktif" : "Pasif"} tone={item.isActive ? "success" : "neutral"} />
                  <AdminPrefetchLink
                    href={editHref(basePath, "editNav", item.id)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
                  >
                    Düzenle
                  </AdminPrefetchLink>
                </div>
              </div>
            </div>
          ))}
          {navigation.items.length === 0 ? (
            <p className="text-sm text-slate-500">Navigasyon kaydı yoksa site sabit menüyü kullanır.</p>
          ) : null}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-5 lg:p-6">
        <h2 className="text-xl font-semibold text-slate-950">Yönetilebilir sayfalar</h2>
        <div className="mt-5 space-y-4">
          {pages.items.map((page) => (
            <div key={page.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{page.title}</p>
                  <p className="mt-1 break-all text-sm text-slate-600">/{page.slug}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{page.excerpt}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={pageStatusLabel(page.status)} tone={page.status === "published" ? "success" : page.status === "draft" ? "warning" : "neutral"} />
                  {page.noIndex ? <AdminStatusBadge label="Noindex" tone="warning" /> : null}
                  {!page.showInSitemap ? <AdminStatusBadge label="Sitemap dışı" tone="neutral" /> : null}
                  <AdminPrefetchLink href={`/${page.slug}`} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                    Aç
                  </AdminPrefetchLink>
                  <AdminPrefetchLink
                    href={editHref(basePath, "editPage", page.id)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
                  >
                    Düzenle
                  </AdminPrefetchLink>
                  <SitePageDeleteButton
                    id={page.id}
                    title={page.title}
                    returnHref={`${basePath}#site-management`}
                  />
                </div>
              </div>
            </div>
          ))}
          {pages.items.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz yönetilebilir sayfa yok.</p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
