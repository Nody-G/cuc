/**
 * Analyse et indexation d'usage des médias de la vitrine CUC.
 *
 * Module DOMAINE PUR (Directive AGENTS.md § 1) : aucune dépendance UI ni 'use server'.
 * Détecte les emplacements précis (pages, profil coach, discipline, etc.),
 * calcule le nombre d'occurrences et permet le tri par usage.
 */

import type { MediaObject } from '@/app/(admin)/admin/media-shared';

export interface MediaUsageLocation {
    table: string;
    label: string;
    context?: string;
}

export interface MediaUsageItem {
    count: number;
    locations: MediaUsageLocation[];
}

export type MediaUsageIndex = Record<string, MediaUsageItem>;

/** Déduit un libellé lisible pour une ligne d'une table donnée. */
export function getRowEntityLabel(table: string, row: Record<string, unknown>): string {
    const title = typeof row.title === 'string' ? row.title : null;
    const name = typeof row.name === 'string' ? row.name : null;
    const slug = typeof row.slug === 'string' ? row.slug : null;
    const key = typeof row.key === 'string' ? row.key : null;

    switch (table) {
        case 'site_pages':
            return `Page "${title || slug || 'Sans titre'}"`;
        case 'site_team':
            return `Équipe : ${name || 'Membre'}`;
        case 'site_films':
            return `Film : ${title || 'Titre inconnu'}`;
        case 'site_events':
            return `Événement : ${title || 'Sans titre'}`;
        case 'site_partners':
            return `Partenaire : ${name || 'Organisme'}`;
        case 'site_disciplines':
            return `Discipline : ${title || name || 'Atelier'}`;
        case 'site_campus_pois':
            return `Lieu Campus : ${title || name || 'Zone'}`;
        case 'site_sessions':
            return `Session : ${title || 'Stage'}`;
        case 'site_settings':
            return `Configuration : ${key || 'Général'}`;
        case 'site_translations': {
            const ns = typeof row.namespace === 'string' ? row.namespace : '';
            return `Traduction : ${ns}${key ? ` (${key})` : ''}`;
        }
        default:
            return table;
    }
}

/** Qualifie le contexte d'utilisation selon la clé du champ JSON. */
export function getFieldContext(key: string): string | undefined {
    const lower = key.toLowerCase();
    if (lower.includes('hero') || lower.includes('bg_image')) return "Bannière d'en-tête (Hero)";
    if (lower.includes('og_image') || lower.includes('meta')) return 'Partage réseaux (OG)';
    if (lower.includes('portrait') || lower.includes('photo')) return 'Photo de profil';
    if (lower.includes('logo')) return 'Logo';
    if (lower.includes('poster') || lower.includes('affiche') || lower === 'image') return 'Affiche / Visuel';
    if (lower.includes('section') || lower.includes('gallery') || lower.includes('content')) return 'Section / Galerie';
    return undefined;
}

/**
 * Parcourt récursivement une ligne de base de données pour identifier
 * toutes les URLs pointant vers le bucket et leur contexte d'apparition.
 */
export function extractMediaOccurrencesFromRow(
    table: string,
    row: Record<string, unknown>,
    marker: string
): Array<{ path: string; location: MediaUsageLocation }> {
    const results: Array<{ path: string; location: MediaUsageLocation }> = [];
    const entityLabel = getRowEntityLabel(table, row);

    function scanValue(value: unknown, currentContext?: string) {
        if (!value) return;

        if (typeof value === 'string') {
            if (value.includes(marker)) {
                let cursor = 0;
                while (cursor < value.length) {
                    const hit = value.indexOf(marker, cursor);
                    if (hit === -1) break;
                    let end = hit + marker.length;
                    while (end < value.length && !/["'\\\s)]/.test(value[end])) end += 1;
                    const raw = value.slice(hit + marker.length, end);
                    cursor = end;
                    if (!raw) continue;
                    let path = raw;
                    try {
                        path = decodeURIComponent(raw);
                    } catch {
                        /* chemin déjà normalisé */
                    }
                    results.push({
                        path,
                        location: {
                            table,
                            label: entityLabel,
                            context: currentContext,
                        },
                    });
                }
            }
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                scanValue(item, currentContext);
            }
            return;
        }

        if (typeof value === 'object') {
            for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
                const fieldContext = getFieldContext(k) || currentContext;
                scanValue(v, fieldContext);
            }
        }
    }

    scanValue(row);
    return results;
}

/** Construit l'index complet d'usage en agrégeant les occurrences. */
export function buildMediaUsageIndex(
    occurrences: Array<{ path: string; location: MediaUsageLocation }>
): MediaUsageIndex {
    const index: MediaUsageIndex = {};

    for (const { path, location } of occurrences) {
        if (!index[path]) {
            index[path] = { count: 0, locations: [] };
        }
        index[path].count += 1;

        // Déduplication d'emplacements identiques (même libellé et même contexte)
        const exists = index[path].locations.some(
            (loc) => loc.label === location.label && loc.context === location.context
        );
        if (!exists) {
            index[path].locations.push(location);
        }
    }

    return index;
}

/**
 * Trie une liste de fichiers selon leur nombre d'utilisations en base.
 *
 * En ordre 'desc' : les plus utilisés en premier (visuels phares).
 * En ordre 'asc' : les non utilisés (0 utilisation) en premier (détection orphelins).
 * En cas d'égalité : tri alphabétique par nom.
 */
export function sortMediaByUsage(
    files: MediaObject[],
    usageIndex: MediaUsageIndex | null,
    order: 'asc' | 'desc'
): MediaObject[] {
    return [...files].sort((a, b) => {
        const countA = usageIndex?.[a.path]?.count ?? 0;
        const countB = usageIndex?.[b.path]?.count ?? 0;

        if (countA !== countB) {
            return order === 'desc' ? countB - countA : countA - countB;
        }
        return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    });
}
