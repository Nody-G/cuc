'use client';

/**
 * ==============================================================================
 * CUC — Garde anti-clés orphelines des overlays `labels` (navigation, pied de page)
 * ==============================================================================
 * Le socle `useEntityEditorLocale` projette le brouillon via un codec dont les
 * clés **dérivent des ancres courantes** (`item.id`, `col.id`, `brand.tagline`…).
 * Mais la ligne localisée, elle, fusionne l'overlay **persisté** : une ancre
 * retirée côté français (entrée supprimée) peut donc survivre comme clé morte.
 * Or `diffTranslation` autorise une feuille anglaise inédite (cas d'un texte
 * ajouté en EN) : cette clé morte serait alors réécrite au prochain
 * enregistrement.
 *
 * Ce garde réécrit la ligne localisée à partir des ancres FR courantes dès que
 * leur signature change (ajout / retrait d'une entrée) : toute clé orpheline est
 * éliminée avant sauvegarde, sans toucher aux traductions valides.
 *
 * Déclencheur = **identité des clés**, jamais leur contenu : une simple édition
 * de libellé ne clobbe donc pas la saisie anglaise en cours.
 */

import { useEffect, useRef } from 'react';
import type React from 'react';

export interface AnchoredOverlayResyncOptions<TDraft extends object> {
    /** Édition anglaise active (aucune charge en français). */
    isEnglish: boolean;
    /** Overlay chargé : le brouillon affiché correspond à l'entité courante. */
    ready: boolean;
    /** Signature des ancres courantes (identifiants triés puis joints). */
    anchorSignature: string;
    /** Brouillon actif (français fusionné avec l'overlay). */
    active: TDraft;
    /** Écriture de l'overlay : ré-ancre la ligne sur les clés courantes. */
    setActive: React.Dispatch<React.SetStateAction<TDraft>>;
}

export function useAnchoredOverlayResync<TDraft extends object>({
    isEnglish,
    ready,
    anchorSignature,
    active,
    setActive,
}: AnchoredOverlayResyncOptions<TDraft>): void {
    const lastSignature = useRef<string | null>(null);

    useEffect(() => {
        if (!isEnglish) {
            // Retour au français : la prochaine entrée en anglais resynchronise.
            lastSignature.current = null;
            return;
        }
        if (!ready) return;
        if (lastSignature.current === anchorSignature) return;
        lastSignature.current = anchorSignature;
        // Réécrit la ligne via le codec (clés = ancres courantes) : les clés
        // orphelines disparaissent, les traductions valides sont conservées.
        setActive(active);
    }, [isEnglish, ready, anchorSignature, active, setActive]);
}
