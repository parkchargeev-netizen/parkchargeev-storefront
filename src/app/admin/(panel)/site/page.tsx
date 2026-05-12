import { SiteManagementPanel } from "@/components/admin/site-management-panel";

type AdminSitePageProps = {
  searchParams?: Promise<{
    editNav?: string;
    editPage?: string;
    newNav?: string;
    newPage?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function AdminSitePage({ searchParams }: AdminSitePageProps) {
  const query = (await searchParams) ?? {};

  return <SiteManagementPanel query={query} basePath="/admin/site" />;
}
