/**
 * Tests de la fusion de l'overlay EN des événements.
 *
 * Aucun import de `vitest` : `globals: true` est activé (convention du dépôt).
 */
import { applyEventOverlay, applyEventOverlays } from './apply-event-overlay';
import type { SiteEvent } from '@/lib/data/site-service';

const EVENT: SiteEvent = {
    id: 'team-building',
    title: 'Team Building Cascades',
    subtitle: 'Journée sur le campus',
    badge: 'ENTREPRISE',
    description: 'Description française de l’événement.',
    features: ['Initiations', 'Cascades'],
    price_indicator: 'Sur devis',
    cta_text: 'Demander un devis',
    cta_link: '/contact-cuc?demande=cuc-events',
    image_url: '/images/events.jpg',
    order_index: 1,
    is_published: true,
};

describe('applyEventOverlay', () => {
    it('sans overlay, l’événement français reste intact', () => {
        expect(applyEventOverlay(EVENT)).toEqual(EVENT);
        expect(applyEventOverlay(EVENT, null)).toEqual(EVENT);
        expect(applyEventOverlay(EVENT, {})).toEqual(EVENT);
    });

    it('applique les champs traduits présents', () => {
        const result = applyEventOverlay(EVENT, {
            title: 'Corporate Stunt Days',
            description: 'English description.',
            features: ['Initiation workshops', 'Stunt work'],
            cta_text: 'Request a quote',
        });

        expect(result.title).toBe('Corporate Stunt Days');
        expect(result.description).toBe('English description.');
        expect(result.features).toEqual(['Initiation workshops', 'Stunt work']);
        expect(result.cta_text).toBe('Request a quote');
    });

    it('ne remplace jamais par une chaîne vide ou un tableau vide', () => {
        const result = applyEventOverlay(EVENT, {
            title: '   ',
            description: '',
            features: [],
        });

        expect(result.title).toBe(EVENT.title);
        expect(result.description).toBe(EVENT.description);
        expect(result.features).toBe(EVENT.features);
    });

    it('ne touche ni l’identifiant, ni l’image, ni le lien du bouton', () => {
        const result = applyEventOverlay(EVENT, {
            id: 'wrong',
            image_url: '/wrong.jpg',
            cta_link: '/wrong',
            order_index: 99,
        });

        expect(result.id).toBe(EVENT.id);
        expect(result.image_url).toBe(EVENT.image_url);
        expect(result.cta_link).toBe(EVENT.cta_link);
        expect(result.order_index).toBe(EVENT.order_index);
    });
});

describe('applyEventOverlays', () => {
    const OTHER: SiteEvent = { ...EVENT, id: 'soiree-cinema' };

    it('sans overlays, la liste est renvoyée telle quelle (même référence)', () => {
        const events = [EVENT, OTHER];
        expect(applyEventOverlays(events, null)).toBe(events);
    });

    it('n’applique que les événements présents dans les overlays', () => {
        const result = applyEventOverlays([EVENT, OTHER], {
            'soiree-cinema': { title: 'Cinema Night' },
        });

        expect(result[0]).toEqual(EVENT);
        expect(result[1].title).toBe('Cinema Night');
    });
});
