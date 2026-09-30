/**
 * Domaine pur de la compression d'image — décisions, sans entrée/sortie.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions déterministes,
 * typées, testables hors du cycle de vie UI. Aucun `canvas`, aucun `Blob`,
 * aucun `sharp` ici : ce fichier dit *ce qu'il faut faire* ; l'exécution
 * navigateur vit dans `image-compression.client.ts`.
 */

import type { CompressionProfile, CompressionProfileId } from './media-policy';

export interface SourceImageInfo {
    bytes: number;
    width: number;
    height: number;
    mime: string;
    name: string;
}

export interface TargetBox {
    width: number;
    height: number;
    /** Facteur appliqué (1 = aucun redimensionnement). */
    scale: number;
}

export type CompressionPlanReason =
    | 'compressible'
    | 'not-a-raster-image'
    | 'profile-is-passthrough'
    | 'already-lean';

export interface CompressionDecision {
    compress: boolean;
    reason: CompressionPlanReason;
    profileId: CompressionProfileId;
    /** Boîte cible, `null` quand aucun redimensionnement n'a été calculé. */
    box: TargetBox | null;
}

export interface CompressionGain {
    savedBytes: number;
    /** Part réellement économisée, entre 0 et 1. */
    ratio: number;
    /** Libellé court pour l'UI (`-94 %`, `+3 %`, `0 %`). */
    label: string;
}

/** Gain minimal exigé pour remplacer l'original par le dérivé. */
export const MIN_GAIN_RATIO = 0.1;
/** En dessous de ce poids, une image déjà bien dimensionnée n'est pas réencodée. */
export const LEAN_FLOOR_BYTES = 120_000;

/** Types qui traversent la chaîne sans réencodage (animation, vectoriel, déjà AVIF). */
const PASSTHROUGH_MIMES = new Set(['image/gif', 'image/svg+xml', 'image/avif']);

/**
 * Une image est réencodable si c'est un raster non animé. Le repli par
 * extension couvre les navigateurs qui n'annoncent pas le type MIME.
 */
export function isRasterCompressible(mime: string, name = ''): boolean {
    const normalized = (mime || '').toLowerCase().trim();
    if (PASSTHROUGH_MIMES.has(normalized)) return false;
    if (normalized === 'image/jpeg' || normalized === 'image/png' || normalized === 'image/webp') return true;
    if (!normalized) return /\.(jpe?g|png|webp)$/i.test(name);
    return false;
}

/** Boîte cible : jamais d'agrandissement, jamais de dimension nulle. */
export function targetBox(source: { width: number; height: number }, maxLongEdge: number): TargetBox {
    const longEdge = Math.max(source.width, source.height);
    if (maxLongEdge <= 0 || longEdge <= 0 || longEdge <= maxLongEdge) {
        return { width: source.width, height: source.height, scale: 1 };
    }
    const scale = maxLongEdge / longEdge;
    return {
        width: Math.max(1, Math.round(source.width * scale)),
        height: Math.max(1, Math.round(source.height * scale)),
        scale,
    };
}

/** Image déjà légère et déjà correctement dimensionnée : réencoder n'apporte rien. */
export function isAlreadyLean(
    source: Pick<SourceImageInfo, 'bytes' | 'width' | 'height'>,
    profile: CompressionProfile,
    floorBytes = LEAN_FLOOR_BYTES,
): boolean {
    if (source.bytes > floorBytes) return false;
    return targetBox(source, profile.maxLongEdge).scale === 1;
}

/** Décision complète pour un fichier et un profil. */
export function planCompression(source: SourceImageInfo, profile: CompressionProfile): CompressionDecision {
    if (profile.id === 'passthrough') {
        return { compress: false, reason: 'profile-is-passthrough', profileId: profile.id, box: null };
    }
    if (!isRasterCompressible(source.mime, source.name)) {
        return { compress: false, reason: 'not-a-raster-image', profileId: profile.id, box: null };
    }
    const box = targetBox(source, profile.maxLongEdge);
    if (isAlreadyLean(source, profile)) {
        return { compress: false, reason: 'already-lean', profileId: profile.id, box };
    }
    return { compress: true, reason: 'compressible', profileId: profile.id, box };
}

/** Économie mesurée entre deux poids, jamais négative dans `savedBytes`. */
export function compressionGain(before: number, after: number): CompressionGain {
    const safeBefore = Math.max(0, before);
    const safeAfter = Math.max(0, after);
    const delta = safeBefore - safeAfter;
    const percent = safeBefore === 0 ? 0 : Math.round((Math.abs(delta) / safeBefore) * 100);
    return {
        savedBytes: Math.max(0, delta),
        ratio: safeBefore === 0 ? 0 : Math.max(0, delta) / safeBefore,
        label: delta === 0 ? '0 %' : `${delta > 0 ? '-' : '+'}${percent} %`,
    };
}

/**
 * Faut-il conserver le dérivé ? Oui seulement s'il fait vraiment maigrir le
 * fichier : remplacer une image par une version à peine plus légère perdrait
 * de la qualité pour rien.
 */
export function shouldKeepCompressed(before: number, after: number, minRatio = MIN_GAIN_RATIO): boolean {
    if (before <= 0 || after <= 0) return false;
    return after < before * (1 - minRatio);
}

/** Extension finale d'un nom de fichier (`photo.jpg` → `jpg`). */
export function extensionOf(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase();
}

/** Remplace l'extension (`photo.jpg`, `webp` → `photo.webp`). */
export function replaceExtension(name: string, extension: string): string {
    const dot = name.lastIndexOf('.');
    const base = dot <= 0 ? name : name.slice(0, dot);
    return `${base}.${extension}`;
}

/**
 * Normalise un nom de fichier pour le stockage : accents retirés, minuscules,
 * tout ce qui n'est pas `a-z0-9.-` remplacé par `_`. Contrat historique de la
 * médiathèque, désormais partagé client/serveur au lieu d'être dupliqué.
 */
export function sanitizeFileName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_');
}

/** Nom final du dérivé servi : le master stocké est toujours un WebP. */
export function webpFileName(name: string): string {
    return replaceExtension(sanitizeFileName(name), 'webp');
}

/** Nom du négatif conservé : on garde l'extension d'origine du fichier reçu. */
export function originalFileName(name: string): string {
    return sanitizeFileName(name);
}

/** Chemin horodaté, contrat de nommage de la médiathèque (`<ts>_<nom>`). */
export function stampedPath(folder: string, name: string, timestamp: number): string {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const fileName = `${timestamp}_${name}`;
    return cleanFolder ? `${cleanFolder}/${fileName}` : fileName;
}
