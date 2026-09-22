'use client';

import { useEffect, useState } from 'react';
import { getPreviewEntities, subscribePreviewEntities } from './preview-store';

/**
 * ==============================================================================
 * CUC — Surcharges d'entités de l'aperçu (côté vitrine)
 * ==============================================================================
 * Les composants qui affichent une entité de la base (bannière d'annonce,
 * fiches…) lisent leurs valeurs serveur. Dans l'iframe du Cockpit, le parent
 * pousse un brouillon `entity-draft` (référence `table:id:champ` → valeur) :
 * ce hook rend la carte complète à appliquer **par-dessus** les valeurs
 * serveur, sans rechargement ni écriture en base.
 *
 * Hors aperçu, le store est vide et l'objet rendu est stable : aucun rendu
 * supplémentaire pour la vitrine publique.
 */

type EntityOverrides = Record<string, string>;

const EMPTY: EntityOverrides = {};

export function usePreviewEntities(): EntityOverrides {
    const [overrides, setOverrides] = useState<EntityOverrides>(getPreviewEntities);

    useEffect(() => subscribePreviewEntities(setOverrides), []);

    return overrides ?? EMPTY;
}

/** Valeur surchargée d'une référence, ou `null` si l'entité n'est pas éditée. */
export function resolveEntityOverride(
    overrides: EntityOverrides,
    ref: string | null
): string | null {
    if (!ref) return null;
    const value = overrides[ref];
    return typeof value === 'string' ? value : null;
}
