import type { Metadata } from "next";
import { buildRouteMetadata } from '@/lib/i18n/route-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildRouteMetadata({
    slug: 'partenaires',
    locale,
    fallback: {
      title: "Partenaires du Campus Univers Cascades",
      description: "Les marques, fabricants et institutions qui accompagnent le Campus Univers Cascades (Nike, RXR, C17, Kiloutou...).",
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
