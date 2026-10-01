/**
 * Sauvegarde automatique du site CUC — chiffrement authentifié des parties.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : transformer un
 * tampon en clair en **enveloppe binaire versionnée** et inversement. Aucune
 * lecture d'environnement ici : la clé est **reçue en paramètre** (sa
 * validation appartient à `config.ts`), et un `keyResolver` permet de
 * déchiffrer un instantané ancien après rotation de clé.
 *
 * Seul `node:crypto` est utilisé (aucune bibliothèque de chiffrement).
 *
 * ---------------------------------------------------------------------------
 * FORMAT BINAIRE EXACT DE L'ENVELOPPE (octets, dans l'ordre)
 * ---------------------------------------------------------------------------
 *   offset   taille   champ
 *   0        4        magic « CUCB » (0x43 0x55 0x43 0x42)
 *   4        1        version d'enveloppe (0x01)
 *   5        1        longueur L du keyId, en octets (1..255)
 *   6        L        keyId, encodé UTF-8
 *   6+L      12       IV aléatoire, neuf à chaque appel (randomBytes)
 *   18+L     16       tag d'authentification GCM
 *   34+L     n        chiffré AES-256-GCM
 *
 *   Longueur totale = 34 + L + n ; en-tête authentifié en AAD = octets 0..(6+L).
 *
 * Le champ `version` et le `keyId` sont **authentifiés** (AAD) : les altérer
 * invalide le tag. C'est ce qui rend une rotation de clé future possible sans
 * casser les instantanés existants, et ce qui détecte une altération.
 * ---------------------------------------------------------------------------
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/** Magic bytes d'identification d'une enveloppe de sauvegarde CUC. */
export const ENVELOPE_MAGIC = 'CUCB';

/** Version d'enveloppe reconnue par ce module (toute autre est refusée). */
export const ENVELOPE_VERSION = 1;

/** Taille imposée d'une clé AES-256, en octets. */
export const AES_256_KEY_BYTES = 32;

/** Taille de l'IV GCM, en octets. */
export const GCM_IV_BYTES = 12;

/** Taille du tag d'authentification GCM, en octets. */
export const GCM_TAG_BYTES = 16;

/** Longueur maximale d'un identifiant de clé, en octets. */
export const MAX_KEY_ID_BYTES = 255;

const ALGORITHM = 'aes-256-gcm';
const MAGIC_BYTES = Buffer.from(ENVELOPE_MAGIC, 'ascii');

/** Motifs d'échec typés : un déchiffrement ne renvoie jamais un résultat ambigu. */
export type BackupCryptoErrorCode =
    | 'invalid-key-length'
    | 'invalid-key-id'
    | 'bad-magic'
    | 'unknown-version'
    | 'truncated-envelope'
    | 'unknown-key'
    | 'authentication-failed';

/** Erreur de chiffrement nommée, porteuse d'un code exploitable par l'appelant. */
export class BackupCryptoError extends Error {
    readonly code: BackupCryptoErrorCode;

    constructor(code: BackupCryptoErrorCode, message: string) {
        super(message);
        this.name = 'BackupCryptoError';
        this.code = code;
    }
}

/** Résout une clé par son `keyId` ; `null` si la clé est inconnue de l'appelant. */
export type BackupKeyResolver = (keyId: string) => Uint8Array | null;

/** Longueur d'en-tête pour un `keyId` donné (utile aux diagnostics). */
export function computeEnvelopeHeaderLength(keyIdByteLength: number): number {
    return MAGIC_BYTES.byteLength + 2 + keyIdByteLength + GCM_IV_BYTES + GCM_TAG_BYTES;
}

/**
 * Longueur d'un tampon, sans opérateur `instanceof` : sous jsdom (environnement
 * de test du dépôt), un `Buffer` Node et le `Uint8Array` du module peuvent
 * provenir de contextes distincts et échouer au test d'appartenance alors que
 * l'objet est bien binaire. Le contrôle de longueur reste, lui, infaillible.
 */
function bufferByteLength(value: unknown): number | null {
    if (value === null || typeof value !== 'object') return null;
    const candidate = value as { byteLength?: unknown };
    return typeof candidate.byteLength === 'number' ? candidate.byteLength : null;
}

function asKeyBuffer(key: Uint8Array, origin: string): Buffer {
    const byteLength = bufferByteLength(key);
    if (byteLength !== AES_256_KEY_BYTES) {
        const received = byteLength === null ? 'aucune clé binaire' : `${byteLength} octet(s)`;
        throw new BackupCryptoError(
            'invalid-key-length',
            `${origin} — clé AES-256 de ${AES_256_KEY_BYTES} octets attendue, ${received} reçue(s).`,
        );
    }
    return Buffer.from(key);
}

function asKeyIdBytes(keyId: string): Buffer {
    if (typeof keyId !== 'string' || keyId.length === 0) {
        throw new BackupCryptoError('invalid-key-id', 'Identifiant de clé (keyId) vide ou non textuel.');
    }
    const bytes = Buffer.from(keyId, 'utf8');
    if (bytes.byteLength > MAX_KEY_ID_BYTES) {
        throw new BackupCryptoError(
            'invalid-key-id',
            `Identifiant de clé trop long (${bytes.byteLength} > ${MAX_KEY_ID_BYTES} octets).`,
        );
    }
    return bytes;
}

function toBuffer(input: Uint8Array): Buffer {
    return Buffer.isBuffer(input) ? input : Buffer.from(input);
}

interface EnvelopeHeader {
    version: number;
    keyId: string;
    /** En-tête authentifié (magic + version + longueur + keyId). */
    authenticated: Buffer;
}

/** Valide magic, version et troncature ; retourne l'en-tête authentifiable. */
function parseHeader(buffer: Buffer): EnvelopeHeader {
    if (buffer.byteLength < computeEnvelopeHeaderLength(0)) {
        throw new BackupCryptoError('truncated-envelope', 'Enveloppe tronquée — en-tête incomplet.');
    }
    if (!buffer.subarray(0, MAGIC_BYTES.byteLength).equals(MAGIC_BYTES)) {
        throw new BackupCryptoError('bad-magic', 'Enveloppe refusée — magic bytes « CUCB » attendus.');
    }

    const version = buffer[4];
    if (version !== ENVELOPE_VERSION) {
        throw new BackupCryptoError(
            'unknown-version',
            `Version d'enveloppe inconnue (0x${version.toString(16).padStart(2, '0')}) — refus explicite.`,
        );
    }

    const keyIdByteLength = buffer[5];
    if (keyIdByteLength === 0) {
        throw new BackupCryptoError('invalid-key-id', 'Enveloppe invalide — keyId de longueur nulle.');
    }
    if (buffer.byteLength < computeEnvelopeHeaderLength(keyIdByteLength)) {
        throw new BackupCryptoError('truncated-envelope', 'Enveloppe tronquée — keyId interrompu.');
    }

    const authenticated = Buffer.from(buffer.subarray(0, 6 + keyIdByteLength));
    const keyId = authenticated.subarray(6).toString('utf8');
    return { version, keyId, authenticated };
}

/**
 * Chiffre un tampon et retourne l'enveloppe complète. Un IV **neuf** est
 * généré à chaque appel (`randomBytes`), jamais réutilisé.
 */
export function encryptBuffer(plain: Uint8Array, key: Uint8Array, keyId: string): Buffer {
    const keyBytes = asKeyBuffer(key, 'encryptBuffer');
    const keyIdBytes = asKeyIdBytes(keyId);
    const iv = randomBytes(GCM_IV_BYTES);

    const authenticated = Buffer.concat([
        MAGIC_BYTES,
        Buffer.from([ENVELOPE_VERSION, keyIdBytes.byteLength]),
        keyIdBytes,
    ]);

    const cipher = createCipheriv(ALGORITHM, keyBytes, iv);
    cipher.setAAD(authenticated);
    const ciphertext = Buffer.concat([cipher.update(toBuffer(plain)), cipher.final()]);

    return Buffer.concat([authenticated, iv, cipher.getAuthTag(), ciphertext]);
}

/** Lit l'identifiant de clé d'une enveloppe **sans** la déchiffrer. */
export function readEnvelopeKeyId(envelope: Uint8Array): { version: number; keyId: string } {
    const header = parseHeader(toBuffer(envelope));
    return { version: header.version, keyId: header.keyId };
}

/**
 * Déchiffre une enveloppe via un résolveur de clés. Échoue **explicitement**
 * (erreur typée) sur magic/version/troncature invalides, clé absente, ou tag
 * d'authentification invalide — c'est ce qui détecte une altération.
 */
export function decryptBuffer(envelope: Uint8Array, keyResolver: BackupKeyResolver): Buffer {
    const buffer = toBuffer(envelope);
    const header = parseHeader(buffer);

    if (typeof keyResolver !== 'function') {
        throw new BackupCryptoError('unknown-key', 'Aucun résolveur de clé fourni — déchiffrement refusé.');
    }
    const resolved = keyResolver(header.keyId);
    if (resolved === null || resolved === undefined) {
        throw new BackupCryptoError(
            'unknown-key',
            `Aucune clé disponible pour l'identifiant « ${header.keyId} » — rotation non couverte.`,
        );
    }
    const keyBytes = asKeyBuffer(resolved, `clé « ${header.keyId} »`);

    const headerLength = header.authenticated.byteLength;
    const iv = buffer.subarray(headerLength, headerLength + GCM_IV_BYTES);
    const tag = buffer.subarray(headerLength + GCM_IV_BYTES, headerLength + GCM_IV_BYTES + GCM_TAG_BYTES);
    const ciphertext = buffer.subarray(headerLength + GCM_IV_BYTES + GCM_TAG_BYTES);

    const decipher = createDecipheriv(ALGORITHM, keyBytes, iv);
    decipher.setAAD(header.authenticated);
    decipher.setAuthTag(tag);

    try {
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
        throw new BackupCryptoError(
            'authentication-failed',
            "Déchiffrement refusé — enveloppe altérée, tronquée ou tag d'authentification invalide.",
        );
    }
}
