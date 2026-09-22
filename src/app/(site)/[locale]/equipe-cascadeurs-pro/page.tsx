'use client';

import React from 'react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CucFilmsShowcase } from '@/components/sections/films/CucFilmsShowcase';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import { useEquipeCascadeursData } from './sections/useEquipeCascadeursData';
import { EquipeHeroSection } from './sections/EquipeHeroSection';
import { CoachCard } from './sections/CoachCard';
import { EquipeCallout } from './sections/EquipeCallout';

/**
 * Page équipe — façade de composition.
 *
 * L'orchestration (équipe + films, overlays EN, Realtime) vit dans
 * `useEquipeCascadeursData` ; les blocs visuels dans `sections/**`
 * (hero, carte coach avec crédits et tournages, appel à l'action).
 */
export default function EquipeCascadeursProPage() {
  const data = useEquipeCascadeursData();

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <EquipeHeroSection
          heroBadge={data.heroBadge}
          heroTitle={data.heroTitle}
          heroSubtitle={data.heroSubtitle}
          heroBg={data.heroBg}
        />

        {/* Team Roster Grid with Grand High-Impact Portraits */}
        <section className="py-16">
          <div className="page-shell">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {data.displayTeam.map((member) => (
                <CoachCard
                  key={member.id}
                  member={member}
                  films={data.displayFilms}
                  onSelectFilm={data.setSelectedFilm}
                />
              ))}
            </div>

            {/* FILMOGRAPHIE & TOURNAGES DE L'ÉQUIPE — composant partagé avec la page TOURNAGE */}
            <CucFilmsShowcase className="mt-20" />

            {/* Bottom Callout */}
            <EquipeCallout />
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal Dossier de Production du Film (interactions des cartes coachs) */}
      <FilmDetailsModal
        movie={data.selectedFilm}
        onClose={() => data.setSelectedFilm(null)}
      />
    </div>
  );
}
