'use client';

import React from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { SiteDataProvider, useSiteData } from './SiteDataProvider';

/**
 * ==============================================================================
 * Contenu de page DÉJÀ localisé, injecté dans le provider de données de site
 * ==============================================================================
 * Le layout de locale fournit la COQUILLE (navigation, pied de page, réseaux
 * sociaux, overlays d'entités) mais ne peut pas connaître le slug de la route :
 * `usePageDynamicContent` retombait donc, au rendu serveur, sur la constante
 * `DEFAULT_PAGE_CONTENTS[slug]` — du français dans le HTML des pages EN, corrigé
 * seulement après hydratation.
 *
 * Chaque `layout.tsx` de route (composant serveur, il connaît son slug) résout
 * `getLocalizedPageContent(slug, locale)` et l'injecte ici. Le parent est
 * recopié tel quel : rien de la coquille n'est perdu, aucun champ n'est inventé.
 *
 * WS-F / F1 : la route peut en plus fournir les **overlays propres à sa page**
 * (`campus_facility`, `discipline`…). Ils sont FUSIONNÉS avec ceux de la coquille
 * (`team` reste porté par le layout) — un overlay global n'est jamais écrasé par
 * un overlay de route, et un overlay absent n'est jamais remplacé par `{}`.
 */
export const PageDataProvider: React.FC<{
    page: SitePageContent | null;
    /** Overlays d'entités propres à la route, fusionnés avec ceux de la coquille. */
    overlays?: Record<string, Record<string, Record<string, unknown>>> | null;
    /** Réservé à la route d'aperçu admin : sert le brouillon sans le masquer. */
    allowUnpublished?: boolean;
    children: React.ReactNode;
}> = ({ page, overlays, allowUnpublished, children }) => {
    const parent = useSiteData();
    const base = parent ?? { locale: 'fr' };
    const mergedOverlays = overlays
        ? { ...(base.overlays ?? {}), ...overlays }
        : base.overlays;

    return (
        <SiteDataProvider
            value={{ ...base, page, overlays: mergedOverlays }}
            allowUnpublished={allowUnpublished}
        >
            {children}
        </SiteDataProvider>
    );
};
