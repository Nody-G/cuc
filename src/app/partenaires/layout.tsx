import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partenaires du Campus Univers Cascades | CUC",
  description: "Les marques, fabricants et institutions qui accompagnent le Campus Univers Cascades (Nike, RXR, C17, Kiloutou...).",
  alternates: {
    canonical: '/partenaires',
  },
  openGraph: {
    title: "Partenaires du Campus Univers Cascades | CUC",
    description: "Les marques, fabricants et institutions qui accompagnent le Campus Univers Cascades (Nike, RXR, C17, Kiloutou...).",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
