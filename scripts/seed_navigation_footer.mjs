/**
 * ==============================================================================
 * CUC — Seed : Navigation, Footer & Réseaux Sociaux
 * ==============================================================================
 * Amorce les trois tables `site_navigation`, `site_footer` et `site_social_links`
 * avec les valeurs canoniques actuellement codées en dur dans la vitrine.
 *
 * Doctrine :
 *   - Idempotent : `upsert` sur la clé primaire (`id`), ré-exécutable sans doublon.
 *   - Zéro régression : les valeurs écrites reproduisent EXACTEMENT le rendu
 *     historique (voir `src/data/navigation.ts`).
 *   - Les handles TikTok/YouTube sont unifiés sur `@campusuniverscascades`.
 *
 * Prérequis : exécuter d'abord `scripts/schema_navigation_footer.sql` dans Supabase.
 *
 * Usage : node scripts/seed_navigation_footer.mjs
 * ==============================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv() {
    try {
        const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* environnement déjà fourni */
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// ------------------------------------------------------------------------------
// 1. NAVIGATION PRINCIPALE
// ------------------------------------------------------------------------------
const NAVIGATION_STRUCTURE = {
    items: [
        { id: 'home', label: 'Accueil', href: '/', type: 'link', order: 1, is_visible: true },
        {
            id: 'formations',
            label: 'Formation & Stages',
            type: 'dropdown',
            order: 2,
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
            id: 'campus',
            label: 'Le Campus',
            type: 'dropdown',
            order: 3,
            is_visible: true,
            activeMatchPrefixes: ['/visite-guidee', '/visite-virtuelle'],
            children: [
                {
                    id: 'visite-guidee',
                    label: 'VISITE GUIDÉE',
                    description: 'Découvrez le campus',
                    href: '/visite-guidee',
                    order: 1,
                    is_visible: true,
                },
                {
                    id: 'visite-virtuelle',
                    label: 'VISITE VIRTUELLE',
                    description: 'Immersion 360°',
                    href: '/visite-virtuelle',
                    order: 2,
                    is_visible: true,
                },
            ],
        },
        {
            id: 'equipe',
            label: 'Équipe & Tournages',
            type: 'dropdown',
            order: 4,
            is_visible: true,
            activeMatchPrefixes: ['/equipe-cascadeurs-pro', '/cuc-team-cascadeur'],
            children: [
                {
                    id: 'equipe-pro',
                    label: 'ÉQUIPE DE CASCADEURS',
                    description: 'Coachs et professionnels du cinéma',
                    href: '/equipe-cascadeurs-pro',
                    order: 1,
                    is_visible: true,
                },
                {
                    id: 'cuc-team',
                    label: 'CUC STUNT TEAM',
                    description: 'Prestations et tournages',
                    href: '/cuc-team-cascadeur',
                    order: 2,
                    is_visible: true,
                },
            ],
        },
        {
            id: 'videos',
            label: 'Vidéos',
            href: '/videos-cascadeur',
            type: 'link',
            order: 5,
            is_visible: true,
        },
        {
            id: 'contact',
            label: 'Contact',
            href: '/contact-cuc',
            type: 'link',
            order: 6,
            is_visible: true,
        },
    ],
    cta: { label: 'Contact & Projets', href: '/contact-cuc' },
};

// ------------------------------------------------------------------------------
// 2. PIED DE PAGE
// ------------------------------------------------------------------------------
const FOOTER_STRUCTURE = {
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
                { id: 'formation-pro-2ans', label: 'Formation Pro 2 ans', href: '/formation-de-cascadeur', order: 1, is_visible: true },
                { id: 'formule-decouverte', label: 'Formule Découverte (12j)', href: '/formation-de-cascadeur', order: 2, is_visible: true },
                { id: 'stages-weekend', label: 'Stages Week-end (250€)', href: '/stages-cascades-parkour-2', order: 3, is_visible: true },
                { id: 'afdas', label: 'Prise en charge AFDAS', href: '/stages-cascades-parkour-2', order: 4, is_visible: true },
                { id: 'workshop-international', label: 'International Workshop', href: '/stunt-workshop-cuc', order: 5, is_visible: true },
            ],
        },
        {
            id: 'campus',
            title: 'Le Campus',
            order: 2,
            is_visible: true,
            links: [
                { id: 'visite-guidee-campus', label: 'Visite Guidée du Campus', href: '/visite-guidee', order: 1, is_visible: true },
                { id: 'visite-virtuelle-360', label: 'Visite Virtuelle 360°', href: '/visite-virtuelle', order: 2, is_visible: true },
                { id: 'videos-cascadeur', label: 'Vidéos & Démos', href: '/videos-cascadeur', order: 3, is_visible: true },
            ],
        },
        {
            id: 'equipe',
            title: 'Équipe & Tournages',
            order: 3,
            is_visible: true,
            links: [
                { id: 'equipe-cascadeurs', label: 'Équipe de Cascadeurs', href: '/equipe-cascadeurs-pro', order: 1, is_visible: true },
                { id: 'cuc-stunt-team', label: 'CUC Stunt Team', href: '/cuc-team-cascadeur', order: 2, is_visible: true },
                { id: 'team-building', label: 'Team Building', href: '/team-building-cascades', order: 3, is_visible: true },
            ],
        },
        {
            id: 'contact',
            title: 'Contact & Accès',
            order: 4,
            is_visible: true,
            links: [
                { id: 'contact-cuc', label: 'Nous Contacter', href: '/contact-cuc', order: 1, is_visible: true },
                { id: 'candidature', label: 'Candidater', href: '/contact-cuc', order: 2, is_visible: true },
            ],
        },
    ],
    legal: {
        copyright:
            '© 2008-{year} Campus Univers Cascades — Tous droits réservés. Organisme certifié Qualiopi.',
        links: [
            { id: 'mentions-legales', label: 'Mentions Légales', href: '/mentions-legales', order: 1, is_visible: true },
            { id: 'reglement', label: 'Règlement & Inscriptions', href: '/contact-cuc', order: 2, is_visible: true },
        ],
    },
};

// ------------------------------------------------------------------------------
// 3. RÉSEAUX SOCIAUX (handles unifiés)
// ------------------------------------------------------------------------------
const SOCIAL_LINKS = [
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
        display_hint: 'Chaîne Stunt Team',
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
        display_hint: 'Réponse rapide',
        brand_color: '#25D366',
        order_index: 5,
        is_active: true,
        show_in_navbar: false,
        show_in_footer: true,
        show_in_drawer: true,
    },
];

// ------------------------------------------------------------------------------
// EXÉCUTION
// ------------------------------------------------------------------------------
const now = new Date().toISOString();
let failures = 0;

// 1. Navigation
{
    const { error } = await supabase.from('site_navigation').upsert(
        {
            id: 'main',
            label: 'Navigation principale',
            structure: NAVIGATION_STRUCTURE,
            is_published: true,
            updated_at: now,
        },
        { onConflict: 'id' }
    );
    if (error) {
        failures++;
        console.error('✗ site_navigation :', error.message);
    } else {
        console.log(`✓ site_navigation — ${NAVIGATION_STRUCTURE.items.length} entrées de premier niveau`);
    }
}

// 2. Footer
{
    const { error } = await supabase.from('site_footer').upsert(
        {
            id: 'main',
            label: 'Pied de page principal',
            structure: FOOTER_STRUCTURE,
            is_published: true,
            updated_at: now,
        },
        { onConflict: 'id' }
    );
    if (error) {
        failures++;
        console.error('✗ site_footer :', error.message);
    } else {
        console.log(`✓ site_footer — ${FOOTER_STRUCTURE.columns.length} colonnes`);
    }
}

// 3. Réseaux sociaux
{
    const { error } = await supabase.from('site_social_links').upsert(
        SOCIAL_LINKS.map((link) => ({ ...link, updated_at: now })),
        { onConflict: 'id' }
    );
    if (error) {
        failures++;
        console.error('✗ site_social_links :', error.message);
    } else {
        console.log(`✓ site_social_links — ${SOCIAL_LINKS.length} réseaux`);
    }
}

console.log('');
if (failures > 0) {
    console.error(`${failures} table(s) en échec. Vérifiez que le schéma a bien été appliqué.`);
    process.exit(1);
}
console.log('Seed terminé. La vitrine reflète désormais ces valeurs (Realtime actif).');
