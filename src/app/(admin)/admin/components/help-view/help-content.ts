/**
 * Contenu de la section « Aide & Guide » du Cockpit — point d'assemblage unique.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : données pures, aucune React.
 * Réparti en modules spécialisés sous le plafond de 300 lignes par fichier :
 * - `help-guide-essentiels.ts` (Navigation, rôles, thème)
 * - `help-guide-vitrine.ts` (Pages, Mode Studio, publication, bilingue, menus)
 * - `help-guide-medias.ts` (Médiathèque, plan 3D campus)
 * - `help-guide-metier.ts` (Contact/candidatures, sessions, coachs/films, Instagram, visites)
 * - `help-content.systeme.ts` (Journal, diagnostic, sauvegardes, comptes, moniteur)
 */

import type { HelpGroup } from './help-content.types';
import { HELP_ESSENTIELS_GROUP } from './help-guide-essentiels';
import { HELP_VITRINE_GROUP } from './help-guide-vitrine';
import { HELP_MEDIAS_GROUP } from './help-guide-medias';
import { HELP_METIER_GROUP } from './help-guide-metier';
import { HELP_SYSTEM_GROUP } from './help-content.systeme';

export type { HelpTopic, HelpGroup, QuickStep } from './help-content.types';
export { HELP_QUICK_START } from './help-content.types';

/** Assemblage unique de tous les groupes d'aide du Cockpit. */
export const HELP_CONTENT: HelpGroup[] = [
    HELP_ESSENTIELS_GROUP,
    HELP_VITRINE_GROUP,
    HELP_MEDIAS_GROUP,
    HELP_METIER_GROUP,
    HELP_SYSTEM_GROUP,
];
