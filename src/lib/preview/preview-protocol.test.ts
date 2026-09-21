import {
    CUC_FIELD_KINDS,
    hasCommitChanged,
    isPreviewMessage,
    isSameOrigin,
    parsePreviewMessage,
    PREVIEW_CHANNEL,
    PREVIEW_PROTOCOL_VERSION,
    previewMessage,
    resolveFieldKind,
} from './preview-protocol';
import type { SitePageContent } from '@/lib/data/site-service';

/**
 * Garde-fou du protocole Cockpit ↔ Aperçu (Mode Studio).
 *
 * Ce qui est verrouillé ici :
 *   1. tous les messages v2 sont estampillés du canal et de la version ;
 *   2. la forme héritée (sans `v`), encore émise par un bundle de vitrine en
 *      cache, est normalisée — jamais rejetée en panne ;
 *   3. tout message invalide ou d'une version future est ignoré silencieusement
 *      (le pont reste un confort, jamais une dépendance dure) ;
 *   4. la sélection de widget (`resolveFieldKind`) et la règle « pas de commit
 *      sur valeur inchangée » sont verrouillées.
 */

const DRAFT = { slug: '/', title: 'Accueil' } as unknown as SitePageContent;

describe('protocole v2 — fabriques', () => {
    it('estampille chaque message du canal et de la version courante', () => {
        const messages = [
            previewMessage.ready(),
            previewMessage.mode('edit'),
            previewMessage.draft(DRAFT),
            previewMessage.fieldHover('hero.title'),
            previewMessage.fieldHover(null),
            previewMessage.fieldSelect('hero.title'),
            previewMessage.fieldCommit('hero.title', 'Titre'),
            previewMessage.listCommand('sections_data.faq.items', 'move-up', 2),
            previewMessage.mediaRequest('sections_data.about.image'),
            previewMessage.mediaCommit('sections_data.about.image', 'https://cdn.test/a.jpg'),
        ];

        for (const message of messages) {
            expect(message.channel).toBe(PREVIEW_CHANNEL);
            expect(message.v).toBe(PREVIEW_PROTOCOL_VERSION);
        }
    });

    it('fait l’aller-retour sans perte, sauts de ligne inclus', () => {
        const message = previewMessage.fieldCommit(
            'sections_data.about.description',
            'Ligne 1\nLigne 2'
        );
        expect(parsePreviewMessage(message)).toEqual(message);
    });
});

describe('parsePreviewMessage — v2 strict', () => {
    it('accepte les messages valides', () => {
        expect(parsePreviewMessage(previewMessage.mode('inspect'))).toEqual(
            previewMessage.mode('inspect')
        );
        expect(parsePreviewMessage(previewMessage.fieldSelect('hero.title'))).toEqual(
            previewMessage.fieldSelect('hero.title')
        );
        expect(parsePreviewMessage(previewMessage.listCommand('liste', 'add', 0))).toEqual(
            previewMessage.listCommand('liste', 'add', 0)
        );
    });

    it('ignore tout message invalide, inconnu ou d’une version future', () => {
        const invalid: unknown[] = [
            null,
            undefined,
            42,
            'cuc-preview',
            [],
            {},
            { channel: 'autre-canal', v: 2, type: 'ready' },
            { channel: PREVIEW_CHANNEL, v: 3, type: 'ready' },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'inconnu' },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'field-select' },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'field-select', field: '   ' },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'field-commit', field: 'hero.title', value: 7 },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'mode', payload: 'preview' },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'draft', payload: null },
            {
                channel: PREVIEW_CHANNEL,
                v: 2,
                type: 'list-command',
                field: 'liste',
                command: 'remove-all',
                index: 0,
            },
            {
                channel: PREVIEW_CHANNEL,
                v: 2,
                type: 'list-command',
                field: 'liste',
                command: 'add',
                index: Number.NaN,
            },
            {
                channel: PREVIEW_CHANNEL,
                v: 2,
                type: 'list-command',
                field: 'liste',
                command: 'add',
                index: '2',
            },
            { channel: PREVIEW_CHANNEL, v: 2, type: 'media-commit', field: 'image', url: '  ' },
            { channel: PREVIEW_CHANNEL, type: 'field-focus' },
            { channel: PREVIEW_CHANNEL, type: 'draft' },
        ];

        for (const value of invalid) {
            expect(
                parsePreviewMessage(value),
                `Message accepté à tort : ${JSON.stringify(value) ?? String(value)}`
            ).toBeNull();
        }
    });
});

describe('parsePreviewMessage — tolérance héritée', () => {
    it('normalise `ready` et `draft` hérités', () => {
        expect(parsePreviewMessage({ channel: PREVIEW_CHANNEL, type: 'ready' })).toEqual(
            previewMessage.ready()
        );
        expect(
            parsePreviewMessage({ channel: PREVIEW_CHANNEL, type: 'draft', payload: DRAFT })
        ).toEqual(previewMessage.draft(DRAFT));
    });

    it('normalise `field-focus` hérité en `field-select`', () => {
        expect(
            parsePreviewMessage({ channel: PREVIEW_CHANNEL, type: 'field-focus', field: 'hero.title' })
        ).toEqual(previewMessage.fieldSelect('hero.title'));
    });

    it('normalise `field-hover` hérité, absence comprise', () => {
        expect(
            parsePreviewMessage({ channel: PREVIEW_CHANNEL, type: 'field-hover', field: null })
        ).toEqual(previewMessage.fieldHover(null));
        expect(parsePreviewMessage({ channel: PREVIEW_CHANNEL, type: 'field-hover' })).toEqual(
            previewMessage.fieldHover(null)
        );
        expect(
            parsePreviewMessage({
                channel: PREVIEW_CHANNEL,
                type: 'field-hover',
                field: 'hero.subtitle',
            })
        ).toEqual(previewMessage.fieldHover('hero.subtitle'));
    });

    it('ne confond pas la forme héritée avec un message v2 strict', () => {
        expect(isPreviewMessage({ channel: PREVIEW_CHANNEL, type: 'ready' })).toBe(false);
        expect(isPreviewMessage(previewMessage.ready())).toBe(true);
    });
});

describe('resolveFieldKind', () => {
    it('résout les natures connues et retombe sur `text`', () => {
        expect(CUC_FIELD_KINDS).toEqual(['text', 'textarea', 'image', 'link', 'list-item']);

        for (const kind of CUC_FIELD_KINDS) {
            expect(resolveFieldKind(kind)).toBe(kind);
        }

        expect(resolveFieldKind(null)).toBe('text');
        expect(resolveFieldKind(undefined)).toBe('text');
        expect(resolveFieldKind('TEXT')).toBe('text');
        expect(resolveFieldKind('inline')).toBe('text');
        expect(resolveFieldKind(7)).toBe('text');
    });
});

describe('isSameOrigin', () => {
    it('n’accepte que l’origine exacte, jamais `null` ni une origine vide', () => {
        expect(isSameOrigin('https://cuc.test', 'https://cuc.test')).toBe(true);
        expect(isSameOrigin('http://localhost:3000', 'http://localhost:3000')).toBe(true);
        expect(isSameOrigin('https://autre.test', 'https://cuc.test')).toBe(false);
        expect(isSameOrigin('https://cuc.test', 'http://cuc.test')).toBe(false);
        expect(isSameOrigin('null', 'https://cuc.test')).toBe(false);
        expect(isSameOrigin('', 'https://cuc.test')).toBe(false);
        expect(isSameOrigin('https://cuc.test', '')).toBe(false);
    });
});

describe('hasCommitChanged', () => {
    it('n’émet un commit que sur valeur réellement modifiée', () => {
        expect(hasCommitChanged('', 'a')).toBe(true);
        expect(hasCommitChanged(undefined, 'a')).toBe(true);
        expect(hasCommitChanged(null, '')).toBe(false);
        expect(hasCommitChanged('a', 'a')).toBe(false);
        expect(hasCommitChanged('ligne 1\nligne 2', 'ligne 1\nligne 2')).toBe(false);
    });
});
