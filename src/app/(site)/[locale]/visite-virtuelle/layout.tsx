import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visite Virtuelle 360° du Campus",
  description: "Explorez le Zoé Bell Hall, la CUC Tower 21m, la fosse olympique et les dojos de combat en immersion 360° interactive HD Media.",
  alternates: {
    canonical: '/visite-virtuelle', languages: { fr: '/visite-virtuelle', en: '/en/visite-virtuelle' },
  },
  openGraph: {
    title: "Visite Virtuelle 360° du Campus",
    description: "Explorez le Zoé Bell Hall, la CUC Tower 21m, la fosse olympique et les dojos de combat en immersion 360° interactive HD Media.",
  },
};

export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="w-full flex-grow flex flex-col">{children}</section>;
}
