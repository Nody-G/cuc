/**
 * ==============================================================================
 * CUC — Navigation, Footer & Réseaux Sociaux : Types & Valeurs par Défaut
 * ==============================================================================
 * Ce module est la SOURCE DE VÉRITÉ DE SECOURS (fallback) de la navigation.
 *
 * Doctrine :
 *   - Les valeurs ci-dessous reproduisent EXACTEMENT le contenu actuellement
 *     codé en dur dans Navbar / NavDropdowns / NavMobileDrawer / Footer.
 *   - Elles servent de fallback si Supabase est indisponible ou si les tables
 *     `site_navigation`, `site_footer`, `site_social_links` sont vides.
 *   - Toute modification en base (via le Cockpit) prend le pas sur ces valeurs.
 *   - Zéro régression : la vitrine reste identique tant que rien n'est modifié.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. NAVIGATION
// ------------------------------------------------------------------------------

export type NavItemType = 'link' | 'dropdown' | 'external';

export interface NavChildItem {
    id: string;
    label: string;
    description?: string;
    href: string;
    order: number;
    is_visible: boolean;
    is_external?: boolean;
}

export interface NavItem {
    id: string;
    label: string;
    href?: string;
    type: NavItemType;
    order: number;
    is_visible: boolean;
    is_external?: boolean;
    /** Infobulle native (attribut `title`) pour les liens externes notamment. */
    title?: string;
    /**
     * Préfixes d'URL qui rendent l'item « actif » (souligné jaune).
     * Ex. l'item « Formation & Stages » est actif sur `/formation*` et `/stages*`.
     */
    activeMatchPrefixes?: string[];
    children?: NavChildItem[];
}

export interface NavCta {
    label: string;
    href: string;
    is_external?: boolean;
}

export interface NavigationStructure {
    items: NavItem[];
    cta: NavCta;
}

export interface SiteNavigation {
    id: string;
    label: string;
    structure: NavigationStructure;
    is_published: boolean;
    updated_at?: string;
}

export const DEFAULT_NAVIGATION: SiteNavigation = {
    id: 'main',
    label: 'Navigation principale',
    is_published: true,
    structure: {
        items: [
            {
                id: 'home',
                label: 'ACCUEIL',
                href: '/',
                type: 'link',
                order: 1,
                is_visible: true,
            },
            {
                // Onglet unique : la page campus regroupe les infrastructures,
                // la visite 360°, le plan 3D et les photos. Plus de sous-menu.
                id: 'campus',
                label: 'LE CAMPUS',
                href: '/visite-guidee',
                type: 'link',
                order: 2,
                is_visible: true,
                activeMatchPrefixes: ['/visite-guidee', '/visite-virtuelle'],
            },
            {
                id: 'formations',
                label: 'STAGES & FORMATIONS',
                type: 'dropdown',
                order: 3,
                is_visible: true,
                activeMatchPrefixes: ['/formation', '/stages'],
                children: [
                    {
                        id: 'formation-pro',
                        label: 'FORMATION DE CASCADEUR',
                        description: 'Formule découverte & Cursus pro 2 ans',
                        href: '/formation-de-cascadeur',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'stages-sejours',
                        label: 'STAGES & SÉJOURS',
                        description: 'Week-end, AFDAS, Summer Camp',
                        href: '/stages-cascades-parkour-2',
                        order: 2,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'workshop',
                label: 'WORKSHOP',
                href: '/stunt-workshop-cuc',
                type: 'link',
                order: 4,
                is_visible: true,
            },
            {
                id: 'tournages',
                label: 'TOURNAGE',
                href: '/cuc-team-cascadeur',
                type: 'link',
                order: 5,
                is_visible: true,
            },
            {
                id: 'equipe',
                label: 'L’ÉQUIPE',
                href: '/equipe-cascadeurs-pro',
                type: 'link',
                order: 6,
                is_visible: true,
            },
            {
                id: 'events',
                label: 'EVENTS',
                type: 'dropdown',
                order: 7,
                is_visible: true,
                activeMatchPrefixes: [
                    '/cuc-events',
                    '/spectacles',
                    '/animations',
                    '/team-building',
                ],
                children: [
                    {
                        id: 'cuc-events-agence',
                        label: 'CUC EVENTS AGENCE',
                        description: 'Prestations & coordination événementielle',
                        href: '/cuc-events-agence',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'spectacles-yamakasi',
                        label: 'SPECTACLES YAMAKASI',
                        description: 'Shows de parkour & cascades live',
                        href: '/spectacles-cascadeurs-yamakasi',
                        order: 2,
                        is_visible: true,
                    },
                    {
                        id: 'animations-airbag',
                        label: 'ANIMATIONS AIRBAG',
                        description: 'Airbag parkour pour tous publics',
                        href: '/animations-airbag-parkour',
                        order: 3,
                        is_visible: true,
                    },
                    {
                        id: 'team-building',
                        label: 'TEAM BUILDING',
                        description: 'Cohésion d’équipe par la cascade',
                        href: '/team-building-cascades',
                        order: 4,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'videos',
                label: 'VIDÉOS',
                href: '/videos-cascadeur',
                type: 'link',
                order: 8,
                is_visible: true,
            },
            {
                id: 'partenaires',
                label: 'PARTENAIRES',
                href: '/partenaires',
                type: 'link',
                order: 9,
                is_visible: true,
            },
            {
                id: 'boutique',
                label: 'BOUTIQUE',
                href: 'https://ma-boutique-club.com/campus-universcascades/',
                type: 'external',
                order: 10,
                is_visible: true,
                is_external: true,
                title: 'Boutique CUC (Textiles, Sweats, Équipements)',
            },
            {
                id: 'contact',
                label: 'CONTACT',
                href: '/contact-cuc',
                type: 'link',
                order: 11,
                is_visible: true,
            },
        ],
        cta: {
            label: 'Contact & Projets',
            href: '/contact-cuc',
        },
    },
};

// ------------------------------------------------------------------------------
// 2. FOOTER
// ------------------------------------------------------------------------------

export interface FooterLink {
    id: string;
    label: string;
    href: string;
    order: number;
    is_visible: boolean;
    is_external?: boolean;
}

export interface FooterColumn {
    id: string;
    title: string;
    order: number;
    is_visible: boolean;
    links: FooterLink[];
}

export interface FooterBrand {
    name: string;
    tagline: string;
    description: string;
}

export interface FooterLegal {
    copyright: string;
    links: FooterLink[];
}

export interface FooterStructure {
    columns: FooterColumn[];
    brand: FooterBrand;
    legal: FooterLegal;
}

export interface SiteFooter {
    id: string;
    label: string;
    structure: FooterStructure;
    is_published: boolean;
    updated_at?: string;
}

export const DEFAULT_FOOTER: SiteFooter = {
    id: 'main',
    label: 'Pied de page principal',
    is_published: true,
    structure: {
        brand: {
            name: 'CAMPUS UNIVERS CASCADES',
            tagline: 'Fondé en 2008 • Plus grande école au monde',
            description:
                "Centre de formation professionnelle de cascadeurs, coordinateurs et action designers pour l'industrie cinématographique internationale. Des installations de pointe.",
        },
        columns: [
            {
                id: 'formations',
                title: 'Formations',
                order: 1,
                is_visible: true,
                links: [
                    {
                        id: 'formation-pro-2ans',
                        label: 'Formation Pro 2 ans',
                        href: '/formation-de-cascadeur#formation-pro',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'formule-decouverte',
                        label: 'Formule Découverte (12j)',
                        href: '/formation-de-cascadeur#formule-decouverte',
                        order: 2,
                        is_visible: true,
                    },
                    {
                        id: 'stages-weekend',
                        label: 'Stages Week-end (250€)',
                        href: '/stages-cascades-parkour-2#weekend-immersion',
                        order: 3,
                        is_visible: true,
                    },
                    {
                        id: 'afdas',
                        label: 'Prise en charge AFDAS',
                        href: '/stages-cascades-parkour-2#afdas-artistes-interpretes',
                        order: 4,
                        is_visible: true,
                    },
                    {
                        id: 'workshop-international',
                        label: 'International Workshop',
                        href: '/stunt-workshop-cuc',
                        order: 5,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'campus',
                title: 'Le Campus',
                order: 2,
                is_visible: true,
                links: [
                    {
                        id: 'visite-guidee-campus',
                        label: 'Visite Guidée du Campus',
                        href: '/visite-guidee',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'visite-virtuelle-360',
                        label: 'Visite Virtuelle 360°',
                        href: '/visite-virtuelle',
                        order: 2,
                        is_visible: true,
                    },
                    {
                        id: 'zoe-bell-hall',
                        label: 'Zoé Bell Hall & Fosse',
                        href: '/visite-guidee?installation=zoe-bell-hall#installations-detail',
                        order: 3,
                        is_visible: true,
                    },
                    {
                        id: 'cuc-tower',
                        label: 'CUC Tower',
                        href: '/visite-guidee?installation=cuc-tower#installations-detail',
                        order: 4,
                        is_visible: true,
                    },
                    {
                        id: 'dojos',
                        label: 'Dojos de Combat',
                        href: '/visite-guidee?installation=dojos-sceniques#installations-detail',
                        order: 5,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'equipe',
                title: 'L’équipe',
                order: 3,
                is_visible: true,
                links: [
                    {
                        id: 'equipe-cascadeurs',
                        label: 'Équipe de Cascadeurs',
                        href: '/equipe-cascadeurs-pro',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'videos',
                        label: 'Vidéos & Démos',
                        href: '/videos-cascadeur',
                        order: 2,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'tournages',
                title: 'Tournage',
                order: 4,
                is_visible: true,
                links: [
                    {
                        id: 'cuc-team',
                        label: 'CUC Team & Action Design',
                        href: '/cuc-team-cascadeur',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'partenaires',
                        label: 'Partenaires & Studios',
                        href: '/partenaires',
                        order: 2,
                        is_visible: true,
                    },
                ],
            },
            {
                id: 'contact',
                title: 'Contact & Accès',
                order: 5,
                is_visible: true,
                links: [
                    {
                        id: 'contact-cuc',
                        label: 'Contact & Projets',
                        href: '/contact-cuc',
                        order: 1,
                        is_visible: true,
                    },
                    {
                        id: 'carte-acces',
                        label: 'Carte & Accès',
                        href: '/contact-cuc#campus-map-hub',
                        order: 2,
                        is_visible: true,
                    },
                    {
                        id: 'boutique',
                        label: 'Boutique Officielle',
                        href: 'https://ma-boutique-club.com/campus-universcascades/',
                        order: 3,
                        is_visible: true,
                        is_external: true,
                    },
                ],
            },
        ],
        legal: {
            copyright:
                '© 2008-2026 Campus Univers Cascades — Tous droits réservés. Organisme certifié Qualiopi.',
            links: [
                {
                    id: 'mentions-legales',
                    label: 'Mentions Légales',
                    href: '/contact-cuc?demande=autre',
                    order: 1,
                    is_visible: true,
                },
                {
                    id: 'reglement',
                    label: 'Règlement & Inscriptions',
                    href: '/contact-cuc?demande=autre#contact-form',
                    order: 2,
                    is_visible: true,
                },
            ],
        },
    },
};

// ------------------------------------------------------------------------------
// 3. RÉSEAUX SOCIAUX
// ------------------------------------------------------------------------------

export type SocialPlatform =
    | 'instagram'
    | 'youtube'
    | 'tiktok'
    | 'facebook'
    | 'whatsapp'
    | 'linkedin';

export interface SiteSocialLink {
    id: string;
    platform: SocialPlatform;
    label: string;
    handle?: string;
    url: string;
    display_hint?: string;
    brand_color?: string;
    order_index: number;
    is_active: boolean;
    show_in_navbar: boolean;
    show_in_footer: boolean;
    show_in_drawer: boolean;
}

/**
 * Valeurs canoniques unifiées (corrige les incohérences TikTok/YouTube
 * relevées dans l'audit : le handle officiel est `@campusuniverscascades`
 * pour YouTube/TikTok, `@campus.univers.cascades` pour Instagram/Facebook).
 */
export const DEFAULT_SOCIAL_LINKS: SiteSocialLink[] = [
    {
        id: 'instagram',
        platform: 'instagram',
        label: 'Instagram',
        handle: '@campus.univers.cascades',
        url: 'https://www.instagram.com/campus.univers.cascades/',
        display_hint: '@campus.univers.cascades',
        brand_color: '#E1306C',
        order_index: 1,
        is_active: true,
        show_in_navbar: true,
        show_in_footer: true,
        show_in_drawer: true,
    },
    {
        id: 'youtube',
        platform: 'youtube',
        label: 'YouTube',
        handle: '@campusuniverscascades',
        url: 'https://www.youtube.com/@campusuniverscascades',
        // Indice d'affichage : DONNÉE de `site_social_links`, jamais une copie FR
        // en dur — sinon il fuite en anglais (repli SSR, segment caché).
        display_hint: '',
        brand_color: '#FF0000',
        order_index: 2,
        is_active: true,
        show_in_navbar: true,
        show_in_footer: true,
        show_in_drawer: true,
    },
    {
        id: 'tiktok',
        platform: 'tiktok',
        label: 'TikTok',
        handle: '@campusuniverscascades',
        url: 'https://www.tiktok.com/@campusuniverscascades',
        display_hint: '@campusuniverscascades',
        brand_color: '#25F4EE',
        order_index: 3,
        is_active: true,
        show_in_navbar: true,
        show_in_footer: true,
        show_in_drawer: true,
    },
    {
        id: 'facebook',
        platform: 'facebook',
        label: 'Facebook',
        handle: '@campus.univers.cascades',
        url: 'https://www.facebook.com/campus.univers.cascades',
        display_hint: '@campus.univers.cascades',
        brand_color: '#1877F2',
        order_index: 4,
        is_active: true,
        show_in_navbar: false,
        show_in_footer: true,
        show_in_drawer: true,
    },
    {
        id: 'whatsapp',
        platform: 'whatsapp',
        label: 'WhatsApp',
        handle: 'CUC Admissions',
        url: 'https://wa.me/33672849492',
        // Idem : « Réponse rapide » vit en base (avec overlay EN `social_link`).
        display_hint: '',
        brand_color: '#25D366',
        order_index: 5,
        is_active: true,
        show_in_navbar: false,
        show_in_footer: true,
        show_in_drawer: true,
    },
];
