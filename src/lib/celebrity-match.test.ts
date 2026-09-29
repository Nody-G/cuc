/**
 * Tests de la résolution inverse « nom publié → fiche du catalogue ».
 *
 * Le contrat est volontairement strict : seul un nom identique après
 * normalisation ouvre un lien. « Adil », « Liu », « Policier En Civil » ne
 * doivent produire AUCUN lien plutôt qu'un lien faux.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt (cf. `src/lib/celebrity-double.test.ts`).
 */
import type { DoubledCelebrity } from '@/types';
import { DOUBLED_CELEBRITIES } from '@/data/celebrities';
import {
    buildCelebrityIndex,
    CELEBRITY_SPELLING_FIXES,
    celebrityNameKey,
    NON_ACTOR_DOUBLED_ENTRIES,
    publishedActorNames,
    resolveCelebrityByActorName,
    uniqueActorNames,
} from './celebrity-match';

function celebrity(id: string, name: string): DoubledCelebrity {
    return {
        id,
        name,
        photo: `/images/actors/${id}.png`,
        productions: [],
        stuntSpecialty: '',
        stuntDoubles: '',
        imdbUrl: '',
    };
}

const CATALOGUE: DoubledCelebrity[] = [
    celebrity('aamir-khan', 'Aamir Khan'),
    celebrity('keanu-reeves', 'Keanu Reeves'),
    celebrity('benjamin-de-la-fere', 'Gabriel Almaer (Benjamin de la Fère)'),
    celebrity('jean-hugues-anglade', 'Jean-hugues Anglade'),
];

describe('celebrityNameKey', () => {
    it('neutralise accents, casse et ponctuation', () => {
        expect(celebrityNameKey('Benjamin De LA Fère')).toBe(
            celebrityNameKey('benjamin de la fere')
        );
        expect(celebrityNameKey('Jean-hugues Anglade')).toBe(
            celebrityNameKey('Jean Hugues  Anglade')
        );
    });

    it('retourne une clé vide pour un nom vide', () => {
        expect(celebrityNameKey('')).toBe('');
        expect(celebrityNameKey('   ')).toBe('');
    });
});

describe('resolveCelebrityByActorName', () => {
    const index = buildCelebrityIndex(CATALOGUE);

    it('résout un nom exact du catalogue', () => {
        expect(resolveCelebrityByActorName('Keanu Reeves', index)?.id).toBe('keanu-reeves');
    });

    it('résout malgré la casse, les accents et la ponctuation', () => {
        expect(resolveCelebrityByActorName('keanu  reeves', index)?.id).toBe('keanu-reeves');
        expect(resolveCelebrityByActorName('Jean-Hugues Anglade', index)?.id).toBe(
            'jean-hugues-anglade'
        );
    });

    it('résout un alias déclaré entre parenthèses dans le catalogue', () => {
        expect(resolveCelebrityByActorName('Benjamin De LA Fère', index)?.id).toBe(
            'benjamin-de-la-fere'
        );
        expect(resolveCelebrityByActorName('Gabriel Almaer', index)?.id).toBe(
            'benjamin-de-la-fere'
        );
    });

    it('ne fabrique aucun lien : nom absent, rôle ou prénom seul', () => {
        expect(resolveCelebrityByActorName('Adil', index)).toBeNull();
        expect(resolveCelebrityByActorName('Policier En Civil', index)).toBeNull();
        expect(resolveCelebrityByActorName('Ezio Burntwood', index)).toBeNull();
    });

    it('applique une correction vérifiée : la coquille pointe vers sa fiche', () => {
        // L'index doit contenir la fiche visée : on l'indexe depuis le catalogue réel.
        const realIndex = buildCelebrityIndex(DOUBLED_CELEBRITIES);
        expect(resolveCelebrityByActorName('Aahmir Khan', realIndex)?.name).toBe('Aamir Khan');
    });

    it('ignore une correction dont la fiche est absente du catalogue', () => {
        // `index` est bâti sur un catalogue de test qui ne contient pas la fiche
        // visée : aucune cible n'est fabriquée, donc aucun lien.
        expect(resolveCelebrityByActorName('Aahmir Khan', index)).toBeNull();
    });
});

describe('CELEBRITY_SPELLING_FIXES', () => {
    it('ne corrige que vers une fiche réellement présente au catalogue', () => {
        const ids = new Set(DOUBLED_CELEBRITIES.map((celebrity) => celebrity.id));
        for (const fix of CELEBRITY_SPELLING_FIXES) {
            expect(ids.has(fix.catalogueId), `fiche absente : ${fix.catalogueId}`).toBe(true);
            expect(fix.source.length, `preuve manquante pour ${fix.published}`).toBeGreaterThan(10);
        }
    });

    it('ne masque jamais un nom déjà publié au catalogue', () => {
        const taken = new Set(
            DOUBLED_CELEBRITIES.flatMap((celebrity) => [
                celebrityNameKey(celebrity.name),
                celebrityNameKey(celebrity.name.replace(/\([^)]*\)/g, ' ')),
            ])
        );
        for (const fix of CELEBRITY_SPELLING_FIXES) {
            expect(taken.has(celebrityNameKey(fix.published))).toBe(false);
        }
    });

    it('cible une fiche dont le nom diffère bien de la forme publiée', () => {
        const byId = new Map(DOUBLED_CELEBRITIES.map((celebrity) => [celebrity.id, celebrity]));
        for (const fix of CELEBRITY_SPELLING_FIXES) {
            expect(celebrityNameKey(byId.get(fix.catalogueId)?.name ?? '')).not.toBe(
                celebrityNameKey(fix.published)
            );
        }
    });
});

describe('NON_ACTOR_DOUBLED_ENTRIES', () => {
    it('n’exclut jamais une entrée qui possède une fiche au catalogue', () => {
        const index = buildCelebrityIndex(DOUBLED_CELEBRITIES);
        for (const entry of NON_ACTOR_DOUBLED_ENTRIES) {
            expect(
                resolveCelebrityByActorName(entry, index),
                `« ${entry} » possède une fiche : il ne doit pas être exclu`
            ).toBeNull();
        }
    });
});

describe('publishedActorNames', () => {
    it('écarte les personnages et fusionne les doublons, ordre conservé', () => {
        expect(
            publishedActorNames([
                'Adil',
                'Keanu Reeves',
                'Keanu  Reeves',
                'Policier En Civil',
                'Mister V',
            ])
        ).toEqual(['Keanu Reeves', 'Mister V']);
    });

    it('conserve un alias déclaré au catalogue', () => {
        expect(publishedActorNames(['Benjamin De LA Fère'])).toEqual(['Benjamin De LA Fère']);
    });
});

describe('uniqueActorNames', () => {
    it('fusionne les doublons de casse, d’accents ou de ponctuation', () => {
        expect(uniqueActorNames(['Benjamin De LA Fere', 'Benjamin De LA Fère'])).toEqual([
            'Benjamin De LA Fere',
        ]);
    });

    it('conserve l’ordre et ignore les entrées vides', () => {
        expect(uniqueActorNames(['Keanu Reeves', '  ', 'Keanu  Reeves', 'Tomer Sisley'])).toEqual([
            'Keanu Reeves',
            'Tomer Sisley',
        ]);
    });
});
