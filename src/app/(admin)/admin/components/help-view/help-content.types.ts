/**
 * Contrats de la section « Aide & Guide » du Cockpit.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune React, aucune donnée
 * métier autre que le parcours de démarrage. Les sujets sont répartis dans
 * `help-content.ts` (cœur) et `help-content.systeme.ts` (système & sécurité).
 */

export interface HelpTopic {
    id: string;
    title: string;
    /** Résumé en une phrase. */
    summary: string;
    /** Points pratiques (ce qu'il faut savoir faire). */
    bullets: string[];
    /** Mots-clés de recherche (synonymes, onglets concernés). */
    keywords: string[];
}

export interface HelpGroup {
    id: string;
    title: string;
    topics: HelpTopic[];
}

export interface QuickStep {
    label: string;
    text: string;
}

/** Parcours conseillé à la première ouverture. */
export const HELP_QUICK_START: QuickStep[] = [
    {
        label: '1. Explorer',
        text: 'Le menu de gauche regroupe les onglets par pôle. Ctrl+K ouvre la palette de commandes pour sauter directement à un écran.',
    },
    {
        label: '2. Modifier la vitrine',
        text: 'Onglet « Pages du Site » : choisissez une page, éditez son contenu, prévisualisez, puis publiez. Tout part de là.',
    },
    {
        label: '3. Relier une page au menu',
        text: 'Onglet « Menus du Site » : chaque entrée nomme la page qu’elle sert. Les deux écrans se renvoient l’un à l’autre.',
    },
    {
        label: '4. Vérifier avant/après',
        text: '« Diagnostic du Site » détecte les liens cassés et images manquantes ; « Journal & Activité » trace qui a modifié quoi.',
    },
];

/** Identifiants des 5 grands volets du centre d'aide. */
export type HelpTabId = 'guide' | 'application' | 'methodologie' | 'cuc-sign' | 'faq';

export interface HelpTabDefinition {
    id: HelpTabId;
    label: string;
    shortLabel: string;
    description: string;
    badge?: string;
}

