'use client';

import { useEffect } from 'react';

/**
 * ==============================================================================
 * CUC — Position de défilement du Cockpit
 * ==============================================================================
 * Le défilement vit au niveau du document (`CockpitApp` n'enferme plus le contenu
 * dans une zone `overflow`). Changer d'onglet est un changement de page : il doit
 * donc **toujours** rouvrir par le haut, jamais à la position héritée de l'écran
 * précédent (le navigateur se contentait de rogner la hauteur du nouveau contenu).
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : geste isolé des raccourcis
 * clavier — `useCockpitShortcuts` ne connaît plus que deux appels, jamais la
 * mécanique du défilement ni celle de l'historique.
 */

/**
 * Remet la fenêtre en haut, **instantanément**.
 *
 * Aucun `behavior: 'smooth'` : la remise en haut est un changement de contexte,
 * pas une animation — un défilement animé donnerait l'impression que l'onglet
 * précédent saute au lieu d'ouvrir le nouveau.
 */
export function resetWindowScroll(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo(0, 0);
}

/**
 * Désactive la restauration automatique de la position de défilement par le
 * navigateur (boutons Précédent/Suivant, rechargement) : le Cockpit décide
 * lui-même de sa position, il ne la laisse pas deviner par l'historique.
 * Le réglage précédent est restauré au démontage.
 */
export function useManualScrollRestoration(): void {
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const history = window.history;
        if (!history || !('scrollRestoration' in history)) return undefined;

        const previous = history.scrollRestoration;
        history.scrollRestoration = 'manual';

        return () => {
            history.scrollRestoration = previous;
        };
    }, []);
}
