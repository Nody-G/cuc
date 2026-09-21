import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

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

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
