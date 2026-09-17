'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  PartenairesHeroSection,
  PartenairesGridSection,
  PartenairesCtaSection,
} from '@/components/sections/partenaires';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function PartenairesPage() {
  const { content } = usePageDynamicContent('partenaires');

  const sortedSections = [...(content.layout_sections || [])]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <PartenairesHeroSection key="hero" hero={content.hero} />;
      case 'partners_grid':
        return <PartenairesGridSection key="partners_grid" />;
      case 'cta':
        return <PartenairesCtaSection key="cta" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {sortedSections.length > 0 ? (
          sortedSections.map((sec) => renderSection(sec.id))
        ) : (
          <>
            <PartenairesHeroSection hero={content.hero} />
            <PartenairesGridSection />
            <PartenairesCtaSection />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
