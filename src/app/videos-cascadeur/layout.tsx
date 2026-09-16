import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportages TV & Vidéos de Cascades | CUC",
  description: "Regardez les reportages TF1, France 2 et showreels d'entraînement des cascadeurs du CUC.",
  alternates: {
    canonical: '/videos-cascadeur',
  },
  openGraph: {
    title: "Reportages TV & Vidéos de Cascades | CUC",
    description: "Regardez les reportages TF1, France 2 et showreels d'entraînement des cascadeurs du CUC.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
