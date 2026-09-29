/**
 * Contrats de la vue « Journal & Activité » du Cockpit.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucun React, aucun accès
 * réseau. Les onglets sont décrits ici pour que la navigation interne du hub et
 * son rendu partagent la même source.
 */

import type { ActivityLogEntry, LogLevel, LogSource } from '@/lib/logging/types';
import type { RangeFilter } from '@/lib/time-range';

/**
 * Trois onglets, trois natures de trace.
 *
 * « Métier » réutilise la vue d'audit existante au lieu de la réécrire : le
 * journal d'audit fonctionne, son rendu a été éprouvé, et le dupliquer aurait
 * créé deux comportements à maintenir pour la même information.
 */
export type LogHubTab = 'metier' | 'systeme' | 'retention';

export interface LogHubTabDescriptor {
    id: LogHubTab;
    label: string;
    description: string;
}

export const LOG_HUB_TABS: readonly LogHubTabDescriptor[] = [
    {
        id: 'metier',
        label: 'Activité métier',
        description:
            'Modifications de contenu, publications, rôles et candidatures — le journal d’audit du Cockpit.',
    },
    {
        id: 'systeme',
        label: 'Système & incidents',
        description:
            'Erreurs techniques classées, dégradations d’outils, synchronisations et e-mails refusés.',
    },
    {
        id: 'retention',
        label: 'Rétention',
        description:
            'Ce qui est conservé, ce qui est déjà purgeable, et application de la purge.',
    },
];

/** État des filtres du hub — les tableaux vides signifient « tout ». */
export interface LogHubFilterState {
    levels: LogLevel[];
    sources: LogSource[];
    range: RangeFilter;
    search: string;
}

export const EMPTY_LOG_FILTERS: LogHubFilterState = {
    levels: [],
    sources: [],
    range: 'all',
    search: '',
};

/** Groupe d'événements d'une même journée, dans l'ordre d'arrivée. */
export interface LogDayGroup {
    key: string;
    label: string;
    entries: ActivityLogEntry[];
}

/** Répartition calculée sur les entrées chargées (fenêtre courante). */
export interface LogHubSummary {
    total: number;
    byLevel: Record<LogLevel, number>;
    bySource: Array<{ source: LogSource; count: number }>;
}
