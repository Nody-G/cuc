'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import { StudioGlobalAtmosphere } from '@/components/ui/parallax';
import {
  HomeAboutSection,
  HomeTournagesSection,
  HomeVirtualTourSection,
  HomeQualiopiSection,
  HomePartnersSection,
  HomeSocialSection,
} from '@/components/sections/home';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function Home() {
  const { content } = usePageDynamicContent('/');

  // Tri et filtrage des sections selon l'agencement configuré dans le Cockpit
  const sortedSections = [...(content.layout_sections || [])]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Rendu modulaire de chaque bloc dynamique
  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <ParallaxHero key="hero" heroData={content.hero} />;
      case 'about':
        return <HomeAboutSection key="about" aboutData={content.sections_data?.about} />;
      case 'tournages':
        return (
          <HomeTournagesSection
            key="tournages"
            tournagesData={content.sections_data?.tournages}
          />
        );
      case 'virtual_tour':
        return (
          <HomeVirtualTourSection
            key="virtual_tour"
            virtualTourData={content.sections_data?.virtual_tour}
          />
        );
      case 'qualiopi':
        return (
          <HomeQualiopiSection
            key="qualiopi"
            qualiopiData={content.sections_data?.qualiopi}
          />
        );
      case 'partners':
        return (
          <HomePartnersSection
            key="partners"
            partnersData={content.sections_data?.partners}
          />
        );
      case 'social':
        return (
          <HomeSocialSection key="social" socialData={content.sections_data?.social} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      {/* Studio Animation Continuous Global Depth Atmosphere */}
      <StudioGlobalAtmosphere />

      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28 relative z-10">
        {sortedSections.length > 0 ? (
          sortedSections.map((sec) => renderSection(sec.id))
        ) : (
          /* Fallback résilient officiel si aucune section n'est configurée */
          <>
            <ParallaxHero heroData={content.hero} />
            <HomeAboutSection aboutData={content.sections_data?.about} />
            <HomeTournagesSection tournagesData={content.sections_data?.tournages} />
            <HomeVirtualTourSection
              virtualTourData={content.sections_data?.virtual_tour}
            />
            <HomeQualiopiSection qualiopiData={content.sections_data?.qualiopi} />
            <HomePartnersSection partnersData={content.sections_data?.partners} />
            <HomeSocialSection socialData={content.sections_data?.social} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
