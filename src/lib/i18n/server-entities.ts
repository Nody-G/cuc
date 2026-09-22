import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import type { SiteSocialLink } from '@/data/navigation';
import { OVERLAY_ENTITIES, type Locale } from './entities';

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
