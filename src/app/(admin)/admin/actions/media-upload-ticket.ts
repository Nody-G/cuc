'use server';

/**
 * Ticket de téléversement direct vers Supabase Storage.
 *
 * Pourquoi cette Server Action existe alors que `uploadMediaFile` fait déjà le
 * travail : elle ne peut plus le faire. Le corps d'une Server Action est
 * plafonné à 1 Mo par Next.js (`serverActions.bodySizeLimit` par défaut) et
 * celui d'une fonction serverless à 4,5 Mo — une photo de téléphone n'atteint
 * donc jamais le serveur. Le navigateur compresse, demande ici une autorisation
 * signée, puis dépose lui-même le contenu dans le bucket. Le serveur reste
 * autoritaire : il valide la nature, le type MIME, le plafond et le chemin, et
 * refuse tout ce qui dépasse.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1). Règles de décision :
 *  - la nature du média et son plafond viennent de `media-policy` (source unique) ;
 *  - le nom et le chemin viennent de `image-compression.plan` (mêmes fonctions
 *    pures que le client, donc aucun risque de divergence de nommage) ;
 *  - les préfixes réservés (`_originals`, `_trash`) sont calculés par le
 *    serveur, jamais dictés par le client.
 */

import { getCurrentUserProfile } from './auth';
import { reportMediaFailure } from './media-failures';
import { MEDIA_BUCKET } from './media-internals';

import { createAdminClient } from '@/lib/supabase/admin';
import {
    MEDIA_LIMITS,
    ORIGINALS_ROOT,
    acceptsMime,
    describeCeilingRefusal,
    isReservedPrefix,
    mediaNature,
    originalRetentionAllowed,
    profileForPath,
    uploadCeilingBytes,
    type MediaNature,
} from '@/lib/media-library/media-policy';
import {
    compressionGain,
    extensionOf,
    originalFileName,
    sanitizeFileName,
    stampedPath,
    webpFileName,
} from '@/lib/media-library/image-compression.plan';
import type {
    MediaUploadCapabilitiesResult,
    MediaUploadReport,
    MediaUploadReportResult,
    MediaUploadTicket,
    MediaUploadTicketRequest,
    MediaUploadTicketResult,
    SignedTarget,
} from '@/lib/media-library/upload-ticket.contract';
import { writeActivityLog } from '@/lib/logging/write';

/** Rôles autorisés à ouvrir le Cockpit (aligné sur `checkIsAdmin`). */
const COCKPIT_ROLES = ['admin', 'directeur', 'secretaire'];
/** Conservation d'un négatif : réservée à la Direction et aux administrateurs. */
const ORIGINAL_ROLES = ['admin', 'directeur'];

const WEBP_MIME = 'image/webp';

const NATURE_LABELS: Record<MediaNature, string> = {
    image: 'image',
    video: 'vidéo',
    document: 'document',
};

/** Poids lisible en mégaoctets, virgule française. */
function mega(bytes: number): string {
    return (bytes / 1_000_000).toFixed(1).replace('.', ',');
}

/** Dossier de destination assaini, ou message de refus. */
function sanitizeFolder(raw: unknown): { folder: string } | { error: string } {
    const folder = String(raw ?? '')
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .replace(/\.\./g, '');
    if (isReservedPrefix(folder)) {
        return { error: 'Ce dossier est réservé à la médiathèque interne.' };
    }
    return { folder };
}

/** Signe un chemin et renvoie de quoi déposer le contenu depuis le navigateur. */
async function signTarget(path: string): Promise<SignedTarget> {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
        .from(MEDIA_BUCKET)
        .createSignedUploadUrl(path, { upsert: true });
    if (error || !data) throw error ?? new Error("Autorisation d'upload refusée");

    const { data: publicUrlData } = adminClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return {
        path,
        uploadUrl: data.signedUrl,
        token: data.token,
        publicUrl: publicUrlData.publicUrl,
    };
}

/**
 * Autorise un dépôt et renvoie les URL signées. Refuse explicitement plutôt que
 * de laisser le navigateur échouer sur une limite invisible.
 */
export async function createMediaUploadTicket(
    request: MediaUploadTicketRequest,
): Promise<MediaUploadTicketResult> {
    const folderInput = request?.folder ?? '';

    try {
        const profile = await getCurrentUserProfile();
        if (!profile || !COCKPIT_ROLES.includes(profile.role || '')) {
            return { success: false, error: 'Accès Cockpit requis pour téléverser un média.' };
        }

        const sanitized = sanitizeFolder(folderInput);
        if ('error' in sanitized) return { success: false, error: sanitized.error };
        const folder = sanitized.folder;

        const contentType = String(request?.contentType || '').toLowerCase().trim();
        const fileName = sanitizeFileName(String(request?.fileName || 'fichier'));
        const bytes = Number(request?.bytes ?? 0);

        const nature = mediaNature(contentType, fileName);
        if (!nature) {
            return { success: false, error: 'Type de fichier non pris en charge par la médiathèque.' };
        }
        if (!acceptsMime(nature, contentType)) {
            return { success: false, error: `Type « ${contentType || 'inconnu'} » refusé pour une ${NATURE_LABELS[nature]}.` };
        }

        const keepOriginal =
            Boolean(request?.keepOriginal) &&
            originalRetentionAllowed(nature) &&
            ORIGINAL_ROLES.includes(profile.role || '');

        const ceiling = uploadCeilingBytes(nature, keepOriginal);
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return { success: false, error: 'Fichier vide ou taille illisible.' };
        }
        if (bytes > ceiling) {
            return { success: false, error: describeCeilingRefusal(bytes, ceiling, keepOriginal) };
        }

        const timestamp = Date.now();
        // Le dérivé servi est un WebP ; tout le reste (SVG, GIF animé, PDF, vidéo)
        // conserve son extension d'origine.
        const servedName = contentType === WEBP_MIME ? webpFileName(fileName) : originalFileName(fileName);
        const served = await signTarget(stampedPath(folder, servedName, timestamp));

        let original: SignedTarget | null = null;
        if (keepOriginal) {
            const originalFolder = folder ? `${ORIGINALS_ROOT}/${folder}` : ORIGINALS_ROOT;
            original = await signTarget(
                stampedPath(originalFolder, originalFileName(request.fileName), timestamp),
            );
        }

        const ticket: MediaUploadTicket = {
            served,
            original,
            profileId: profileForPath(folder).id,
            ceilingBytes: ceiling,
        };
        return { success: true, ticket };
    } catch (err: unknown) {
        reportMediaFailure('media.upload.ticket.failed', String(folderInput), err, 'createMediaUploadTicket');
        return {
            success: false,
            error: err instanceof Error ? err.message : "Autorisation d'upload impossible",
        };
    }
}

/**
 * Journalise l'issue d'un dépôt direct.
 *
 * Le serveur n'a pas vu passer les octets : sans cet appel, la compression
 * serait invisible dans le journal d'activité et aucun gain réel ne serait
 * mesurable. Le journal ne bloque jamais le parcours (`writeActivityLog`).
 */
export async function finalizeMediaUpload(report: MediaUploadReport): Promise<MediaUploadReportResult> {
    try {
        const profile = await getCurrentUserProfile();
        if (!profile || !COCKPIT_ROLES.includes(profile.role || '')) {
            return { success: false, error: 'Accès Cockpit requis.' };
        }

        const path = String(report?.path || '');
        if (!path) return { success: false, error: 'Chemin manquant.' };

        const bytesBefore = Math.max(0, Number(report.bytesBefore) || 0);
        const bytesAfter = Math.max(0, Number(report.bytesAfter) || 0);
        const gain = compressionGain(bytesBefore, bytesAfter);
        const extension = extensionOf(path);

        void writeActivityLog({
            level: 'info',
            source: 'media',
            category: report.compressed ? 'media.upload.compressed' : 'media.upload.stored',
            message: report.compressed
                ? `${report.fileName} : ${mega(bytesBefore)} Mo → ${mega(bytesAfter)} Mo (${gain.label}) en ${extension}`
                : `${report.fileName} déposé sans recompression (${mega(bytesAfter)} Mo)`,
            target: path,
            context: {
                profile: report.profileId,
                bytesBefore,
                bytesAfter,
                savedBytes: gain.savedBytes,
                gain: gain.label,
                compressed: Boolean(report.compressed),
                keptOriginal: Boolean(report.keptOriginal),
                originalPath: report.originalPath ?? null,
                folder: report.folder || '',
                contentType: report.contentType || '',
            },
            origin: 'finalizeMediaUpload',
        });

        const adminClient = createAdminClient();
        const { data } = adminClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        return { success: true, url: data.publicUrl };
    } catch (err: unknown) {
        reportMediaFailure('media.upload.finalize.failed', String(report?.path || ''), err, 'finalizeMediaUpload');
        return { success: false, error: err instanceof Error ? err.message : 'Journalisation impossible' };
    }
}

/**
 * Ce que le rôle courant peut faire dans ce dossier, et sous quel plafond.
 *
 * Une seule interrogation pour tout l'écran d'import : sans elle, l'interface
 * proposerait « conserver l'original » à un rôle qui n'y a pas droit, ou
 * annoncerait un plafond qui n'est pas le bon — deux promesses que le serveur
 * démentirait ensuite.
 */
export async function getMediaUploadCapabilities(folder: string): Promise<MediaUploadCapabilitiesResult> {
    try {
        const profile = await getCurrentUserProfile();
        if (!profile || !COCKPIT_ROLES.includes(profile.role || '')) {
            return { success: false, error: 'Accès Cockpit requis.' };
        }

        const sanitized = sanitizeFolder(folder);
        const target = 'error' in sanitized ? '' : sanitized.folder;
        const imageLimit = MEDIA_LIMITS.image;

        return {
            success: true,
            capabilities: {
                canKeepOriginal: ORIGINAL_ROLES.includes(profile.role || ''),
                imageCeilingBytes: imageLimit.maxBytes,
                imageOriginalCeilingBytes: imageLimit.maxOriginalBytes,
                profileId: profileForPath(target).id,
                folder: target,
            },
        };
    } catch (err: unknown) {
        reportMediaFailure('media.upload.capabilities.failed', String(folder || ''), err, 'getMediaUploadCapabilities');
        return { success: false, error: 'Capacités de téléversement indisponibles.' };
    }
}
