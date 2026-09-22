import { CUC_FIELD_ATTRIBUTE, CUC_KIND_ATTRIBUTE } from './preview-protocol';
import { cucField, findItemIndex, itemPath } from './cuc-field';

/**
 * Garde-fous des attributs de champ (Mode Studio).
 *
 * Un champ fantôme — attribut posé alors que le chemin n'existe pas — écrirait
 * une valeur hors du brouillon, ou celle d'un autre item. On verrouille donc :
 *   1. aucun attribut sans chemin valide ;
 *   2. nature par défaut `text`, nature explicite respectée ;
 *   3. chemins d'items indexés, jamais négatifs ;
 *   4. recherche d'item par identifiant (`-1` si absent).
 */
describe('cucField', () => {
    it('pose les attributs pour un chemin valide', () => {
        expect(cucField('sections_data.formules.title')).toEqual({
            [CUC_FIELD_ATTRIBUTE]: 'sections_data.formules.title',
            [CUC_KIND_ATTRIBUTE]: 'text',
        });
    });

    it('respecte la nature demandée', () => {
        expect(cucField('hero.subtitle', 'textarea')[CUC_KIND_ATTRIBUTE]).toBe('textarea');
        expect(cucField('hero.image', 'image')[CUC_KIND_ATTRIBUTE]).toBe('image');
    });

    it('ne pose aucun attribut sans chemin valide', () => {
        expect(cucField(null)).toEqual({});
        expect(cucField(undefined)).toEqual({});
        expect(cucField('   ')).toEqual({});
        expect(cucField(itemPath('formules', -1, 'title'))).toEqual({});
    });

    it('tolère les espaces autour du chemin', () => {
        expect(cucField('  hero.title  ')[CUC_FIELD_ATTRIBUTE]).toBe('hero.title');
    });
});

describe('itemPath', () => {
    it('construit un chemin d’item indexé', () => {
        expect(itemPath('formules', 0, 'title')).toBe('sections_data.formules.items.0.title');
        expect(itemPath('formules', 1, 'cta_text')).toBe(
            'sections_data.formules.items.1.cta_text'
        );
    });

    it('refuse un index invalide', () => {
        expect(itemPath('formules', -1, 'title')).toBeNull();
        expect(itemPath('formules', 1.5, 'title')).toBeNull();
        expect(itemPath('', 0, 'title')).toBeNull();
    });
});

describe('findItemIndex', () => {
    const items = [{ id: 'decouverte' }, { id: 'pro_longue_duree' }];

    it('retrouve un item par identifiant', () => {
        expect(findItemIndex(items, 'pro_longue_duree')).toBe(1);
        expect(findItemIndex(items, 'inconnu')).toBe(-1);
        expect(findItemIndex(undefined, 'decouverte')).toBe(-1);
    });
});
