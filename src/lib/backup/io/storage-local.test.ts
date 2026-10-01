import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { BackupStorage } from './storage';
import { createLocalStorage } from './storage-local';

let root: string;
let storage: BackupStorage;

beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'cuc-backup-local-'));
    const created = createLocalStorage({ kind: 'local', root });
    if (!created.ok) throw new Error(`stockage local non créé : ${created.error.message}`);
    storage = created.value;
});

afterEach(() => {
    rmSync(root, { recursive: true, force: true });
});

describe('backup/io/storage-local — système de fichiers temporaire', () => {
    it('écrit, relit et expose la taille d’un objet', async () => {
        const body = Buffer.from('contenu de test', 'utf8');

        const written = await storage.put('site/2026/10/snap/data/site_pages.ndjson.gz.enc', body);
        expect(written.ok).toBe(true);
        if (written.ok) {
            expect(written.value.size).toBe(body.byteLength);
            expect(written.value.objectKey).toBe('site/2026/10/snap/data/site_pages.ndjson.gz.enc');
        }

        const read = await storage.get('site/2026/10/snap/data/site_pages.ndjson.gz.enc');
        expect(read.ok).toBe(true);
        if (read.ok) expect(read.value.equals(body)).toBe(true);
    });

    it('retourne `head` et `exists` cohérents', async () => {
        await storage.put('a/b/c.bin', Buffer.from('x'));

        const head = await storage.head('a/b/c.bin');
        expect(head.ok).toBe(true);

        const present = await storage.exists('a/b/c.bin');
        expect(present).toEqual({ ok: true, value: true });

        const absent = await storage.exists('a/b/absent.bin');
        expect(absent).toEqual({ ok: true, value: false });
    });

    it('retourne un échec typé (jamais un throw nu) sur une clé absente', async () => {
        const read = await storage.get('site/absent.bin');

        expect(read.ok).toBe(false);
        if (!read.ok) {
            expect(read.error.code).toBe('not-found');
            expect(read.error.objectKey).toBe('site/absent.bin');
        }
    });

    it('liste uniquement les objets du préfixe demandé, triés', async () => {
        await storage.put('site/2026/10/a/x.bin', Buffer.from('1'));
        await storage.put('site/2026/10/b/y.bin', Buffer.from('2'));
        await storage.put('media/other.bin', Buffer.from('3'));

        const listed = await storage.list('site/2026/10/');

        expect(listed.ok).toBe(true);
        if (listed.ok) {
            expect(listed.value.map((item) => item.objectKey)).toEqual([
                'site/2026/10/a/x.bin',
                'site/2026/10/b/y.bin',
            ]);
        }
    });

    it('retourne une liste vide (succès) quand le préfixe n’existe pas', async () => {
        const listed = await storage.list('inexistant/');

        expect(listed.ok).toBe(true);
        if (listed.ok) expect(listed.value).toEqual([]);
    });

    it('copie un objet sur une nouvelle clé (promotion GFS)', async () => {
        await storage.put('site/2026/10/daily/snap.json', Buffer.from('manifest'));

        const copied = await storage.copyWithin('site/2026/10/daily/snap.json', 'site/2026/10/weekly/snap.json');

        expect(copied.ok).toBe(true);
        const read = await storage.get('site/2026/10/weekly/snap.json');
        expect(read.ok).toBe(true);
        if (read.ok) expect(read.value.toString('utf8')).toBe('manifest');
    });

    it('signale une copie dont la source est absente', async () => {
        const copied = await storage.copyWithin('site/absent.json', 'site/present.json');

        expect(copied.ok).toBe(false);
        if (!copied.ok) expect(copied.error.code).toBe('not-found');
    });

    it('supprime un objet et signale une suppression d’objet déjà absent', async () => {
        await storage.put('site/temp.json', Buffer.from('temp'));
        const removed = await storage.remove('site/temp.json');

        expect(removed.ok).toBe(true);
        expect(existsSync(path.join(root, 'site', 'temp.json'))).toBe(false);

        const again = await storage.remove('site/temp.json');
        expect(again.ok).toBe(false);
        if (!again.ok) expect(again.error.code).toBe('not-found');
    });

    it('refuse une clé qui sortirait du répertoire racine', async () => {
        for (const dangerous of ['../evasion.bin', '/absolu.bin', 'a/../../evasion.bin', 'a\\b.bin', '']) {
            const result = await storage.put(dangerous, Buffer.from('x'));
            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.error.code).toBe('invalid-key');
        }
        expect(existsSync(path.join(path.dirname(root), 'evasion.bin'))).toBe(false);
    });

    it('refuse une racine absente à la construction', () => {
        const created = createLocalStorage({ kind: 'local', root: '   ' });

        expect(created.ok).toBe(false);
        if (!created.ok) expect(created.error.code).toBe('config-incomplete');
    });
});
