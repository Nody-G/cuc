'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Instructor } from '@/types';
import { CUC_TEAM } from '@/data/team';
import { getTeam } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { CucFilmsShowcase } from './films/CucFilmsShowcase';

/**
 * Bloc « LES FILMS COORDONNÉS PAR LE CUC » de la page TOURNAGE (`/cuc-team-cascadeur`).
 *
 * Décision produit : la page Tournage s'articule autour de 4 blocs majeurs :
 *   1. Le Studio & la Salle d'action
 *   2. Les Cascadeurs en action
 *   3. Les Équipements de tournage
 *   4. Les Films coordonnés par le CUC (Lucas Dollfus)
 */
export const HallOfFame: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<Instructor[]>(CUC_TEAM);

  const loadTeam = useCallback(() => {
    getTeam().then(setTeamMembers);
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Synchronisation Realtime Cockpit → Vitrine
  useRealtimeRefresh(['site_team'], loadTeam);

  /**
   * Référent de coordination de la vitrine : Lucas Dollfus.
   */
  const coordinator = useMemo(
    () =>
      teamMembers.find((member) => member.id === 'lucas-dollfus') ??
      teamMembers.find((member) => member.name.toLowerCase().includes('dollfus')),
    [teamMembers]
  );

  return <CucFilmsShowcase coordinator={coordinator} id="filmographie" divider={false} />;
};

export default HallOfFame;
