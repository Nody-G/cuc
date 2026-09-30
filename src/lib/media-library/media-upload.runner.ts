/**
 * Séquence d'import d'un lot de médias — domaine pur, dépendances injectées.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1). La règle de l'architecture
 * veut qu'une décision se teste hors du cycle de vie UI : la boucle d'import
 * (compresser → demander un ticket → déposer → journaliser, fichier par
 * fichier) vit donc ici, avec ses quatre dépendances passées en paramètre. Le
 * hook React n'en fait plus que le branchement.
 *
 * Deux comportements sont explicitement garantis, parce qu'ils sont
 * invisibles à l'œil et coûteux en pratique :
 *
 *  1. **L'échec est isolé** : un fichier refusé (plafond, type MIME, réseau)
 *     n'interrompt pas le lot. Une photo de 9 Mo ne doit pas faire perdre les
 *     sept autres.
 *  2. **Le négatif est un bonus, jamais une condition** : si le dépôt de
 *     l'original échoue, l'image servie existe déjà — on le signale, on
 *     n'annonce pas un échec complet.
 */

import type { CompressedImage } from './image-compression.client';
import type {
    MediaUploadReport,
    MediaUploadReportResult,
    MediaUploadTicketRequest,
    MediaUploadTicketResult,
} from './upload-ticket.contract';

export type UploadItemStatus = 'pending' | 'compressing' | 'uploading' | 'done' | 'error';

export interface MediaUploadItem {
    id: string;
    name: string;
    /** Poids du fichier tel que choisi par l'utilisateur. */
    sourceBytes: number;
    /** Poids réellement déposé dans le bucket. */
    uploadedBytes: number;
    compressed: boolean;
    gainLabel: string;
    status: UploadItemStatus;
    error?: string;
    keptOriginal: boolean;
    url?: string;
}

export interface UploadRunDeps {
    compress: (file: File) => Promise<CompressedImage>;
    requestTicket: (request: MediaUploadTicketRequest) => Promise<MediaUploadTicketResult>;
    /** Dépose un blob sur une URL signée ; renvoie `null` en cas de succès. */
    put: (url: string, body: Blob, contentType: string) => Promise<string | null>;
    finalize: (report: MediaUploadReport) => Promise<MediaUploadReportResult>;
}

export interface UploadRunOptions {
    folder: string;
    keepOriginal: boolean;
    deps: UploadRunDeps;
    /** Appelé à chaque changement d'état d'un élément. */
    onItem?: (item: MediaUploadItem) => void;
    /** Appelé après chaque fichier traité (déposé ou refusé). */
    onSettled?: (settledCount: number, total: number) => void;
}

export interface UploadRunSummary {
    items: MediaUploadItem[];
    stored: number;
    failures: number;
    /** Octets économisés par la compression, cumulés sur le lot. */
    savedBytes: number;
}

/** État initial d'un lot, dans l'ordre de la sélection. */
export function planUploadItems(files: readonly File[], stamp = Date.now()): MediaUploadItem[] {
    return files.map((file, index) => ({
        id: `${stamp}-${index}`,
        name: file.name,
        sourceBytes: file.size,
        uploadedBytes: file.size,
        compressed: false,
        gainLabel: '0 %',
        status: 'pending',
        keptOriginal: false,
    }));
}

/** Traite un lot, fichier par fichier, sans jamais interrompre les suivants. */
export async function runMediaUpload(
    files: readonly File[],
    options: UploadRunOptions,
): Promise<UploadRunSummary> {
    const { deps, folder, keepOriginal, onItem, onSettled } = options;
    const items = planUploadItems(files);
    let stored = 0;
    let failures = 0;
    let savedBytes = 0;
    let settled = 0;

    const update = (index: number, patch: Partial<MediaUploadItem>): MediaUploadItem => {
        items[index] = { ...items[index], ...patch };
        onItem?.(items[index]);
        return items[index];
    };

    for (const [index, file] of files.entries()) {
        update(index, { status: 'compressing' });

        let compressed: CompressedImage;
        try {
            compressed = await deps.compress(file);
        } catch {
            failures += 1;
            settled += 1;
            update(index, { status: 'error', error: 'Compression impossible sur ce navigateur.' });
            onSettled?.(settled, files.length);
            continue;
        }

        update(index, {
            status: 'uploading',
            compressed: compressed.compressed,
            uploadedBytes: compressed.bytes,
            gainLabel: compressed.gainLabel,
        });

        const ticket = await deps.requestTicket({
            folder,
            fileName: file.name,
            contentType: compressed.mime,
            bytes: compressed.bytes,
            keepOriginal,
        });

        if (!ticket.success) {
            failures += 1;
            settled += 1;
            update(index, { status: 'error', error: ticket.error });
            onSettled?.(settled, files.length);
            continue;
        }

        const servedError = await deps.put(ticket.ticket.served.uploadUrl, compressed.blob, compressed.mime);
        if (servedError) {
            failures += 1;
            settled += 1;
            update(index, { status: 'error', error: servedError });
            onSettled?.(settled, files.length);
            continue;
        }

        let keptOriginal = false;
        let originalWarning: string | undefined;
        if (ticket.ticket.original) {
            const originalError = await deps.put(
                ticket.ticket.original.uploadUrl,
                file,
                file.type || 'application/octet-stream',
            );
            keptOriginal = !originalError;
            if (originalError) originalWarning = 'Négatif non conservé (dépôt refusé).';
        }

        const report = await deps.finalize({
            path: ticket.ticket.served.path,
            folder,
            fileName: file.name,
            contentType: compressed.mime,
            profileId: ticket.ticket.profileId,
            bytesBefore: file.size,
            bytesAfter: compressed.bytes,
            compressed: compressed.compressed,
            keptOriginal,
            originalPath: keptOriginal ? (ticket.ticket.original?.path ?? null) : null,
        });

        stored += 1;
        settled += 1;
        savedBytes += Math.max(0, file.size - compressed.bytes);
        update(index, {
            status: 'done',
            keptOriginal,
            error: originalWarning,
            url: report.success ? report.url : ticket.ticket.served.publicUrl,
        });
        onSettled?.(settled, files.length);
    }

    return { items, stored, failures, savedBytes };
}
