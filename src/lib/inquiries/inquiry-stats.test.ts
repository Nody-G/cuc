/**
 * Tests des comptages de la file Contact.
 */

import { computePipelineStats, countByPipeline, filterByPipeline } from './inquiry-stats';
import { getPipeline } from './pipelines';

const formation = getPipeline('formation');

const ENTRIES = [
    { status: 'recue', metadata: { pipeline: 'formation' } },
    { status: 'qualification', metadata: { pipeline: 'formation' } },
    { status: 'decouverte_validee', metadata: { pipeline: 'formation' } },
    { status: 'admis', metadata: { pipeline: 'formation' } },
    { status: 'refuse', metadata: { pipeline: 'formation' } },
    { status: 'recue', metadata: { pipeline: 'production' } },
    { status: 'recue', metadata: undefined },
];

describe('countByPipeline', () => {
    it('classe chaque dossier, formation par défaut', () => {
        expect(countByPipeline(ENTRIES)).toEqual({
            formation: 6,
            production: 1,
            evenement: 0,
            presse: 0,
        });
    });
});

describe('filterByPipeline', () => {
    it('ne retient que le pipeline demandé', () => {
        expect(filterByPipeline(ENTRIES, 'production')).toHaveLength(1);
        expect(filterByPipeline(ENTRIES, 'presse')).toHaveLength(0);
    });
});

describe('computePipelineStats', () => {
    const stats = computePipelineStats(formation, filterByPipeline(ENTRIES, 'formation'));

    it('compte les dossiers non traités à l’étape d’entrée', () => {
        expect(stats.toProcess).toBe(2); // recue + « nouveau » hérité
    });

    it('sépare les dossiers en cours des clôtures', () => {
        expect(stats.inProgress).toBe(2); // qualification + decouverte_validee
        expect(stats.won).toBe(1);
        expect(stats.lost).toBe(1);
        expect(stats.total).toBe(stats.toProcess + stats.inProgress + stats.won + stats.lost);
    });

    it('détaille chaque étape du pipeline, y compris à zéro', () => {
        for (const stage of formation.stages) {
            expect(stats.byStage[stage.id]).toBeGreaterThanOrEqual(0);
        }
        expect(stats.byStage.admis).toBe(1);
        expect(stats.byStage.decouverte_en_cours).toBe(0);
    });

    it('résout les anciens statuts hérités', () => {
        const legacy = computePipelineStats(formation, [{ status: 'nouveau' }]);
        expect(legacy.toProcess).toBe(1);
        expect(legacy.byStage.recue).toBe(1);
    });
});
