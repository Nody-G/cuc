'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DoubledCelebrity } from '@/types';
import { StuntBadge } from '../ui/StuntBadge';
import { Clapperboard } from 'lucide-react';
import { CelebrityDoublesGallery } from './hall-of-fame/CelebrityDoublesGallery';
import { CelebrityDetailsModal } from './hall-of-fame/CelebrityDetailsModal';
import { CucFilmsShowcase } from './films/CucFilmsShowcase';

/**
 * Bloc « Hall of Fame » de la page TOURNAGE (`/cuc-team-cascadeur`).
 *
 * La grille « FILMOGRAPHIE / FILMS & SÉRIES » a été remplacée par le composant
 * partagé [`CucFilmsShowcase`](src/components/sections/films/CucFilmsShowcase.tsx:1)
 * (« LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC »), tandis que la section
 * « Acteurs & comédiens doublés » est conservée à l'identique.
 */
export const HallOfFame: React.FC = () => {
  const [selectedCelebrity, setSelectedCelebrity] = useState<DoubledCelebrity | null>(null);

  // Fermeture des modales au clavier (Échap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCelebrity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="filmographie" className="py-24 bg-[#08080a] relative border-t border-zinc-800 overflow-hidden">
      {/* Subtle Anamorphic Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full lens-flare-gold opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Principal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14 drop-shadow-[0_0_20px_rgba(255,229,0,0.4)]">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Blason CUC"
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 mb-3">
            <StuntBadge variant="yellow" icon={<Clapperboard className="w-3.5 h-3.5" />}>
              CRÉDITS & TOURNAGES
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-500">PRODUCTIONS CUC & ANCIENS ÉLÈVES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
            HALL OF FAME DU CINÉMA D'ACTION
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FFE500] to-transparent mx-auto my-3" />
          <p className="text-sm sm:text-base text-zinc-400 font-tech mt-2">
            Retrouvez une sélection de productions audiovisuelles et cinématographiques sur lesquelles sont intervenus les cascadeurs et formateurs du CUC.
          </p>
        </div>

        {/* SECTION VEDETTE : LES ACTEURS ET COMÉDIENS DOUBLÉS */}
        <CelebrityDoublesGallery onSelectCelebrity={setSelectedCelebrity} />

        {/* SECTION FILMS : LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC */}
        <CucFilmsShowcase className="mt-16" />
      </div>

      {/* Modale Acteurs doublés */}
      <CelebrityDetailsModal
        celebrity={selectedCelebrity}
        onClose={() => setSelectedCelebrity(null)}
      />
    </section>
  );
};
