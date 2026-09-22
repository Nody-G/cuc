/**
 * Localisation éditoriale des partenaires : copie i18n appariée par NOM
 * (les logos, sites et certificats restent dans les données) et clés de
 * traduction des groupes de `partenaires.data`.
 */

/**
 * Copie éditoriale d'un partenaire, appariée par NOM (les logos, sites et
 * certificats restent dans les données). Un nom absent du catalogue retombe sur
 * la donnée : jamais de champ vide.
 */
export interface PartnerCopy {
    name: string;
    category?: string;
    role?: string;
    description?: string;
}

/** Champs structurels partagés par les fiches statiques et celles du Cockpit. */
export interface PartnerLike {
    name: string;
    role?: string;
    category?: string;
    description?: string;
}

export interface LocalizedPartnerFields {
    role?: string;
    category?: string;
    description?: string;
}

export type PartnerLocalizer = (partner: PartnerLike) => LocalizedPartnerFields;

/**
 * Rôle, catégorie et description localisés d'un partenaire (donnée en repli).
 * Le type reste structurel : les fiches statiques (`Partner`) et celles du
 * Cockpit (`SitePartner`) partagent ces champs sans héritage commun.
 */
export function createPartnerLocalizer(partnerCopy: PartnerCopy[]): PartnerLocalizer {
    const copyByName = new Map(partnerCopy.map((copy) => [copy.name.toLowerCase().trim(), copy]));
    return (partner) => {
        const copy = copyByName.get(partner.name.toLowerCase().trim());
        return {
            role: copy?.role || partner.role,
            category: copy?.category || partner.category,
            description: copy?.description || partner.description,
        };
    };
}

/**
 * Clés i18n des intitulés de groupes de `partenaires.data` (FR = source).
 * Le libellé FR reste la clé de repli : un groupe non répertorié s'affiche tel
 * quel plutôt que de disparaître.
 */
export const CATEGORY_KEYS: Record<string, string> = {
    "Agrément & Certification d'État": 'categories.agrement',
    'Équipementiers & Protections': 'categories.equipementiers',
    'Matériel & Équipement de Tournage': 'categories.materiel',
    'Pédagogie & Cascades Professionnelles': 'categories.pedagogie',
    'Multimédia & Production': 'categories.multimedia',
    'Établissement & Nutrition': 'categories.etablissement',
};
