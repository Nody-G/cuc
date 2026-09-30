/**
 * Tests de la séquence d'import — isolation des échecs, gains, négatif.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt). Les quatre dépendances sont des
 * doublures : aucun canvas, aucun réseau, aucune Server Action.
 */

import type { CompressedImage } from './image-compression.client';
import { planUploadItems, runMediaUpload, type UploadRunDeps } from './media-upload.runner';
import type {
    MediaUploadReport,
    MediaUploadTicketRequest,
    MediaUploadTicketResult,
} from './upload-ticket.contract';

function photo(name: string, bytes = 8_000_000, mime = 'image/jpeg'): File {
    return new File([new Uint8Array(bytes)], name, { type: mime });
}

function compressed(bytes: number, compressedFlag = true): CompressedImage {
    return {
        blob: new Blob([new Uint8Array(bytes)], { type: compressedFlag ? 'image/webp' : 'image/jpeg' }),
        bytes,
        width: 2560,
        height: 1920,
        mime: compressedFlag ? 'image/webp' : 'image/jpeg',
        extension: compressedFlag ? 'webp' : 'jpeg',
        compressed: compressedFlag,
        reason: compressedFlag ? 'compressible' : 'already-lean',
        sourceBytes: 8_000_000,
        sourceWidth: 4032,
        sourceHeight: 3024,
        gainLabel: '-94 %',
    };
}

function ticket(request: MediaUploadTicketRequest, options: { original?: boolean } = {}): MediaUploadTicketResult {
    return {
        success: true,
        ticket: {
            served: {
                path: `media/cuc-visual/1_photo.webp`,
                uploadUrl: `https://storage.test/served/${request.fileName}`,
                token: 'token-served',
                publicUrl: `https://cdn.test/${request.fileName}`,
            },
            original: options.original
                ? {
                    path: `_originals/media/cuc-visual/1_${request.fileName}`,
                    uploadUrl: `https://storage.test/original/${request.fileName}`,
                    token: 'token-original',
                    publicUrl: `https://cdn.test/_originals/${request.fileName}`,
                }
                : null,
            profileId: 'web',
            ceilingBytes: 8_000_000,
        },
    };
}

interface DepsOptions {
    ticket?: (request: MediaUploadTicketRequest) => MediaUploadTicketResult;
    put?: (url: string) => string | null;
    compress?: (file: File) => CompressedImage;
}

function makeDeps(options: DepsOptions = {}) {
    const puts: { url: string; bytes: number }[] = [];
    const reports: MediaUploadReport[] = [];

    const deps: UploadRunDeps = {
        compress: async (file) => options.compress?.(file) ?? compressed(500_000),
        requestTicket: async (request) => (options.ticket ? options.ticket(request) : ticket(request)),
        put: async (url, body) => {
            puts.push({ url, bytes: body.size });
            return options.put ? options.put(url) : null;
        },
        finalize: async (report) => {
            reports.push(report);
            return { success: true, url: `https://cdn.test/${report.path}` };
        },
    };

    return { deps, puts, reports };
}

describe('planUploadItems', () => {
    it('donne un identifiant stable et l’état initial de chaque fichier', () => {
        const items = planUploadItems([photo('a.jpg', 1000), photo('b.jpg', 2000)], 1);
        expect(items.map((item) => item.id)).toEqual(['1-0', '1-1']);
        expect(items[1]).toMatchObject({ name: 'b.jpg', sourceBytes: 2000, status: 'pending', gainLabel: '0 %' });
    });
});

describe('runMediaUpload', () => {
    it('dépose un lot entier et cumule les octets économisés', async () => {
        const { deps, reports } = makeDeps();
        const summary = await runMediaUpload([photo('a.jpg'), photo('b.jpg')], {
            folder: 'media/cuc-visual',
            keepOriginal: false,
            deps,
        });

        expect(summary.stored).toBe(2);
        expect(summary.failures).toBe(0);
        expect(summary.savedBytes).toBe(15_000_000);
        expect(summary.items.every((item) => item.status === 'done')).toBe(true);
        expect(summary.items[0]).toMatchObject({ compressed: true, uploadedBytes: 500_000, gainLabel: '-94 %' });
        expect(reports[0]).toMatchObject({ bytesBefore: 8_000_000, bytesAfter: 500_000, compressed: true });
    });

    it('isole un refus de plafond sans perdre les autres fichiers', async () => {
        const { deps } = makeDeps({
            ticket: (request) =>
                request.fileName === 'trop-lourd.jpg'
                    ? { success: false, error: 'Fichier trop lourd : 9,0 Mo pour un plafond de 8,0 Mo.' }
                    : ticket(request),
        });

        const summary = await runMediaUpload(
            [photo('a.jpg'), photo('trop-lourd.jpg'), photo('c.jpg', 3000)],
            { folder: 'media/cuc-visual', keepOriginal: false, deps },
        );

        expect(summary.stored).toBe(2);
        expect(summary.failures).toBe(1);
        expect(summary.items[1].status).toBe('error');
        expect(summary.items[1].error).toContain('plafond');
        expect(summary.items[2].status).toBe('done');
    });

    it('signale un dépôt refusé sans journaliser de succès', async () => {
        const { deps, reports } = makeDeps({
            put: (url) => (url.includes('served') ? 'Dépôt refusé par le stockage (403).' : null),
        });

        const summary = await runMediaUpload([photo('a.jpg')], {
            folder: 'media/cuc-visual',
            keepOriginal: false,
            deps,
        });

        expect(summary.failures).toBe(1);
        expect(summary.items[0].status).toBe('error');
        expect(summary.items[0].error).toContain('403');
        expect(reports).toHaveLength(0);
    });

    it('signale une compression impossible sans interrompre le lot', async () => {
        const { deps } = makeDeps();
        const failing: UploadRunDeps = {
            ...deps,
            compress: async (file) => {
                if (file.name === 'corrompu.jpg') throw new Error('decode-failed');
                return compressed(500_000);
            },
        };

        const summary = await runMediaUpload([photo('corrompu.jpg'), photo('b.jpg')], {
            folder: 'media/cuc-visual',
            keepOriginal: false,
            deps: failing,
        });

        expect(summary.failures).toBe(1);
        expect(summary.stored).toBe(1);
        expect(summary.items[0].error).toContain('Compression impossible');
        expect(summary.items[1].status).toBe('done');
    });

    it('conserve le négatif quand il est demandé', async () => {
        const { deps, puts, reports } = makeDeps({
            ticket: (request) => ticket(request, { original: true }),
        });

        const summary = await runMediaUpload([photo('hero.jpg')], {
            folder: 'media/cuc-visual/hero',
            keepOriginal: true,
            deps,
        });

        expect(summary.items[0]).toMatchObject({ status: 'done', keptOriginal: true });
        expect(summary.items[0].error).toBeUndefined();
        expect(puts).toHaveLength(2);
        expect(puts[1].url).toContain('/original/');
        expect(reports[0].originalPath).toContain('_originals/');
    });

    it('n’invalide pas l’image servie si le négatif échoue', async () => {
        const { deps, reports } = makeDeps({
            ticket: (request) => ticket(request, { original: true }),
            put: (url) => (url.includes('original') ? 'Réseau injoignable pendant le dépôt.' : null),
        });

        const summary = await runMediaUpload([photo('hero.jpg')], {
            folder: 'media/cuc-visual/hero',
            keepOriginal: true,
            deps,
        });

        expect(summary.stored).toBe(1);
        expect(summary.items[0]).toMatchObject({ status: 'done', keptOriginal: false });
        expect(summary.items[0].error).toContain('Négatif non conservé');
        expect(reports[0].keptOriginal).toBe(false);
    });

    it('dépose tel quel un fichier non compressible', async () => {
        const { deps, reports } = makeDeps({
            compress: () => compressed(2_000_000, false),
        });

        const summary = await runMediaUpload([photo('clip.mp4', 2_000_000, 'video/mp4')], {
            folder: 'media/video',
            keepOriginal: false,
            deps,
        });

        expect(summary.items[0]).toMatchObject({ status: 'done', compressed: false, uploadedBytes: 2_000_000 });
        expect(summary.savedBytes).toBe(0);
        expect(reports[0].compressed).toBe(false);
    });

    it('rend compte de l’avancement après chaque fichier traité', async () => {
        const { deps } = makeDeps();
        const settled: number[] = [];

        await runMediaUpload([photo('a.jpg'), photo('b.jpg'), photo('c.jpg', 1000)], {
            folder: 'media/cuc-visual',
            keepOriginal: false,
            deps,
            onSettled: (count) => settled.push(count),
        });

        expect(settled).toEqual([1, 2, 3]);
    });
});
