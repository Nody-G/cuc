'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  EventsHeroSection,
  EventsPillarsSection,
  EventsPartnersBanners,
  EventsGuaranteesSection,
} from '@/components/sections/events';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function CucEventsAgencePage() {
  const { content } = usePageDynamicContent('cuc-events-agence');

  const sortedSections = [...(content.layout_sections || [])]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <EventsHeroSection key="hero" hero={content.hero} />;
      case 'pillars':
        return <EventsPillarsSection key="pillars" />;
      case 'partners':
        return <EventsPartnersBanners key="partners" />;
      case 'guarantees':
        return <EventsGuaranteesSection key="guarantees" />;
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
            <EventsHeroSection hero={content.hero} />
            <EventsPillarsSection />
            <EventsPartnersBanners />
            <EventsGuaranteesSection />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
