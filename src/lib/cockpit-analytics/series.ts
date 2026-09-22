/**
 * Séries temporelles du moteur analytique : agrégation journalière sur une
 * fenêtre glissante et conversion en tracé SVG normalisé.
 */

import type { TrendPoint, TrendSeries, TrendDirection } from './types';
import { DAY_MS, startOfDay, formatDayLabel } from './time';

/**
 * Construit une série temporelle journalière sur la fenêtre demandée.
 * Les jours sans événement sont conservés à zéro pour éviter toute
 * distorsion visuelle de la courbe.
 */
export function buildDailySeries(
    dates: Date[],
    windowDays: number,
    now: Date
): TrendSeries {
    const today = startOfDay(now);
    const buckets = new Map<string, number>();

    for (let i = windowDays - 1; i >= 0; i -= 1) {
        const day = new Date(today.getTime() - i * DAY_MS);
        buckets.set(formatDayLabel(day), 0);
    }

    const windowStart = today.getTime() - (windowDays - 1) * DAY_MS;

    for (const date of dates) {
        const day = startOfDay(date);
        if (day.getTime() < windowStart) continue;
        const key = formatDayLabel(day);
        if (buckets.has(key)) {
            buckets.set(key, (buckets.get(key) || 0) + 1);
        }
    }

    const points: TrendPoint[] = Array.from(buckets.entries()).map(([label, value]) => ({
        label,
        value,
    }));

    const total = points.reduce((acc, p) => acc + p.value, 0);

    // Comparaison première moitié / seconde moitié de la fenêtre.
    const half = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, half).reduce((acc, p) => acc + p.value, 0);
    const secondHalf = points.slice(half).reduce((acc, p) => acc + p.value, 0);

    let deltaPct = 0;
    if (firstHalf === 0 && secondHalf === 0) {
        deltaPct = 0;
    } else if (firstHalf === 0) {
        deltaPct = 100;
    } else {
        deltaPct = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    }

    const direction: TrendDirection = deltaPct > 2 ? 'up' : deltaPct < -2 ? 'down' : 'flat';

    return { points, total, deltaPct, direction };
}

/**
 * Convertit une série en tracé SVG normalisé (viewBox 0 0 100 32).
 * Retourne une chaîne `points` prête pour un `<polyline>`.
 */
export function seriesToPolyline(points: TrendPoint[], width = 100, height = 32): string {
    if (points.length === 0) return '';
    const max = Math.max(...points.map((p) => p.value), 1);
    const step = points.length > 1 ? width / (points.length - 1) : width;
    return points
        .map((p, i) => {
            const x = points.length > 1 ? i * step : width / 2;
            const y = height - (p.value / max) * height;
            return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
        })
        .join(' ');
}
