import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

/**
 * ==============================================================================
 * CUC — Registre des écrans d'aperçu
 * ==============================================================================
 * L'aperçu éditeur (`/preview/<slug>`) rend les **mêmes composants** que les
 * pages publiques — jamais une reconstruction par sections (l'incident de la
 * « route fantôme » : un aperçu qui rejouait les sections de l'accueil). Un slug
 * absent d'ici est un 404 : aucune page qui n'existe pas.
 *
 * Contrat de couverture : chaque page du catalogue canonique
 * (`SITE_PAGE_CATALOG`) doit avoir son entrée — vérifié par
 * `preview-url.test.ts`.
 *
 * Chargement différé (`next/dynamic`) : évite que Webpack ne fusionne les 15
 * vues de pages dans un chunk client commun à toute la vitrine.
 */
export const PREVIEW_SCREENS: Record<string, ComponentType> = {
    '/': dynamic(() => import('../HomeView').then((m) => m.HomeView)),
    '/animations-airbag-parkour': dynamic(() => import('../animations-airbag-parkour/page')),
    '/contact-cuc': dynamic(() => import('../contact-cuc/page')),
    '/cuc-events-agence': dynamic(() => import('../cuc-events-agence/page')),
    '/cuc-team-cascadeur': dynamic(() => import('../cuc-team-cascadeur/page')),
    '/equipe-cascadeurs-pro': dynamic(() => import('../equipe-cascadeurs-pro/page')),
    '/formation-de-cascadeur': dynamic(() => import('../formation-de-cascadeur/page')),
    '/partenaires': dynamic(() => import('../partenaires/page')),
    '/spectacles-cascadeurs-yamakasi': dynamic(() => import('../spectacles-cascadeurs-yamakasi/page')),
    '/stages-cascades-parkour-2': dynamic(() => import('../stages-cascades-parkour-2/page')),
    '/stunt-workshop-cuc': dynamic(() => import('../stunt-workshop-cuc/page')),
    '/team-building-cascades': dynamic(() => import('../team-building-cascades/page')),
    '/videos-cascadeur': dynamic(() => import('../videos-cascadeur/page')),
    '/visite-guidee': dynamic(() => import('../visite-guidee/page')),
    '/visite-virtuelle': dynamic(() => import('../visite-virtuelle/page')),
};
