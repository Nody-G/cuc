'use client';

import { useCallback, useRef } from 'react';

/**
 * ==============================================================================
 * CUC — Contrat commun d'abandon d'un brouillon
 * ==============================================================================
 * Règle unique, partagée par tous les écrans à barre d'enregistrement :
 *
 *   « Annuler » = revenir à la **dernière valeur persistée** et déclarer le
 *   brouillon propre — jamais « Réinitialiser aux valeurs par défaut », qui est
 *   une action destructive distincte.
 *
 * Le hook ne détient aucune valeur d'affichage : il ne garde que la référence de
 * ce qui a été réellement persisté (au chargement, puis après chaque
 * enregistrement réussi) et rejoue cette référence à la demande.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : les écrans fournissent les
 * trois gestes (`restoreDraft`, `markClean`), la sémantique d'abandon n'est
 * écrite qu'ici — pas recopiée dans chaque barre.
 */

export interface PersistedDraftDiscard<T> {
    /** Mémorise la valeur réellement persistée (chargement ou enregistrement réussi). */
    rememberPersisted: (value: T) => void;
    /** Abandonne le brouillon : retour à la valeur persistée, brouillon rendu propre. */
    discardPersisted: () => void;
}

export function usePersistedDraftDiscard<T>(
    initialPersisted: T,
    restoreDraft: (value: T) => void,
    markClean: () => void
): PersistedDraftDiscard<T> {
    const persistedRef = useRef<T>(initialPersisted);

    const rememberPersisted = useCallback((value: T) => {
        persistedRef.current = value;
    }, []);

    const discardPersisted = useCallback(() => {
        restoreDraft(persistedRef.current);
        markClean();
    }, [restoreDraft, markClean]);

    return { rememberPersisted, discardPersisted };
}
