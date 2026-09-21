import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'cuc-events-agence',
    locale,
    fallback: {
      title: "Agence CUC Events • Spectacles & Shows Cascadeurs",
      description: "Prestations événementielles spectaculaires, shows Yamakasi, animation Airbag Géant et team building pour entreprises.",
    },
  });
}

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
