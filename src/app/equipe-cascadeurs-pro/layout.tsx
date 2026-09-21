import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L'équipe — Coachs & Professionnels du Cinéma",
  description: "Découvrez les coordinateurs de cascades, action designers, membres des Yamakasi et formateurs professionnels du Campus Univers Cascades.",
  alternates: {
    canonical: '/equipe-cascadeurs-pro',
  },
  openGraph: {
    title: "L'équipe — Coachs & Professionnels du Cinéma",
    description: "Découvrez les coordinateurs de cascades, action designers, membres des Yamakasi et formateurs professionnels du Campus Univers Cascades.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
