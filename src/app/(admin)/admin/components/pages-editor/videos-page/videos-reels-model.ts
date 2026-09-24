/**
 * Domaine de l'éditeur de la page Vidéos : lecture de la section `reels`,
 * opérations pures sur la liste (déplacement, édition, retrait) et fabrique
 * d'un Reel importé. Aucun accès réseau, aucun état React (`AGENTS.md` § 1-2).
 */

import type { SitePageContent } from '@/lib/data/site-service';
import type { InstagramReel } from '@/app/(site)/[locale]/videos-cascadeur/sections/instagram-reels.data';
import { ALL_INSTAGRAM_REELS } from '@/app/(site)/[locale]/videos-cascadeur/sections/instagram-reels.data';

/** Titre par défaut proposé tant que le Cockpit n'a rien écrit. */
export const DEFAULT_REELS_TITLE = "SESSIONS D'ACTION EN FORMAT COURT";

/** Largeurs de grille proposées (2 à 6 colonnes). */
export const REEL_COLUMNS = [2, 3, 4, 5, 6] as const;

/** Nombre de colonnes effectives, repli 6. */
export function resolveColumns(columns: unknown): number {
    return typeof columns === 'number' ? columns : 6;
}

/** Section `sections_data.reels` telle qu'écrite par l'éditeur. */
export function readReelsSection(formData: SitePageContent): {
    title?: string;
    intro?: string;
    columns?: number;
    items?: InstagramReel[];
} {
    return formData.sections_data?.reels || {};
}

/** Liste éditée : les items de la page priment, sinon le catalogue embarqué. */
export function readReelsList(formData: SitePageContent): InstagramReel[] {
    const section = readReelsSection(formData);

    return Array.isArray(section.items) ? section.items : ALL_INSTAGRAM_REELS;
}

/** Reel créé depuis un import Instagram réussi (id horodaté, mis en avant). */
export function createReelFromImport(data: {
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
}): InstagramReel {
    return {
        id: `reel-${Date.now()}`,
        shortcode: data.shortcode,
        url: data.url,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        views: 0,
        viewsFormatted: '',
        date: new Date().toISOString().split('T')[0],
        isFeatured: true,
    };
}

/** Échange un Reel avec son voisin ; liste **inchangée** hors bornes. */
export function moveReel(
    list: InstagramReel[],
    index: number,
    direction: 'up' | 'down'
): InstagramReel[] {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return list;

    const copy = [...list];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    return copy;
}

/** Édition d'un champ d'un Reel, en mise à jour immuable. */
export function updateReelField<K extends keyof InstagramReel>(
    list: InstagramReel[],
    index: number,
    field: K,
    value: InstagramReel[K]
): InstagramReel[] {
    const copy = [...list];
    copy[index] = { ...copy[index], [field]: value };
    return copy;
}

/** Retrait d'un Reel par son index. */
export function removeReel(list: InstagramReel[], index: number): InstagramReel[] {
    return list.filter((_, i) => i !== index);
}

/** Somme des vues déclarées (0 si aucune). */
export function sumReelViews(list: InstagramReel[]): number {
    return list.reduce((sum, reel) => sum + (reel.views || 0), 0);
}

/** Millions de vues, à la française, avec une décimale. */
export function formatMillions(views: number): string {
    return `${(views / 1000000).toFixed(1).replace('.', ',')} M`;
}
