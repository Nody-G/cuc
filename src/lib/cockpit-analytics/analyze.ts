/**
 * Analyse complète du Cockpit. Tous les indicateurs sont dérivés des données
 * fournies ; aucune valeur n'est inventée.
 */

import type { AnalyticsInput, AnalyticsReport } from './types';
import { safeDate } from './time';
import { buildDailySeries } from './series';
import { computeInquiryMetrics } from './inquiry-metrics';
import { computeSessionMetrics } from './session-metrics';
import { computeActivityMetrics } from './activity-metrics';
import {
    buildFunnel,
    buildProgramDistribution,
    buildStatusDistribution,
} from './breakdowns';

export function analyzeCockpit(input: AnalyticsInput): AnalyticsReport {
    const windowDays = Math.max(1, input.windowDays ?? 30);
    const now = input.now ?? new Date();
    const inquiries = input.inquiries ?? [];
    const programs = input.programs ?? [];
    const auditLogs = input.auditLogs ?? [];
    const pages = input.pages ?? [];

    // --- Candidatures -------------------------------------------------------
    const {
        statusCounts,
        total: inquiriesTotal,
        newCount: inquiriesNew,
        admitted: inquiriesAdmitted,
        refused: inquiriesRefused,
        decided,
        admissionRate,
        avgResponseHours,
    } = computeInquiryMetrics(inquiries);

    // --- Sessions -----------------------------------------------------------
    const { sessionsTotal, sessionsFull, seatFillRate, pressure } =
        computeSessionMetrics(programs);

    // --- Pages --------------------------------------------------------------
    const publishedPages = pages.filter((p) => p.is_published !== false).length;
    const draftPages = pages.length - publishedPages;

    // --- Journal d'audit ----------------------------------------------------
    const { auditEvents, activeEditors, activityByAuthor, activityByEntity } =
        computeActivityMetrics(auditLogs);

    const auditDates = auditLogs
        .map((log) => safeDate(log.created_at))
        .filter((d): d is Date => d !== null);

    const inquiryDates = inquiries
        .map((inq) => safeDate(inq.created_at))
        .filter((d): d is Date => d !== null);

    const inquiryTrend = buildDailySeries(inquiryDates, windowDays, now);
    const auditTrend = buildDailySeries(auditDates, windowDays, now);

    // --- Entonnoir de conversion -------------------------------------------
    const funnel = buildFunnel({
        received: inquiriesTotal,
        processing: statusCounts.en_cours + inquiriesAdmitted + inquiriesRefused,
        decided,
        admitted: inquiriesAdmitted,
    });

    // --- Répartitions -------------------------------------------------------
    const statusDistribution = buildStatusDistribution(statusCounts);
    const programDistribution = buildProgramDistribution(inquiries);

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
            auditEvents,
            activeEditors,
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
