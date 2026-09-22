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
    tag: string;
    rows: HomeRowDef[];
}

/**
 * Description déclarative des six blocs `sections_data` de la page d'accueil.
 * Chaque champ alimente `site_pages.sections_data.<id>.<key>` via le
 * formulaire parent (`PagesEditorView`).
 */
export const HOME_BLOCKS: HomeBlockDef[] = [
    {
        id: 'about',
        title: 'Présentation & Fondateur',
        desc: 'Dossier de présentation, citation du fondateur et visuel du campus.',
        tag: 'about',
        rows: [
            {
                columns: 2,
                fields: [
                    { key: 'tag', label: 'Surtitre (Tag)', liveEdit: true },
                    { key: 'subtag', label: 'Sous-titre (Subtag)', liveEdit: true },
                ],
            },
            { fields: [{ key: 'title', label: 'Titre de section', liveEdit: true }] },
            {
                fields: [
                    {
                        key: 'description',
                        label: 'Description',
                        kind: 'textarea',
                        rows: 3,
                        liveEdit: true,
                    },
                ],
            },
            {
                fields: [
                    {
                        key: 'founder_quote',
                        label: 'Citation du fondateur',
                        kind: 'textarea',
                        rows: 2,
                        liveEdit: true,
                    },
                ],
            },
            {
                columns: 3,
                fields: [
                    { key: 'founder_name', label: 'Nom du fondateur', liveEdit: true },
                    { key: 'founder_role', label: 'Rôle du fondateur', liveEdit: true },
                    { key: 'badge_year', label: 'Badge année', liveEdit: true },
                ],
            },
            { fields: [{ key: 'image_url', label: 'Image de présentation', media: true }] },
            {
                columns: 2,
                fields: [
                    { key: 'cta_primary_text', label: 'Bouton principal — libellé', liveEdit: true },
                    { key: 'cta_primary_link', label: 'Bouton principal — lien' },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_secondary_text', label: 'Bouton secondaire — libellé', liveEdit: true },
                    { key: 'cta_secondary_link', label: 'Bouton secondaire — lien' },
                ],
            },
        ],
    },
    {
        id: 'tournages',
        title: 'Tournages & Productions Cinéma',
        desc: 'Bandeau de présentation de l\'activité de coordination de cascades.',
        tag: 'tournages',
        rows: [
            { fields: [{ key: 'badge', label: 'Badge', liveEdit: true }] },
            { fields: [{ key: 'title', label: 'Titre', liveEdit: true }] },
            {
                fields: [
                    { key: 'subtitle', label: 'Sous-titre', kind: 'textarea', rows: 2, liveEdit: true },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_text', label: 'Bouton — libellé', liveEdit: true },
                    { key: 'cta_link', label: 'Bouton — lien' },
                ],
            },
        ],
    },
    {
        id: 'virtual_tour',
        title: 'Visite Virtuelle 360°',
        desc: 'Bloc d\'appel à l\'exploration immersive du campus.',
        tag: 'virtual_tour',
        rows: [
            { fields: [{ key: 'badge', label: 'Badge', liveEdit: true }] },
            { fields: [{ key: 'title', label: 'Titre', liveEdit: true }] },
            {
                fields: [
                    { key: 'subtitle', label: 'Sous-titre', kind: 'textarea', rows: 2, liveEdit: true },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_text', label: 'Bouton — libellé', liveEdit: true },
                    { key: 'cta_link', label: 'Bouton — lien' },
                ],
            },
        ],
    },
    {
        id: 'qualiopi',
        title: 'Certification Qualiopi & Financements',
        desc: 'Bandeau d\'information sur les dispositifs de prise en charge.',
        tag: 'qualiopi',
        rows: [
            { fields: [{ key: 'badge', label: 'Badge', liveEdit: true }] },
            { fields: [{ key: 'title', label: 'Titre', liveEdit: true }] },
            {
                fields: [
                    { key: 'subtitle', label: 'Sous-titre', kind: 'textarea', rows: 2, liveEdit: true },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'afdas_badge', label: 'AFDAS — badge' },
                    { key: 'afdas_text', label: 'AFDAS — texte' },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'france_travail_badge', label: 'France Travail — badge' },
                    { key: 'france_travail_text', label: 'France Travail — texte' },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'opco_badge', label: 'OPCO — badge' },
                    { key: 'opco_text', label: 'OPCO — texte' },
                ],
            },
        ],
    },
    {
        id: 'partners',
        title: 'Partenaires & Studios',
        desc: 'Bandeau de confiance affichant les collaborations du campus.',
        tag: 'partners',
        rows: [
            { fields: [{ key: 'badge', label: 'Badge', liveEdit: true }] },
            { fields: [{ key: 'title', label: 'Titre', liveEdit: true }] },
            {
                fields: [
                    { key: 'subtitle', label: 'Sous-titre', kind: 'textarea', rows: 2, liveEdit: true },
                ],
            },
        ],
    },
    {
        id: 'social',
        title: 'Réseaux Sociaux & Communauté',
        desc: 'Textes du bloc de communauté. Les liens eux-mêmes se gèrent dans « Réseaux Sociaux ».',
        tag: 'social',
        rows: [
            { fields: [{ key: 'badge', label: 'Badge', liveEdit: true }] },
            { fields: [{ key: 'title', label: 'Titre', liveEdit: true }] },
            {
                fields: [
                    { key: 'subtitle', label: 'Sous-titre', kind: 'textarea', rows: 2, liveEdit: true },
                ],
            },
        ],
    },
];
