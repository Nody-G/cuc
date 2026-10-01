'use server';

/**
 * Server Actions du panneau « Versions & restauration » — Cockpit.
 *
 * Trois actions, **toutes protégées côté serveur** :
 *  1. `listBackupVersions()` — **lecture seule** : état de configuration,
 *     catalogue des versions et constats de santé ;
 *  2. `simulateRestore(snapshotId)` — **lecture seule** : plan table par table,
 *     ce qui serait inséré / modifié / supprimé / **préservé** ;
 *  3. `restoreFromSnapshot(input)` — écriture, uniquement après les trois
 *     vérifications serveur (rôle, ré-authentification, phrase exacte) portées
 *     par `backup-versions-service.ts`.
 *
 * Le moteur `src/lib/backup/restore.ts` reste la **seule porte d'écriture** :
 * ces actions ne font que câbler ses dépendances et mapper son rapport.
 * Aucun mot de passe n'est jamais journalisé ; aucune donnée n'est journalisée.
 *
 * Cette composition est le seul point du Cockpit qui charge `pg` et le SDK S3 :
 * les tests du service utilisent des doubles injectés, jamais ce module.
 */

import { createClient } from '@/lib/supabase/server';
import { gunzipBuffer } from '@/lib/backup/io/compress';
import type { BackupConfig } from '@/lib/backup/io/config';
import { decryptBuffer } from '@/lib/backup/io/crypto';
import type { ApplyRestorePlan } from '@/lib/backup/io/db-restore';
import { applyRestore } from '@/lib/backup/io/db-restore';
import { listPublicTables, readTables } from '@/lib/backup/io/db-read';
import { readBackupIndex } from '@/lib/backup/io/index-store';
import { createStorage, type BackupStorage } from '@/lib/backup/io/storage';
import type { BackupIndexEntry, BackupManifest } from '@/lib/backup/contracts';
import { parseManifest } from '@/lib/backup/manifest';
import { buildIndexObjectKey, sha256Hex } from '@/lib/backup/naming';
import { createPreSnapshot } from '@/lib/backup/pre-snapshot';
import { runRestore, type RestoreDependencies, type RestoreReport } from '@/lib/backup/restore';
import { BACKUP_TABLES } from '@/lib/backup/whitelist';
import {
    COCKPIT_ROLES,
    buildBackupStatusView,
    executeRestoreWithGuards,
    hasRole,
    inspectBackupConfiguration,
    toRestorePlanView,
    type RestoreActor,
    type RestoreGuardDeps,
} from './backup-versions-service';
import type {
    ListBackupVersionsResult,
    RestoreOutcome,
    RestoreRequest,
    SimulateRestoreResult,
} from '../components/backup-view/backup-status.types';
import { getCurrentUserProfile } from './auth';
import { revalidateSite } from './revalidate';

/** Routes hydratées après une restauration réussie (identique à `backup.ts`). */
const REVALIDATED_ROUTES: readonly string[] = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/contact-cuc',
    '/team-building-cascadeurs',
];

/** Nombre maximal de manifestes lus pour renseigner les comptages du catalogue. */
const MAX_MANIFEST_READS = 30;

/** Acteur courant lu dans la session Supabase (jamais fourni par le client). */
async function readActor(): Promise<RestoreActor | null> {
    const profile = await getCurrentUserProfile();
    if (profile === null) return null;
    return { role: profile.role ?? '', email: profile.email ?? null };
}

/**
 * Ré-authentifie l'utilisateur courant contre son propre compte. Le mot de passe
 * n'est **jamais** stocké ni journalisé : il est transmis à Supabase puis oublié.
 */
async function verifyPassword(password: string): Promise<boolean> {
    if (typeof password !== 'string' || password.length === 0) return false;
    const profile = await getCurrentUserProfile();
    if (profile === null || typeof profile.email !== 'string' || profile.email.length === 0) return false;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: profile.email, password });
    return error === null;
}

/** Lit les manifestes des versions les plus récentes ; un échec n'est jamais fatal. */
async function readManifests(
    storage: BackupStorage,
    entries: readonly BackupIndexEntry[],
): Promise<BackupManifest[]> {
    const targets = [...entries]
        .sort((left, right) => (left.createdAt < right.createdAt ? 1 : left.createdAt > right.createdAt ? -1 : 0))
        .slice(0, MAX_MANIFEST_READS);
    const loaded = await Promise.all(
        targets.map(async (entry) => {
            const fetched = await storage.get(`${entry.prefix}/manifest.json`);
            if (!fetched.ok) return null;
            const parsed = parseManifest(fetched.value.toString('utf8'));
            return parsed.ok ? parsed.manifest : null;
        }),
    );
    return loaded.filter((manifest): manifest is BackupManifest => manifest !== null);
}

/** Câble les dépendances du moteur : un seul point de composition (`pg`, AES, S3). */
function buildRestoreDependencies(
    config: BackupConfig,
    storage: BackupStorage,
    env: Record<string, string | undefined>,
    tables: readonly string[] | null,
): RestoreDependencies {
    const connectionString = config.database.connectionString;
    const readCurrent = (targets: readonly string[]) => readTables({ tables: targets, connectionString });
    return {
        storage,
        indexObjectKey: buildIndexObjectKey(config.prefix),
        readTables: readCurrent,
        digest: sha256Hex,
        decrypt: (envelope: Uint8Array) =>
            decryptBuffer(envelope, (keyId) => (keyId === config.encryption.keyId ? config.encryption.key : null)),
        decompress: gunzipBuffer,
        applyRestore: (plan: ApplyRestorePlan) => applyRestore({ connectionString, plan }),
        preSnapshot: createPreSnapshot({
            storage,
            readTables: readCurrent,
            listTables: () => listPublicTables({ connectionString }),
            key: config.encryption.key,
            keyId: config.encryption.keyId,
            prefix: config.prefix,
            retention: config.retention,
            env,
            tables: tables ?? [...BACKUP_TABLES],
        }),
        now: () => new Date(),
    };
}

/** État de configuration, catalogue et santé — jamais une liste vide ambiguë. */
export async function listBackupVersions(): Promise<ListBackupVersionsResult> {
    const actor = await readActor();
    if (actor === null || !hasRole(actor.role, COCKPIT_ROLES)) {
        return { ok: false, error: 'Accès refusé : l’état des sauvegardes est réservé aux comptes du Cockpit.' };
    }

    const env = { ...process.env };
    const now = new Date();
    const inspection = inspectBackupConfiguration(env);
    if (!inspection.ok) {
        return { ok: true, view: buildBackupStatusView({ env, index: null, manifests: [], readError: null, now }) };
    }

    const created = await createStorage(inspection.config.storage);
    if (!created.ok) {
        return { ok: false, error: `Stockage indisponible [${created.error.code}] — ${created.error.message}.` };
    }

    const index = await readBackupIndex(created.value, buildIndexObjectKey(inspection.config.prefix), () => now.toISOString());
    if (!index.ok) {
        return { ok: false, error: `Catalogue illisible [${index.error.code}] — ${index.error.message}.` };
    }

    const manifests = await readManifests(created.value, index.value.entries);
    return { ok: true, view: buildBackupStatusView({ env, index: index.value, manifests, readError: null, now }) };
}

/** Simulation : aucun octet écrit en base, aucune donnée modifiée. */
export async function simulateRestore(snapshotId: string): Promise<SimulateRestoreResult> {
    const actor = await readActor();
    if (actor === null || !hasRole(actor.role, COCKPIT_ROLES)) {
        return { ok: false, error: 'Accès refusé : la simulation est réservée aux comptes du Cockpit.' };
    }
    if (typeof snapshotId !== 'string' || snapshotId.trim().length === 0) {
        return { ok: false, error: 'Instantané non précisé — simulation refusée.' };
    }

    const env = { ...process.env };
    const inspection = inspectBackupConfiguration(env);
    if (!inspection.ok) return { ok: false, error: inspection.state.message };
    const config = inspection.config;

    const created = await createStorage(config.storage);
    if (!created.ok) return { ok: false, error: `Stockage indisponible [${created.error.code}] — ${created.error.message}.` };

    try {
        const report: RestoreReport = await runRestore(
            buildRestoreDependencies(config, created.value, env, null),
            { snapshotId, write: false },
        );
        return { ok: true, plan: toRestorePlanView(report) };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'cause inconnue';
        return { ok: false, error: message };
    }
}

/** Restauration réelle — les trois vérifications vivent dans le service. */
export async function restoreFromSnapshot(input: RestoreRequest): Promise<RestoreOutcome> {
    const env = { ...process.env };
    const inspection = inspectBackupConfiguration(env);
    if (!inspection.ok) {
        return {
            ok: false,
            error: `Sauvegardes versionnées désactivées — ${inspection.state.message}`,
            status: 'refused',
            preSnapshotId: null,
            tables: [],
        };
    }
    const config = inspection.config;

    const created = await createStorage(config.storage);
    if (!created.ok) {
        return {
            ok: false,
            error: `Stockage indisponible [${created.error.code}] — ${created.error.message}.`,
            status: 'refused',
            preSnapshotId: null,
            tables: [],
        };
    }

    const deps: RestoreGuardDeps = {
        readActor,
        verifyPassword,
        runRestore: (request) =>
            runRestore(buildRestoreDependencies(config, created.value, env, request.tables ?? null), {
                snapshotId: request.snapshotId,
                tables: request.tables ?? null,
                write: true,
            }),
    };

    const outcome = await executeRestoreWithGuards(deps, input);
    if (outcome.ok) await revalidateSite([...REVALIDATED_ROUTES]);
    return outcome;
}
