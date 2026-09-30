/**
 * Compression d'image côté navigateur — service d'exécution.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : ce module fait le travail
 * que le serveur ne peut pas faire. Il existe parce que la pile refuse les
 * fichiers volumineux *avant* l'action serveur — 1 Mo pour une Server Action
 * (`serverActions.bodySizeLimit` par défaut), 4,5 Mo pour une fonction
 * serverless. Une photo de téléphone n'atteint donc jamais le serveur : c'est
 * ici qu'elle maigrit.
 *
 * Règle de conduite : **ne jamais bloquer un import**. Si le décodage échoue,
 * si le navigateur n'encode pas le WebP, ou si le dérivé n'apporte pas un gain
 * franc, on renvoie le fichier d'origine avec la raison exacte. Le pire résultat
 * acceptable est « rien n'a changé », jamais « le fichier est perdu ».
 *
 * Le canvas ré-encode l'image : les métadonnées EXIF disparaissent au passage,
 * et l'orientation est appliquée au décodage (`imageOrientation: 'from-image'`).
 */

import {
    compressionGain,
    extensionOf,
    isRasterCompressible,
    planCompression,
    targetBox,
    shouldKeepCompressed,
    type CompressionPlanReason,
    type SourceImageInfo,
} from './image-compression.plan';
import type { CompressionProfile } from './media-policy';
import { compressViaWorker, workerAvailable } from './image-compression.worker-client';

const WEBP_MIME = 'image/webp';

export type CompressionOutcome =
    | CompressionPlanReason
    | 'decode-failed'
    | 'encode-failed'
    | 'no-gain'
    | 'unsupported-browser';

export interface CompressedImage {
    /** Contenu réellement téléversé : le dérivé WebP, ou le fichier d'origine. */
    blob: Blob;
    bytes: number;
    /** Dimensions du contenu téléversé — `0` quand rien n'a été décodé. */
    width: number;
    height: number;
    mime: string;
    extension: string;
    /** `true` seulement si `blob` est le dérivé WebP. */
    compressed: boolean;
    reason: CompressionOutcome;
    sourceBytes: number;
    sourceWidth: number;
    sourceHeight: number;
    /** Libellé court du gain (`-94 %`) — `0 %` quand rien n'a changé. */
    gainLabel: string;
}

export interface CompressionProgress {
    index: number;
    total: number;
    fileName: string;
    result: CompressedImage;
}

/** Le navigateur peut-il décoder et réencoder une image ? */
export function canCompressInBrowser(): boolean {
    const hasDecoder = typeof createImageBitmap === 'function';
    const hasCanvas =
        typeof OffscreenCanvas === 'function' ||
        (typeof document !== 'undefined' && typeof document.createElement === 'function');
    return hasDecoder && hasCanvas;
}

function describeKind(file: File): string {
    return file.type || (extensionOf(file.name) ? `.${extensionOf(file.name)}` : '');
}

/** Résultat « rien n'a changé » : le blob téléversé est le fichier d'origine. */
function passthrough(file: File, reason: CompressionOutcome): CompressedImage {
    return {
        blob: file,
        bytes: file.size,
        width: 0,
        height: 0,
        mime: describeKind(file) || 'application/octet-stream',
        extension: extensionOf(file.name),
        compressed: false,
        reason,
        sourceBytes: file.size,
        sourceWidth: 0,
        sourceHeight: 0,
        gainLabel: '0 %',
    };
}

interface DecodedImage {
    source: CanvasImageSource;
    width: number;
    height: number;
    release: () => void;
}

/**
 * Décode le fichier, orientation EXIF appliquée. Deux décodeurs : le bitmap
 * natif d'abord, puis, pour les navigateurs qui l'ignorent, un élément image
 * hors flux — jamais rendu, donc jamais soumis à la règle `next/image` du site.
 */
async function decode(file: File): Promise<DecodedImage> {
    if (typeof createImageBitmap === 'function') {
        try {
            const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
            return {
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                release: () => bitmap.close?.(),
            };
        } catch {
            // Certains navigateurs refusent les options d'orientation : on retente
            // sans elles avant de basculer sur le décodeur de repli.
            try {
                const bitmap = await createImageBitmap(file);
                return {
                    source: bitmap,
                    width: bitmap.width,
                    height: bitmap.height,
                    release: () => bitmap.close?.(),
                };
            } catch {
                /* repli ci-dessous */
            }
        }
    }

    if (typeof document === 'undefined') throw new Error('decode-failed');

    const url = URL.createObjectURL(file);
    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const element = new Image();
            element.onload = () => resolve(element);
            element.onerror = () => reject(new Error('decode-failed'));
            element.src = url;
        });
        return {
            source: image,
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
            release: () => URL.revokeObjectURL(url),
        };
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }
}

type DrawableCanvas = OffscreenCanvas | HTMLCanvasElement;
type DrawableContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function createCanvas(width: number, height: number): { canvas: DrawableCanvas; context: DrawableContext } {
    if (typeof OffscreenCanvas === 'function') {
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');
        if (context) return { canvas, context };
    }
    if (typeof document === 'undefined') throw new Error('decode-failed');

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('decode-failed');
    return { canvas, context };
}

/** Encode le canvas en WebP ; renvoie `null` si le navigateur ne sait pas le faire. */
async function encodeWebp(canvas: DrawableCanvas, quality: number): Promise<Blob | null> {
    if ('convertToBlob' in canvas) {
        try {
            return await canvas.convertToBlob({ type: WEBP_MIME, quality });
        } catch {
            return null;
        }
    }
    return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), WEBP_MIME, quality);
    });
}

/**
 * Compresse un fichier selon son profil, sur le fil principal. Ne lève jamais :
 * toute défaillance produit un résultat « fichier d'origine », avec la raison.
 *
 * C'est cette fonction que le worker appelle : elle ne doit donc jamais
 * chercher à créer un worker à son tour (récursion).
 */
export async function compressImageInline(file: File, profile: CompressionProfile): Promise<CompressedImage> {
    if (profile.id === 'passthrough') return passthrough(file, 'profile-is-passthrough');
    if (!isRasterCompressible(file.type, file.name)) return passthrough(file, 'not-a-raster-image');
    if (!canCompressInBrowser()) return passthrough(file, 'unsupported-browser');

    let decoded: DecodedImage;
    try {
        decoded = await decode(file);
    } catch {
        return passthrough(file, 'decode-failed');
    }

    try {
        const info: SourceImageInfo = {
            bytes: file.size,
            width: decoded.width,
            height: decoded.height,
            mime: file.type,
            name: file.name,
        };
        const decision = planCompression(info, profile);
        if (!decision.compress) return passthrough(file, decision.reason);

        const box = decision.box ?? targetBox(info, profile.maxLongEdge);
        const { canvas, context } = createCanvas(box.width, box.height);
        context.drawImage(decoded.source, 0, 0, box.width, box.height);

        const blob = await encodeWebp(canvas, profile.quality);
        // Un navigateur sans encodeur WebP rend un PNG : le garder grossirait
        // le fichier, on préfère conserver l'original.
        if (!blob || blob.type !== WEBP_MIME) return passthrough(file, 'encode-failed');
        if (!shouldKeepCompressed(file.size, blob.size)) return passthrough(file, 'no-gain');

        return {
            blob,
            bytes: blob.size,
            width: box.width,
            height: box.height,
            mime: WEBP_MIME,
            extension: 'webp',
            compressed: true,
            reason: 'compressible',
            sourceBytes: file.size,
            sourceWidth: decoded.width,
            sourceHeight: decoded.height,
            gainLabel: compressionGain(file.size, blob.size).label,
        };
    } catch {
        return passthrough(file, 'encode-failed');
    } finally {
        decoded.release();
    }
}

/** Compresse une liste en série, en signalant chaque résultat. */
export async function compressImages(
    files: readonly File[],
    profileFor: (fileName: string) => CompressionProfile,
    onProgress?: (progress: CompressionProgress) => void,
): Promise<CompressedImage[]> {
    const results: CompressedImage[] = [];
    for (const [index, file] of files.entries()) {
        const result = await compressImage(file, profileFor(file.name));
        results.push(result);
        onProgress?.({ index: index + 1, total: files.length, fileName: file.name, result });
    }
    return results;
}


/** Compresse en tentant le worker, puis en ligne s'il fait défaut. */
export async function compressImage(file: File, profile: CompressionProfile): Promise<CompressedImage> {
    if (workerAvailable()) {
        try {
            return await compressViaWorker(file, profile);
        } catch {
            /* repli en ligne ci-dessous */
        }
    }
    return compressImageInline(file, profile);
}
