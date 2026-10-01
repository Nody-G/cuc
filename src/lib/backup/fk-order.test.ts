import { computeDeleteOrder, orderByDependencies } from './fk-order';

describe('backup/fk-order — ordre de restauration', () => {
    it('place le parent avant ses enfants sur le graphe réel du dépôt', () => {
        const { order, cycles } = orderByDependencies([
            'site_inquiries',
            'site_sessions',
            'site_programs',
        ]);

        expect(order).toEqual(['site_programs', 'site_sessions', 'site_inquiries']);
        expect(cycles).toEqual([]);
    });

    it('reste stable : l’ordre d’entrée ne change pas le résultat', () => {
        const forward = orderByDependencies(['site_programs', 'site_sessions', 'site_inquiries']);
        const backward = orderByDependencies(['site_inquiries', 'site_sessions', 'site_programs']);

        expect(backward.order).toEqual(forward.order);
        expect(orderByDependencies([...forward.order]).order).toEqual(forward.order);
    });

    it('ignore une dépendance dont le parent n’est pas dans le lot demandé', () => {
        expect(orderByDependencies(['site_sessions']).order).toEqual(['site_sessions']);
    });

    it('retourne un cycle comme donnée, sans lever d’exception', () => {
        const cyclicGraph = {
            site_a: ['site_b'],
            site_b: ['site_a'],
        };

        const result = orderByDependencies(['site_a', 'site_b'], cyclicGraph);
        expect(result.order).toEqual([]);
        expect(result.cycles).toEqual([['site_a', 'site_b']]);
    });

    it('calcule l’ordre de suppression comme l’inverse exact (enfants d’abord)', () => {
        expect(computeDeleteOrder(['site_programs', 'site_sessions'])).toEqual([
            'site_sessions',
            'site_programs',
        ]);
    });
});
