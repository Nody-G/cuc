'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '@/components/i18n/SiteDataProvider';
import { getPreviewDraft, subscribePreviewDraft } from '@/lib/preview/preview-store';
import type { SitePageContent } from '@/lib/data/site-service';

/**
 * ==============================================================================
 * CUC — Données de section d'une page (brouillon compris)
 * ==============================================================================
 * Les sections de la vitrine doivent pouvoir lire leurs textes depuis
 * `sections_data.<bloc>` **sans passer par les props de page** — sinon chaque
 * micro-texte à rendre éditable exige de remonter la donnée à la main dans une
 * chaîne de composants, ce qui rend la couverture inatteignable.
 *
 * Deux sources, dans cet ordre :
 *   1. le **brouillon d'aperçu** (`preview-store`, poussé par le Cockpit en
 *      `postMessage`) : il porte les modifications non enregistrées ;
 *   2. la **page servie par le serveur** (`SiteDataProvider`, déjà localisée
 *      FR + overlay EN), disponible partout dans l'arbre.
 *
 * Aucune requête, aucun état global : un abonnement local au store d'aperçu.
 */

export function usePageSectionData<T = Record<string, unknown>>(block: string): T | undefined {
    const serverPage = useSiteData()?.page ?? null;
    // Initialisation paresseuse : si un brouillon est déjà publié (aperçu déjà
    // chargé), il est pris en compte dès le premier rendu, sans effet d'état.
    const [draft, setDraft] = useState<SitePageContent | null>(() => getPreviewDraft());

    useEffect(() => subscribePreviewDraft(setDraft), []);

    const source = draft ?? serverPage;
    const sectionsData = source?.sections_data as Record<string, unknown> | undefined;
    return sectionsData?.[block] as T | undefined;
}

/**
 * Fusionne les items venus des données avec les replis traduits, **par index** :
 * un champ absent des données garde son texte traduit (zéro régression), un
 * champ présent le remplace. La longueur résultante est le maximum des deux —
 * ni un repli perdu, ni un item fourni par la base ignoré.
 */
export function mergeSectionItems<T extends object>(
    defaults: readonly T[],
    data?: { items?: Array<Partial<T>> } | null
): T[] {
    const incoming = data?.items;
    if (!incoming || incoming.length === 0) return [...defaults];

    const length = Math.max(incoming.length, defaults.length);
    return Array.from({ length }, (_, index) => ({
        ...(defaults[index] ?? ({} as T)),
        ...(incoming[index] ?? {}),
    }));
}
