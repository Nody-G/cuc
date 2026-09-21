import { render } from '@testing-library/react';
import { PreviewEditLayer } from './PreviewEditLayer';
import {
    clearPreviewSelection,
    selectPreviewField,
    setPreviewEditMode,
} from '@/lib/preview/preview-edit';

/**
 * Garde-fou d'inertie de la couche d'édition en place.
 *
 * Hors iframe du Cockpit (navigation publique), la couche ne doit ni rendre de
 * saisie, ni surligner un élément — même si un état d'édition traînait en
 * mémoire. Le Mode Studio ne doit jamais fuiter dans la vitrine.
 */
describe('PreviewEditLayer — inertie hors iframe', () => {
    afterEach(() => {
        setPreviewEditMode('inspect');
        clearPreviewSelection();
    });

    it('ne rend rien hors iframe, même avec une sélection active', () => {
        const { container } = render(<PreviewEditLayer />);
        const element = document.createElement('h2');
        element.textContent = 'Titre';
        document.body.appendChild(element);

        setPreviewEditMode('edit');
        selectPreviewField({ field: 'sections_data.about.title', kind: 'text', element });

        expect(container.firstChild).toBeNull();
        expect(document.querySelector('[data-cuc-edit-overlay]')).toBeNull();
        expect(element.hasAttribute('data-cuc-field-active')).toBe(false);

        element.remove();
    });
});
