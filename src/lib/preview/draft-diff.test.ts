import {
    collectDraftChanges,
    getFieldValue,
    revertDraftField,
    summarizeDraftChanges,
} from './draft-diff';

const INITIAL = {
    title: 'Accueil',
    hero: { title: 'Campus', badge: 'depuis 2008' },
    sections_data: {
        about: { title: 'À propos', pillars: [{ tag: 'A' }, { tag: 'B' }] },
        social: { posts: [{ title: 'Post' }] },
    },
};

describe('getFieldValue', () => {
    it('lit une valeur imbriquée', () => {
        expect(getFieldValue(INITIAL, 'sections_data.about.title')).toBe('À propos');
    });

    it('lit un index de tableau', () => {
        expect(getFieldValue(INITIAL, 'sections_data.about.pillars.1.tag')).toBe('B');
    });

    it('renvoie undefined sur un chemin absent', () => {
        expect(getFieldValue(INITIAL, 'sections_data.about.absent')).toBeUndefined();
        expect(getFieldValue(INITIAL, 'sections_data.about.pillars.9.tag')).toBeUndefined();
        expect(getFieldValue(INITIAL, '')).toBe(INITIAL);
    });
});

describe('collectDraftChanges', () => {
    it('liste un champ modifié avec avant/après', () => {
        const draft = { ...INITIAL, title: 'Page d’accueil' };
        expect(collectDraftChanges(INITIAL, draft)).toEqual([
            { path: 'title', before: 'Accueil', after: 'Page d’accueil' },
        ]);
    });

    it('descend dans les objets, les tableaux et les namespaces', () => {
        const draft = {
            ...INITIAL,
            sections_data: {
                ...INITIAL.sections_data,
                about: { ...INITIAL.sections_data.about, pillars: [{ tag: 'A' }, { tag: 'B2' }] },
            },
        };
        expect(collectDraftChanges(INITIAL, draft)).toEqual([
            { path: 'sections_data.about.pillars.1.tag', before: 'B', after: 'B2' },
        ]);
    });

    it('signale un ajout et une suppression', () => {
        const draft = {
            ...INITIAL,
            hero: { title: 'Campus', badge: 'depuis 2008', meta: 'Nouveau' },
        };
        const changes = collectDraftChanges(INITIAL, draft);
        expect(changes).toEqual([{ path: 'hero.meta', before: undefined, after: 'Nouveau' }]);

        const removed = collectDraftChanges(INITIAL, {
            ...INITIAL,
            hero: { title: 'Campus' },
        });
        expect(removed).toEqual([{ path: 'hero.badge', before: 'depuis 2008', after: undefined }]);
    });

    it('ne signale rien quand le brouillon est identique', () => {
        expect(collectDraftChanges(INITIAL, structuredClone(INITIAL))).toEqual([]);
    });

    it('renvoie une liste triée et stable', () => {
        const draft = { ...INITIAL, title: 'B', hero: { ...INITIAL.hero, badge: 'C' } };
        const paths = collectDraftChanges(INITIAL, draft).map((change) => change.path);
        expect(paths).toEqual([...paths].sort());
    });

    it('respecte la limite demandée', () => {
        const draft = {
            ...INITIAL,
            a: 1,
            b: 2,
            c: 3,
        };
        expect(collectDraftChanges(INITIAL, draft, { maxChanges: 2 })).toHaveLength(2);
    });
});

describe('revertDraftField', () => {
    it('restaure la valeur enregistrée sans muter le brouillon', () => {
        const draft = { ...INITIAL, title: 'Modifié' };
        const reverted = revertDraftField(draft, INITIAL, 'title');
        expect(reverted.title).toBe('Accueil');
        expect(draft.title).toBe('Modifié');
    });

    it('restaure une valeur imbriquée', () => {
        const draft = {
            ...INITIAL,
            sections_data: {
                ...INITIAL.sections_data,
                about: { ...INITIAL.sections_data.about, title: 'Modifié' },
            },
        };
        const reverted = revertDraftField(draft, INITIAL, 'sections_data.about.title');
        expect(getFieldValue(reverted, 'sections_data.about.title')).toBe('À propos');
    });

    it('retire un champ qui n’existait pas au départ (aucun champ fantôme)', () => {
        const draft = { ...INITIAL, hero: { ...INITIAL.hero, meta: 'Nouveau' } };
        const reverted = revertDraftField(draft, INITIAL, 'hero.meta');
        expect('meta' in (reverted.hero as Record<string, unknown>)).toBe(false);
        expect(collectDraftChanges(INITIAL, reverted)).toEqual([]);
    });

    it('laisse un chemin inconnu intact', () => {
        const draft = { ...INITIAL, title: 'Modifié' };
        expect(revertDraftField(draft, INITIAL, '').title).toBe('Modifié');
    });
});

describe('summarizeDraftChanges', () => {
    it('compte ajouts, mises à jour et suppressions', () => {
        expect(
            summarizeDraftChanges([
                { path: 'a', before: undefined, after: 'x' },
                { path: 'b', before: 'x', after: 'y' },
                { path: 'c', before: 'x', after: undefined },
            ])
        ).toEqual({ total: 3, added: 1, updated: 1, removed: 1 });
    });
});
