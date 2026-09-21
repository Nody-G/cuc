import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'equipe-cascadeurs-pro',
    locale,
    fallback: {
      title: "L'équipe — Coachs & Professionnels du Cinéma",
      description: "Découvrez les coordinateurs de cascades, action designers, membres des Yamakasi et formateurs professionnels du Campus Univers Cascades.",
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
