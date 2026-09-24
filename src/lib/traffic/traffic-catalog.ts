/**
 * Catalogue des pages suivies par le moniteur de trafic : chemin, libellé,
 * catégorie, poids de répartition et objectif de conversion.
 * Données pures — aucune logique (`AGENTS.md` § 1-2).
 */

import type { PageVisitMetric } from '@/types/site-traffic';

export const CUC_PAGES_CATALOG: Array<{
    path: string;
    title: string;
    category: PageVisitMetric['category'];
    weight: number;
    conversionGoal: string;
}> = [
        {
            path: '/formation-de-cascadeur',
            title: 'Formation Cascadeur Pro (Qualiopi & AFDAS)',
            category: 'formation',
            weight: 0.28,
            conversionGoal: 'Candidature Formation',
        },
        {
            path: '/videos-cascadeur',
            title: 'Vidéos & Reels Cascades CUC',
            category: 'experience',
            weight: 0.22,
            conversionGoal: 'Visionnage Reels',
        },
        {
            path: '/stages-cascades-parkour-2',
            title: 'Stages Cascades & Parkour Découverte',
            category: 'stages',
            weight: 0.14,
            conversionGoal: 'Réservation Stage',
        },
        {
            path: '/visite-virtuelle',
            title: 'Visite Virtuelle 3D du Campus',
            category: 'experience',
            weight: 0.11,
            conversionGoal: 'Exploration 3D',
        },
        {
            path: '/team-building-cascades',
            title: 'Team Building & Événements Entreprises',
            category: 'b2b',
            weight: 0.08,
            conversionGoal: 'Demande Devis B2B',
        },
        {
            path: '/stunt-workshop-cuc',
            title: 'Stunt Workshops Internationaux',
            category: 'stages',
            weight: 0.05,
            conversionGoal: 'Inscription Workshop',
        },
        {
            path: '/cuc-team-cascadeur',
            title: "L'Équipe des Cascadeurs & Coachs",
            category: 'vitrine',
            weight: 0.04,
            conversionGoal: 'Consultation Coachs',
        },
        {
            path: '/spectacles-cascadeurs-yamakasi',
            title: 'Spectacles Cascades & Yamakasi Live',
            category: 'b2b',
            weight: 0.03,
            conversionGoal: 'Booking Spectacle',
        },
        {
            path: '/contact-cuc',
            title: 'Contact & Accès Campus CUC',
            category: 'vitrine',
            weight: 0.03,
            conversionGoal: 'Formulaire Contact',
        },
        {
            path: '/visite-guidee',
            title: 'Infrastructures & 11 000 m² d’équipements',
            category: 'vitrine',
            weight: 0.02,
            conversionGoal: 'Visite Campus',
        },
    ];
