'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DOUBLED_CELEBRITIES } from '@/data/filmography';
import { getCelebrities } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { DoubledCelebrity } from '@/types';
import { UserCheck } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { CelebrityCard } from './CelebrityCard';
import type { TeamNameRef } from '@/lib/celebrity-double';

interface CelebrityDoublesGalleryProps {
  onSelectCelebrity: (celebrity: DoubledCelebrity) => void;
  /** Référentiel de l'équipe, transmis aux vignettes pour interconnexion. */
  teamMembers: TeamNameRef[];
}

interface CelebrityCopy {
  id: string;
  specialty?: string;
  doubles?: string;
}

/**
 * Galerie des comédiens doublés.
 *
 * La galerie orchestre les données (catalogue + overlays EN + temps réel) et
 * délègue le rendu de chaque vignette à [`CelebrityCard`], qui porte à la fois
 * la mise en page et l'interconnexion « doubleur CUC → fiche coach ».
 *
 * Les filtres de segmentation marketing sont retirés : la lecture
 * (français / international) ne reposait sur aucune preuve éditoriale.
 */
export const CelebrityDoublesGallery: React.FC<CelebrityDoublesGalleryProps> = ({
  onSelectCelebrity,
  teamMembers,
}) => {
  const t = useTranslations('teamProduction');
  const [celebrities, setCelebrities] = useState<DoubledCelebrity[]>(DOUBLED_CELEBRITIES);

  const copyById = useMemo(() => {
    const copies = t.raw('celebrities') as CelebrityCopy[];
    return new Map(copies.map((copy) => [copy.id, copy]));
  }, [t]);

  const localizedCelebrities = useMemo(
    () =>
      celebrities.map((actor) => {
        const copy = copyById.get(actor.id);
        if (!copy) return actor;
        return {
          ...actor,
          stuntSpecialty: copy.specialty || actor.stuntSpecialty,
          stuntDoubles: copy.doubles || actor.stuntDoubles,
        };
      }),
    [celebrities, copyById]
  );

  /** Recharge les comédiens doublés (état initial + synchronisation Realtime). */
  const loadCelebrities = useCallback(() => {
    getCelebrities().then(setCelebrities);
  }, []);

  useEffect(() => {
    loadCelebrities();
  }, [loadCelebrities]);

  // Synchronisation Realtime Cockpit → Vitrine (clé `celebrities` de site_settings).
  useRealtimeRefresh(['site_settings'], loadCelebrities);

  return (
    <div className="mb-20 bg-[#0c0c10] border-2 border-zinc-800 p-6 sm:p-8 relative shadow-2xl">

      {/* Section Header */}
      <div className="pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
              <span {...cucMicro('teamProduction.hallOfFame.actorsBadge')}>
                {t('hallOfFame.actorsBadge')}
              </span>
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-tight text-white">
            <span {...cucMicro('teamProduction.hallOfFame.actorsTitle')}>
              {t('hallOfFame.actorsTitle')}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-tech mt-1 max-w-2xl">
            <span {...cucMicro('teamProduction.hallOfFame.actorsIntro')}>
              {t('hallOfFame.actorsIntro')}
            </span>
          </p>
        </div>
      </div>

      {/* Grille des comédiens doublés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
        {localizedCelebrities.map((actor) => (
          <CelebrityCard
            key={actor.id}
            actor={actor}
            teamMembers={teamMembers}
            onSelect={() => onSelectCelebrity(actor)}
          />
        ))}
      </div>
    </div>
  );
};
