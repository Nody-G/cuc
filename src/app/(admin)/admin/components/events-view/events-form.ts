/**
 * Domaine de l'éditeur de prestations : fabrique d'une nouvelle offre et
 * classes de champs communes.
 */

import type { SiteEvent } from '@/lib/data/site-service';

export const EVENTS_INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

/** Fabrique une prestation vierge prête à éditer (id horodaté, ordre en fin de liste). */
export function createEmptyEvent(events: SiteEvent[]): SiteEvent {
    return {
        id: `event-${Date.now()}`,
        title: '',
        subtitle: '',
        badge: 'NOUVELLE PRESTATION',
        description: '',
        features: ['Encadrement professionnel', 'Sécurité homologuée'],
        price_indicator: 'Sur devis',
        cta_text: 'Demander un devis',
        cta_link: '/contact-cuc',
        image_url: '',
        order_index: events.length + 1,
        is_published: true,
    };
}
