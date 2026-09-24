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
