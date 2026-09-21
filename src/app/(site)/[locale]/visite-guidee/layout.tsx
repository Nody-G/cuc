import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'visite-guidee',
    locale,
    fallback: {
      title: "Visite Guidée des 9 Installations Techniques",
      description: "Détail complet des installations du CUC : dojos, fosse à mousse, tour de 21 mètres, manège équestre et hébergement des stagiaires.",
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
