'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationModal } from '@/components/sections/ApplicationModal';
import { StagesHeroSection, StagesGridSection } from '@/components/sections/stages';

export default function StagesCascadesParkourPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('weekend-immersion');

  const handleOpenApplication = (programId: string) => {
    setSelectedProgramId(programId);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28">
        <StagesHeroSection />
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
