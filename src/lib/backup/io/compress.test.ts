import type { BackupRow } from '../contracts';
import { CompressionError, gunzipBuffer, gzipBuffer, parseNdjson, toNdjson } from './compress';

describe('backup/io/compress — gzip et NDJSON', () => {
    it('fait un aller-retour exact', () => {
        const plain = Buffer.from(
            Array.from({ length: 2048 }, (_, index) => `ligne ${index} — contenu répétitif`).join('\n'),
            'utf8',
        );

        const compressed = gzipBuffer(plain);

        expect(compressed.byteLength).toBeGreaterThan(0);
        expect(gunzipBuffer(compressed).equals(plain)).toBe(true);
    });

    it('produit un flux plus petit sur une entrée répétitive', () => {
        const plain = Buffer.from('a'.repeat(10_000), 'utf8');
        expect(gzipBuffer(plain).byteLength).toBeLessThan(plain.byteLength);
    });

    it('signale explicitement une entrée gzip tronquée', () => {
        const valid = gzipBuffer(Buffer.from('contenu à décompresser '.repeat(64), 'utf8'));
        const truncated = valid.subarray(0, valid.byteLength - 12);

        expect(truncated.byteLength).toBeGreaterThan(0);
        expect(() => gunzipBuffer(truncated)).toThrow(CompressionError);
        try {
            gunzipBuffer(truncated);
        } catch (error) {
            expect((error as CompressionError).code).toBe('decompress-failed');
        }
    });

    it('signale explicitement une entrée gzip altérée (flux illisible)', () => {
        const valid = gzipBuffer(Buffer.from('contenu à décompresser '.repeat(64), 'utf8'));
        const corrupted = Buffer.from(valid);
        corrupted[Math.floor(corrupted.byteLength / 2)] ^= 0xff;

        try {
            gunzipBuffer(corrupted);
            throw new Error('la décompression aurait dû échouer');
        } catch (error) {
            expect(error).toBeInstanceOf(CompressionError);
            expect((error as CompressionError).code).toBe('decompress-failed');
        }
    });

    it('refuse une entrée vide ou non binaire', () => {
        try {
            gunzipBuffer(Buffer.alloc(0));
            throw new Error('la décompression aurait dû échouer');
        } catch (error) {
            expect((error as CompressionError).code).toBe('decompress-failed');
        }
    });

    it('sérialise en NDJSON déterministe, insensible à l’ordre des clés', () => {
        const ordered: BackupRow[] = [{ id: '1', title: 'A', is_published: true }];
        const shuffled: BackupRow[] = [{ is_published: true, title: 'A', id: '1' }];

        expect(toNdjson(ordered)).toBe(toNdjson(shuffled));
        expect(toNdjson(ordered).split('\n')).toHaveLength(1);
    });

    it('analyse un NDJSON valide et restitue les lignes', () => {
        const rows: BackupRow[] = [{ id: '1' }, { id: '2' }];
        const parsed = parseNdjson(toNdjson(rows));

        expect(parsed.ok).toBe(true);
        if (parsed.ok) expect(parsed.rows).toEqual(rows);
    });

    it('signale une ligne NDJSON corrompue avec son numéro', () => {
        const parsed = parseNdjson('{"id":"1"}\n{ceci n’est pas du JSON}\n{"id":"2"}');

        expect(parsed.ok).toBe(false);
        if (!parsed.ok) expect(parsed.error).toContain('ligne 2');
    });

    it('refuse une ligne NDJSON qui n’est pas un objet', () => {
        const parsed = parseNdjson('{"id":"1"}\n42');

        expect(parsed.ok).toBe(false);
        if (!parsed.ok) expect(parsed.error).toContain('ligne 2');
    });
});
