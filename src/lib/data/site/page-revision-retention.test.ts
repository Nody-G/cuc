import {
    countPlannedRemovals,
    normalizeKeepPerPage,
    planRevisionRetention,
    type PageRevisionRow,
} from './page-revision-retention';

/**
 * Garde-fou de la rétention de l'historique : ce qui est conservé, ce qui part,
 * et ce qui ne part **jamais**.
 */

function row(
    page_slug: string,
    revision_number: number,
    extra: Partial<PageRevisionRow> = {}
): PageRevisionRow {
    return { id: `${page_slug}-${revision_number}`, page_slug, revision_number, ...extra };
}

describe('normalizeKeepPerPage', () => {
    it('retombe sur la valeur par défaut si la saisie est absurde', () => {
        expect(normalizeKeepPerPage(Number.NaN)).toBe(20);
        expect(normalizeKeepPerPage(2.5)).toBe(20);
        expect(normalizeKeepPerPage(0)).toBe(20);
        expect(normalizeKeepPerPage(-3)).toBe(20);
        expect(normalizeKeepPerPage(10)).toBe(10);
    });
});

describe('planRevisionRetention', () => {
    it('garde les N plus récentes de chaque page, page par page', () => {
        const revisions = [
            ...[1, 2, 3, 4, 5].map((n) => row('/formation', n)),
            ...[1, 2].map((n) => row('/contact', n)),
        ];

        const plan = planRevisionRetention(revisions, 3);
        const formation = plan.find((page) => page.slug === '/formation');
        const contact = plan.find((page) => page.slug === '/contact');

        expect(formation).toMatchObject({ total: 5, kept: 3, removed: 2 });
        expect(formation?.removedIds).toEqual(['/formation-2', '/formation-1']);
        // Une page peu éditée n'est pas touchée par le seuil d'une autre page.
        expect(contact).toMatchObject({ total: 2, kept: 2, removed: 0 });
        expect(contact?.removedIds).toEqual([]);
    });

    it('ne purge jamais une révision étiquetée, même ancienne', () => {
        const revisions = [
            row('/cuc-team-cascadeur', 1, { label: 'Avant refonte de la galerie' }),
            ...[2, 3, 4, 5, 6].map((n) => row('/cuc-team-cascadeur', n)),
        ];

        const plan = planRevisionRetention(revisions, 2);
        const [page] = plan;

        // Conservées : les 2 plus récentes (6, 5) **et** le jalon (1).
        // Purgées : tout ce qui reste entre les deux (4, 3, 2).
        expect(page.removedIds).not.toContain('/cuc-team-cascadeur-1');
        expect(page.removedIds).toEqual([
            '/cuc-team-cascadeur-4',
            '/cuc-team-cascadeur-3',
            '/cuc-team-cascadeur-2',
        ]);
        expect(page.kept).toBe(3);
    });

    it('purge du plus ancien et laisse les plus récentes intactes', () => {
        const revisions = [1, 2, 3, 4].map((n) => row('/', n));

        const plan = planRevisionRetention(revisions, 2);

        expect(plan[0].removedIds).toEqual(['/-2', '/-1']);
        expect(plan[0].newest).toBeNull(); // aucun `created_at` fourni
    });

    it('additionne les octets visés et ignore les tailles absentes', () => {
        const revisions = [
            row('/visite-guidee', 1, { bytes: 4096 }),
            row('/visite-guidee', 2, { bytes: 1024 }),
            row('/visite-guidee', 3),
        ];

        const plan = planRevisionRetention(revisions, 1);

        expect(plan[0].bytes).toBe(0);
        expect(plan[0].removedBytes).toBe(5120);
    });

    it('ne touche à rien quand tout tient dans le seuil', () => {
        const revisions = [1, 2].map((n) => row('/partenaires', n));
        const plan = planRevisionRetention(revisions, 20);

        expect(countPlannedRemovals(plan)).toBe(0);
        expect(plan[0].removedIds).toEqual([]);
    });

    it('trie les pages par volume décroissant', () => {
        const revisions = [
            ...[1, 2].map((n) => row('/petit', n)),
            ...[1, 2, 3, 4, 5].map((n) => row('/gros', n)),
        ];

        const plan = planRevisionRetention(revisions, 1);

        expect(plan.map((page) => page.slug)).toEqual(['/gros', '/petit']);
    });
});
