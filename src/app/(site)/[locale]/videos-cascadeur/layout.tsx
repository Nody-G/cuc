import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'videos-cascadeur',
    locale,
    fallback: {
      title: "Reportages TV & Vidéos de Cascades",
      description: "Regardez les reportages TF1, France 2 et showreels d'entraînement des cascadeurs du CUC.",
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
