/**
 * Tests du catalogue des pipelines Contact.
 *
 * Aucun import de `vitest` : `globals: true` est activé (`vitest.config.mts`).
 */

import {
    DISCOVERY_VALIDATED_STAGE,
    LONG_PROGRAM_STAGE,
    PIPELINE_CATALOG,
    PIPELINE_IDS,
    canSelectStage,
    firstStageOf,
    getPipeline,
    isTerminalStage,
    resolveStage,
} from './pipelines';
import { firstParticipationStage, requiresProfileFor } from './pipeline-read';

describe('catalogue des pipelines', () => {
    it('expose chaque pipeline déclaré, sans doublon', () => {
        expect(PIPELINE_CATALOG).toHaveLength(PIPELINE_IDS.length);
        expect(new Set(PIPELINE_CATALOG.map((p) => p.id)).size).toBe(PIPELINE_CATALOG.length);
    });

    it('donne au moins deux étapes et une checklist à chaque pipeline', () => {
        for (const pipeline of PIPELINE_CATALOG) {
            expect(pipeline.stages.length).toBeGreaterThanOrEqual(2);
            expect(pipeline.checklist.length).toBeGreaterThan(0);
        }
    });

    it('réserve le vocabulaire d’admission à la formation', () => {
        const formation = getPipeline('formation');
        expect(formation.admission).toBe(true);
        for (const pipeline of PIPELINE_CATALOG.filter((p) => p.id !== 'formation')) {
            expect(pipeline.admission).toBe(false);
            expect(pipeline.stages.some((stage) => stage.id === 'admis')).toBe(false);
        }
    });

    it('retombe sur la formation pour un pipeline inconnu ou absent', () => {
        expect(getPipeline('tournage').id).toBe('formation');
        expect(getPipeline(null).id).toBe('formation');
        expect(getPipeline(undefined).id).toBe('formation');
    });
});

describe('résolution des étapes héritées', () => {
    const formation = getPipeline('formation');

    it('traduit les anciens statuts vers le catalogue', () => {
        expect(resolveStage(formation, 'nouveau').id).toBe('recue');
        expect(resolveStage(formation, 'en_cours').id).toBe('qualification');
        expect(resolveStage(formation, 'admis').id).toBe(LONG_PROGRAM_STAGE);
        expect(resolveStage(formation, 'refuse').id).toBe('refuse');
        expect(resolveStage(formation, 'archive').id).toBe('archive');
    });

    it('retombe sur la première étape pour une valeur inconnue', () => {
        const production = getPipeline('production');
        expect(resolveStage(production, 'decouverte_validee').id).toBe(firstStageOf(production).id);
        expect(resolveStage(production, '').id).toBe(firstStageOf(production).id);
    });

    it('marque les étapes de clôture', () => {
        const closed = formation.stages.filter(isTerminalStage).map((stage) => stage.id);
        expect(closed).toContain('refuse');
        expect(closed).toContain('archive');
        expect(closed).not.toContain('qualification');
    });
});

describe('participation ⇒ profil CUC Sign', () => {
    const formation = getPipeline('formation');

    it('marque les étapes de participation du parcours Formation', () => {
        expect(requiresProfileFor(formation, 'decouverte_planifiee')).toBe(true);
        expect(requiresProfileFor(formation, 'decouverte_en_cours')).toBe(true);
        expect(requiresProfileFor(formation, DISCOVERY_VALIDATED_STAGE)).toBe(true);
        expect(requiresProfileFor(formation, LONG_PROGRAM_STAGE)).toBe(true);
    });

    it('n’exige aucun profil pour une simple demande en cours d’examen', () => {
        expect(requiresProfileFor(formation, 'recue')).toBe(false);
        expect(requiresProfileFor(formation, 'qualification')).toBe(false);
        expect(requiresProfileFor(formation, 'refuse')).toBe(false);
    });

    it('n’exige aucun profil pour un devis de tournage, un événement ou la presse', () => {
        for (const id of ['production', 'evenement', 'presse'] as const) {
            const pipeline = getPipeline(id);
            expect(firstParticipationStage(pipeline)).toBeNull();
            for (const stage of pipeline.stages) {
                expect(requiresProfileFor(pipeline, stage.id)).toBe(false);
            }
        }
    });

    it('identifie la première étape de participation de la Formation', () => {
        expect(firstParticipationStage(formation)).toBe('decouverte_planifiee');
    });
});

describe('verrou Découverte → Cursus Pro', () => {
    const formation = getPipeline('formation');

    it('interdit le cursus long sans verdict favorable', () => {
        const decision = canSelectStage({
            pipeline: formation,
            fromStageId: 'qualification',
            toStageId: LONG_PROGRAM_STAGE,
        });
        expect(decision.allowed).toBe(false);
    });

    it('autorise le cursus long quand la Découverte est validée', () => {
        const decision = canSelectStage({
            pipeline: formation,
            fromStageId: DISCOVERY_VALIDATED_STAGE,
            toStageId: LONG_PROGRAM_STAGE,
            discoveryValidated: true,
        });
        expect(decision.allowed).toBe(true);
    });

    it('laisse corriger un dossier par ailleurs', () => {
        const decision = canSelectStage({
            pipeline: formation,
            fromStageId: 'qualification',
            toStageId: 'recue',
        });
        expect(decision.allowed).toBe(true);
    });

    it('refuse une étape qui n’appartient pas au pipeline', () => {
        const production = getPipeline('production');
        const decision = canSelectStage({
            pipeline: production,
            fromStageId: 'recue',
            toStageId: 'decouverte_en_cours',
        });
        expect(decision.allowed).toBe(false);
    });
});
