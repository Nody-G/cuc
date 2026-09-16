import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CUC Stunt Team & Filmographie | CUC",
  description: "Les affiches et longs-métrages doublés et coordonnés par le Campus Univers Cascades et Lucas Dollfus pour le cinéma international.",
  alternates: {
    canonical: '/cuc-team-cascadeur',
  },
  openGraph: {
    title: "CUC Stunt Team & Filmographie | CUC",
    description: "Les affiches et longs-métrages doublés et coordonnés par le Campus Univers Cascades et Lucas Dollfus pour le cinéma international.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
