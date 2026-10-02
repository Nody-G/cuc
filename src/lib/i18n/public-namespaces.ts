/**
 * ==============================================================================
 * [Types] — Contrat de portée du payload i18n PUBLIC (WS-F / F1)
 * ==============================================================================
 * Le layout de locale fournit la COQUILLE (SkipLink, MobileStickyCTA…) : il ne
 * connaît pas le slug de la route. Il ne doit donc sérialiser que les namespaces
 * dont la coquille a besoin (`SHELL_NAMESPACES`). Chaque route ajoute ensuite,
 * via `SitePageScope`, les siens (`ROUTE_NAMESPACES`).
 *
 * Portée : ce fichier ne contient QUE le contrat (données). La sélection pure
 * vit dans `scoped-payload.ts` [Domain], la composition dans
 * `ScopedIntlProvider.tsx` [Hooks]. Règle SRP : `AGENTS.md` § 1.
 *
 * Règle de sûreté (non négociable) : **en cas de doute, INCLURE** le namespace.
 * Un namespace manquant casse `useTranslations()` côté client ; un namespace en
 * trop ne coûte que quelques octets. La carte est vérifiée en continu par
 * `public-namespaces.test.ts` (scan de graphe d'imports par route).
 */

/** Tous les namespaces des catalogues `messages/<locale>.json`. */
export const PUBLIC_NAMESPACES = [
    'common',
    'films',
    'campus',
    'campus3dViewer',
    'formation',
    'footer',
    'partenaires',
    'team',
    'contact',
    'visite',
    'home',
    'videos',
    'teamBuilding',
    'visiteVirtuelle',
    'eventsAgence',
    'spectacles',
    'animations',
    'stages',
    'stuntWorkshop',
    'visiteGuidee',
    'teamProduction',
    'commonChrome',
    'applicationModal',
    'lightbox',
] as const;

export type PublicNamespace = (typeof PUBLIC_NAMESPACES)[number];

/**
 * Namespaces portés par la COQUILLE, sur toutes les routes :
 *   - `common` / `commonChrome` : `SkipLink`, `MobileStickyCTA`, `Navbar` ;
 *   - `footer` : pied de page rendu dans toutes les vues ;
 *   - `team` : libellés de rôles et noms de coachs partout (invariant WS-F) ;
 *   - `lightbox` / `applicationModal` : surcouches transverses.
 */
export const SHELL_NAMESPACES = [
    'common',
    'commonChrome',
    'footer',
    'team',
    'lightbox',
    'applicationModal',
] as const satisfies readonly PublicNamespace[];

/** Slugs canoniques des routes publiques (`/` = accueil). */
export type PublicRouteSlug =
    | '/'
    | 'animations-airbag-parkour'
    | 'contact-cuc'
    | 'cuc-events-agence'
    | 'cuc-team-cascadeur'
    | 'equipe-cascadeurs-pro'
    | 'formation-de-cascadeur'
    | 'partenaires'
    | 'spectacles-cascadeurs-yamakasi'
    | 'stages-cascades-parkour-2'
    | 'stunt-workshop-cuc'
    | 'team-building-cascades'
    | 'videos-cascadeur'
    | 'visite-guidee'
    | 'visite-virtuelle';

export const PUBLIC_ROUTE_SLUGS: readonly PublicRouteSlug[] = [
    '/',
    'animations-airbag-parkour',
    'contact-cuc',
    'cuc-events-agence',
    'cuc-team-cascadeur',
    'equipe-cascadeurs-pro',
    'formation-de-cascadeur',
    'partenaires',
    'spectacles-cascadeurs-yamakasi',
    'stages-cascades-parkour-2',
    'stunt-workshop-cuc',
    'team-building-cascades',
    'videos-cascadeur',
    'visite-guidee',
    'visite-virtuelle',
];

/**
 * Namespaces PROPRES à chaque route (hors `SHELL_NAMESPACES`, hérités du
 * layout). Dérivé du graphe d'imports réel de chaque route — sur-approximé
 * volontairement (on suit tous les imports, y compris serveur).
 */
export const ROUTE_NAMESPACES: Record<PublicRouteSlug, readonly PublicNamespace[]> = {
    '/': ['home', 'teamProduction'],
    'animations-airbag-parkour': ['animations'],
    'contact-cuc': ['contact'],
    'cuc-events-agence': ['eventsAgence'],
    'cuc-team-cascadeur': ['films', 'teamProduction'],
    'equipe-cascadeurs-pro': ['films', 'teamProduction'],
    'formation-de-cascadeur': ['formation'],
    'partenaires': ['partenaires'],
    'spectacles-cascadeurs-yamakasi': ['spectacles'],
    'stages-cascades-parkour-2': ['stages'],
    'stunt-workshop-cuc': ['stuntWorkshop'],
    'team-building-cascades': ['teamBuilding'],
    'videos-cascadeur': ['videos'],
    'visite-guidee': ['campus3dViewer', 'visite', 'visiteGuidee', 'visiteVirtuelle'],
    'visite-virtuelle': ['campus3dViewer', 'visiteVirtuelle'],
};

/** Entités d'overlay (`site_translations`) résolues par route. `team` est global. */
export type PublicOverlayEntity = 'campus_poi' | 'campus_facility' | 'discipline';

/**
 * Overlays EN chargés EN PLUS de `team` (global) pour chaque route. Un overlay
 * absent n'est PAS une panne : `useEntityOverlays` retombe alors sur sa lecture
 * navigateur paresseuse (repli historique, jamais pire qu'avant WS-F).
 */
export const ROUTE_OVERLAYS: Partial<Record<PublicRouteSlug, readonly PublicOverlayEntity[]>> = {
    'visite-guidee': ['campus_facility'],
    'formation-de-cascadeur': ['discipline'],
};
