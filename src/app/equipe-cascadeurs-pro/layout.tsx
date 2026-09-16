import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L'Équipe des Formateurs & Cascadeurs Professionnels | CUC",
  description: "Découvrez les coordinateurs de cascades, action designers, membres des Yamakasi et instructeurs d'élite du Campus Univers Cascades.",
  openGraph: {
    title: "L'Équipe des Formateurs & Cascadeurs Professionnels | CUC",
    description: "Découvrez les coordinateurs de cascades, action designers, membres des Yamakasi et instructeurs d'élite du Campus Univers Cascades.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
