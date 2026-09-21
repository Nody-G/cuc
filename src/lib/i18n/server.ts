import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import {
    DEFAULT_FOOTER,
    DEFAULT_NAVIGATION,
    type FooterStructure,
    type NavigationStructure,
} from '@/data/navigation';
import { OVERLAY_ENTITIES, type Locale } from './entities';

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

/** Fusion récursive : l'overlay écrase le FR, les tableaux non vides remplacent. */
function mergeLocalized<T>(base: T, overlay: unknown): T {
    if (overlay === null || overlay === undefined) return base;
    if (Array.isArray(overlay)) return (overlay.length > 0 ? overlay : base) as T;
    if (typeof overlay === 'object') {
        if (typeof base !== 'object' || base === null || Array.isArray(base)) {
            return overlay as T;
        }
        const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
        for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
            out[key] = key in out ? mergeLocalized(out[key], value) : value;
        }
        return out as T;
    }
    // Scalaire : une valeur vide ne doit jamais effacer le français.
    if (overlay === '' || overlay === null) return base;
    return overlay as T;
}

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
