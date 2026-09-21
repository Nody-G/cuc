import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'animations-airbag-parkour',
    locale,
    fallback: {
      title: "Animation Airbag Géant & Xtrem Jump",
      description: "Dispositif d'animation mobile grand public avec saut dans airbag géant et parcours parkour encadré par des professionnels.",
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
