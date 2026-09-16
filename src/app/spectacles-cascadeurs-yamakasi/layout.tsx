import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spectacles Cascadeurs & Yamakasi • Shows Live | CUC",
  description: "Création et coordination de spectacles vivants d'action, parkour et cascades urbaines pour festivals et événements.",
  alternates: {
    canonical: '/spectacles-cascadeurs-yamakasi',
  },
  openGraph: {
    title: "Spectacles Cascadeurs & Yamakasi • Shows Live | CUC",
    description: "Création et coordination de spectacles vivants d'action, parkour et cascades urbaines pour festivals et événements.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
