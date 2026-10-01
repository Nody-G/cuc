/**
 * Sauvegarde automatique du site CUC — empreinte d'environnement.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : produire un
 * diagnostic d'environnement **sans jamais exposer une valeur de secret**
 * (`plans/plan-backups-automatiques-2026.md` § 1, couche d).
 *
 * Sortie strictement limitée à trois choses : la liste des **noms** de clés, un
 * booléen « présente / absente » par clé, et une empreinte SHA-256 **calculée
 * sur les noms seuls**. Aucune valeur d'environnement ne peut donc fuiter, même
 * par accident : elle n'est jamais lue dans la sortie.
 */

import { createHash } from 'node:crypto';

import type { EnvSource } from './config';

/** Résultat d'empreinte : noms et booléens uniquement, jamais de valeur. */
export interface EnvFingerprint {
    keys: string[];
    present: Record<string, boolean>;
    sha256OfNames: string;
}

/**
 * Clés suivies par défaut : uniquement des **noms** déjà en usage dans le
 * dépôt. Les secrets ne sont jamais lus, seulement constatés présents ou non.
 */
export const DEFAULT_FINGERPRINT_KEYS: readonly string[] = [
    'DATABASE_URL',
    'SUPABASE_DB_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'BACKUP_ENCRYPTION_KEY',
    'BACKUP_ENCRYPTION_KEY_ID',
    'BACKUP_STORAGE_KIND',
    'BACKUP_STORAGE_PREFIX',
    'BACKUP_S3_ENDPOINT',
    'BACKUP_S3_BUCKET',
    'BACKUP_S3_ACCESS_KEY_ID',
    'BACKUP_S3_SECRET_ACCESS_KEY',
    'BACKUP_S3_REGION',
];

/** Vrai si la variable est définie et non vide. La valeur n'est jamais conservée. */
function isPresent(env: EnvSource, name: string): boolean {
    const raw = env?.[name];
    return typeof raw === 'string' && raw.trim().length > 0;
}

/**
 * Construit l'empreinte d'environnement. `env` est injectable : les tests
 * fournissent un environnement factice et prouvent qu'aucune valeur ne sort.
 */
export function buildEnvFingerprint(
    names: readonly string[] = DEFAULT_FINGERPRINT_KEYS,
    env: EnvSource = process.env,
): EnvFingerprint {
    const keys = [...names];
    const present: Record<string, boolean> = {};
    for (const name of keys) present[name] = isPresent(env, name);

    return {
        keys,
        present,
        sha256OfNames: createHash('sha256').update(keys.join('\n')).digest('hex'),
    };
}
