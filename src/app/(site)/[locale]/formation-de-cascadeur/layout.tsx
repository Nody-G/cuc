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
    slug: 'formation-de-cascadeur',
    locale,
    fallback: {
      title: "Formation Professionnelle de Cascadeur (2 ans / 720h)",
      description: "Formation professionnelle en 2 ans et Stage Découverte 12 jours. Combat chorégraphié, chutes, torche humaine, parkour et préparation cinéma au Cateau-Cambrésis.",
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
  // page localisée (déjà en cache), applique la porte de diffusion (404 si la page
  // est définitivement non publiée) et l'injecte dans le provider — le client ne
  // rejoue donc AUCUNE lecture `site_pages`.
  return (
    <SitePageScope slug="formation-de-cascadeur" locale={safeLocale}>
      <section className="w-full flex-grow flex flex-col">{children}</section>
    </SitePageScope>
  );
}
