/**
 * Contrats de la description déclarative des blocs `sections_data` de la page
 * d'accueil (couche « Types & Contrats », AGENTS.md § 1).
 *
 * Extraits de `home-blocks.ts` le 2026-09-24 : le fichier de données dépassait
 * le plafond de 300 lignes, et ces interfaces n'ont rien à y faire.
 */

export interface HomeFieldDef {
    key: string;
    label: string;
    kind?: 'text' | 'textarea';
    rows?: number;
    /** Champ relié à l'aperçu live (attribut `data-cuc-field`). */
    liveEdit?: boolean;
    /** Rendu avec le bouton Médiathèque (cible `sections_data.<bloc>.<clé>`). */
    media?: boolean;
}

export interface HomeRowDef {
    /** Colonnes de la grille (2 ou 3 ; absent → champ(s) en bloc simple). */
    columns?: 2 | 3;
    fields: HomeFieldDef[];
}

export interface HomeBlockDef {
    id: string;
    title: string;
    desc: string;
    /** Nom du bloc dans `site_pages.sections_data`. */
    tag: string;
    rows: HomeRowDef[];
}

/**
 * Sous-champ d'un item de liste `sections_data.<bloc>.<tableau>.<index>.<clé>`.
 *
 * Nommé `fieldKey` (et non `key`) à dessein : l'audit d'accroche de l'accueil
 * normalise tout littéral `{ key: …, liveEdit: true }` en champ **plat** du bloc
 * (`sections_data.<bloc>.<clé>`). Un item écrit sous cette forme produirait une
 * promesse fantôme jamais annotée côté vitrine.
 */
export interface HomeListFieldDef {
    fieldKey: string;
    label: string;
    kind?: 'text' | 'textarea';
    rows?: number;
    /** Média de l'item : la médiathèque reçoit le chemin complet de l'item. */
    media?: boolean;
}

export interface HomeListDef {
    /** Clé du tableau dans le bloc (`pillars`, `items`, `posts`, `slides`). */
    arrayKey: string;
    label: string;
    desc?: string;
    /**
     * Nombre d'items rendus par la vitrine. `Math.max(count, items.length)` : le
     * formulaire édite au moins les positions servies par la vitrine.
     */
    count: number;
    fields: HomeListFieldDef[];
    /**
     * Ouvre les commandes de structure (ajouter, supprimer, réordonner,
     * dupliquer) via le moteur `applyListCommand`. Réservé aux listes dont le
     * domaine tolère une longueur variable (visuels du hero) : les autres
     * gardent une longueur fixe, inchangée.
     */
    canEditStructure?: boolean;
    /**
     * Socle par défaut d'une liste encore absente : sert de **repli affiché** par
     * position et de **graine** à la première addition. Ce sont des données
     * réelles (ex. les visuels historiques du hero), jamais du contenu inventé.
     */
    seed?: Array<Record<string, string | undefined>>;
}

/**
 * Bloc d'accueil entièrement composé de listes fixes. Les tableaux de la
 * vitrine fusionnent index par index avec un socle local de longueur constante :
 * le formulaire édite ces positions, il n'en crée ni n'en supprime aucune.
 */
export interface HomeListBlockDef {
    /** Bloc `site_pages.sections_data` (`about`, `partners`, `social`). */
    id: string;
    title: string;
    desc: string;
    tag: string;
    lists: HomeListDef[];
}
