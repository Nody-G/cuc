'use client';

import React, { createContext, useContext } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { FooterStructure, NavigationStructure } from '@/data/navigation';

/**
 * ==============================================================================
 * Données de site RÉSOLUES SUR LE SERVEUR, consommées par les hooks clients
 * ==============================================================================
 * Problème résolu : les hooks (`usePageDynamicContent`, `useNavigation`,
 * `useFooter`) chargeaient le FR puis l'overlay EN en deux requêtes, d'où un
 * affichage fugace du français en mode anglais.
 *
 * Ici, le serveur fournit le contenu **déjà localisé**. Les hooks l'utilisent
 * comme état INITIAL : le premier rendu client est donc correct, sans attente ni
 * clignotement. Le Realtime continue de s'abonner ensuite pour la fraîcheur.
 *
 * Déploiement progressif : si un écran n'est pas encore branché sur ce provider,
 * les hooks retombent automatiquement sur leur ancien comportement (chargement
 * côté navigateur). Rien ne casse, aucun écran n'est bloqué.
 */

export interface LocalizedChromeData<TStructure> {
    structure: TStructure;
    /** Libellés traduits (`null` en FR : la source fait foi). */
    labels: Record<string, string> | null;
}

export interface SiteDataValue {
    locale: string;
    /** Contenu de page déjà localisé (FR + overlay EN fusionnés). */
    page?: SitePageContent | null;
    navigation?: LocalizedChromeData<NavigationStructure> | null;
    footer?: LocalizedChromeData<FooterStructure> | null;
}

const SiteDataContext = createContext<SiteDataValue | null>(null);

export const SiteDataProvider: React.FC<{
    value: SiteDataValue;
    children: React.ReactNode;
}> = ({ value, children }) => (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
);

/**
 * Données serveur disponibles, ou `null` si l'écran n'est pas encore branché.
 * Ne lève jamais : l'absence de provider est un cas normal (déploiement
 * progressif, aperçu du Cockpit, tests).
 */
export function useSiteData(): SiteDataValue | null {
    return useContext(SiteDataContext);
}

// Note : l'application des libellés se fait dans les hooks concernés
// (`applyItemLabels` pour la navigation, mapping des colonnes pour le pied de
// page). Aucun helper générique n'est exposé ici : les formes d'objets diffèrent
// (`label` d'un côté, `title` + `links` de l'autre) et un helper unique
// produirait des libellés faux — pire que pas de helper du tout.
