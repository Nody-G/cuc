import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Projets | Campus Univers Cascades",
  description: "Productions cinéma, action design, formations professionnelles de cascadeurs, stages et événements : échangez directement avec les équipes du Campus Univers Cascades.",
  alternates: {
    canonical: '/contact-cuc',
  },
  openGraph: {
    title: "Contact & Projets | Campus Univers Cascades",
    description: "Productions cinéma, action design, formations professionnelles de cascadeurs, stages et événements : échangez directement avec les équipes du Campus Univers Cascades.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
