/**
 * Sauvegarde automatique du site CUC — vérification d'intégrité.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : entrées = empreintes **fournies
 * par la couche I/O**, jamais calculées ici. Aucun accès fichier, réseau, base ;
 * aucun appel à `crypto`, `fs` ou `process.env`. Le module ne fait que comparer
 * et recalculer des agrégats déterministes.
 *
 * Plan de référence : `plans/plan-backups-automatiques-2026.md` § 4.3.
 */

import type {
    BackupManifest,
    BackupTotals,
    PartDigest,
    PartIntegrityFailure,
    TotalsCheck,
} from './contracts';

const SHA256_HEX_LENGTH = 64;

/**
 * Comparaison d'empreintes en **temps constant** (pas de sortie anticipée
 * hormis la longueur) : un digest qui ne correspond pas est détecté sans
 * révéler où se situe la divergence. Aucune I/O, aucune allocation notable.
 */
export function verifyPartDigest(
    expectedSha256: string,
    actualSha256: string | null | undefined,
): boolean {
    if (typeof expectedSha256 !== 'string' || typeof actualSha256 !== 'string') return false;

    const expected = expectedSha256.trim().toLowerCase();
    const actual = actualSha256.trim().toLowerCase();
    if (expected.length !== SHA256_HEX_LENGTH || actual.length !== SHA256_HEX_LENGTH) return false;

    let divergence = 0;
    for (let index = 0; index < SHA256_HEX_LENGTH; index += 1) {
        divergence |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
    }
    return divergence === 0;
}

/**
 * Confronte chaque partie du manifeste aux empreintes réellement observées.
 * Retourne **la liste des parties en défaut** (vide = intégrité confirmée) :
 * une empreinte absente est un défaut au même titre qu'une empreinte fausse —
 * un contrôle manquant ne doit jamais ressembler à un contrôle vert.
 */
export function verifyManifestIntegrity(
    manifest: BackupManifest,
    providedDigests: readonly PartDigest[],
): PartIntegrityFailure[] {
    const digestsByKey = new Map<string, string[]>();
    for (const digest of providedDigests) {
        const existing = digestsByKey.get(digest.objectKey);
        if (existing === undefined) digestsByKey.set(digest.objectKey, [digest.sha256]);
        else existing.push(digest.sha256);
    }

    const failures: PartIntegrityFailure[] = [];
    for (const part of manifest.parts) {
        const observed = digestsByKey.get(part.objectKey);
        if (observed === undefined || observed.length === 0) {
            failures.push({
                objectKey: part.objectKey,
                table: part.table,
                expectedSha256: part.sha256,
                actualSha256: null,
                reason: 'digest-missing',
            });
            continue;
        }
        if (!observed.some((candidate) => verifyPartDigest(part.sha256, candidate))) {
            failures.push({
                objectKey: part.objectKey,
                table: part.table,
                expectedSha256: part.sha256,
                actualSha256: observed[0],
                reason: 'digest-mismatch',
            });
        }
    }
    return failures;
}

/**
 * Recalcule les totaux **indépendamment** des parties et les confronte à ce que
 * le manifeste déclare. Le recalcul est volontairement autonome (il ne réutilise
 * pas `computeTotals`) : un contrôle d'intégrité qui partage le code du
 * producteur ne vérifie rien.
 */
export function verifyManifestTotals(manifest: BackupManifest): TotalsCheck {
    let parts = 0;
    let rows = 0;
    let bytes = 0;
    for (const part of manifest.parts) {
        parts += 1;
        rows += part.rows;
        bytes += part.compressedBytes;
    }

    const expected: BackupTotals = manifest.totals;
    const actual: BackupTotals = { parts, rows, bytes };
    return { ok: expected.parts === parts && expected.rows === rows && expected.bytes === bytes, expected, actual };
}
