import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visite Guidée des 9 Installations Techniques",
  description: "Détail complet des installations du CUC : dojos, fosse à mousse, tour de 21 mètres, manège équestre et hébergement des stagiaires.",
  alternates: {
    canonical: '/visite-guidee', languages: { fr: '/visite-guidee', en: '/en/visite-guidee' },
  },
  openGraph: {
    title: "Visite Guidée des 9 Installations Techniques",
    description: "Détail complet des installations du CUC : dojos, fosse à mousse, tour de 21 mètres, manège équestre et hébergement des stagiaires.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
