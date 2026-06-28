import {
  ArchiveOperationButton,
  BannerForm,
  CampaignForm,
  MerchandisingSlotForm
} from "@/components/admin/operation-forms";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import {
  listAdminBanners,
  listAdminCampaigns,
  listAdminMerchandisingSlots
} from "@/server/admin/operations";

export default async function AdminCampaignsPage() {
  const [bannersResult, campaignsResult, slotsResult] = await Promise.all([
    listAdminBanners({ limit: 8 }),
    listAdminCampaigns({ limit: 8 }),
    listAdminMerchandisingSlots({ limit: 8 })
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Kampanya ve Vitrin"
        title="Banner, kampanya ve vitrin yonetimi"
        description="Ana sayfa ve magazayi besleyen banner, indirim kampanyasi ve vitrin slotlari gercek kayitlarla yonetilir."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <BannerForm />
        <CampaignForm />
        <MerchandisingSlotForm />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ContentList
          title="Bannerlar"
          endpoint="/api/admin/banners"
          items={bannersResult.items.map((item) => ({
            id: item.id,
            title: item.title,
            meta: `${item.placement} / ${item.status}`
          }))}
        />
        <ContentList
          title="Kampanyalar"
          endpoint="/api/admin/campaigns"
          items={campaignsResult.items.map((item) => ({
            id: item.id,
            title: item.name,
            meta: `${item.discountType} / ${item.discountValue} / ${item.status}`
          }))}
        />
        <ContentList
          title="Vitrin slotlari"
          endpoint="/api/admin/merchandising"
          archiveLabel="Pasife al"
          items={slotsResult.items.map((item) => ({
            id: item.id,
            title: item.title ?? item.slotKey,
            meta: `${item.slotKey} / ${item.isActive ? "aktif" : "pasif"}`
          }))}
        />
      </div>
    </div>
  );
}

function ContentList({
  title,
  items,
  endpoint,
  archiveLabel
}: {
  title: string;
  items: Array<{ id: string; title: string; meta: string }>;
  endpoint: string;
  archiveLabel?: string;
}) {
  return (
    <section className="surface-card border border-slate-200 bg-white/95 p-5">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
              <ArchiveOperationButton
                endpoint={endpoint}
                id={item.id}
                label={archiveLabel ?? "Arsivle"}
              />
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Henuz kayit yok.</p>
        )}
      </div>
    </section>
  );
}
