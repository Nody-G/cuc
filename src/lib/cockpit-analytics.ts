/**
 * Moteur analytique du Cockpit CUC — surface publique.
 *
 * Fonction pure, sans effet de bord ni accès réseau : elle dérive des
 * indicateurs exploitables à partir des données déjà chargées par le Cockpit
 * (candidatures, sessions, journal d'audit, contenus). Testable sous Vitest.
 *
 * Aucune donnée n'est inventée : tout indicateur est calculé à partir des
 * enregistrements fournis. Un jeu vide produit des zéros, jamais des valeurs
 * fictives.
 *
 * L'implémentation vit dans `cockpit-analytics/**` ; cette façade conserve
 * l'API historique (`analyzeCockpit`, `seriesToPolyline`, types).
 */

export type {
    AnalyticsInput,
    AnalyticsReport,
    DistributionSlice,
    FunnelStage,
    SessionPressure,
    TrendDirection,
    TrendPoint,
    TrendSeries,
} from './cockpit-analytics/types';

export { analyzeCockpit } from './cockpit-analytics/analyze';
export { seriesToPolyline } from './cockpit-analytics/series';
