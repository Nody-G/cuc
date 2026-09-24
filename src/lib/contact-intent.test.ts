import { withContactIntent } from './contact-intent';

/**
 * Garde-fou : un CTA contextuel ne doit jamais mener à un formulaire vide.
 * L'intention voyage dans `?demande=…`, consommée par `ContactForm`.
 */
describe('withContactIntent', () => {
    it('ajoute l’intention et cale la vue sur le formulaire', () => {
        expect(withContactIntent('/contact-cuc', 'afdas-artistes-interpretes')).toBe(
            '/contact-cuc?demande=afdas-artistes-interpretes#contact-form'
        );
    });

    it('ne touche pas une intention déjà posée par l’éditeur', () => {
        expect(
            withContactIntent('/contact-cuc?demande=cuc-events', 'tournage-production')
        ).toBe('/contact-cuc?demande=cuc-events');
    });

    it('conserve une ancre explicite', () => {
        expect(withContactIntent('/contact-cuc#campus-map-hub', 'cuc-events')).toBe(
            '/contact-cuc?demande=cuc-events#campus-map-hub'
        );
    });

    it('laisse les liens hors contact intacts', () => {
        expect(withContactIntent('/formation-de-cascadeur', 'cuc-events')).toBe(
            '/formation-de-cascadeur'
        );
    });
});
