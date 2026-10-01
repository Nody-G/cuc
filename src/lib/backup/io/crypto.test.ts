import { randomBytes } from 'node:crypto';

import {
    AES_256_KEY_BYTES,
    BackupCryptoError,
    ENVELOPE_MAGIC,
    GCM_IV_BYTES,
    computeEnvelopeHeaderLength,
    decryptBuffer,
    encryptBuffer,
    readEnvelopeKeyId,
} from './crypto';

const KEY = randomBytes(AES_256_KEY_BYTES);
const KEY_ID = 'v1';

/** Résolveur de clé de test : ne connaît que `v1`. */
function resolverFor(id: string): Uint8Array | null {
    return id === KEY_ID ? KEY : null;
}

describe('backup/io/crypto — enveloppe AES-256-GCM', () => {
    it('fait un aller-retour exact sur des données binaires arbitraires', () => {
        const plain = randomBytes(4096);

        const envelope = encryptBuffer(plain, KEY, KEY_ID);
        const restored = decryptBuffer(envelope, resolverFor);

        expect(restored.equals(plain)).toBe(true);
    });

    it('accepte un tampon vide et restitue un tampon vide', () => {
        const envelope = encryptBuffer(Buffer.alloc(0), KEY, KEY_ID);
        expect(decryptBuffer(envelope, resolverFor).byteLength).toBe(0);
    });

    it('génère un IV neuf à chaque appel', () => {
        const headerLength = computeEnvelopeHeaderLength(Buffer.byteLength(KEY_ID));
        const first = encryptBuffer(Buffer.from('même entrée'), KEY, KEY_ID);
        const second = encryptBuffer(Buffer.from('même entrée'), KEY, KEY_ID);

        const firstIv = first.subarray(headerLength, headerLength + GCM_IV_BYTES);
        const secondIv = second.subarray(headerLength, headerLength + GCM_IV_BYTES);

        expect(firstIv.equals(secondIv)).toBe(false);
        expect(first.equals(second)).toBe(false);
    });

    it('place le magic « CUCB » en tête et permet de lire le keyId', () => {
        const envelope = encryptBuffer(Buffer.from('x'), KEY, KEY_ID);

        expect(envelope.subarray(0, 4).toString('ascii')).toBe(ENVELOPE_MAGIC);
        expect(readEnvelopeKeyId(envelope)).toEqual({ version: 1, keyId: KEY_ID });
    });

    it('refuse une clé de mauvaise taille au chiffrement', () => {
        expect(() => encryptBuffer(Buffer.from('x'), randomBytes(16), KEY_ID)).toThrow(BackupCryptoError);
        try {
            encryptBuffer(Buffer.from('x'), randomBytes(31), KEY_ID);
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('invalid-key-length');
        }
    });

    it('refuse une clé de mauvaise taille résolue au déchiffrement', () => {
        const envelope = encryptBuffer(Buffer.from('x'), KEY, KEY_ID);

        try {
            decryptBuffer(envelope, () => randomBytes(20));
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect(error).toBeInstanceOf(BackupCryptoError);
            expect((error as BackupCryptoError).code).toBe('invalid-key-length');
        }
    });

    it("détecte l'altération d'un seul octet du chiffré", () => {
        const envelope = encryptBuffer(randomBytes(256), KEY, KEY_ID);
        const tampered = Buffer.from(envelope);
        tampered[tampered.byteLength - 1] ^= 0xff;

        expect(() => decryptBuffer(tampered, resolverFor)).toThrow(BackupCryptoError);
        try {
            decryptBuffer(tampered, resolverFor);
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('authentication-failed');
        }
    });

    it("détecte l'altération du tag d'authentification", () => {
        const envelope = encryptBuffer(randomBytes(64), KEY, KEY_ID);
        const tampered = Buffer.from(envelope);
        const tagOffset = computeEnvelopeHeaderLength(Buffer.byteLength(KEY_ID)) + GCM_IV_BYTES;
        tampered[tagOffset] ^= 0x01;

        try {
            decryptBuffer(tampered, resolverFor);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('authentication-failed');
        }
    });

    it("authentifie le keyId : le modifier invalide l'enveloppe", () => {
        const envelope = encryptBuffer(randomBytes(64), KEY, KEY_ID);
        const tampered = Buffer.from(envelope);
        tampered[6] = 'z'.charCodeAt(0); // keyId « v1 » devient « z1 »

        try {
            decryptBuffer(tampered, () => KEY);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('authentication-failed');
        }
    });

    it('rejette une enveloppe tronquée', () => {
        const envelope = encryptBuffer(randomBytes(128), KEY, KEY_ID);

        try {
            decryptBuffer(envelope.subarray(0, 10), resolverFor);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('truncated-envelope');
        }
    });

    it("rejette une version d'enveloppe inconnue", () => {
        const envelope = encryptBuffer(randomBytes(32), KEY, KEY_ID);
        const tampered = Buffer.from(envelope);
        tampered[4] = 0x09;

        try {
            decryptBuffer(tampered, resolverFor);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('unknown-version');
        }
    });

    it('rejette un magic invalide', () => {
        const envelope = encryptBuffer(randomBytes(32), KEY, KEY_ID);
        const tampered = Buffer.from(envelope);
        tampered[0] = 0x58;

        try {
            decryptBuffer(tampered, resolverFor);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('bad-magic');
        }
    });

    it('signale une clé absente pour un keyId inconnu (rotation non couverte)', () => {
        const envelope = encryptBuffer(randomBytes(32), KEY, 'v2');

        try {
            decryptBuffer(envelope, resolverFor);
            throw new Error('le déchiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('unknown-key');
        }
    });

    it('permet la rotation : un second keyId est déchiffrable avec sa propre clé', () => {
        const rotated = randomBytes(AES_256_KEY_BYTES);
        const envelope = encryptBuffer(Buffer.from('rotation'), rotated, 'v2');

        const restored = decryptBuffer(envelope, (id) => (id === 'v2' ? rotated : KEY));

        expect(restored.toString('utf8')).toBe('rotation');
    });

    it('refuse un keyId vide', () => {
        try {
            encryptBuffer(Buffer.from('x'), KEY, '');
            throw new Error('le chiffrement aurait dû échouer');
        } catch (error) {
            expect((error as BackupCryptoError).code).toBe('invalid-key-id');
        }
    });
});
