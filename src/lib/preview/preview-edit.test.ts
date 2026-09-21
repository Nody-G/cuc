import {
    clearPreviewSelection,
    getPreviewEditState,
    isInlineEditableKind,
    resolveOverlaySelection,
    selectPreviewField,
    setPreviewEditMode,
    subscribePreviewEdit,
} from './preview-edit';

/**
 * Garde-fous de l'état d'édition en place.
 *
 * Ce qui est verrouillé :
 *   1. le mode par défaut est l'inspection (aucune édition fantôme) ;
 *   2. repasser en inspection ferme la sélection ;
 *   3. seules les natures texte ouvrent une saisie en place ;
 *   4. les notifications ne partent que sur un changement réel.
 */
describe('preview-edit — état du Mode Studio', () => {
    beforeEach(() => {
        setPreviewEditMode('inspect');
        clearPreviewSelection();
    });

    it('démarre en inspection, sans sélection', () => {
        expect(getPreviewEditState()).toEqual({ mode: 'inspect', selection: null });
    });

    it('publie la sélection de champ en mode édition', () => {
        const element = document.createElement('h2');
        element.textContent = 'Titre';
        setPreviewEditMode('edit');

        selectPreviewField({ field: 'sections_data.about.title', kind: 'text', element });

        const state = getPreviewEditState();
        expect(state.mode).toBe('edit');
        expect(state.selection?.field).toBe('sections_data.about.title');
        expect(state.selection?.element).toBe(element);
    });

    it('le retour en inspection ferme la sélection', () => {
        const element = document.createElement('span');
        setPreviewEditMode('edit');
        selectPreviewField({ field: 'hero.title', kind: 'text', element });

        setPreviewEditMode('inspect');

        expect(getPreviewEditState()).toEqual({ mode: 'inspect', selection: null });
    });

    it('n’émet rien sur une transition sans changement', () => {
        const listener = vi.fn();
        const unsubscribe = subscribePreviewEdit(listener);

        // Déjà en inspection : aucune notification.
        setPreviewEditMode('inspect');
        expect(listener).not.toHaveBeenCalled();

        // Aucune sélection à effacer : aucune notification.
        clearPreviewSelection();
        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });

    it('notifie à la sélection puis à la fermeture, et se désabonne', () => {
        const listener = vi.fn();
        const unsubscribe = subscribePreviewEdit(listener);
        const element = document.createElement('p');
        setPreviewEditMode('edit');

        selectPreviewField({ field: 'sections_data.about.description', kind: 'textarea', element });
        clearPreviewSelection();

        expect(listener).toHaveBeenCalledTimes(3); // mode + sélection + fermeture
        expect(listener.mock.calls[1][0].selection.field).toBe(
            'sections_data.about.description'
        );
        expect(listener.mock.calls[2][0].selection).toBeNull();

        unsubscribe();
        setPreviewEditMode('inspect');
        expect(listener).toHaveBeenCalledTimes(3);
    });
});

describe('preview-edit — sélection éditable', () => {
    it('n’ouvre la saisie en place que pour les natures texte', () => {
        expect(isInlineEditableKind('text')).toBe(true);
        expect(isInlineEditableKind('textarea')).toBe(true);
        expect(isInlineEditableKind('link')).toBe(true);
        expect(isInlineEditableKind('image')).toBe(false);
        expect(isInlineEditableKind('list-item')).toBe(false);
    });

    it('résout la sélection effective selon le mode et la nature', () => {
        const element = document.createElement('div');
        const selection = { field: 'hero.title', kind: 'text' as const, element };

        expect(
            resolveOverlaySelection({ mode: 'inspect', selection })
        ).toBeNull();
        expect(
            resolveOverlaySelection({ mode: 'edit', selection: null })
        ).toBeNull();
        expect(
            resolveOverlaySelection({ mode: 'edit', selection })
        ).toBe(selection);
        expect(
            resolveOverlaySelection({
                mode: 'edit',
                selection: { field: 'hero.image', kind: 'image', element },
            })
        ).toBeNull();
    });
});
