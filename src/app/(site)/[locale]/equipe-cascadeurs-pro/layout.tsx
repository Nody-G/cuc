import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';
import { hasLocale } from 'next-intl';
import { getLocalizedPageContent } from '@/lib/i18n/server';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n/entities';
import { PageDataProvider } from '@/components/i18n/PageDataProvider';

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

export default async function RouteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : 'fr';

  // Contenu de page localisé (FR + overlay EN) résolu sur le SERVEUR : le HTML
  // servi est déjà dans la bonne langue, sans flash de français.
  const page = await getLocalizedPageContent('equipe-cascadeurs-pro', safeLocale);

  return (
    <PageDataProvider page={page}>
      <section className="w-full flex-grow flex flex-col">{children}</section>
    </PageDataProvider>
  );
}
