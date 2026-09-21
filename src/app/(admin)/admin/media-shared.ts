/**
 * Contrats partagés de la médiathèque.
 *
 * Module **pur** (aucun `'use server'`) : un fichier marqué `'use server'`
 * n'accepte que des exports asynchrones, or le client a besoin des types et des
 * petits utilitaires de présentation. D'où cette séparation.
 */

export interface MediaObject {
    name: string;
    /** Chemin relatif à la racine du bucket — clé de toute opération. */
    path: string;
    /** Dossier parent (chaîne vide pour la racine). */
    folder: string;
    url: string;
    size: number;
    mimetype: string;
    createdAt: string | null;
    kind: MediaKind;
}

export type MediaKind = 'image' | 'video' | 'document' | 'other';

export interface MediaFolderStat {
    path: string;
    name: string;
    files: number;
    bytes: number;
}

export interface MediaFolderEntry {
    name: string;
    path: string;
}

/** Nature d'un média, déduite de son extension. */
export function mediaKind(name: string): MediaKind {
    const dot = name.lastIndexOf('.');
    const ext = dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'video';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext)) return 'document';
    return 'other';
}

/** Taille lisible (o / Ko / Mo / Go). */
export function formatBytes(bytes: number): string {
    if (!bytes) return '0 o';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

/** Dernier segment d'un chemin (`media/cuc-visual/001.jpg` → `001.jpg`). */
export function basename(path: string): string {
    return path.split('/').pop() || path;
}

/** Dossier parent d'un chemin. */
export function dirname(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
}

/** Étiquette lisible d'un dossier (`media/cuc-visual` → `cuc-visual`). */
export function folderLabel(path: string): string {
    if (!path) return 'Racine';
    return path.split('/').pop() || path;
}

/**
 * Filtre client : dossier courant + recherche + type.
 * Le tri est fait côté serveur par `listMediaFolder`.
 */
export function filterMedia(
    files: MediaObject[],
    options: { query?: string; kinds?: MediaKind[] } = {}
): MediaObject[] {
    const query = (options.query || '').trim().toLowerCase();
    return files.filter((file) => {
        if (options.kinds?.length && !options.kinds.includes(file.kind)) return false;
        if (!query) return true;
        return file.path.toLowerCase().includes(query);
    });
}
