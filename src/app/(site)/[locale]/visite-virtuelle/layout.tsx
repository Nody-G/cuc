import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'visite-virtuelle',
    locale,
    fallback: {
      title: "Visite Virtuelle 360° du Campus",
      description: "Explorez le Zoé Bell Hall, la CUC Tower 21m, la fosse olympique et les dojos de combat en immersion 360° interactive HD Media.",
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
