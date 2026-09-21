import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formation Professionnelle de Cascadeur (2 ans / 720h)",
  description: "Formation professionnelle en 2 ans et Stage Découverte 12 jours. Combat chorégraphié, chutes, torche humaine, parkour et préparation cinéma au Cateau-Cambrésis.",
  alternates: {
    canonical: '/formation-de-cascadeur', languages: { fr: '/formation-de-cascadeur', en: '/en/formation-de-cascadeur' },
  },
  openGraph: {
    title: "Formation Professionnelle de Cascadeur (2 ans / 720h)",
    description: "Formation professionnelle en 2 ans et Stage Découverte 12 jours. Combat chorégraphié, chutes, torche humaine, parkour et préparation cinéma au Cateau-Cambrésis.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
