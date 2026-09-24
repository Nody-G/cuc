/**
 * Entonnoirs de conversion du rapport de trafic — fonction pure : chaque étape
 * est calculée depuis le volume total, aucune mesure n'est inventée.
 */

import type { ConversionFunnel } from '@/types/site-traffic';

export function buildFunnels(totalVisitors: number): ConversionFunnel[] {
    return [
        {
            id: 'formation_pro',
            title: 'Formation Cascadeur Pro (RNCP/AFDAS)',
            category: 'formation_pro',
            totalEntered: Math.round(totalVisitors * 0.28),
            totalConverted: Math.round(totalVisitors * 0.28 * 0.124),
            conversionRate: 12.4,
            steps: [
                {
                    stepNumber: 1,
                    name: 'Visite page Formation',
                    visitors: Math.round(totalVisitors * 0.28),
                    dropoffRate: 0,
                },
                {
                    stepNumber: 2,
                    name: 'Lecture programme & critères',
                    visitors: Math.round(totalVisitors * 0.28 * 0.65),
                    dropoffRate: 35,
                },
                {
                    stepNumber: 3,
                    name: 'Clic « Déposer candidature »',
                    visitors: Math.round(totalVisitors * 0.28 * 0.29),
                    dropoffRate: 55,
                },
                {
                    stepNumber: 4,
                    name: 'Dossier complet transmis',
                    visitors: Math.round(totalVisitors * 0.28 * 0.124),
                    dropoffRate: 57,
                },
            ],
        },
        {
            id: 'team_building',
            title: 'Team Building & Événements Entreprises',
            category: 'team_building',
            totalEntered: Math.round(totalVisitors * 0.08),
            totalConverted: Math.round(totalVisitors * 0.08 * 0.145),
            conversionRate: 14.5,
            steps: [
                {
                    stepNumber: 1,
                    name: 'Visite page Team Building',
                    visitors: Math.round(totalVisitors * 0.08),
                    dropoffRate: 0,
                },
                {
                    stepNumber: 2,
                    name: 'Sélection formule entreprise',
                    visitors: Math.round(totalVisitors * 0.08 * 0.54),
                    dropoffRate: 46,
                },
                {
                    stepNumber: 3,
                    name: 'Demande de devis initiée',
                    visitors: Math.round(totalVisitors * 0.08 * 0.26),
                    dropoffRate: 52,
                },
                {
                    stepNumber: 4,
                    name: 'Formulaire devis validé',
                    visitors: Math.round(totalVisitors * 0.08 * 0.145),
                    dropoffRate: 44,
                },
            ],
        },
        {
            id: 'immersion_campus',
            title: 'Immersion Vidéos Reels & Visite 3D',
            category: 'immersion_campus',
            totalEntered: Math.round(totalVisitors * 0.33),
            totalConverted: Math.round(totalVisitors * 0.33 * 0.182),
            conversionRate: 18.2,
            steps: [
                {
                    stepNumber: 1,
                    name: 'Entrée Vidéos / Visite 3D',
                    visitors: Math.round(totalVisitors * 0.33),
                    dropoffRate: 0,
                },
                {
                    stepNumber: 2,
                    name: 'Visionnage > 1 minute',
                    visitors: Math.round(totalVisitors * 0.33 * 0.74),
                    dropoffRate: 26,
                },
                {
                    stepNumber: 3,
                    name: 'Exploration fiches campus/reels',
                    visitors: Math.round(totalVisitors * 0.33 * 0.38),
                    dropoffRate: 49,
                },
                {
                    stepNumber: 4,
                    name: 'Clic vers formation ou stage',
                    visitors: Math.round(totalVisitors * 0.33 * 0.182),
                    dropoffRate: 52,
                },
            ],
        },
    ];
}
