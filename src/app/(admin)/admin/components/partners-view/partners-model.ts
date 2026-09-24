/**
 * Domaine de l'éditeur de partenaires : libellés, fiche vierge et opérations
 * pures. Aucun accès réseau, aucune dépendance UI (`AGENTS.md` § 1-2).
 */

import type { SitePartner } from '@/lib/data/site-service';

/** Filtres de catégorie affichés au-dessus de la grille. */
export const PARTNER_FILTERS: ReadonlyArray<{ id: string; label: string }> = [
    { id: 'all', label: 'Tous les partenaires' },
    { id: 'cinema', label: '🎬 Cinéma & Productions' },
    { id: 'institutionnel', label: '🏛️ Institutionnels & Labels' },
    { id: 'materiel', label: '🛡️ Équipements & Sécurité' },
];

/** Catégories proposées dans le formulaire d'édition. */
export const PARTNER_CATEGORY_OPTIONS: ReadonlyArray<{
    value: SitePartner['category'];
    label: string;
}> = [
        { value: 'cinema', label: '🎬 Cinéma & Productions' },
        { value: 'institutionnel', label: '🏛️ Institutionnels & Certifications' },
        { value: 'materiel', label: '🛡️ Équipementiers & Sécurité' },
        { value: 'media', label: '📺 Médias & Presse' },
    ];

/** Fiche vierge : identifiant horodaté, placée en fin de liste. */
export function createEmptyPartner(orderIndex: number): SitePartner {
    return {
        id: `partner-${Date.now()}`,
        name: '',
        category: 'cinema',
        logo_url: '',
        website_url: '',
        order_index: orderIndex,
        is_published: true,
    };
}

/** Charge utile d'écriture : uniquement les colonnes réellement persistées. */
export function toPartnerUpsertPayload(partner: SitePartner) {
    return {
        id: partner.id,
        name: partner.name,
        category: partner.category,
        logo_url: partner.logo_url,
        website_url: partner.website_url,
        description: partner.description,
        order_index: partner.order_index,
    };
}

/** Filtre par catégorie (`all` rend la liste telle quelle). */
export function filterPartnersByCategory(
    partners: SitePartner[],
    category: string
): SitePartner[] {
    return category === 'all' ? partners : partners.filter((p) => p.category === category);
}
