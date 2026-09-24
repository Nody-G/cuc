/**
 * Volumes de référence par fenêtre d'analyse du moniteur de trafic.
 *
 * Ce sont des **ordres de grandeur de démonstration**, pas des relevés. Ils
 * restent utiles pour montrer la forme du tableau de bord avant la mise en place
 * d'une collecte réelle, à condition de le dire à l'écran
 * (`SiteTrafficReport.dataSource === 'modelled'`).
 */

import type { TrafficWindow } from '@/types/site-traffic';

export interface WindowVolumeConfig {
    visits: number;
    prevVisits: number;
    /** Nombre de points de la série temporelle pour cette fenêtre. */
    points: number;
}

export const WINDOW_VOLUMES: Record<TrafficWindow, WindowVolumeConfig> = {
    today: { visits: 3820, prevVisits: 3450, points: 24 },
    '24h': { visits: 4190, prevVisits: 3890, points: 24 },
    '7d': { visits: 28450, prevVisits: 25100, points: 7 },
    '30d': { visits: 114200, prevVisits: 102400, points: 30 },
    '90d': { visits: 326000, prevVisits: 298000, points: 12 },
    '12m': { visits: 1280000, prevVisits: 1120000, points: 12 },
};

/** Configuration d'une fenêtre, repli `30d` si la fenêtre est inconnue. */
export function windowVolume(window: TrafficWindow): WindowVolumeConfig {
    return WINDOW_VOLUMES[window] || WINDOW_VOLUMES['30d'];
}

/** Vrai pour les fenêtres horaires (libellés d'heures, points à l'heure). */
export function isHourlyWindow(window: TrafficWindow): boolean {
    return window === 'today' || window === '24h';
}
