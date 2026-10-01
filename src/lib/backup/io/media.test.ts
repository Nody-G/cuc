/**
 * I/O média — test sans réseau, sans Supabase Storage. Un client factice renvoie
 * des pages et des contenus ; on prouve la pagination, l'exclusion de `reports`,
 * la lecture seule de `avatars` et l'absence totale de `remove`/`upload`.
 */
import { MEDIA_BUCKET_PLAN, MediaScopeError, assertBucketInScope, downloadObject, listBucket, readBucketObjects } from './media';
import type { MediaClient } from './media';

interface FakeFile {
    name: string;
    id: string | null;
    size: number;
    updatedAt: string | null;
}

interface FakeWorld {
    folders: Record<string, FakeFile[]>;
    content: Record<string, Buffer>;
    failingPaths?: Set<string>;
}

interface FakeClient {
    client: MediaClient;
    calls: string[];
}

/** Client factice : aucune notion de `remove`/`upload` dans notre interface,
 * mais des espions qui échoueraient s'ils étaient appelés — la preuve explicite. */
function createFakeClient(world: FakeWorld): FakeClient {
    const calls: string[] = [];
    const client: MediaClient = {
        storage: {
            from(bucket: string) {
                return {
                    async list(path = '', options = {}) {
                        const limit = options.limit ?? 100;
                        const offset = options.offset ?? 0;
                        calls.push(`list:${bucket}:${path}:${offset}:${limit}`);
                        const entries = (world.folders[path] ?? []).slice(offset, offset + limit);
                        return { data: entries, error: null };
                    },
                    async download(path: string) {
                        calls.push(`download:${bucket}:${path}`);
                        if (world.failingPaths?.has(path)) return { data: null, error: { message: 'panne simulée' } };
                        const buffer = world.content[path];
                        if (buffer === undefined) return { data: null, error: { message: 'absent' } };
                        return { data: buffer, error: null };
                    },
                };
            },
        },
    };
    return { client, calls };
}

function file(name: string, id: string, size = 4): FakeFile {
    return { name, id, size, updatedAt: null };
}

/** Entrée « dossier » : `id === null` signale un répertoire au listing. */
function folder(name: string): FakeFile {
    return { name, id: null, size: 0, updatedAt: null };
}

describe('backup/io/media — listing paginé et lecture seule', () => {
    it('pagine le listing au lieu de supposer tout en une requête', async () => {
        const world: FakeWorld = {
            folders: { '': [file('a', '1'), file('b', '2'), file('c', '3')] },
            content: {},
        };
        const { client, calls } = createFakeClient(world);
        const result = await listBucket({ client, bucket: 'cuc-vitrine-assets', pageSize: 2 });

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.objects.map((object) => object.path)).toEqual(['a', 'b', 'c']);
        expect(calls.filter((call) => call.startsWith('list:'))).toHaveLength(2);
    });

    it('descend dans les dossiers (id null) pour reconstruire le chemin complet', async () => {
        const world: FakeWorld = {
            folders: {
                '': [folder('media'), file('root.png', 'root')],
                media: [file('x.png', 'x')],
            },
            content: {},
        };
        const { client } = createFakeClient(world);
        const result = await listBucket({ client, bucket: 'cuc-vitrine-assets' });
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.objects.map((object) => object.path).sort()).toEqual(['media/x.png', 'root.png']);
    });

    it('exclut le bucket reports explicitement', async () => {
        const { client } = createFakeClient({ folders: {}, content: {} });
        expect(() => assertBucketInScope('reports')).toThrow(MediaScopeError);
        await expect(listBucket({ client, bucket: 'reports' })).rejects.toBeInstanceOf(MediaScopeError);
        expect(MEDIA_BUCKET_PLAN.some((plan) => plan.name === 'reports')).toBe(false);
    });

    it('refuse un bucket non déclaré', () => {
        expect(() => assertBucketInScope('inconnu')).toThrow(MediaScopeError);
    });

    it('liste et lit avatars en lecture seule, sans jamais supprimer ni envoyer', async () => {
        const world: FakeWorld = {
            folders: { '': [file('avatar.png', 'a')] },
            content: { 'avatar.png': Buffer.from('avatar-bytes') },
        };
        const { client, calls } = createFakeClient(world);
        const result = await readBucketObjects({ client, bucket: 'avatars' });

        expect(result.ok).toBe(true);
        expect(result.objects).toHaveLength(1);
        expect(result.objects[0].sha256).toMatch(/^[0-9a-f]{64}$/);
        // Preuve explicite : aucune opération d'écriture n'existe ni n'est appelée.
        expect(calls.every((call) => call.startsWith('list:') || call.startsWith('download:'))).toBe(true);
        expect(calls.some((call) => call.includes('remove') || call.includes('upload'))).toBe(false);
    });

    it('n’expose aucune méthode d’écriture sur la poignée de bucket', () => {
        const { client } = createFakeClient({ folders: {}, content: {} });
        const handle = client.storage.from('cuc-vitrine-assets') as unknown as Record<string, unknown>;
        expect(handle.remove).toBeUndefined();
        expect(handle.upload).toBeUndefined();
    });

    it('calcule le sha256 du contenu téléchargé', async () => {
        const world: FakeWorld = { folders: {}, content: { 'a.png': Buffer.from('abcdef') } };
        const { client } = createFakeClient(world);
        const result = await downloadObject({ client, bucket: 'cuc-vitrine-assets', path: 'a.png' });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.bytes.toString('utf8')).toBe('abcdef');
            expect(result.descriptor.sha256).toMatch(/^[0-9a-f]{64}$/);
        }
    });

    it('trace un téléchargement en échec sans interrompre le reste', async () => {
        const world: FakeWorld = {
            folders: { '': [file('ok.png', '1'), file('ko.png', '2')] },
            content: { 'ok.png': Buffer.from('ok') },
            failingPaths: new Set(['ko.png']),
        };
        const { client } = createFakeClient(world);
        const result = await readBucketObjects({ client, bucket: 'cuc-vitrine-assets' });
        expect(result.ok).toBe(true);
        expect(result.objects.map((object) => object.path)).toEqual(['ok.png']);
        expect(result.failures).toEqual(['ko.png [download-failed]']);
    });
});
