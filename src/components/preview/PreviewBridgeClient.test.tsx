import { render } from '@testing-library/react';
import { PreviewBridgeClient } from './PreviewBridgeClient';

/**
 * Garde-fou d'inertie du pont d'aperçu.
 *
 * Le pont est monté sur **toutes** les pages publiques : hors iframe du Cockpit
 * (navigation normale), il ne doit strictement rien faire — aucun message,
 * aucun style injecté, aucun attribut de mode. Une régression ici ferait fuir
 * des comportements d'édition dans la vitrine publique.
 */
describe('PreviewBridgeClient — inertie hors iframe', () => {
    it('ne poste aucun message quand la page n’est pas embarquée', () => {
        const postMessage = vi.spyOn(window, 'postMessage');

        // jsdom : `window.parent === window` → la page n'est pas dans une iframe.
        render(<PreviewBridgeClient />);

        expect(postMessage).not.toHaveBeenCalled();
        postMessage.mockRestore();
    });

    it('n’injecte ni style de surlignage ni attribut de mode hors iframe', () => {
        render(<PreviewBridgeClient />);

        expect(document.querySelector('[data-cuc-preview-style]')).toBeNull();
        expect(document.documentElement.hasAttribute('data-cuc-mode')).toBe(false);
    });

    it('ne rend rien dans le DOM', () => {
        const { container } = render(<PreviewBridgeClient />);
        expect(container.firstChild).toBeNull();
    });
});
