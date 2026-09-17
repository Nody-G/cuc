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
import { courseJsonLd } from '@/lib/seo';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function FormationDeCascadeurPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('pro-longue-duree');
  const { content } = usePageDynamicContent('formation-de-cascadeur');

  const handleOpenApplication = (programId: string) => {
    setSelectedProgramId(programId);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      {/* Données structurées schema.org — Course */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            courseJsonLd({
              name: "Formation Professionnelle de Cascadeur (2 ans / 720h)",
              description:
                "Cursus d'élite en 2 ans et Formule Découverte 12 jours. Combat chorégraphié, chutes, torche humaine, parkour et préparation cinéma au Cateau-Cambrésis.",
              path: "/formation-de-cascadeur",
              duration: "P2Y",
            })
          ),
        }}
      />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* 1. Page Header Hero & Key Indicators */}
        <FormationHeroSection onApply={handleOpenApplication} heroData={content.hero} />

        {/* 2. Les 2 Formules du Cursus Professionnel */}
        <FormationFormulesSection
          onApply={handleOpenApplication}
          formulesData={content.sections_data?.formules}
        />

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
