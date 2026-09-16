import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Animation Airbag Géant & Xtrem Jump | CUC",
  description: "Dispositif d'animation mobile grand public avec saut dans airbag géant et parcours parkour encadré par des professionnels.",
  alternates: {
    canonical: '/animations-airbag-parkour',
  },
  openGraph: {
    title: "Animation Airbag Géant & Xtrem Jump | CUC",
    description: "Dispositif d'animation mobile grand public avec saut dans airbag géant et parcours parkour encadré par des professionnels.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
