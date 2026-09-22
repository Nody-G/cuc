'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationModal } from '@/components/sections/ApplicationModal';
import { WorkshopHero } from './sections/WorkshopHero';
import { WorkshopHighlights } from './sections/WorkshopHighlights';
import { WorkshopProgram } from './sections/WorkshopProgram';
import { WorkshopInfoCards } from './sections/WorkshopInfoCards';
import { WorkshopApplyBox } from './sections/WorkshopApplyBox';
import { useWorkshopContent } from './sections/useWorkshopContent';

export default function StuntWorkshopCucPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const copy = useWorkshopContent();

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* International Workshop Hero */}
        <WorkshopHero
          breadcrumbs={copy.breadcrumbs}
          hero={copy.hero}
          onApply={() => setIsApplicationOpen(true)}
        />

        {/* Global Key Highlights */}
        <WorkshopHighlights highlights={copy.highlights} />

        {/* Workshop Content & Curriculum */}
        <WorkshopProgram program={copy.program} curriculum={copy.curriculum} />

        {/* Accommodation & Location Info */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="page-shell">
            <WorkshopInfoCards
              location={copy.location}
              housing={copy.housing}
              certificate={copy.certificate}
            />

            <WorkshopApplyBox cta={copy.cta} onApply={() => setIsApplicationOpen(true)} />
          </div>
        </section>
      </main>

      <Footer />

      <ApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        defaultProgramId="pro-longue-duree"
      />
    </div>
  );
}
