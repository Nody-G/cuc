import { BACKUP_ENV } from './config';
import type { S3StorageSelection, StorageSelection } from './storage';
import { createStorage } from './storage';
import { buildS3ClientConfig, createS3Client, createS3Storage, validateS3Selection } from './storage-s3';

const SELECTION: S3StorageSelection = {
    kind: 's3',
    endpoint: 'https://account.r2.cloudflarestorage.com',
    bucket: 'cuc-backups',
    region: 'auto',
    accessKeyId: 'AKIAEXAMPLEKEYID',
    secretAccessKey: 'secret-access-value',
    forcePathStyle: true,
};

interface RecordedCommand {
    name: string;
    input: Record<string, unknown>;
}

/** Client factice : aucun test ne touche le réseau. */
function createFakeSender(responder: (command: { input?: unknown }) => unknown) {
    const commands: RecordedCommand[] = [];
    const sender = {
        async send(command: { input?: unknown }): Promise<unknown> {
            commands.push({
                name: command.constructor.name,
                input: (command.input ?? {}) as Record<string, unknown>,
            });
            return responder(command);
        },
    };
    return { sender, commands };
}

function buildStorage(responder: (command: { input?: unknown }) => unknown) {
    const { sender, commands } = createFakeSender(responder);
    const created = createS3Storage(SELECTION, sender);
    if (!created.ok) throw new Error(`adaptateur S3 non créé : ${created.error.message}`);
    return { storage: created.value, commands };
}

describe('backup/io/storage-s3 — construction sans réseau et mapping', () => {
    it('construit la configuration du client (endpoint, region, credentials)', () => {
        expect(buildS3ClientConfig(SELECTION)).toEqual({
            endpoint: SELECTION.endpoint,
            region: 'auto',
            forcePathStyle: true,
            credentials: { accessKeyId: SELECTION.accessKeyId, secretAccessKey: SELECTION.secretAccessKey },
        });
    });

    it('instancie un client sans émettre la moindre requête', () => {
        const client = createS3Client(SELECTION);

        expect(typeof client.send).toBe('function');
        expect(client.config.region).toBeDefined();
    });

    it('valide une sélection complète et refuse une sélection incomplète en nommant la variable', () => {
        expect(validateS3Selection(SELECTION)).toBeNull();

        const incomplete = { ...SELECTION, bucket: '' };
        const problem = validateS3Selection(incomplete);

        expect(problem?.code).toBe('config-incomplete');
        expect(problem?.message).toContain(BACKUP_ENV.s3Bucket);

        const missingEndpoint = validateS3Selection({ ...SELECTION, endpoint: undefined as unknown as string });
        expect(missingEndpoint?.message).toContain(BACKUP_ENV.s3Endpoint);
    });

    it('refuse de créer l’adaptateur si la configuration est incomplète', () => {
        const created = createS3Storage({ ...SELECTION, secretAccessKey: '' });

        expect(created.ok).toBe(false);
        if (!created.ok) expect(created.error.message).toContain(BACKUP_ENV.s3SecretAccessKey);
    });

    it('mappe `put` sur PutObjectCommand', async () => {
        const { storage, commands } = buildStorage(() => ({ ETag: '"abc"' }));
        const body = Buffer.from('charge utile');

        const written = await storage.put('site/2026/10/snap/data/site_pages.ndjson.gz.enc', body, {
            contentType: 'application/octet-stream',
        });

        expect(written.ok).toBe(true);
        expect(commands).toHaveLength(1);
        expect(commands[0].name).toBe('PutObjectCommand');
        expect(commands[0].input).toMatchObject({
            Bucket: 'cuc-backups',
            Key: 'site/2026/10/snap/data/site_pages.ndjson.gz.enc',
            ContentType: 'application/octet-stream',
        });
        expect(commands[0].input.Body).toBe(body);
        if (written.ok) expect(written.value.etag).toBe('abc');
    });

    it('mappe `get` et restitue le tampon', async () => {
        const { storage, commands } = buildStorage(() => ({ Body: Buffer.from('contenu') }));

        const read = await storage.get('site/2026/10/snap/manifest.json');

        expect(read.ok).toBe(true);
        if (read.ok) expect(read.value.toString('utf8')).toBe('contenu');
        expect(commands[0].name).toBe('GetObjectCommand');
        expect(commands[0].input).toMatchObject({ Bucket: 'cuc-backups', Key: 'site/2026/10/snap/manifest.json' });
    });

    it('convertit un 404 en échec typé « not-found », jamais en exception', async () => {
        const { storage } = buildStorage(() => {
            throw Object.assign(new Error('introuvable'), { name: 'NotFound', $metadata: { httpStatusCode: 404 } });
        });

        const read = await storage.get('site/absent.json');
        expect(read.ok).toBe(false);
        if (!read.ok) expect(read.error.code).toBe('not-found');

        const exists = await storage.exists('site/absent.json');
        expect(exists).toEqual({ ok: true, value: false });
    });

    it('mappe `head` sur HeadObjectCommand', async () => {
        const { storage, commands } = buildStorage(() => ({
            ContentLength: 128,
            LastModified: new Date('2026-10-01T02:30:00.000Z'),
            ETag: '"deadbeef"',
            ContentType: 'application/json',
        }));

        const head = await storage.head('site/index.json');

        expect(commands[0].name).toBe('HeadObjectCommand');
        expect(head.ok).toBe(true);
        if (head.ok) {
            expect(head.value).toMatchObject({
                objectKey: 'site/index.json',
                size: 128,
                updatedAt: '2026-10-01T02:30:00.000Z',
                etag: 'deadbeef',
                contentType: 'application/json',
            });
        }
    });

    it('liste avec pagination et trie les clés', async () => {
        const { storage, commands } = buildStorage((command) => {
            const token = (command.input as { ContinuationToken?: string } | undefined)?.ContinuationToken;
            if (token === undefined) {
                return { Contents: [{ Key: 'site/b.json', Size: 2 }], NextContinuationToken: 'page-2' };
            }
            return { Contents: [{ Key: 'site/a.json', Size: 1 }] };
        });

        const listed = await storage.list('site/');

        expect(listed.ok).toBe(true);
        if (listed.ok) expect(listed.value.map((item) => item.objectKey)).toEqual(['site/a.json', 'site/b.json']);
        expect(commands).toHaveLength(2);
        expect(commands[0].name).toBe('ListObjectsV2Command');
        expect(commands[1].input.ContinuationToken).toBe('page-2');
    });

    it('mappe `remove` et `copyWithin` (promotion GFS)', async () => {
        const { storage, commands } = buildStorage(() => ({}));

        const removed = await storage.remove('site/old.json');
        expect(removed.ok).toBe(true);
        expect(commands[0].name).toBe('DeleteObjectCommand');

        const copied = await storage.copyWithin('site/2026/10/daily/snap.json', 'site/2026/10/weekly/snap.json');
        expect(copied.ok).toBe(true);
        expect(commands[1].name).toBe('CopyObjectCommand');
        expect(commands[1].input.Key).toBe('site/2026/10/weekly/snap.json');
        expect(commands[1].input.CopySource).toBe(encodeURIComponent('cuc-backups/site/2026/10/daily/snap.json'));
    });

    it('refuse une clé dangereuse sans même envoyer de commande', async () => {
        const { storage, commands } = buildStorage(() => ({}));

        const result = await storage.put('../evasion.bin', Buffer.from('x'));

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('invalid-key');
        expect(commands).toHaveLength(0);
    });

    it('journalise un échec sans jamais exposer les identifiants', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { storage } = buildStorage(() => {
            throw new Error(`refus pour ${SELECTION.accessKeyId} avec ${SELECTION.secretAccessKey}`);
        });

        const read = await storage.get('site/secret.json');
        const logged = spy.mock.calls.flat().join(' ');

        expect(read.ok).toBe(false);
        expect(logged).not.toContain(SELECTION.accessKeyId);
        expect(logged).not.toContain(SELECTION.secretAccessKey);
        expect(logged).toContain('[redacted]');
        spy.mockRestore();
    });

    it('refuse un adaptateur inconnu dans la fabrique', async () => {
        const created = await createStorage({ kind: 'gcs' } as unknown as StorageSelection);

        expect(created.ok).toBe(false);
        if (!created.ok) expect(created.error.code).toBe('unknown-storage-kind');
    });

    it('la fabrique construit l’adaptateur local sans charger le SDK S3', async () => {
        const created = await createStorage({ kind: 'local', root: '.backup-local-run' });

        expect(created.ok).toBe(true);
        if (created.ok) expect(created.value.kind).toBe('local');
    });
});
