import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import type { SiteSocialLink } from '@/data/navigation';
import {
    DEFAULT_FOOTER,
    DEFAULT_NAVIGATION,
    type FooterStructure,
    type NavigationStructure,
} from '@/data/navigation';
import { OVERLAY_ENTITIES, type Locale } from './entities';
import { mergeLocalized } from './localized-merge';

/**
 * ==============================================================================
 * Résolution SERVEUR de la localisation — fin du flash de français
 * ==============================================================================
 * Le contenu de la vitrine était chargé côté navigateur en deux temps : d'abord
 * le français, puis l'overlay EN. D'où le français affiché une fraction de
 * seconde. Ici, la fusion FR + EN se fait **sur le serveur, en une passe**, et le
 * résultat part directement dans le HTML : le premier pixel est déjà dans la
 * bonne langue.
 *
 * Cache (doctrine Next 16 — `unstable_cache` a été remplacé par la directive) :
 *   - `'use cache'` + `cacheLife('max')` : le contenu éditorial ne change que sur
 *     action humaine, on l'invalide donc par TAG plutôt que par le temps ;
 *   - `cacheTag(...)` : chaque lecture est étiquetée, ce qui permet au Cockpit
 *     d'invalider précisément (`revalidateTag('site_pages')`).
 *
 * Aucune API de requête (`cookies`, `headers`) n'est lue ici : les fonctions
 * restent donc cacheables et prérendables.
 */

/**
 * La fusion FR + overlay vit désormais dans `lib/i18n/localized-merge.ts` :
 * elle est partagée avec le client (`usePageDynamicContent`) et avec l'éditeur
 * bilingue du Cockpit, ce qui garantit qu'un même overlay produit exactement le
 * même rendu sur la vitrine, dans l'aperçu et dans le formulaire de traduction.
 */

/** Lit l'overlay EN d'une entité (ou null si absent). */
async function fetchOverlay(
    entity: string,
    entityId: string,
    locale: Locale
): Promise<Record<string, unknown> | null> {
    if (locale === 'fr') return null; // le français est la source : aucun overlay
    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('site_translations')
        .select('payload')
        .eq('entity', entity)
        .eq('entity_id', entityId)
        .eq('locale', locale)
        .eq('is_published', true)
        .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as Record<string, unknown>;
}

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

/**
 * Contenu d'une page, DÉJÀ localisé (FR fusionné avec l'overlay EN).
 * Retourne `null` si la page n'existe pas en base.
 */
export async function getLocalizedPageContent(
    slug: string,
    locale: Locale = 'fr'
): Promise<SitePageContent | null> {
    'use cache';
    cacheLife('max');
    const cleanSlug = normalizeSlug(slug);
    cacheTag('site_pages', 'site_translations', `page:${cleanSlug}`, `locale:${locale}`);

    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('site_pages')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

    if (error || !data) return null;

    const base = data as SitePageContent;
    const overlay = await fetchOverlay('page', cleanSlug, locale);
    if (!overlay) return base;

    return mergeLocalized(base, overlay);
}

/* ------------------------------------------------------------------ *
 * Navigation & pied de page
 * ------------------------------------------------------------------ */

import type { LocalizedChromeData } from '@/components/i18n/SiteDataProvider';

interface ChromeData {
    structure: NavigationStructure | FooterStructure;
    labels: Record<string, string> | null;
}

async function getChrome(
    entity: 'navigation' | 'footer',
    id: string,
    locale: Locale
): Promise<ChromeData | null> {
    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from(entity === 'navigation' ? 'site_navigation' : 'site_footer')
        .select('structure, is_published')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();

    const overlay = await fetchOverlay(entity, id, locale);
    const labels = (overlay?.labels as Record<string, string> | undefined) ?? null;

    if (error || !data?.structure) {
        // Repli statique : les libellés traduits restent applicables.
        const fallback =
            entity === 'navigation'
                ? DEFAULT_NAVIGATION.structure
                : DEFAULT_FOOTER.structure;
        return { structure: fallback as NavigationStructure | FooterStructure, labels };
    }

    return { structure: data.structure as NavigationStructure | FooterStructure, labels };
}

/** Navigation principale, libellés EN inclus (résolus sur le serveur). */
export async function getLocalizedNavigation(
    id = 'main',
    locale: Locale = 'fr'
): Promise<LocalizedChromeData<NavigationStructure>> {
    'use cache';
    cacheLife('max');
    cacheTag('site_navigation', 'site_translations', `navigation:${id}`, `locale:${locale}`);
    const chrome = await getChrome('navigation', id, locale);
    return {
        structure: (chrome?.structure ?? DEFAULT_NAVIGATION.structure) as NavigationStructure,
        labels: chrome?.labels ?? null,
    };
}

/** Pied de page, libellés EN inclus (résolus sur le serveur). */
export async function getLocalizedFooterChrome(
    id = 'main',
    locale: Locale = 'fr'
): Promise<LocalizedChromeData<FooterStructure>> {
    'use cache';
    cacheLife('max');
    cacheTag('site_footer', 'site_translations', `footer:${id}`, `locale:${locale}`);
    const chrome = await getChrome('footer', id, locale);
    return {
        structure: (chrome?.structure ?? DEFAULT_FOOTER.structure) as FooterStructure,
        labels: chrome?.labels ?? null,
    };
}

/* ------------------------------------------------------------------ *
 * Collections (coachs, films, programmes, disciplines…)
 * ------------------------------------------------------------------ */

/**
 * Overlays EN d'une collection, indexés par identifiant.
 * Les lignes restent lues côté client quand c'est nécessaire (Realtime), mais
 * leur traduction est fournie immédiatement : plus d'attente, plus de flash.
 */
export async function getEntityOverlays(
    entity: string,
    locale: Locale = 'fr'
): Promise<Record<string, Record<string, unknown>>> {
    'use cache';
    cacheLife('max');
    cacheTag('site_translations', `entity:${entity}`, `locale:${locale}`);

    if (locale === 'fr' || !OVERLAY_ENTITIES.includes(entity)) return {};

    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('site_translations')
        .select('entity_id, payload')
        .eq('entity', entity)
        .eq('locale', locale)
        .eq('is_published', true);

    if (error || !data) return {};
    return Object.fromEntries(
        (data as { entity_id: string; payload: Record<string, unknown> }[]).map((row) => [
            row.entity_id,
            row.payload ?? {},
        ])
    );
}

/**
 * Réseaux sociaux officiels, DÉJÀ localisés (FR + overlay EN `social_link`).
 *
 * Résolus sur le serveur comme la navigation et le pied de page : sans cela,
 * le premier rendu HTML (barre collante, footer) affichait les indices FR
 * (« Réponse rapide ») même en mode anglais.
 */
export async function getLocalizedSocialLinks(
    locale: Locale = 'fr'
): Promise<SiteSocialLink[]> {
    'use cache';
    cacheLife('max');
    cacheTag('site_social_links', 'site_translations', `social:${locale}`, `locale:${locale}`);

    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('site_social_links')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error || !data) return [];

    const overlays = await getEntityOverlays('social_link', locale);

    return (data as (SiteSocialLink & { id: string })[]).map((row) => {
        const overlay = overlays[row.id] ?? {};
        return {
            id: row.id,
            platform: row.platform,
            label: (overlay.label as string) || row.label,
            handle: row.handle || undefined,
            url: row.url,
            display_hint: (overlay.display_hint as string) || row.display_hint || undefined,
            brand_color: row.brand_color || undefined,
            order_index: row.order_index ?? 0,
            is_active: row.is_active ?? true,
            show_in_navbar: row.show_in_navbar ?? true,
            show_in_footer: row.show_in_footer ?? true,
            show_in_drawer: row.show_in_drawer ?? true,
        };
    });
}
