import { describe, expect, it } from 'vitest';
import { HELP_TABS, DEFAULT_HELP_TAB } from './help-tabs.config';
import { APP_METRICS, WORDPRESS_VS_NEXT, PUBLIC_PAGES_OVERVIEW, COCKPIT_SCREENS_OVERVIEW } from './help-application-data';
import { METHODOLOGY_STACK, VIBE_CODING_PRINCIPLES, PROJECT_DEV_STATS } from './help-methodology-data';
import { CUC_SIGN_FEATURES, VITRINE_TO_SIGN_BRIDGE, CUC_SIGN_CHALLENGES } from './help-cuc-sign-data';
import { LUCAS_FAQ_ITEMS } from './help-faq-data';

describe('Centre d’Aide & Documentation CUC', () => {
    it('expose exactement 5 grands onglets avec configuration complète', () => {
        expect(HELP_TABS).toHaveLength(5);
        const ids = HELP_TABS.map((t) => t.id);
        expect(ids).toEqual(['guide', 'application', 'methodologie', 'cuc-sign', 'faq']);
        expect(DEFAULT_HELP_TAB).toBe('guide');

        for (const tab of HELP_TABS) {
            expect(tab.label.length).toBeGreaterThan(0);
            expect(tab.description.length).toBeGreaterThan(0);
            expect(tab.icon).toBeDefined();
        }
    });

    it('dossier application contient les métriques clés et comparatifs', () => {
        expect(APP_METRICS.length).toBeGreaterThanOrEqual(4);
        expect(WORDPRESS_VS_NEXT.length).toBeGreaterThanOrEqual(5);
        expect(PUBLIC_PAGES_OVERVIEW.count).toBe(15);
        expect(COCKPIT_SCREENS_OVERVIEW.count).toBe(27);
    });

    it('méthodologie de travail contient la stack IA, les principes et les stats de dev', () => {
        expect(METHODOLOGY_STACK.length).toBeGreaterThanOrEqual(6);
        const stackNames = METHODOLOGY_STACK.map((s) => s.name);
        expect(stackNames).toContain('Google Antigravity');
        expect(stackNames).toContain('Gemini 2.5 Pro & Flash');
        expect(stackNames).toContain('DeepSeek Reasoner');
        expect(stackNames).toContain('PostgreSQL Supabase');
        expect(stackNames).toContain('GitHub & Git');
        expect(stackNames).toContain('Vercel Edge Platform');

        expect(VIBE_CODING_PRINCIPLES.length).toBe(2);
        expect(PROJECT_DEV_STATS.length).toBe(4);
    });

    it('dossier CUC Sign détaille les fonctionnalités, la passerelle et les défis', () => {
        expect(CUC_SIGN_FEATURES.length).toBe(4);
        expect(VITRINE_TO_SIGN_BRIDGE.length).toBe(4);
        expect(CUC_SIGN_CHALLENGES.length).toBe(4);
    });

    it('la FAQ de Lucas répond de manière chiffrée et transparente', () => {
        expect(LUCAS_FAQ_ITEMS.length).toBeGreaterThanOrEqual(6);
        for (const item of LUCAS_FAQ_ITEMS) {
            expect(item.question.length).toBeGreaterThan(5);
            expect(item.answer.length).toBeGreaterThan(20);
            expect(['finances', 'autonomie', 'technique', 'securite']).toContain(item.category);
        }
    });
});
