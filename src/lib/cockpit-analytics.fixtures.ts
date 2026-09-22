/**
 * Fixtures du moteur analytique du Cockpit, partagées entre les fichiers de
 * test par famille d'indicateurs.
 */

import type { AnalyticsInput } from './cockpit-analytics';
import type { SiteInquiry, AuditLogEntry, SitePageContent } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';

export const NOW = new Date('2026-09-20T12:00:00.000Z');

export function makeInquiry(overrides: Partial<SiteInquiry> = {}): SiteInquiry {
    return {
        id: overrides.id ?? 'inq-1',
        full_name: 'Candidat Test',
        email: 'test@example.com',
        phone: '0600000000',
        program_id: 'prog-1',
        message: 'Message',
        status: 'nouveau',
        created_at: '2026-09-19T10:00:00.000Z',
        ...overrides,
    };
}

export function makeAuditLog(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
    return {
        id: overrides.id ?? 'log-1',
        user_name: 'Niels',
        action: 'update',
        entity: 'Page',
        created_at: '2026-09-19T10:00:00.000Z',
        ...overrides,
    };
}

export function makePage(overrides: Partial<SitePageContent> = {}): SitePageContent {
    return {
        slug: '/test',
        title: 'Page de test',
        is_published: true,
        ...overrides,
    } as SitePageContent;
}

export function makeProgram(overrides: Partial<StuntProgram> = {}): StuntProgram {
    return {
        id: 'prog-1',
        title: 'Formation Cascadeur',
        nextSessions: [],
        ...overrides,
    } as StuntProgram;
}

export function emptyInput(overrides: Partial<AnalyticsInput> = {}): AnalyticsInput {
    return {
        inquiries: [],
        programs: [],
        auditLogs: [],
        pages: [],
        windowDays: 30,
        now: NOW,
        ...overrides,
    };
}
