/**
 * ==============================================================================
 * CUC — Pages vitrine portant le chrome et les entités éditables
 * ==============================================================================
 * La navbar (et donc la bannière d'annonce) et le pied de page sont rendus sur
 * ces pages, en FR **et** en EN : toute écriture qui touche le chrome ou une
 * entité de la liste blanche les republie toutes.
 *
 * Module **sans** `'use server'` : un module de Server Actions n'exporte que
 * des fonctions async — la constante est donc partagée ici par `settings.ts`
 * et `entities.ts`, une seule source.
 */

export const CHROME_PAGE_PATHS = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur',
    '/partenaires',
    '/team-building-cascades',
    '/animations-airbag-parkour',
    '/spectacles-cascadeurs-yamakasi',
    '/stunt-workshop-cuc',
    '/videos-cascadeur',
    '/visite-guidee',
    '/visite-virtuelle',
    '/contact-cuc',
];
