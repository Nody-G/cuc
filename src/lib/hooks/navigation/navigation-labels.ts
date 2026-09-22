/**
 * Helpers de localisation de la navigation / du pied de page : locale d'URL,
 * chargement de l'overlay `site_translations` et application aux structures.
 */

import { createClient } from '@/lib/supabase/client';
import { DEFAULT_FOOTER, type FooterStructure } from '@/data/navigation';

/** Locale déduite de l'URL (la vitrine vit sous `/[locale]`). */
export function currentLocale(): 'fr' | 'en' {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/en')) return 'en';
    return 'fr';
}

/**
 * Charge l'overlay de libellés depuis `site_translations` (payload.labels).
 * Repli FR automatique si la traduction est absente (retourne `null`).
 */
export async function fetchLabelOverlay(
    supabase: ReturnType<typeof createClient>,
    entity: string,
    entityId: string,
    locale: string
): Promise<Record<string, string> | null> {
    if (locale === 'fr') return null;
    try {
        const { data } = await supabase
            .from('site_translations')
            .select('payload')
            .eq('entity', entity)
            .eq('entity_id', entityId)
            .eq('locale', locale)
            .eq('is_published', true)
            .maybeSingle();
        const labels = (data?.payload as { labels?: Record<string, string> } | null)?.labels;
        return labels && typeof labels === 'object' ? labels : null;
    } catch {
        return null;
    }
}

/** Applique les libellés traduits aux items de navigation (et leurs enfants). */
export function applyItemLabels(items: any[], labels: Record<string, string> | null): any[] {
    if (!labels) return items;
    return items.map((item) => ({
        ...item,
        label: labels[item.id] || item.label,
        children: Array.isArray(item.children)
            ? item.children.map((c: any) => ({ ...c, label: labels[c.id] || c.label }))
            : item.children,
    }));
}

/**
 * Applique les libellés traduits à la structure du pied de page.
 *
 * Conventions de clés (payload `labels` de `site_translations`) :
 *   - `[col.id]` / `[link.id]` : titres de colonnes et libellés de liens ;
 *   - `brand.tagline` / `brand.description` : signature et description de marque ;
 *   - `legal.copyright` / `legal.[link.id]` : barre légale.
 *
 * Une clé absente laisse le français : l'anglais ne remplace jamais par du vide.
 */
export function applyFooterLabels(
    structure: FooterStructure,
    labels: Record<string, string> | null
): FooterStructure {
    const brand = structure.brand || DEFAULT_FOOTER.structure.brand;
    const legal = structure.legal || DEFAULT_FOOTER.structure.legal;

    const columns = labels
        ? (structure.columns ?? []).map((col) => ({
            ...col,
            title: labels[col.id] || col.title,
            links: Array.isArray(col.links)
                ? col.links.map((link) => ({ ...link, label: labels[link.id] || link.label }))
                : col.links,
        }))
        : structure.columns;

    return {
        columns,
        brand: labels
            ? {
                ...brand,
                tagline: labels['brand.tagline'] || brand.tagline,
                description: labels['brand.description'] || brand.description,
            }
            : brand,
        legal: labels
            ? {
                ...legal,
                copyright: labels['legal.copyright'] || legal.copyright,
                links: Array.isArray(legal.links)
                    ? legal.links.map((link) => ({
                        ...link,
                        label: labels[`legal.${link.id}`] || labels[link.id] || link.label,
                    }))
                    : legal.links,
            }
            : legal,
    };
}
