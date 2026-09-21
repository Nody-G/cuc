import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

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

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
