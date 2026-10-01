import { describe, expect, it } from 'vitest';
import { HELP_TABS, DEFAULT_HELP_TAB } from './help-tabs.config';
import { APP_METRICS, WORDPRESS_VS_NEXT, PUBLIC_PAGES_OVERVIEW, COCKPIT_SCREENS_OVERVIEW } from './help-application-data';
import {
    CONCRETE_CASE_STUDIES,
    FLASH_MODELS,
    PRE_PROMPT_THOUGHTS,
    SAFETY_PROTOCOL_STEPS,
    TOKEN_COST_ESTIMATION,
} from './help-methodology-data';
import { CUC_SIGN_FEATURES, VITRINE_TO_SIGN_BRIDGE, CUC_SIGN_CHALLENGES } from './help-cuc-sign-data';
import { LUCAS_FAQ_ITEMS } from './help-faq-data';
import { HELP_CONTENT } from './help-content';

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

    it('le guide pratique contient des sujets détaillés avec étapes et dépannage', () => {
        expect(HELP_CONTENT.length).toBe(5);
        const totalTopics = HELP_CONTENT.reduce((acc, g) => acc + g.topics.length, 0);
        expect(totalTopics).toBeGreaterThanOrEqual(15);

        // Vérification qu'au moins plusieurs sujets comportent des étapes pas-à-pas, des astuces et du dépannage
        const topicsWithSteps = HELP_CONTENT.flatMap((g) => g.topics).filter((t) => t.steps && t.steps.length > 0);
        const topicsWithProTip = HELP_CONTENT.flatMap((g) => g.topics).filter((t) => Boolean(t.proTip));
        const topicsWithTroubleshooting = HELP_CONTENT.flatMap((g) => g.topics).filter((t) => Boolean(t.troubleshooting));

        expect(topicsWithSteps.length).toBeGreaterThanOrEqual(10);
        expect(topicsWithProTip.length).toBeGreaterThanOrEqual(10);
        expect(topicsWithTroubleshooting.length).toBeGreaterThanOrEqual(10);
    });

    it('dossier application contient les métriques clés et comparatifs', () => {
        expect(APP_METRICS.length).toBeGreaterThanOrEqual(4);
        expect(WORDPRESS_VS_NEXT.length).toBeGreaterThanOrEqual(5);
        expect(PUBLIC_PAGES_OVERVIEW.count).toBe(15);
        expect(COCKPIT_SCREENS_OVERVIEW.count).toBe(27);
    });

    it('méthodologie détaille Gemini 3.8 Flash, DeepSeek v4.1 Flash, les tokens et les cas réels', () => {
        expect(PRE_PROMPT_THOUGHTS).toHaveLength(4);
        expect(FLASH_MODELS).toHaveLength(2);
        const modelNames = FLASH_MODELS.map((m) => m.name);
        expect(modelNames).toContain('Gemini 3.8 Flash');
        expect(modelNames).toContain('DeepSeek v4.1 Flash');

        expect(TOKEN_COST_ESTIMATION.estimatedCostEuros).toContain('€');
        expect(TOKEN_COST_ESTIMATION.comparisons.length).toBe(4);

        expect(CONCRETE_CASE_STUDIES).toHaveLength(3);
        expect(SAFETY_PROTOCOL_STEPS).toHaveLength(4);
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
