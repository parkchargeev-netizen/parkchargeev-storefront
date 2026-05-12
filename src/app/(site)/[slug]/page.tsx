import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { absoluteUrl } from "@/lib/site";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

type ManagedRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ManagedRoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedSitePageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
    alternates: {
      canonical: page.canonicalUrl || absoluteUrl(`/${page.slug}`)
    },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt,
      url: absoluteUrl(`/${page.slug}`),
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex
    }
  };
}

export default async function ManagedRoutePage({ params }: ManagedRoutePageProps) {
  const { slug } = await params;
  const page = await getPublishedSitePageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <ManagedPageRenderer page={page} />;
}
