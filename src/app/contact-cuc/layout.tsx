import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidater & Contacter le Campus Univers Cascades | CUC",
  description: "Secrétariat pédagogique et formulaire d'admission aux formations et stages de cascades du CUC au Cateau-Cambrésis.",
  alternates: {
    canonical: '/contact-cuc',
  },
  openGraph: {
    title: "Candidater & Contacter le Campus Univers Cascades | CUC",
    description: "Secrétariat pédagogique et formulaire d'admission aux formations et stages de cascades du CUC au Cateau-Cambrésis.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
