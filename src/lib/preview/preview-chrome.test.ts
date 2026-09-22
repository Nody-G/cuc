import {
    parsePreviewMessage,
    previewMessage,
} from './preview-protocol';
import {
    clearPreviewSettings,
    getPreviewSettings,
    setPreviewSettings,
    subscribePreviewSettings,
} from './preview-store';
import { resolveFieldElement, resolveFieldTarget } from './field-hit';
import { collectEditableFields } from './field-navigation';

/**
 * Chrome éditable dans l'aperçu : le même canal que le contenu de page porte
 * désormais les réglages du site (`data-cuc-setting`), avec une source
 * explicite dans le commit pour que le Cockpit écrive au bon endroit.
 */
describe('protocole — chrome éditable', () => {
    it('fait l’aller-retour d’un brouillon de réglages', () => {
        const message = previewMessage.settingsDraft({ hero_primary_cta_text: 'Nous écrire' });
        const parsed = parsePreviewMessage(JSON.parse(JSON.stringify(message)));
        expect(parsed?.type).toBe('settings-draft');
        if (parsed?.type === 'settings-draft') {
            expect(parsed.payload.hero_primary_cta_text).toBe('Nous écrire');
        }
    });

    it('refuse un brouillon de réglages non textuel', () => {
        expect(
            parsePreviewMessage({
                channel: 'cuc-preview',
                v: 2,
                type: 'settings-draft',
                payload: { hero_primary_cta_text: 42 },
            })
        ).toBeNull();
    });

    it('porte la source dans le commit (réglage) et reste compatible sans source', () => {
        const settingCommit = previewMessage.fieldCommit(
            'hero_primary_cta_text',
            'Devis',
            'setting'
        );
        const parsed = parsePreviewMessage(JSON.parse(JSON.stringify(settingCommit)));
        expect(parsed?.type).toBe('field-commit');
        if (parsed?.type === 'field-commit') {
            expect(parsed.source).toBe('setting');
        }

        const legacy = previewMessage.fieldCommit('hero.title', 'Titre');
        expect('source' in legacy).toBe(false);
        expect(parsePreviewMessage(JSON.parse(JSON.stringify(legacy)))).not.toBeNull();
    });

    it('refuse une source inconnue', () => {
        expect(
            parsePreviewMessage({
                channel: 'cuc-preview',
                v: 2,
                type: 'field-commit',
                field: 'hero.title',
                value: 'Titre',
                source: 'inconnu',
            })
        ).toBeNull();
    });
});

describe('store — surcharges de réglages', () => {
    afterEach(() => {
        clearPreviewSettings();
    });

    it('publie les surcharges aux abonnés et les efface proprement', () => {
        const seen: Record<string, string>[] = [];
        const unsubscribe = subscribePreviewSettings((overrides) => seen.push(overrides));

        setPreviewSettings({ hero_primary_cta_text: 'Contact' });
        expect(getPreviewSettings().hero_primary_cta_text).toBe('Contact');

        clearPreviewSettings();
        expect(getPreviewSettings()).toEqual({});

        unsubscribe();
        setPreviewSettings({ autre: 'valeur' });
        expect(seen.map((entry) => Object.keys(entry).join(','))).toEqual([
            'hero_primary_cta_text',
            '',
        ]);
    });
});

describe('champs de réglage — résolution et navigation', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    function mount(html: string): HTMLElement {
        document.body.innerHTML = html;
        return document.body.firstElementChild as HTMLElement;
    }

    it('résout la source « setting » d’un texte de réglage', () => {
        const root = mount(
            '<span data-cuc-setting="hero_primary_cta_text">Contact & Projets</span>'
        );
        const target = resolveFieldTarget(root);
        expect(target).toEqual({
            field: 'hero_primary_cta_text',
            source: 'setting',
            attribute: 'data-cuc-setting',
        });
        expect(resolveFieldElement(root)).toBe(root);
    });

    it('couvre toute la surface du contrôle qui porte le réglage', () => {
        const root = mount(
            '<button><svg><path /></svg><span data-cuc-setting="hero_primary_cta_text">CTA</span></button>'
        );
        expect(resolveFieldElement(root.querySelector('svg'))).toBe(
            root.querySelector('[data-cuc-setting]')
        );
    });

    it('inclut les réglages dans la séquence de tabulation, avec leur source', () => {
        const root = mount(
            '<div>' +
            '<span data-cuc-field="hero.title">Titre</span>' +
            '<button><span data-cuc-setting="hero_primary_cta_text">CTA</span></button>' +
            '</div>'
        );
        // Boîtes non nulles : jsdom ne calcule pas de mise en page.
        root.querySelectorAll<HTMLElement>('[data-cuc-field], [data-cuc-setting]').forEach(
            (element) => {
                element.getBoundingClientRect = () =>
                    ({ width: 100, height: 20, top: 0, left: 0 }) as DOMRect;
            }
        );

        const fields = collectEditableFields(root);
        expect(fields.map((field) => field.path)).toEqual([
            'hero.title',
            'hero_primary_cta_text',
        ]);
        expect(fields[0].source).toBeUndefined();
        expect(fields[1].source).toBe('setting');
    });
});
