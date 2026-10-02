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
    slug: 'spectacles-cascadeurs-yamakasi',
    locale,
    fallback: {
      title: "Spectacles Cascadeurs & Yamakasi • Shows Live",
      description: "Création et coordination de spectacles vivants d'action, parkour et cascades urbaines pour festivals et événements.",
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
    <SitePageScope slug="spectacles-cascadeurs-yamakasi" locale={safeLocale}>
      <section className="w-full flex-grow flex flex-col">{children}</section>
    </SitePageScope>
  );
}
