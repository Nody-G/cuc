import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'stages-cascades-parkour-2',
    locale,
    fallback: {
      title: "Stages de Cascade & Week-end Immersion (250€)",
      description: "Vivez l'expérience d'un cascadeur le temps d'un week-end à 250€ en pension complète ou en stage AFDAS au Campus Univers Cascades.",
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
