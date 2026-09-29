/**
 * Tests de l'historique d'une personne (candidatures répétées, Découverte non
 * retenue).
 */

import {
    buildApplicantHistory,
    groupByApplicant,
    hasPreviousDecisions,
    isReturningApplicant,
    normalizeApplicantEmail,
    previousDossiers,
} from './applicant-history';

const dossier = (
    id: string,
    email: string,
    status: string,
    createdAt: string,
    metadata?: unknown
) => ({ id, email, status, created_at: createdAt, updated_at: createdAt, metadata });

/** Premier passage : Découverte faite, verdict défavorable, dossier refusé. */
const PASS_1 = dossier(
    'inq_1',
    'lea@example.org',
    'refuse',
    '2026-01-10T09:00:00.000Z',
    { pipeline: 'formation', discovery_verdict: 'defavorable' }
);

/** Second passage : la même personne re-postule. */
const PASS_2 = dossier('inq_2', 'Lea@Example.org ', 'recue', '2026-06-01T09:00:00.000Z', {
    pipeline: 'formation',
});

/** Un tournage, autre projet, autre personne. */
const PRODUCTION = dossier('inq_3', 'prod@studio.fr', 'conclu', '2026-02-01T09:00:00.000Z', {
    pipeline: 'production',
});

const ALL = [PASS_1, PASS_2, PRODUCTION];

describe('normalizeApplicantEmail', () => {
    it('nettoie espaces et casse, sans ajouter de domaine', () => {
        expect(normalizeApplicantEmail('  Lea@Example.org ')).toBe('lea@example.org');
        expect(normalizeApplicantEmail('lea')).toBe('lea');
        expect(normalizeApplicantEmail(null)).toBe('');
    });
});

describe('groupByApplicant', () => {
    it('regroupe les passages d’une même personne', () => {
        const groups = groupByApplicant(ALL);
        expect(groups.get('lea@example.org')).toHaveLength(2);
        expect(groups.get('prod@studio.fr')).toHaveLength(1);
    });

    it('ignore une adresse vide', () => {
        expect(groupByApplicant([{ email: '  ' }]).size).toBe(0);
    });
});

describe('previousDossiers', () => {
    it('retourne les passages antérieurs, du plus récent au plus ancien', () => {
        const previous = previousDossiers(ALL, 'inq_2');
        expect(previous.map((d) => d.id)).toEqual(['inq_1']);
    });

    it('ne mélange pas les personnes ni les projets', () => {
        expect(previousDossiers(ALL, 'inq_3')).toEqual([]);
    });

    it('tolère un identifiant inconnu', () => {
        expect(previousDossiers(ALL, 'inq_absent')).toEqual([]);
    });
});

describe('buildApplicantHistory', () => {
    const history = buildApplicantHistory('lea@example.org', ALL);

    it('compte les candidatures de la personne', () => {
        expect(history.applications).toBe(2);
        expect(isReturningApplicant(history)).toBe(true);
        expect(history.firstAt).toBe('2026-01-10T09:00:00.000Z');
        expect(history.lastAt).toBe('2026-06-01T09:00:00.000Z');
    });

    it('conserve la décision déjà rendue', () => {
        expect(hasPreviousDecisions(history)).toBe(true);
        expect(history.decisions).toHaveLength(1);
        expect(history.decisions[0]).toMatchObject({
            dossierId: 'inq_1',
            pipeline: 'formation',
            stage: 'refuse',
            label: 'Non retenu',
            negative: true,
        });
    });

    it('mémorise la Découverte non retenue pour l’avenir', () => {
        expect(history.discoveryVerdict).toBe('defavorable');
        expect(history.discoveryNotRetained).toBe(true);
        expect(history.longProgramAdmitted).toBe(false);
    });

    it('reconnaît une admission au cursus long', () => {
        const admitted = buildApplicantHistory('ok@example.org', [
            dossier('inq_ok', 'ok@example.org', 'admis', '2026-03-01T09:00:00.000Z', {
                pipeline: 'formation',
                discovery_verdict: 'favorable',
            }),
        ]);
        expect(admitted.longProgramAdmitted).toBe(true);
        expect(admitted.discoveryNotRetained).toBe(false);
        expect(admitted.discoveryVerdict).toBe('favorable');
    });

    it('n’affirme pas « Découverte non retenue » sans Découverte connue', () => {
        const refusedOnly = buildApplicantHistory('court@example.org', [
            dossier('inq_c', 'court@example.org', 'refuse', '2026-03-01T09:00:00.000Z', {
                pipeline: 'formation',
            }),
        ]);
        expect(refusedOnly.decisions[0].negative).toBe(true);
        expect(refusedOnly.discoveryNotRetained).toBe(false);
    });

    it('rend un historique vide pour une personne inconnue', () => {
        const empty = buildApplicantHistory('personne@nulle.part', ALL);
        expect(empty.applications).toBe(0);
        expect(empty.decisions).toEqual([]);
        expect(isReturningApplicant(empty)).toBe(false);
    });
});
