/**
 * Contrats du moteur analytique du Cockpit CUC.
 *
 * Aucune donnée n'est inventée : tout indicateur est calculé à partir des
 * enregistrements fournis. Un jeu vide produit des zéros, jamais des valeurs
 * fictives.
 */

import type { SiteInquiry, AuditLogEntry, SitePageContent } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendPoint {
    /** Libellé court de la période (ex. « 12/09 »). */
    label: string;
    /** Valeur brute de la période. */
    value: number;
}

export interface TrendSeries {
    points: TrendPoint[];
    total: number;
    /** Variation en pourcentage entre la première et la seconde moitié de la fenêtre. */
    deltaPct: number;
    direction: TrendDirection;
}

export interface FunnelStage {
    id: string;
    label: string;
    count: number;
    /** Taux de conversion depuis l'étape précédente (0-100). La première étape vaut 100. */
    conversionFromPrevious: number;
    /** Taux de conversion depuis la première étape (0-100). */
    conversionFromStart: number;
}

export interface DistributionSlice {
    label: string;
    value: number;
    /** Part en pourcentage du total (0-100). */
    share: number;
}

export interface SessionPressure {
    programId: string;
    programTitle: string;
    totalSeats: number;
    bookedSeats: number;
    /** Taux de remplissage (0-100). */
    fillRate: number;
    openSessions: number;
    fullSessions: number;
}

export interface AnalyticsInput {
    inquiries: SiteInquiry[];
    programs: StuntProgram[];
    auditLogs: AuditLogEntry[];
    pages: SitePageContent[];
    /** Fenêtre d'analyse en jours pour les séries temporelles. */
    windowDays?: number;
    /** Date de référence (injectable pour les tests). */
    now?: Date;
}

export interface AnalyticsReport {
    windowDays: number;
    generatedAt: string;
    kpis: {
        inquiriesTotal: number;
        inquiriesNew: number;
        inquiriesAdmitted: number;
        inquiriesRefused: number;
        admissionRate: number;
        avgResponseHours: number | null;
        sessionsTotal: number;
        sessionsFull: number;
        seatFillRate: number;
        publishedPages: number;
        draftPages: number;
        auditEvents: number;
        activeEditors: number;
    };
    inquiryTrend: TrendSeries;
    auditTrend: TrendSeries;
    funnel: FunnelStage[];
    statusDistribution: DistributionSlice[];
    programDistribution: DistributionSlice[];
    sessionPressure: SessionPressure[];
    activityByAuthor: DistributionSlice[];
    activityByEntity: DistributionSlice[];
}
