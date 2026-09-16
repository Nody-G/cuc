import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Building & Séminaires d'Action | CUC",
  description: "Ateliers immersifs de cascades et cohésion d'équipe pour entreprises sur notre campus de 6 hectares.",
  openGraph: {
    title: "Team Building & Séminaires d'Action | CUC",
    description: "Ateliers immersifs de cascades et cohésion d'équipe pour entreprises sur notre campus de 6 hectares.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
