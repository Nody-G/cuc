'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationModal } from '@/components/sections/ApplicationModal';
import {
  FormationHeroSection,
  FormationFormulesSection,
  FormationDisciplinesExplorer,
  FormationPedagogyModalities,
} from '@/components/sections/formation';

export default function FormationDeCascadeurPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('pro-longue-duree');

  const handleOpenApplication = (programId: string) => {
    setSelectedProgramId(programId);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28">
        {/* 1. Page Header Hero & Key Indicators */}
        <FormationHeroSection onApply={handleOpenApplication} />

        {/* 2. Les 2 Formules du Cursus Professionnel */}
        <FormationFormulesSection onApply={handleOpenApplication} />

        {/* 3. Les 10 Disciplines de la Cascade Physique */}
        <FormationDisciplinesExplorer />

        {/* 4. Modalités Pédagogiques, Calendrier & Prise en Charge */}
        <FormationPedagogyModalities onApply={handleOpenApplication} />
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
