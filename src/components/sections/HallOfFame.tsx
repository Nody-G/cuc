'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DoubledCelebrity, FilmCredit, Instructor } from '@/types';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getFilms, getTeam } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { selectCoordinatedFilms } from '@/lib/coach-films';
import type { TeamNameRef } from '@/lib/celebrity-double';
import { CucFilmsShowcase } from './films/CucFilmsShowcase';
import { CelebrityDoublesGallery } from './hall-of-fame/CelebrityDoublesGallery';
import { CelebrityDetailsModal } from './hall-of-fame/CelebrityDetailsModal';
import { FilmDetailsModal } from './hall-of-fame/FilmDetailsModal';

/**
 * Pôle Crédits & Tournages de la page TOURNAGE (`/cuc-team-cascadeur`) :
 *   - Les Films coordonnés par le CUC (Lucas Dollfus)
 *   - Les Comédiens doublés par l'équipe CUC (grille 6 colonnes)
 *   - Interconnexion bidirectionnelle : cliquer sur un film coordonné depuis la fiche comédien ouvre la fiche du film.
 */
export const HallOfFame: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<Instructor[]>(CUC_TEAM);
  const [films, setFilms] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
  const [selectedCelebrity, setSelectedCelebrity] = useState<DoubledCelebrity | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<FilmCredit | null>(null);

  const loadData = useCallback(() => {
    getTeam().then(setTeamMembers);
    getFilms().then(setFilms);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronisation Realtime Cockpit → Vitrine
  useRealtimeRefresh(['site_team', 'site_films'], loadData);

  const teamNames = useMemo<TeamNameRef[]>(
    () => teamMembers.map((member) => ({ id: member.id, name: member.name })),
    [teamMembers]
  );

  const coordinator = useMemo(
    () =>
      teamMembers.find((member) => member.id === 'lucas-dollfus') ??
      teamMembers.find((member) => member.name.toLowerCase().includes('dollfus')),
    [teamMembers]
  );

  const coordinatedFilms = useMemo(
    () => (coordinator ? selectCoordinatedFilms(films, coordinator) : []),
    [films, coordinator]
  );

  return (
    <>
      {/* 4. LES FILMS COORDONNÉS PAR LE CUC */}
      <CucFilmsShowcase coordinator={coordinator} id="filmographie" divider={false} />

      {/* 5. LES COMÉDIENS DOUBLÉS PAR LE CUC — GRILLE 6 COLONNES */}
      <CelebrityDoublesGallery
        onSelectCelebrity={setSelectedCelebrity}
        teamMembers={teamNames}
      />

      {/* Modale Comédien doublé */}
      <CelebrityDetailsModal
        celebrity={selectedCelebrity}
        teamMembers={teamNames}
        coordinatedFilms={coordinatedFilms}
        onSelectFilm={(film) => {
          setSelectedCelebrity(null);
          setSelectedFilm(film);
        }}
        onClose={() => setSelectedCelebrity(null)}
      />

      {/* Modale Film coordonné par Lucas (ouverte depuis un comédien) */}
      <FilmDetailsModal
        movie={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </>
  );
};

export default HallOfFame;
