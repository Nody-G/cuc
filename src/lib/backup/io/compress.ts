/**
 * Sauvegarde automatique du site CUC — compression et charge utile NDJSON.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : encoder/décoder la
 * charge utile d'une partie. Seul `node:zlib` est utilisé (aucune archive
 * externe, aucun `tar` — `plans/plan-backups-automatiques-2026.md` § 3.5).
 *
 * La forme NDJSON (un objet JSON par ligne) s'appuie sur la sérialisation
 * canonique de [`canonicalRow()`](../diff.ts:56) du Lot 1 : l'ordre des clés ne
 * peut donc jamais produire deux empreintes différentes pour la même ligne.
 * Aucune donnée n'est interprétée ici : le module ne fait que (dé)compresser.
 */

import { gunzipSync, gzipSync } from 'node:zlib';

import type { BackupRow } from '../contracts';
import { canonicalRow } from '../diff';

/** Motifs d'échec typés de la compression. */
export type CompressionErrorCode = 'compress-failed' | 'decompress-failed';

/** Erreur de compression nommée, porteuse d'un code exploitable. */
export class CompressionError extends Error {
    readonly code: CompressionErrorCode;

    constructor(code: CompressionErrorCode, message: string) {
        super(message);
        this.name = 'CompressionError';
        this.code = code;
    }
}

/** Résultat d'analyse NDJSON : union discriminée, jamais d'exception non typée. */
export type NdjsonParseResult =
    | { ok: true; rows: BackupRow[] }
    | { ok: false; error: string };

/** Compresse un tampon en gzip (déterministe : niveau maximal fixé). */
export function gzipBuffer(input: Uint8Array): Buffer {
    try {
        return gzipSync(input, { level: 9 });
    } catch (error) {
        throw new CompressionError(
            'compress-failed',
            `Compression gzip refusée — ${error instanceof Error ? error.message : 'cause inconnue'}.`,
        );
    }
}

/** Décompresse un tampon gzip ; une entrée corrompue échoue explicitement. */
export function gunzipBuffer(input: Uint8Array): Buffer {
    // Contrôle par longueur (jamais `instanceof`) : sous jsdom, un `Buffer` Node
    // et le `Uint8Array` du module peuvent venir de contextes distincts.
    if (input === null || typeof input !== 'object' || typeof input.byteLength !== 'number' || input.byteLength === 0) {
        throw new CompressionError('decompress-failed', 'Décompression refusée — tampon vide ou non binaire.');
    }
    try {
        return gunzipSync(input);
    } catch {
        throw new CompressionError(
            'decompress-failed',
            'Décompression refusée — flux gzip corrompu ou tronqué.',
        );
    }
}

/** Sérialise des lignes en NDJSON déterministe (une ligne par objet). */
export function toNdjson(rows: readonly BackupRow[]): string {
    return rows.map((row) => canonicalRow(row)).join('\n');
}

/**
 * Analyse un NDJSON. Refuse toute ligne vide ou non-objet : une partie
 * corrompue doit être signalée, jamais silencieusement tronquée.
 */
export function parseNdjson(text: string, source = 'partie'): NdjsonParseResult {
    if (typeof text !== 'string') return { ok: false, error: `${source} illisible — contenu non textuel.` };
    const trimmed = text.trim();
    if (trimmed.length === 0) return { ok: true, rows: [] };

    const rows: BackupRow[] = [];
    const lines = trimmed.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index].trim();
        if (line.length === 0) continue;
        let parsed: unknown;
        try {
            parsed = JSON.parse(line);
        } catch {
            return { ok: false, error: `${source} corrompue — ligne ${index + 1} n'est pas un JSON valide.` };
        }
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return { ok: false, error: `${source} corrompue — ligne ${index + 1} n'est pas un objet.` };
        }
        rows.push(parsed as BackupRow);
    }
    return { ok: true, rows };
}
