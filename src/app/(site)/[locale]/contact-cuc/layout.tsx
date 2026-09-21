import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'contact-cuc',
    locale,
    fallback: {
      title: "Contact & Projets | Campus Univers Cascades",
      description: "Productions cinéma, action design, formations professionnelles de cascadeurs, stages et événements : échangez directement avec les équipes du Campus Univers Cascades.",
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
