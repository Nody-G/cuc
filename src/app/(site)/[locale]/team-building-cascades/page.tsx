'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TeamBuildingCustomCta } from './sections/TeamBuildingCustomCta';
import { TeamBuildingHero } from './sections/TeamBuildingHero';
import { TeamBuildingOverview } from './sections/TeamBuildingOverview';
import { TeamBuildingWorkshops } from './sections/TeamBuildingWorkshops';
import { useTeamBuildingPage } from './sections/useTeamBuildingPage';

/**
 * Page Team Building — **façade de composition**.
 *
 * Contenu et replis dans `sections/` : `team-building-copy.ts` (replis
 * certifiés, découpe du titre), `useTeamBuildingPage` (page + ateliers) et
 * quatre blocs de présentation (`TeamBuildingHero`, `TeamBuildingOverview`,
 * `TeamBuildingWorkshops`, `TeamBuildingCustomCta`).
 */
export default function TeamBuildingCascadesPage() {
  const page = useTeamBuildingPage();

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <TeamBuildingHero copy={page.hero} meta={page.heroMeta} />

        <TeamBuildingOverview overview={page.overview} />

        <TeamBuildingWorkshops
          workshops={page.workshops}
          editable={page.workshopsFromContent}
        />

        <TeamBuildingCustomCta />
      </main>

      <Footer />
    </div>
  );
}
