import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partenaires Officiels de l'Action & du Cinéma | CUC",
  description: "Les 13 marques, fabricants et partenaires officiels accompagnant le Campus Univers Cascades (Nike, RXR, C17, Kiloutou...).",
  alternates: {
    canonical: '/partenaires',
  },
  openGraph: {
    title: "Partenaires Officiels de l'Action & du Cinéma | CUC",
    description: "Les 13 marques, fabricants et partenaires officiels accompagnant le Campus Univers Cascades (Nike, RXR, C17, Kiloutou...).",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
