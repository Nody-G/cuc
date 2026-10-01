/**
 * Index média — domaine pur, sans réseau ni base. Prouve le déterminisme, le
 * différentiel incrémental (un fichier inchangé n'est jamais revu), l'adressage
 * par contenu (deux chemins de même contenu ⇒ une seule clé) et le refus des
 * entrées malformées.
 */
import {
    MediaIndexError,
    buildMediaIndex,
    diffMediaIndex,
    hashesToStore,
    mediaEntryKey,
    mediaKeyFor,
    referencedHashes,
} from './media-index';
import type { MediaIndexEntry, MediaObjectDescriptor } from './media-index';

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

function entry(bucket: string, path: string, sha256: string, size = 10): MediaObjectDescriptor {
    return { bucket, path, sha256, size };
}

describe('backup/media-index — index déterministe et adressé par contenu', () => {
    it('trie l’index de façon déterministe, quel que soit l’ordre d’entrée', () => {
        const forward = buildMediaIndex([entry('cuc-vitrine-assets', 'a.png', HASH_A), entry('cuc-vitrine-assets', 'b.png', HASH_B)]);
        const reverse = buildMediaIndex([entry('cuc-vitrine-assets', 'b.png', HASH_B), entry('cuc-vitrine-assets', 'a.png', HASH_A)]);
        expect(forward.map(mediaEntryKey)).toEqual(reverse.map(mediaEntryKey));
        expect(forward.map(mediaEntryKey)).toEqual(['cuc-vitrine-assets/a.png', 'cuc-vitrine-assets/b.png']);
    });

    it('refuse un chemin vide, un hash malformé et une taille négative', () => {
        expect(() => buildMediaIndex([entry('cuc-vitrine-assets', '', HASH_A)])).toThrow(MediaIndexError);
        expect(() => buildMediaIndex([entry('cuc-vitrine-assets', 'a.png', 'zz')])).toThrow(MediaIndexError);
        expect(() => buildMediaIndex([entry('cuc-vitrine-assets', 'a.png', HASH_A, -1)])).toThrow(MediaIndexError);
        expect(() => buildMediaIndex([entry('cuc-vitrine-assets', '/abs.png', HASH_A)])).toThrow(MediaIndexError);
    });

    it('refuse un doublon de clé (même bucket et même chemin)', () => {
        expect(() => buildMediaIndex([entry('avatars', 'x', HASH_A), entry('avatars', 'x', HASH_B)])).toThrow(MediaIndexError);
    });

    it('classe ajout, modification, inchangé et disparition de la source', () => {
        const previous = buildMediaIndex([
            entry('cuc-vitrine-assets', 'keep.png', HASH_A),
            entry('cuc-vitrine-assets', 'edit.png', HASH_A),
            entry('cuc-vitrine-assets', 'gone.png', HASH_A),
        ]);
        const current = buildMediaIndex([
            entry('cuc-vitrine-assets', 'keep.png', HASH_A),
            entry('cuc-vitrine-assets', 'edit.png', HASH_B),
            entry('cuc-vitrine-assets', 'new.png', HASH_A),
        ]);
        const diff = diffMediaIndex(previous, current);
        expect(diff.added.map(mediaEntryKey)).toEqual(['cuc-vitrine-assets/new.png']);
        expect(diff.changed.map(mediaEntryKey)).toEqual(['cuc-vitrine-assets/edit.png']);
        expect(diff.unchanged.map(mediaEntryKey)).toEqual(['cuc-vitrine-assets/keep.png']);
        expect(diff.removedFromSource.map(mediaEntryKey)).toEqual(['cuc-vitrine-assets/gone.png']);
    });

    it('ne re-téléverse jamais un fichier inchangé', () => {
        const index = buildMediaIndex([entry('cuc-vitrine-assets', 'a.png', HASH_A), entry('cuc-vitrine-assets', 'b.png', HASH_B)]);
        const diff = diffMediaIndex(index, index);
        expect(diff.added).toHaveLength(0);
        expect(diff.changed).toHaveLength(0);
        expect(hashesToStore(diff)).toEqual([]);
    });

    it('deux chemins de même contenu ne produisent qu’une seule clé et un seul téléversement', () => {
        const diff = diffMediaIndex([], buildMediaIndex([
            entry('cuc-vitrine-assets', 'one.png', HASH_A),
            entry('cuc-vitrine-assets', 'two.png', HASH_A),
        ]));
        expect(diff.added).toHaveLength(2);
        expect(mediaKeyFor(diff.added[0].sha256)).toBe(mediaKeyFor(diff.added[1].sha256));
        expect(hashesToStore(diff)).toEqual([HASH_A]);
    });

    it('mediaKeyFor est stable et adressée par contenu', () => {
        expect(mediaKeyFor(HASH_A)).toBe(`media/${HASH_A}`);
        expect(mediaKeyFor(HASH_A, 'cuc-backups')).toBe(`cuc-backups/media/${HASH_A}`);
        expect(mediaKeyFor(HASH_A)).toBe(mediaKeyFor(HASH_A));
        expect(() => mediaKeyFor('malformed')).toThrow(MediaIndexError);
    });

    it('referencedHashes rend les hashes uniques et triés', () => {
        const index: MediaIndexEntry[] = buildMediaIndex([
            entry('cuc-vitrine-assets', 'one.png', HASH_B),
            entry('cuc-vitrine-assets', 'two.png', HASH_A),
            entry('cuc-vitrine-assets', 'three.png', HASH_A),
        ]);
        expect(referencedHashes(index)).toEqual([HASH_A, HASH_B]);
    });
});
