/**
 * Domaine de la section « installations » : bloc éditable `sections_data`,
 * préchargement d'image et résolution de l'installation demandée par l'URL.
 * Aucune dépendance React, aucun accès réseau (`AGENTS.md` § 1-2).
 */

import { CAMPUS_FACILITIES } from '@/data/campus';
import type { InfrastructureSpot } from '@/types';

/** Item éditable d'installation (`sections_data.installations.items.<index>`). */
export interface InstallationsBlockItem {
    name?: string;
    size?: string;
    description?: string;
    image?: string;
    specifications?: string;
    features?: string[];
}

/** Bloc `sections_data.installations` (chrome + correctifs saisis en place). */
export interface InstallationsBlock {
    tag?: string;
    title?: string;
    subtitle?: string;
    specs_label?: string;
    compliance_label?: string;
    items?: InstallationsBlockItem[];
}

/**
 * Précharge une image distante dans le cache navigateur (et, en amont, dans le
 * cache de l'optimiseur Next.js via l'URL `/_next/image`). Évite le délai
 * d'environ 1 s constaté lors du changement d'installation : sans préchargement,
 * chaque clic déclenche un aller-retour réseau complet vers le CDN distant.
 */
export const preloadImage = (src: string): void => {
    if (typeof window === 'undefined' || !src) return;
    const img = new window.Image();
    img.decoding = 'async';
    img.src = src;
};

/**
 * Résout l'installation à afficher depuis le paramètre d'URL `?installation=<id>`
 * (transmis par la fiche du plan 3D). Retombe sur la première installation si
 * l'identifiant est absent ou inconnu.
 */
export const resolveInitialFacilityId = (
    list: InfrastructureSpot[] = CAMPUS_FACILITIES
): string => {
    if (typeof window === 'undefined') return list[0].id;
    const requested = new URLSearchParams(window.location.search).get('installation');
    if (requested && list.some((f) => f.id === requested)) {
        return requested;
    }
    return list[0].id;
};

/**
 * Applique les correctifs éditoriaux index par index sur la liste de référence :
 * une clé absente ou vide laisse la donnée d'origine en place.
 */
export function mergeFacilityEdits(
    base: InfrastructureSpot[],
    items?: InstallationsBlockItem[]
): InfrastructureSpot[] {
    if (!items || items.length === 0) return base;

    return base.map((facility, index) => {
        const over = items[index];
        if (!over) return facility;
        return {
            ...facility,
            name: over.name || facility.name,
            size: over.size || facility.size,
            description: over.description || facility.description,
            image: over.image || facility.image,
            specifications: over.specifications || facility.specifications,
            features: over.features?.length ? over.features : facility.features,
        };
    });
}
