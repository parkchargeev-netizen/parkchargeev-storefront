import { redirect } from "next/navigation";

type ServiceLeadDetailRedirectProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceLeadDetailRedirectPage({ params }: ServiceLeadDetailRedirectProps) {
  const { id } = await params;
  redirect(`/admin/teklifler/${id}?view=saha`);
}