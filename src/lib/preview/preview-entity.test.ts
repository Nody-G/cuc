import {
    entityRef,
    isEntityRef,
    parseEntityRef,
} from './entity-ref';
import { cucEntity } from './cuc-entity';
import {
    isPreviewMessage,
    parsePreviewMessage,
    previewMessage,
    CUC_ENTITY_ATTRIBUTE,
} from './preview-protocol';
import {
    clearPreviewEntities,
    getPreviewEntities,
    isPreviewActive,
    setPreviewEntities,
    subscribePreviewEntities,
} from './preview-store';

const REF = 'site_announcements:12:title';

describe('entityRef / parseEntityRef', () => {
    it('construit et décompose une référence canonique', () => {
        expect(entityRef('site_announcements', '12', 'title')).toBe(REF);
        expect(parseEntityRef(REF)).toEqual({
            table: 'site_announcements',
            id: '12',
            field: 'title',
        });
    });

    it('refuse tout ce qui n’est pas `table:id:champ`', () => {
        expect(entityRef('', '12', 'title')).toBeNull();
        expect(entityRef('site announcements', '12', 'title')).toBeNull();
        expect(isEntityRef('site_announcements:12')).toBe(false);
        expect(isEntityRef('site_announcements:12:title:extra')).toBe(false);
        expect(isEntityRef('site_announcements:12:ti tle')).toBe(false);
        expect(parseEntityRef('nope')).toBeNull();
    });
});

describe('cucEntity', () => {
    it('pose l’attribut d’entité pour une référence valide', () => {
        expect(cucEntity('site_announcements', '12', 'title')).toEqual({
            [CUC_ENTITY_ATTRIBUTE]: REF,
        });
    });

    it('ne pose rien sans identité exploitable', () => {
        expect(cucEntity('site_announcements', '', 'title')).toEqual({});
        expect(cucEntity(null, '12', 'title')).toEqual({});
        expect(cucEntity('site_announcements', '12', '')).toEqual({});
    });
});

describe('protocole — canal d’entité', () => {
    it('accepte un brouillon d’entités (`entity-draft`)', () => {
        const message = previewMessage.entityDraft({ [REF]: 'Journée portes ouvertes' });
        expect(message.type).toBe('entity-draft');
        expect(isPreviewMessage(message)).toBe(true);
        expect(parsePreviewMessage(message)).toEqual(message);
    });

    it('accepte un commit d’entité référencé `table:id:champ`', () => {
        const message = previewMessage.fieldCommit(REF, 'Nouveau titre', 'entity');
        expect(parsePreviewMessage(message)).toEqual(message);
    });

    it('refuse un commit d’entité dont la référence est libre', () => {
        const invalid = {
            channel: 'cuc-preview',
            v: 2,
            type: 'field-commit',
            field: 'hero.title',
            value: 'x',
            source: 'entity',
        };
        expect(isPreviewMessage(invalid)).toBe(false);
        expect(parsePreviewMessage(invalid)).toBeNull();
    });
});

describe('store — surcharges d’entités', () => {
    it('publie, notifie et efface les surcharges', () => {
        const seen: Array<Record<string, string>> = [];
        const unsubscribe = subscribePreviewEntities((overrides) => seen.push(overrides));

        setPreviewEntities({ [REF]: 'Titre' });
        expect(getPreviewEntities()).toEqual({ [REF]: 'Titre' });
        expect(isPreviewActive()).toBe(true);

        clearPreviewEntities();
        expect(getPreviewEntities()).toEqual({});
        expect(seen.at(-1)).toEqual({});

        unsubscribe();
    });
});
