/**
 * Domaine « Reels » de la page Vidéos — fonctions pures, déterministes et
 * testables hors cycle de vie UI (couche « Domaine & Services », AGENTS.md § 1).
 *
 * Aucun état, aucun accès réseau : uniquement la composition et le tri de listes.
 */
import type { InstagramReel, ReelSortOption } from '@/data/instagram-reels';

/** Bornes du sélecteur de colonnes (2 à 6). */
export const MIN_REEL_COLUMNS = 2;
export const MAX_REEL_COLUMNS = 6;

/**
 * Fusionne les Reels mis en avant (copie éditable du Cockpit) et le catalogue.
 * Le dédoublonnage se fait par `shortcode` : un même Reel ne peut donc jamais
 * apparaître deux fois, même s'il figure aussi dans le catalogue complet.
 */
export function mergeReels(
    featured: readonly InstagramReel[],
    catalogue: readonly InstagramReel[],
): InstagramReel[] {
    const seen = new Set(featured.map((reel) => reel.shortcode));
    const featuredList = featured.map((reel) => ({ ...reel, isFeatured: true }));
    const others = catalogue.filter((reel) => !seen.has(reel.shortcode));
    return [...featuredList, ...others];
}

/**
 * Applique le tri d'affichage. Copie immuable (le tableau reçu n'est jamais
 * réordonné sur place). Un tri par date sur des Reels sans date relevée
 * conserve l'ordre d'entrée.
 */
export function sortReels(reels: readonly InstagramReel[], sortBy: ReelSortOption): InstagramReel[] {
    const list = [...reels];
    switch (sortBy) {
        case 'views':
            return list.sort((a, b) => (b.views || 0) - (a.views || 0));
        case 'recent':
            return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        case 'oldest':
            return list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        case 'featured':
        default:
            return list;
    }
}

/** Somme des vues des Reels fournis (les Reels sans relevé comptent pour 0). */
export function sumReelsViews(reels: readonly InstagramReel[]): number {
    return reels.reduce((total, reel) => total + (reel.views || 0), 0);
}

/** Nombre de colonnes affichées, borné à [2, 6]. */
export function clampReelColumns(columns: number | undefined): number {
    if (!columns) return MAX_REEL_COLUMNS;
    return Math.min(Math.max(columns, MIN_REEL_COLUMNS), MAX_REEL_COLUMNS);
}

/** Taille de la première tranche : une rangée complète de `columns`. */
export function initialVisibleCount(columns: number): number {
    return clampReelColumns(columns);
}

/** Pas de pagination « Voir plus » : deux rangées, au minimum 6 Reels. */
export function loadMoreStep(columns: number): number {
    return Math.max(clampReelColumns(columns) * 2, 6);
}
