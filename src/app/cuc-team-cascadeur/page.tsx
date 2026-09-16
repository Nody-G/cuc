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

export default function CucTeamCascadeurPage() {
  const [activeGallery, setActiveGallery] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (images: LightboxImage[], index: number) => {
    setActiveGallery(images);
    setLightboxIndex(index);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <TeamHeroSection />
        <TeamProductionGalleries onOpenLightbox={openLightbox} />
        <TeamBannersSection onOpenLightbox={openLightbox} />
        <HallOfFame />
        <TeamProductionServices />
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
