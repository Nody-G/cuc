/**
 * Moteur analytique du Cockpit CUC.
 *
 * Fonction pure, sans effet de bord ni accès réseau : elle dérive des
 * indicateurs exploitables à partir des données déjà chargées par le Cockpit
 * (candidatures, sessions, journal d'audit, contenus). Testable sous Vitest.
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

const DAY_MS = 86_400_000;

const INQUIRY_STATUS_LABELS: Record<SiteInquiry['status'], string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    admis: 'Admis',
    refuse: 'Refusé',
    archive: 'Archivé',
};

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDayLabel(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

function safeDate(value: string | undefined | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Construit une série temporelle journalière sur la fenêtre demandée.
 * Les jours sans événement sont conservés à zéro pour éviter toute
 * distorsion visuelle de la courbe.
 */
function buildDailySeries(
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

function buildDistribution(
    entries: Array<{ label: string; value: number }>
): DistributionSlice[] {
    const total = entries.reduce((acc, e) => acc + e.value, 0);
    return entries
        .filter((e) => e.value > 0)
        .map((e) => ({
            label: e.label,
            value: e.value,
            share: total > 0 ? Math.round((e.value / total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Analyse complète du Cockpit. Tous les indicateurs sont dérivés des données
 * fournies ; aucune valeur n'est inventée.
 */
export function analyzeCockpit(input: AnalyticsInput): AnalyticsReport {
    const windowDays = Math.max(1, input.windowDays ?? 30);
    const now = input.now ?? new Date();
    const inquiries = input.inquiries ?? [];
    const programs = input.programs ?? [];
    const auditLogs = input.auditLogs ?? [];
    const pages = input.pages ?? [];

    // --- Candidatures -------------------------------------------------------
    const statusCounts: Record<SiteInquiry['status'], number> = {
        nouveau: 0,
        en_cours: 0,
        admis: 0,
        refuse: 0,
        archive: 0,
    };
    for (const inq of inquiries) {
        if (statusCounts[inq.status] !== undefined) {
            statusCounts[inq.status] += 1;
        }
    }

    const inquiriesTotal = inquiries.length;
    const inquiriesNew = statusCounts.nouveau;
    const inquiriesAdmitted = statusCounts.admis;
    const inquiriesRefused = statusCounts.refuse;
    const decided = inquiriesAdmitted + inquiriesRefused;
    const admissionRate = decided > 0 ? Math.round((inquiriesAdmitted / decided) * 1000) / 10 : 0;

    // Délai moyen de traitement : écart entre création et dernière mise à jour
    // pour les dossiers déjà traités (statut ≠ nouveau).
    const responseDurations: number[] = [];
    for (const inq of inquiries) {
        if (inq.status === 'nouveau') continue;
        const created = safeDate(inq.created_at);
        const updated = safeDate(inq.updated_at);
        if (!created || !updated) continue;
        const hours = (updated.getTime() - created.getTime()) / 3_600_000;
        if (hours >= 0) responseDurations.push(hours);
    }
    const avgResponseHours =
        responseDurations.length > 0
            ? Math.round(
                (responseDurations.reduce((a, b) => a + b, 0) / responseDurations.length) * 10
            ) / 10
            : null;

    // --- Sessions -----------------------------------------------------------
    let sessionsTotal = 0;
    let sessionsFull = 0;
    let totalSeats = 0;
    let bookedSeats = 0;
    const pressure: SessionPressure[] = [];

    for (const program of programs) {
        const sessions = program.nextSessions || [];
        let progSeats = 0;
        let progBooked = 0;
        let progOpen = 0;
        let progFull = 0;

        for (const session of sessions) {
            sessionsTotal += 1;
            const max = session.max_seats ?? 0;
            const booked = session.booked_seats ?? 0;
            progSeats += max;
            progBooked += booked;
            totalSeats += max;
            bookedSeats += booked;
            if (session.status === 'complet') {
                sessionsFull += 1;
                progFull += 1;
            } else {
                progOpen += 1;
            }
        }

        if (sessions.length > 0) {
            pressure.push({
                programId: program.id,
                programTitle: program.title,
                totalSeats: progSeats,
                bookedSeats: progBooked,
                fillRate: progSeats > 0 ? Math.round((progBooked / progSeats) * 1000) / 10 : 0,
                openSessions: progOpen,
                fullSessions: progFull,
            });
        }
    }

    pressure.sort((a, b) => b.fillRate - a.fillRate);

    const seatFillRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 1000) / 10 : 0;

    // --- Pages --------------------------------------------------------------
    const publishedPages = pages.filter((p) => p.is_published !== false).length;
    const draftPages = pages.length - publishedPages;

    // --- Journal d'audit ----------------------------------------------------
    const auditDates = auditLogs
        .map((log) => safeDate(log.created_at))
        .filter((d): d is Date => d !== null);

    const inquiryDates = inquiries
        .map((inq) => safeDate(inq.created_at))
        .filter((d): d is Date => d !== null);

    const inquiryTrend = buildDailySeries(inquiryDates, windowDays, now);
    const auditTrend = buildDailySeries(auditDates, windowDays, now);

    const authorCounts = new Map<string, number>();
    const entityCounts = new Map<string, number>();
    for (const log of auditLogs) {
        const author = log.user_name?.trim() || 'Inconnu';
        authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
        const entity = log.entity?.trim() || 'Non précisé';
        entityCounts.set(entity, (entityCounts.get(entity) || 0) + 1);
    }

    const activityByAuthor = buildDistribution(
        Array.from(authorCounts.entries()).map(([label, value]) => ({ label, value }))
    );
    const activityByEntity = buildDistribution(
        Array.from(entityCounts.entries()).map(([label, value]) => ({ label, value }))
    );

    // --- Entonnoir de conversion -------------------------------------------
    const funnel: FunnelStage[] = [];
    const funnelSteps: Array<{ id: string; label: string; count: number }> = [
        { id: 'received', label: 'Demandes reçues', count: inquiriesTotal },
        { id: 'processing', label: 'En cours de traitement', count: statusCounts.en_cours + inquiriesAdmitted + inquiriesRefused },
        { id: 'decided', label: 'Décisions rendues', count: decided },
        { id: 'admitted', label: 'Admis', count: inquiriesAdmitted },
    ];

    let previousCount = 0;
    const startCount = funnelSteps[0]?.count ?? 0;
    funnelSteps.forEach((step, index) => {
        const conversionFromPrevious =
            index === 0 ? 100 : previousCount > 0 ? Math.round((step.count / previousCount) * 1000) / 10 : 0;
        const conversionFromStart =
            startCount > 0 ? Math.round((step.count / startCount) * 1000) / 10 : 0;
        funnel.push({
            ...step,
            conversionFromPrevious,
            conversionFromStart,
        });
        previousCount = step.count;
    });

    // --- Répartitions -------------------------------------------------------
    const statusDistribution = buildDistribution(
        (Object.keys(statusCounts) as Array<SiteInquiry['status']>).map((status) => ({
            label: INQUIRY_STATUS_LABELS[status],
            value: statusCounts[status],
        }))
    );

    const programCounts = new Map<string, number>();
    for (const inq of inquiries) {
        const label = inq.program_title?.trim() || inq.program_id?.trim() || 'Non précisé';
        programCounts.set(label, (programCounts.get(label) || 0) + 1);
    }
    const programDistribution = buildDistribution(
        Array.from(programCounts.entries()).map(([label, value]) => ({ label, value }))
    );

    return {
        windowDays,
        generatedAt: now.toISOString(),
        kpis: {
            inquiriesTotal,
            inquiriesNew,
            inquiriesAdmitted,
            inquiriesRefused,
            admissionRate,
            avgResponseHours,
            sessionsTotal,
            sessionsFull,
            seatFillRate,
            publishedPages,
            draftPages,
            auditEvents: auditLogs.length,
            activeEditors: authorCounts.size,
        },
        inquiryTrend,
        auditTrend,
        funnel,
        statusDistribution,
        programDistribution,
        sessionPressure: pressure,
        activityByAuthor,
        activityByEntity,
    };
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
