'use client';

/**
 * Orchestration de la page Team Building : contenu de page (repli certifié),
 * copie du hero résolue et liste d'ateliers (données de page prioritaires,
 * repli statique sinon).
 */

import { useTranslations } from 'next-intl';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import {
    TEAM_BUILDING_WORKSHOPS,
    type TeamBuildingWorkshop,
} from '../team-building-workshops.data';
import { resolveHeroCopy, type TeamBuildingHeroCopy } from './team-building-copy';

export interface TeamBuildingOverview {
    badge: string;
    title: string;
    description: string;
}

export interface TeamBuildingPage {
    hero: TeamBuildingHeroCopy;
    heroMeta: string;
    overview: TeamBuildingOverview;
    workshops: TeamBuildingWorkshop[];
    /**
     * Vrai quand la liste vient des données de page : seule cette origine
     * autorise l'annotation `data-cuc-field` **indexée** (jamais de champ
     * fantôme sur la liste de repli statique).
     */
    workshopsFromContent: boolean;
}

export function useTeamBuildingPage(): TeamBuildingPage {
    const t = useTranslations('teamBuilding');
    const { content } = usePageDynamicContent('team-building-cascades');

    const workshopsFromContent = (content.sections_data?.workshops?.length ?? 0) > 0;

    return {
        hero: resolveHeroCopy(content.hero),
        heroMeta: content.hero?.meta || t('heroMeta'),
        overview: {
            badge: content.sections_data?.overview?.badge || t('overviewBadge'),
            title: content.sections_data?.overview?.title || t('overviewTitle'),
            description:
                content.sections_data?.overview?.description || t('overviewDescription'),
        },
        workshops: workshopsFromContent
            ? (content.sections_data.workshops as TeamBuildingWorkshop[])
            : TEAM_BUILDING_WORKSHOPS,
        workshopsFromContent,
    };
}
