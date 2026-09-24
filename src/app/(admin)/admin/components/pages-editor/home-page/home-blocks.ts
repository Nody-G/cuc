import type { HomeBlockDef } from './home-blocks.types';

/** Les contrats restent réexportés ici pour ne pas casser les appelants. */
export type { HomeBlockDef, HomeFieldDef, HomeRowDef } from './home-blocks.types';

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
                fields: [{ key: 'founder_label', label: 'Fondateur — surtitre', liveEdit: true }],
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
                fields: [{ key: 'team_tag', label: 'Étiquette d\'équipe', liveEdit: true }],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_text', label: 'Bouton — libellé', liveEdit: true },
                    { key: 'cta_link', label: 'Bouton — lien' },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'pillar1_title', label: 'Pilier 1 — titre', liveEdit: true },
                    {
                        key: 'pillar1_desc',
                        label: 'Pilier 1 — description',
                        kind: 'textarea',
                        rows: 2,
                        liveEdit: true,
                    },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'pillar2_title', label: 'Pilier 2 — titre', liveEdit: true },
                    {
                        key: 'pillar2_desc',
                        label: 'Pilier 2 — description',
                        kind: 'textarea',
                        rows: 2,
                        liveEdit: true,
                    },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'pillar3_title', label: 'Pilier 3 — titre', liveEdit: true },
                    {
                        key: 'pillar3_desc',
                        label: 'Pilier 3 — description',
                        kind: 'textarea',
                        rows: 2,
                        liveEdit: true,
                    },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_production', label: 'CTA production — libellé', liveEdit: true },
                    { key: 'cta_catalog', label: 'CTA catalogue — libellé', liveEdit: true },
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
                fields: [{ key: 'tag', label: 'Étiquette du bloc', liveEdit: true }],
            },
            {
                columns: 2,
                fields: [
                    { key: 'cta_text', label: 'Bouton — libellé', liveEdit: true },
                    { key: 'cta_link', label: 'Bouton — lien' },
                ],
            },
            {
                fields: [
                    {
                        key: 'installations_cta',
                        label: 'Bouton installations — libellé',
                        liveEdit: true,
                    },
                ],
            },
            {
                columns: 2,
                fields: [
                    { key: 'hud_title', label: 'HUD visite 360° — titre', liveEdit: true },
                    { key: 'hud_hint', label: 'HUD visite 360° — invitation', liveEdit: true },
                ],
            },
            {
                fields: [{ key: 'image_url', label: 'Visuel de la visite 360°', media: true }],
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
            {
                fields: [
                    { key: 'cta_text', label: 'Bouton de contact — libellé', liveEdit: true },
                ],
            },
            {
                fields: [{ key: 'logo_url', label: 'Logo de certification', media: true }],
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
            {
                fields: [{ key: 'view_all', label: 'Lien « tout voir » — libellé', liveEdit: true }],
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
            {
                columns: 2,
                fields: [
                    { key: 'handle', label: 'Identifiant du réseau', liveEdit: true },
                    { key: 'join_text', label: 'Bouton de suivi — libellé', liveEdit: true },
                ],
            },
            {
                fields: [{ key: 'see_instagram', label: 'Lien Instagram — libellé', liveEdit: true }],
            },
            {
                fields: [{ key: 'avatar_url', label: 'Avatar du bloc', media: true }],
            },
        ],
    },
];
