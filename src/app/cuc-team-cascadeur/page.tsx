'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LightboxModal, LightboxImage } from '@/components/ui/LightboxModal';
import { HallOfFame } from '@/components/sections/HallOfFame';
import {
  TeamHeroSection,
  TeamProductionGalleries,
  TeamBannersSection,
  TeamProductionServices,
} from '@/components/sections/team';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function CucTeamCascadeurPage() {
  const [activeGallery, setActiveGallery] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { content } = usePageDynamicContent('cuc-team-cascadeur');

  const openLightbox = (images: LightboxImage[], index: number) => {
    setActiveGallery(images);
    setLightboxIndex(index);
  };

  const sortedSections = [...(content.layout_sections || [])]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <TeamHeroSection key="hero" hero={content.hero} />;
      case 'galleries':
        return <TeamProductionGalleries key="galleries" onOpenLightbox={openLightbox} />;
      case 'banners':
        return <TeamBannersSection key="banners" onOpenLightbox={openLightbox} />;
      case 'hall_of_fame':
        return <HallOfFame key="hall_of_fame" />;
      case 'services':
        return <TeamProductionServices key="services" />;
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
            <TeamHeroSection hero={content.hero} />
            <TeamProductionGalleries onOpenLightbox={openLightbox} />
            <TeamBannersSection onOpenLightbox={openLightbox} />
            <HallOfFame />
            <TeamProductionServices />
          </>
        )}
      </main>

      {/* Lightbox Modal for HD Viewing */}
      <LightboxModal
        images={activeGallery}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      <Footer />
    </div>
  );
}
