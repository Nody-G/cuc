/**
 * Tests de la re-catégorisation d'une demande Contact.
 */

import { appendReclassification, evaluateReclassification } from './reclassify';

const AT = '2026-09-29T10:00:00.000Z';

describe('evaluateReclassification', () => {
    it('refuse un pipeline cible inconnu', () => {
        const decision = evaluateReclassification({
            currentPipeline: 'formation',
            targetPipeline: 'inconnu',
            reason: 'Erreur de catégorie',
            at: AT,
        });
        expect(decision.allowed).toBe(false);
    });

    it('refuse un déplacement vers le pipeline courant', () => {
        const decision = evaluateReclassification({
            currentPipeline: 'production',
            targetPipeline: 'production',
            reason: 'Erreur de catégorie',
            at: AT,
        });
        expect(decision.allowed).toBe(false);
    });

    it('exige un motif', () => {
        const decision = evaluateReclassification({
            currentPipeline: 'formation',
            targetPipeline: 'production',
            reason: '  ',
            at: AT,
        });
        expect(decision.allowed).toBe(false);
    });

    it('repart à la première étape du pipeline cible', () => {
        const decision = evaluateReclassification({
            currentPipeline: 'formation',
            targetPipeline: 'production',
            reason: 'Demande de tournage reçue par erreur en formation',
            at: AT,
        });
        expect(decision.allowed).toBe(true);
        if (decision.allowed) {
            expect(decision.pipeline).toBe('production');
            expect(decision.stage).toBe('recue');
            expect(decision.entry.from).toBe('formation');
            expect(decision.entry.to).toBe('production');
        }
    });

    it('traite un pipeline courant absent comme « formation »', () => {
        const decision = evaluateReclassification({
            currentPipeline: null,
            targetPipeline: 'presse',
            reason: 'Demande média mal orientée',
            at: AT,
        });
        expect(decision.allowed).toBe(true);
        if (decision.allowed) expect(decision.entry.from).toBe('formation');
    });
});

describe('appendReclassification', () => {
    it('place la nouvelle entrée en tête', () => {
        const history = appendReclassification([{ at: 'ancien', from: 'a', to: 'b', reason: 'x' }], {
            at: AT,
            from: 'formation',
            to: 'production',
            reason: 'Motif',
        });
        expect(history[0].at).toBe(AT);
        expect(history).toHaveLength(2);
    });

    it('ignore les entrées héritées invalides et borne l’historique', () => {
        const dirty = [{ at: AT }, null, 'texte', { from: 'a' }];
        const history = appendReclassification(dirty, {
            at: AT,
            from: 'formation',
            to: 'presse',
            reason: 'Motif',
        });
        expect(history).toHaveLength(2);
        expect(history[0].to).toBe('presse');
    });
});
