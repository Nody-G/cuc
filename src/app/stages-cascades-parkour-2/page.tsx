'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationModal } from '@/components/sections/ApplicationModal';
import { StagesHeroSection, StagesGridSection } from '@/components/sections/stages';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function StagesCascadesParkourPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('weekend-immersion');
  const { content } = usePageDynamicContent('stages-cascades-parkour-2');

  const handleOpenApplication = (programId: string) => {
    setSelectedProgramId(programId);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <StagesHeroSection heroData={content.hero} />
        <StagesGridSection onOpenApplication={handleOpenApplication} />
      </main>

      <Footer />

      <ApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        defaultProgramId={selectedProgramId}
      />
    </div>
  );
}
