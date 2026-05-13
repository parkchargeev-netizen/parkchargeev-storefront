import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { listAdminBlogPosts } from "@/server/admin/repository";

type AdminBlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
  }>;
};

function buildExportHref(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("format", "csv");
  params.set("limit", "50");
  return `/api/admin/blog?${params.toString()}`;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminBlogPosts({ ...query, limit: 12 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="İçerik Yönetimi"
        title="Blog ve rehber yazıları"
        description="Editör rolünün kullanabileceği blog içerik akışı bu ekrandan yönetilir."
        action={
          <>
            <a href={buildExportHref(query)} className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
              CSV indir
            </a>
            <Link href="/admin/blog/yeni" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Yeni içerik
            </Link>
          </>
        }
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {result.items.length} kayıt
          </span>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_170px_170px_auto]">
          <input name="q" defaultValue={query.q ?? ""} placeholder="Başlık veya slug ara" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <select name="status" defaultValue={query.status ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm">
            <option value="">Tüm durumlar</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
          <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
        </form>
      </AdminFilterBar>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3">İçerik</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">Güncelleme</th>
                <th className="px-3 py-3">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.items.map((post) => (
                <tr key={post.id}>
                  <td className="px-3 py-4">
                    <Link href={`/admin/blog/${post.id}`} className="font-semibold text-slate-950 transition hover:text-blue-700">
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{post.slug}</p>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">{post.excerpt}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge label={post.publishedAt ? "Yayında" : "Taslak"} tone={post.publishedAt ? "success" : "warning"} />
                  </td>
                  <td className="px-3 py-4 text-slate-600">{new Date(post.updatedAt).toLocaleDateString("tr-TR")}</td>
                  <td className="px-3 py-4">
                    <Link href={`/admin/blog/${post.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          {result.nextCursor ? (
            <Link href={`/admin/blog?cursor=${encodeURIComponent(result.nextCursor)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Sonraki sayfa
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Tüm kayıtlar yüklendi.</span>
          )}
        </div>
      </section>
    </div>
  );
}
