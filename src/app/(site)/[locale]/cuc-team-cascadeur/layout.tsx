import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'cuc-team-cascadeur',
    locale,
    fallback: {
      title: "Tournage — CUC Stunt Team & Prestations",
      description: "Les affiches et longs-métrages doublés et coordonnés par le Campus Univers Cascades et Lucas Dollfus pour le cinéma international.",
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
