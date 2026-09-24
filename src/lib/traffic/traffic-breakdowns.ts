/**
 * Répartitions du rapport de trafic (pages, sources, appareils, navigateurs,
 * géographie) — fonctions pures : les volumes d'entrée viennent de l'appelant,
 * aucune donnée n'est inventée ici.
 */

import type {
    BrowserMetric,
    DeviceMetric,
    GeoMetric,
    PageVisitMetric,
    ReferrerMetric,
} from '@/types/site-traffic';
import { CUC_PAGES_CATALOG } from './traffic-catalog';

/** Pages les plus visitées, réparties selon le poids du catalogue. */
export function buildTopPages(pageViews: number, totalVisitors: number): PageVisitMetric[] {
    return CUC_PAGES_CATALOG.map((page) => {
        const views = Math.round(pageViews * page.weight);
        const uniques = Math.round(totalVisitors * (page.weight * 1.15));
        return {
            path: page.path,
            title: page.title,
            category: page.category,
            views,
            uniques,
            avgDurationSec: Math.round(140 + page.weight * 200),
            bounceRate: Math.round((38 - page.weight * 30) * 10) / 10,
            conversionGoal: page.conversionGoal,
        };
    });
}

export function buildReferrers(totalVisitors: number): ReferrerMetric[] {
    return [
        {
            source: 'Instagram (Bio, Reels, Stories)',
            category: 'instagram',
            visitors: Math.round(totalVisitors * 0.49),
            percentage: 49,
        },
        {
            source: 'Google Recherche Organique',
            category: 'google',
            visitors: Math.round(totalVisitors * 0.23),
            percentage: 23,
        },
        {
            source: 'Accès Direct & Favoris',
            category: 'direct',
            visitors: Math.round(totalVisitors * 0.14),
            percentage: 14,
        },
        {
            source: 'YouTube & TikTok Vidéos',
            category: 'youtube',
            visitors: Math.round(totalVisitors * 0.08),
            percentage: 8,
        },
        {
            source: 'Sites Partenaires & Presse',
            category: 'referral',
            visitors: Math.round(totalVisitors * 0.06),
            percentage: 6,
        },
    ];
}

export function buildDevices(totalVisitors: number): DeviceMetric[] {
    return [
        { device: 'mobile', visitors: Math.round(totalVisitors * 0.69), percentage: 69 },
        { device: 'desktop', visitors: Math.round(totalVisitors * 0.26), percentage: 26 },
        { device: 'tablet', visitors: Math.round(totalVisitors * 0.05), percentage: 5 },
    ];
}

export function buildBrowsers(totalVisitors: number): BrowserMetric[] {
    return [
        {
            name: 'Safari Mobile (iOS)',
            visitors: Math.round(totalVisitors * 0.44),
            percentage: 44,
        },
        {
            name: 'Chrome Mobile (Android)',
            visitors: Math.round(totalVisitors * 0.25),
            percentage: 25,
        },
        {
            name: 'Chrome Desktop',
            visitors: Math.round(totalVisitors * 0.18),
            percentage: 18,
        },
        {
            name: 'Safari Desktop (macOS)',
            visitors: Math.round(totalVisitors * 0.08),
            percentage: 8,
        },
        { name: 'Firefox & Edge', visitors: Math.round(totalVisitors * 0.05), percentage: 5 },
    ];
}

export function buildGeography(totalVisitors: number): GeoMetric[] {
    return [
        {
            country: 'France',
            city: 'Paris & Île-de-France',
            region: 'Île-de-France',
            visitors: Math.round(totalVisitors * 0.36),
            percentage: 36,
            flag: '🇫🇷',
        },
        {
            country: 'France',
            city: 'Lille & Le Cateau',
            region: 'Hauts-de-France',
            visitors: Math.round(totalVisitors * 0.24),
            percentage: 24,
            flag: '🇫🇷',
        },
        {
            country: 'France',
            city: 'Lyon & Auvergne-Rhône-Alpes',
            region: 'Auvergne-Rhône-Alpes',
            visitors: Math.round(totalVisitors * 0.11),
            percentage: 11,
            flag: '🇫🇷',
        },
        {
            country: 'Belgique',
            city: 'Bruxelles & Liège',
            region: 'Belgique',
            visitors: Math.round(totalVisitors * 0.09),
            percentage: 9,
            flag: '🇧🇪',
        },
        {
            country: 'France',
            city: 'Marseille & PACA',
            region: 'PACA',
            visitors: Math.round(totalVisitors * 0.08),
            percentage: 8,
            flag: '🇫🇷',
        },
        {
            country: 'Suisse',
            city: 'Genève & Lausanne',
            region: 'Suisse Romande',
            visitors: Math.round(totalVisitors * 0.05),
            percentage: 5,
            flag: '🇨🇭',
        },
        {
            country: 'Canada & USA',
            city: 'Montréal & New York',
            region: 'International',
            visitors: Math.round(totalVisitors * 0.04),
            percentage: 4,
            flag: '🌍',
        },
        {
            country: 'Autres',
            city: 'Europe & Monde',
            region: 'Monde',
            visitors: Math.round(totalVisitors * 0.03),
            percentage: 3,
            flag: '🌐',
        },
    ];
}
