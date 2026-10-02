import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n/entities';
import { SitePageScope } from '@/components/i18n/SitePageScope';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'team-building-cascades',
    locale,
    fallback: {
      title: "Team Building & Séminaires d'Action",
      description: "Ateliers immersifs de cascades et cohésion d'équipe pour entreprises sur notre campus.",
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

  // Contrat « contenu de page fourni par le serveur » : `SitePageScope` résout la
  // page localisée (déjà en cache) et l'injecte dans le provider — le client ne
  // rejoue donc AUCUNE lecture `site_pages`.
  return (
    <SitePageScope slug="team-building-cascades" locale={safeLocale}>
      <section className="w-full flex-grow flex flex-col">{children}</section>
    </SitePageScope>
  );
}
