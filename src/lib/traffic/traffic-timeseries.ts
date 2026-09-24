/**
 * Série temporelle du rapport de trafic — fonction pure vis-à-vis de l'appelant
 * (la date courante est lue une seule fois ici, comme dans l'original).
 */

import type { TrafficTimeSeriesPoint, TrafficWindow } from '@/types/site-traffic';
import { isHourlyWindow } from './traffic-windows';

const HOUR_MS = 3600000;
const DAY_MS = 86400000;

export function generateTimeSeries(
    window: TrafficWindow,
    total: number,
    points: number
): TrafficTimeSeriesPoint[] {
    const list: TrafficTimeSeriesPoint[] = [];
    const avgPerPoint = total / points;
    const now = new Date();
    const hourly = isHourlyWindow(window);

    for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * (hourly ? HOUR_MS : DAY_MS));
        let label = '';
        if (hourly) {
            label = `${date.getHours()}h`;
        } else if (window === '7d' || window === '30d') {
            label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        } else {
            label = date.toLocaleDateString('fr-FR', { month: 'short' });
        }

        // Variation fluide et réaliste
        const sinus = Math.sin((points - i) / 2) * 0.25;
        const randomFactor = 0.85 + Math.random() * 0.3 + sinus;
        const visitors = Math.max(5, Math.round(avgPerPoint * randomFactor));
        const pageViews = Math.round(visitors * (3.1 + Math.random() * 0.7));

        list.push({
            label,
            timestamp: date.toISOString(),
            visitors,
            pageViews,
        });
    }

    return list;
}
