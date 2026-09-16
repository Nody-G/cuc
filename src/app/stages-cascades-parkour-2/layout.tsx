import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stages de Cascade & Week-end Immersion (250€) | CUC",
  description: "Vivez l'expérience d'un cascadeur le temps d'un week-end à 250€ en pension complète ou en stage AFDAS au Campus Univers Cascades.",
  alternates: {
    canonical: '/stages-cascades-parkour-2',
  },
  openGraph: {
    title: "Stages de Cascade & Week-end Immersion (250€) | CUC",
    description: "Vivez l'expérience d'un cascadeur le temps d'un week-end à 250€ en pension complète ou en stage AFDAS au Campus Univers Cascades.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
