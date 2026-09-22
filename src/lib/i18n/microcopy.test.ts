import {
    applyMicrocopyOverlay,
    buildMicrocopyEntries,
    flattenMessages,
    groupMicrocopyEntries,
    pickMicrocopyValues,
    sanitizeMicrocopyOverlay,
    sanitizeMicrocopyValues,
} from './microcopy';

const CATALOG = {
    home: {
        about: { title: 'À propos', tag: 'Campus' },
        hero: { since: 'depuis' },
    },
    teamProduction: {
        galleries: { studioBadge: 'LE STUDIO' },
        // Tableau : hors périmètre, il ne doit jamais produire de clé.
        pillars: [{ title: 'Ignoré' }],
    },
};

describe('flattenMessages', () => {
    it('aplatit les objets en chemins pointés', () => {
        const flat = flattenMessages(CATALOG);
        expect(flat['home.about.title']).toBe('À propos');
        expect(flat['teamProduction.galleries.studioBadge']).toBe('LE STUDIO');
    });

    it('ignore les tableaux (une liste n’est pas un micro-texte)', () => {
        const flat = flattenMessages(CATALOG);
        expect(Object.keys(flat).some((key) => key.includes('pillars'))).toBe(false);
    });

    it('tolère une entrée non objet', () => {
        expect(flattenMessages(null)).toEqual({});
        expect(flattenMessages('texte')).toEqual({});
    });
});

describe('applyMicrocopyOverlay', () => {
    it('surcharge une valeur sans muter la source', () => {
        const merged = applyMicrocopyOverlay(CATALOG, { 'home.about.title': 'Qui sommes-nous' });
        expect(merged.home.about.title).toBe('Qui sommes-nous');
        expect(CATALOG.home.about.title).toBe('À propos');
    });

    it('n’écrit jamais une valeur vide ou blanche', () => {
        const merged = applyMicrocopyOverlay(CATALOG, {
            'home.about.title': '   ',
            'home.about.tag': '',
        });
        expect(merged.home.about.title).toBe('À propos');
        expect(merged.home.about.tag).toBe('Campus');
    });

    it('n’invente pas de clé sur une racine existante et reste inerte à vide', () => {
        const merged = applyMicrocopyOverlay(CATALOG, {});
        expect(merged).toBe(CATALOG);
        const untouched = applyMicrocopyOverlay(CATALOG, null);
        expect(untouched).toBe(CATALOG);
    });

    it('remplace une valeur existante dans un namespace profond', () => {
        const merged = applyMicrocopyOverlay(CATALOG, {
            'teamProduction.galleries.studioBadge': 'LE PLATEAU',
        });
        expect(merged.teamProduction.galleries.studioBadge).toBe('LE PLATEAU');
        expect(merged.teamProduction.pillars).toEqual(CATALOG.teamProduction.pillars);
    });
});

describe('sanitizeMicrocopyValues', () => {
    it('retient les chaînes non vides et rejette le reste', () => {
        expect(
            sanitizeMicrocopyValues({
                'home.about.title': '  Titre  ',
                'home.about.tag': '   ',
                'home.about.vide': '',
                'clé invalide!': 'x',
                'home.about.nombre': 42,
            })
        ).toEqual({ 'home.about.title': 'Titre' });
    });
});

describe('sanitizeMicrocopyOverlay', () => {
    it('ne conserve que les locales connues et non vides', () => {
        const overlay = sanitizeMicrocopyOverlay({
            fr: { 'home.about.title': 'Titre FR' },
            en: { 'home.about.title': '   ' },
            de: { 'home.about.title': 'Titel' },
        });
        expect(overlay).toEqual({ fr: { 'home.about.title': 'Titre FR' } });
    });

    it('reste inerte sur une entrée invalide', () => {
        expect(sanitizeMicrocopyOverlay(null)).toEqual({});
        expect(sanitizeMicrocopyOverlay('texte')).toEqual({});
    });
});

describe('pickMicrocopyValues', () => {
    it('sert la locale demandée après nettoyage', () => {
        const overlay = { fr: { 'home.about.title': 'Titre' } };
        expect(pickMicrocopyValues(overlay, 'fr')).toEqual({ 'home.about.title': 'Titre' });
        expect(pickMicrocopyValues(overlay, 'en')).toEqual({});
        expect(pickMicrocopyValues(overlay, 'de')).toEqual({});
    });

    it('filtre les valeurs vides au passage', () => {
        expect(pickMicrocopyValues({ fr: { 'home.about.title': '  ' } }, 'fr')).toEqual({});
    });
});

describe('buildMicrocopyEntries', () => {
    it('aligne le français et l’anglais par clé, jamais par index', () => {
        const entries = buildMicrocopyEntries(CATALOG, {
            home: { about: { title: 'About' } },
        });
        const title = entries.find((entry) => entry.key === 'home.about.title');
        expect(title).toEqual({
            key: 'home.about.title',
            group: 'home',
            fr: 'À propos',
            en: 'About',
        });
    });

    it('retombe sur le français quand l’anglais manque', () => {
        const entries = buildMicrocopyEntries(CATALOG, {});
        expect(entries.every((entry) => entry.en === entry.fr)).toBe(true);
    });
});

describe('groupMicrocopyEntries', () => {
    it('regroupe par namespace et trie par volume', () => {
        const groups = groupMicrocopyEntries(buildMicrocopyEntries(CATALOG, {}));
        expect(groups[0].group).toBe('home');
        expect(groups.map((group) => group.group).sort()).toEqual(['home', 'teamProduction']);
        expect(groups.flatMap((group) => group.entries)).toHaveLength(4);
    });
});
