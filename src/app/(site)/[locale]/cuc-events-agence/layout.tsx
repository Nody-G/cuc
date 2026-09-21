import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agence CUC Events • Spectacles & Shows Cascadeurs",
  description: "Prestations événementielles spectaculaires, shows Yamakasi, animation Airbag Géant et team building pour entreprises.",
  alternates: {
    canonical: '/cuc-events-agence', languages: { fr: '/cuc-events-agence', en: '/en/cuc-events-agence' },
  },
  openGraph: {
    title: "Agence CUC Events • Spectacles & Shows Cascadeurs",
    description: "Prestations événementielles spectaculaires, shows Yamakasi, animation Airbag Géant et team building pour entreprises.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
