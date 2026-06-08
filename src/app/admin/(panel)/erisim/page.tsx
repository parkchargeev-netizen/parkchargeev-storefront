import { redirect } from "next/navigation";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { getAdminAccessLinks, type AdminAccessLink } from "@/server/admin/access-map";
import { requireAdminRole } from "@/server/auth/guards";

const groupOrder: AdminAccessLink["group"][] = [
  "Operasyon",
  "Katalog",
  "İçerik",
  "Yönetim",
  "Dışarı Aktar"
];

function groupLinks(links: AdminAccessLink[]) {
  return groupOrder.map((group) => ({
    group,
    links: links.filter((link) => link.group === group)
  }));
}

export default async function AdminAccessMapPage() {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const links = getAdminAccessLinks(authenticatedAdmin.session.role);
  const groupedLinks = groupLinks(links).filter((section) => section.links.length > 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Erişim Haritası"
        title="Yetkili olduğunuz tüm admin alanları"
        description="Sidebar dışında kalan yeni kayıt, dışa aktarma ve operasyon kısayolları dahil panel içindeki tüm erişilebilir noktalar burada listelenir."
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {links.length} kısayol
          </span>
        }
      />

      {groupedLinks.map((section) => (
        <section key={section.group} className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">{section.group}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {section.links.map((link) => {
              const content = (
                <>
                  <p className="text-sm font-semibold text-slate-950">{link.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    {link.href.startsWith("/api/") ? "İndir" : "Aç"}
                  </p>
                </>
              );

              if (link.href.startsWith("/api/")) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <AdminPrefetchLink
                  key={link.href}
                  href={link.href}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  {content}
                </AdminPrefetchLink>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
