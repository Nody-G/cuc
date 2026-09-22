'use client';

import React from 'react';
import { StudioParallaxScene, StudioParallaxLayer } from '@/components/ui/parallax';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import { useHomeTournages } from './tournages/useHomeTournages';
import { TournagesHeader } from './tournages/TournagesHeader';
import { TournagesPillarsCard } from './tournages/TournagesPillarsCard';
import type { HomeTournagesData } from './tournages/home-tournages-data';

export type { HomeTournagesData, HomeVirtualTourData } from './tournages/home-tournages-data';

interface HomeTournagesSectionProps {
  tournagesData?: HomeTournagesData;
}

/**
 * Bloc « tournages » de la page Accueil : ambiance dorée, en-tête éditorial,
 * carte studio (3 piliers + sélection de productions résolues dans le
 * catalogue `site_films`) et fiche détaillée partagée avec le showcase films.
 * Toute la logique vit dans `useHomeTournages` ; les sous-vues sont déclaratives.
 */
export const HomeTournagesSection: React.FC<HomeTournagesSectionProps> = ({ tournagesData }) => {
  const { labels, filmsByTitle, selectedFilm, setSelectedFilm, captionFor } = useHomeTournages({
    tournagesData,
  });

  return (
    <StudioParallaxScene className="py-24 sm:py-28 bg-[#08080c] border-b border-zinc-800/80 relative overflow-hidden">
      {/* Cinematic Golden Ambience Beam */}
      <StudioParallaxLayer
        speed={-0.2}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52rem] h-[52rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.05)_0%,_transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="page-shell relative z-10">
        <TournagesHeader
          badge={labels.badge}
          teamTag={labels.teamTag}
          title={labels.title}
          subtitle={labels.subtitle}
          ctaText={labels.ctaText}
          ctaLink={labels.ctaLink}
        />

        <TournagesPillarsCard
          pillar1Title={labels.pillar1Title}
          pillar1Desc={labels.pillar1Desc}
          pillar2Title={labels.pillar2Title}
          pillar2Desc={labels.pillar2Desc}
          pillar3Title={labels.pillar3Title}
          pillar3Desc={labels.pillar3Desc}
          ctaProduction={labels.ctaProduction}
          ctaCatalog={labels.ctaCatalog}
          filmsByTitle={filmsByTitle}
          captionFor={captionFor}
          onOpenFilm={setSelectedFilm}
        />
      </div>

      {/* Fiche détaillée — même modale que le showcase des films. */}
      <FilmDetailsModal movie={selectedFilm} onClose={() => setSelectedFilm(null)} />
    </StudioParallaxScene>
  );
};
