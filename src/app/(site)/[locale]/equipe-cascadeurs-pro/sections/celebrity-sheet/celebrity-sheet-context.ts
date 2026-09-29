'use client';

import { createContext, useContext } from 'react';
import type { DoubledCelebrity } from '@/types';

/**
 * Contrat d'ouverture d'une fiche comédien depuis la vitrine « équipe ».
 *
 * `resolve` est exposé en plus de `openByName` pour que la couche `UI` puisse
 * décider d'afficher un bouton ou du texte **sans connaître le catalogue** :
 * un nom sans fiche reste du texte (aucun lien faux).
 */
export interface CelebritySheetController {
    /** Fiche associée à un nom publié, ou `null` si aucune. */
    resolve: (name: string) => DoubledCelebrity | null;
    /** Ouvre la fiche correspondant au nom publié (sans effet si aucune fiche). */
    openByName: (name: string) => void;
}

export const CelebritySheetContext = createContext<CelebritySheetController | null>(null);

/**
 * Consomme l'ouverture de fiche comédien.
 *
 * Lève une erreur hors provider : sans lui, aucun nom ne serait cliquable et le
 * défaut passerait inaperçu.
 */
export function useCelebritySheet(): CelebritySheetController {
    const controller = useContext(CelebritySheetContext);
    if (!controller) {
        throw new Error('useCelebritySheet doit être utilisé sous <CelebritySheetProvider>.');
    }
    return controller;
}
