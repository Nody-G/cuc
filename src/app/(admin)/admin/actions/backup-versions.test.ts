/**
 * Tests des **gardes serveur** du panneau « Versions & restauration » — doubles
 * injectés, aucun réseau, aucune base, aucune restauration réelle.
 *
 * Le point le plus important : **une vérification échouée n'appelle jamais
 * `runRestore`**. Un appel forgé depuis le client (rôle, mot de passe ou phrase
 * falsifiés) doit donc se solder par un refus, sans le moindre accès au moteur.
 *
 * Convention du dépôt : aucun import de `vitest` (`globals: true`).
 */

import type { RestoreReport } from '@/lib/backup/restore';
import {
    COCKPIT_ROLES,
    RESTORE_ROLES,
    executeRestoreWithGuards,
    hasRole,
    inspectBackupConfiguration,
    type RestoreGuardDeps,
} from './backup-versions-service';
import type { RestoreRequest } from '../components/backup-view/backup-status.types';

/** Environnement complet et valide (dépôt local : aucun accès réseau au dépôt objet). */
const COMPLETE_ENV: Record<string, string> = {
    BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 5).toString('base64'),
    DATABASE_URL: 'postgres://user:secret@localhost:5432/cuc',
    BACKUP_STORAGE_KIND: 'local',
    BACKUP_LOCAL_ROOT: '.backup-test-run',
};

function fakeReport(overrides: Partial<RestoreReport> = {}): RestoreReport {
    return {
        snapshotId: 'snapshot-1',
        dryRun: false,
        status: 'applied',
        tables: [
            {
                table: 'site_pages',
                appendOnly: false,
                insert: 2,
                update: 1,
                delete: 1,
                preserved: 0,
                bridgePreserved: 0,
                deleteAllowed: true,
                reason: 'Table de contenu éditorial.',
            },
            {
                table: 'site_inquiries',
                appendOnly: true,
                insert: 0,
                update: 0,
                delete: 0,
                preserved: 3,
                bridgePreserved: 0,
                deleteAllowed: false,
                reason: 'Table append-only : suppression refusée.',
            },
        ],
        totals: { insert: 2, update: 1, delete: 1, preserved: 3, bridgePreserved: 0 },
        writeOrder: ['site_pages', 'site_inquiries'],
        deleteOrder: ['site_inquiries', 'site_pages'],
        preSnapshotId: 'snapshot-pre',
        postCheck: { ok: true, mismatches: [] },
        bridgeFallbacks: [],
        error: null,
        durationMs: 12,
        ...overrides,
    };
}

function guards(overrides: Partial<RestoreGuardDeps> = {}): RestoreGuardDeps {
    return {
        readActor: async () => ({ role: 'admin', email: 'admin@cuc.test' }),
        verifyPassword: async () => true,
        runRestore: vi.fn(async () => fakeReport()),
        ...overrides,
    };
}

const VALID_REQUEST: RestoreRequest = {
    snapshotId: 'snapshot-1',
    phrase: 'RESTAURER snapshot-1',
    password: 'mot-de-passe-correct',
};

describe('inspectBackupConfiguration', () => {
    it('déclare la configuration complète quand toutes les variables sont présentes', () => {
        const inspection = inspectBackupConfiguration({ ...COMPLETE_ENV });

        expect(inspection.ok).toBe(true);
        expect(inspection.state.kind).toBe('ready');
    });

    it('nomme la variable manquante au lieu de renvoyer une liste vide ambiguë', () => {
        const withoutKey: Record<string, string> = { ...COMPLETE_ENV };
        delete withoutKey.BACKUP_ENCRYPTION_KEY;
        const inspection = inspectBackupConfiguration(withoutKey);

        expect(inspection.ok).toBe(false);
        expect(inspection.state.kind).toBe('incomplete');
        if (inspection.state.kind !== 'incomplete') throw new Error('état inattendu');
        expect(inspection.state.missingVariables).toContain('BACKUP_ENCRYPTION_KEY');
        expect(inspection.state.message).toContain('BACKUP_ENCRYPTION_KEY');
    });
});

describe('executeRestoreWithGuards — les trois vérifications serveur', () => {
    it('refuse un rôle insuffisant sans déclencher la moindre restauration', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(
            guards({ readActor: async () => ({ role: 'secretaire', email: 'sec@cuc.test' }), runRestore }),
            VALID_REQUEST,
        );

        expect(outcome.status).toBe('refused');
        expect(outcome.ok).toBe(false);
        expect(outcome.error).toContain('Rôle insuffisant');
        expect(runRestore).not.toHaveBeenCalled();
    });

    it('refuse un compte absent sans déclencher la moindre restauration', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(guards({ readActor: async () => null, runRestore }), VALID_REQUEST);

        expect(outcome.ok).toBe(false);
        expect(runRestore).not.toHaveBeenCalled();
    });

    it('refuse un mot de passe faux sans déclencher la moindre restauration', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(
            guards({ verifyPassword: async () => false, runRestore }),
            VALID_REQUEST,
        );

        expect(outcome.status).toBe('refused');
        expect(outcome.error).toContain('Mot de passe');
        expect(runRestore).not.toHaveBeenCalled();
    });

    it('refuse une phrase incorrecte même avec un mot de passe valide', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(guards({ runRestore }), {
            ...VALID_REQUEST,
            phrase: 'restaurer snapshot-1',
        });

        expect(outcome.status).toBe('refused');
        expect(outcome.error).toContain('Phrase de confirmation');
        expect(runRestore).not.toHaveBeenCalled();
    });

    it('refuse une phrase partielle (identifiant d’un autre instantané)', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(guards({ runRestore }), {
            ...VALID_REQUEST,
            phrase: 'RESTAURER snapshot-2',
        });

        expect(outcome.ok).toBe(false);
        expect(runRestore).not.toHaveBeenCalled();
    });

    it('n’exécute la restauration qu’après les trois vérifications, puis renvoie le rapport', async () => {
        const runRestore = vi.fn(async () => fakeReport());
        const outcome = await executeRestoreWithGuards(guards({ runRestore }), VALID_REQUEST);

        expect(runRestore).toHaveBeenCalledTimes(1);
        expect(runRestore).toHaveBeenCalledWith(VALID_REQUEST);
        expect(outcome.ok).toBe(true);
        expect(outcome.status).toBe('applied');
        expect(outcome.preSnapshotId).toBe('snapshot-pre');
        expect(outcome.tables).toEqual([
            { table: 'site_pages', insert: 2, update: 1, delete: 1, preserved: 0 },
            { table: 'site_inquiries', insert: 0, update: 0, delete: 0, preserved: 3 },
        ]);
    });

    it('remonte un échec du moteur sans le masquer', async () => {
        const runRestore = vi.fn(async () => {
            throw new Error('Pré-instantané absent ou dégradé — écriture refusée.');
        });
        const outcome = await executeRestoreWithGuards(guards({ runRestore }), VALID_REQUEST);

        expect(outcome.ok).toBe(false);
        expect(outcome.status).toBe('failed');
        expect(outcome.error).toContain('Pré-instantané absent');
    });
});

describe('hasRole', () => {
    it('n’autorise que les rôles listés, jamais un rôle vide', () => {
        expect(hasRole('admin', RESTORE_ROLES)).toBe(true);
        expect(hasRole('directeur', RESTORE_ROLES)).toBe(true);
        expect(hasRole('secretaire', RESTORE_ROLES)).toBe(false);
        expect(hasRole('', COCKPIT_ROLES)).toBe(false);
        expect(hasRole('coach', COCKPIT_ROLES)).toBe(false);
    });
});
