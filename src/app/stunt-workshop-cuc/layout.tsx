import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "International Stunt Workshop • Stages Intensifs | CUC",
  description: "Workshops internationaux de cascades avec des invités et coordinateurs d'action du monde entier.",
  openGraph: {
    title: "International Stunt Workshop • Stages Intensifs | CUC",
    description: "Workshops internationaux de cascades avec des invités et coordinateurs d'action du monde entier.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
