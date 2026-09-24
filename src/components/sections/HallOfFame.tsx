'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity, Instructor } from '@/types';
import { CUC_TEAM } from '@/data/team';
import { getTeam } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import type { TeamNameRef } from '@/lib/celebrity-double';
import { StuntBadge } from '../ui/StuntBadge';
import { Clapperboard } from 'lucide-react';
import { CelebrityDoublesGallery } from './hall-of-fame/CelebrityDoublesGallery';
import { CelebrityDetailsModal } from './hall-of-fame/CelebrityDetailsModal';
import { CucFilmsShowcase } from './films/CucFilmsShowcase';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Bloc « Hall of Fame » de la page TOURNAGE (`/cuc-team-cascadeur`).
 *
 * La grille « FILMOGRAPHIE / FILMS & SÉRIES » a été remplacée par le composant
 * partagé [`CucFilmsShowcase`](src/components/sections/films/CucFilmsShowcase.tsx:1)
 * (« LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC »), tandis que la section
 * « Acteurs & comédiens doublés » est conservée à l'identique.
 */
export const HallOfFame: React.FC = () => {
  const t = useTranslations('teamProduction');
  const [selectedCelebrity, setSelectedCelebrity] = useState<DoubledCelebrity | null>(null);
  const [teamMembers, setTeamMembers] = useState<Instructor[]>(CUC_TEAM);

  /** Charge l'équipe : elle porte les doubleurs cités sur les fiches comédiens. */
  const loadTeam = useCallback(() => {
    getTeam().then(setTeamMembers);
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Synchronisation Realtime Cockpit → Vitrine (un coach cité comme doubleur).
  useRealtimeRefresh(['site_team'], loadTeam);

  /** Référentiel réduit (id + nom) transmis aux vignettes et à la fiche. */
  const teamNames = useMemo<TeamNameRef[]>(
    () => teamMembers.map((member) => ({ id: member.id, name: member.name })),
    [teamMembers]
  );

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

      <div className="page-shell relative z-10">
        {/* Header Principal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14 drop-shadow-[0_0_20px_rgba(255,229,0,0.4)]">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt={t('hallOfFame.emblemAlt')}
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 mb-3">
            <StuntBadge variant="yellow" icon={<Clapperboard className="w-3.5 h-3.5" />}>
              <span {...cucMicro('teamProduction.hallOfFame.badge')}>{t('hallOfFame.badge')}</span>
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-500" {...cucMicro('teamProduction.hallOfFame.tag')}>
              {t('hallOfFame.tag')}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
            <span {...cucMicro('teamProduction.hallOfFame.title')}>{t('hallOfFame.title')}</span>
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FFE500] to-transparent mx-auto my-3" />
          <p className="text-sm sm:text-base text-zinc-400 font-tech mt-2">
            <span {...cucMicro('teamProduction.hallOfFame.subtitle')}>
              {t('hallOfFame.subtitle')}
            </span>
          </p>
        </div>

        {/* SECTION VEDETTE : LES ACTEURS ET COMÉDIENS DOUBLÉS */}
        <CelebrityDoublesGallery onSelectCelebrity={setSelectedCelebrity} teamMembers={teamNames} />

        {/* SECTION FILMS : LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC */}
        <CucFilmsShowcase className="mt-16" />
      </div>

      {/* Modale Acteurs doublés */}
      <CelebrityDetailsModal
        celebrity={selectedCelebrity}
        teamMembers={teamNames}
        onClose={() => setSelectedCelebrity(null)}
      />
    </section>
  );
};
