import { randomBytes } from 'node:crypto';

import {
    BACKUP_ENV,
    BackupConfigError,
    loadBackupConfig,
    parseEncryptionKey,
    resolveDatabaseUrl,
    resolveRetentionPolicy,
    resolveStorageSelection,
} from './config';

const VALID_KEY = randomBytes(32).toString('base64');

function completeEnv(): Record<string, string | undefined> {
    return {
        [BACKUP_ENV.encryptionKey]: VALID_KEY,
        [BACKUP_ENV.databaseUrl]: 'postgres://user:pass@localhost:5432/cuc',
        [BACKUP_ENV.s3Endpoint]: 'https://account.r2.cloudflarestorage.com',
        [BACKUP_ENV.s3Bucket]: 'cuc-backups',
        [BACKUP_ENV.s3AccessKeyId]: 'AKIAEXAMPLEKEYID',
        [BACKUP_ENV.s3SecretAccessKey]: 'secret-access-value',
    };
}

describe('backup/io/config — validation stricte', () => {
    it('charge une configuration complète avec les valeurs par défaut documentées', () => {
        const config = loadBackupConfig(completeEnv());

        expect(config.storage.kind).toBe('s3');
        expect(config.prefix).toBe('cuc-backups');
        expect(config.encryption.keyId).toBe('v1');
        expect(config.encryption.key.byteLength).toBe(32);
        expect(config.retention).toEqual({ daily: 7, weekly: 4, monthly: 12 });
        expect(config.database.connectionString).toContain('postgres://');
    });

    it('applique région « auto » et forcePathStyle par défaut (R2)', () => {
        const selection = resolveStorageSelection(completeEnv());

        expect(selection).toMatchObject({ kind: 's3', region: 'auto', forcePathStyle: true });
    });

    it('nomme la variable manquante quand la clé de chiffrement est absente', () => {
        const env = completeEnv();
        delete env[BACKUP_ENV.encryptionKey];

        try {
            loadBackupConfig(env);
            throw new Error('la configuration aurait dû échouer');
        } catch (error) {
            expect(error).toBeInstanceOf(BackupConfigError);
            expect((error as BackupConfigError).variable).toBe(BACKUP_ENV.encryptionKey);
            expect((error as Error).message).toContain('BACKUP_ENCRYPTION_KEY');
        }
    });

    it('refuse une clé de 31 octets en nommant la variable', () => {
        const raw = randomBytes(31).toString('base64');
        try {
            parseEncryptionKey(raw);
            throw new Error('la clé aurait dû être refusée');
        } catch (error) {
            expect((error as BackupConfigError).message).toContain('31');
            expect((error as BackupConfigError).message).toContain('BACKUP_ENCRYPTION_KEY');
        }
    });

    it('refuse une clé de 33 octets', () => {
        const raw = randomBytes(33).toString('base64');
        try {
            parseEncryptionKey(raw);
            throw new Error('la clé aurait dû être refusée');
        } catch (error) {
            expect((error as BackupConfigError).message).toContain('33');
        }
    });

    it('refuse un base64 invalide', () => {
        try {
            parseEncryptionKey('ceci-n’est-pas-du-base64!!!');
            throw new Error('la clé aurait dû être refusée');
        } catch (error) {
            expect((error as BackupConfigError).message).toContain('base64');
        }
    });

    it('accepte une clé de 32 octets valide', () => {
        expect(parseEncryptionKey(VALID_KEY).byteLength).toBe(32);
    });

    it('nomme BACKUP_S3_BUCKET quand la configuration S3 est incomplète', () => {
        const env = completeEnv();
        delete env[BACKUP_ENV.s3Bucket];

        try {
            loadBackupConfig(env);
            throw new Error('la configuration aurait dû échouer');
        } catch (error) {
            expect((error as Error).message).toContain('BACKUP_S3_BUCKET');
        }
    });

    it('refuse un adaptateur de stockage inconnu en nommant la variable', () => {
        const env = { ...completeEnv(), [BACKUP_ENV.storageKind]: 'gcs' };

        try {
            resolveStorageSelection(env);
            throw new Error('la sélection aurait dû échouer');
        } catch (error) {
            expect((error as Error).message).toContain('BACKUP_STORAGE_KIND');
        }
    });

    it('accepte l’adaptateur local avec une racine par défaut', () => {
        const selection = resolveStorageSelection({ [BACKUP_ENV.storageKind]: 'local' });

        expect(selection.kind).toBe('local');
        if (selection.kind === 'local') expect(selection.root.length).toBeGreaterThan(0);
    });

    it('résout la connexion base par repli sur SUPABASE_DB_URL', () => {
        expect(resolveDatabaseUrl({ [BACKUP_ENV.databaseUrlFallback]: 'postgres://fallback/db' })).toBe(
            'postgres://fallback/db',
        );

        try {
            resolveDatabaseUrl({});
            throw new Error('la résolution aurait dû échouer');
        } catch (error) {
            expect((error as Error).message).toContain('DATABASE_URL');
        }
    });

    it('surcharge la politique de rétention et refuse une valeur non entière', () => {
        expect(
            resolveRetentionPolicy({
                [BACKUP_ENV.retentionDaily]: '3',
                [BACKUP_ENV.retentionWeekly]: '2',
                [BACKUP_ENV.retentionMonthly]: '1',
            }),
        ).toEqual({ daily: 3, weekly: 2, monthly: 1 });

        try {
            resolveRetentionPolicy({ [BACKUP_ENV.retentionDaily]: 'beaucoup' });
            throw new Error('la politique aurait dû échouer');
        } catch (error) {
            expect((error as Error).message).toContain('BACKUP_RETENTION_DAILY');
        }
    });

    it('lit forcePathStyle à false quand il est explicitement désactivé', () => {
        const env = { ...completeEnv(), [BACKUP_ENV.s3ForcePathStyle]: 'false' };
        expect(resolveStorageSelection(env)).toMatchObject({ forcePathStyle: false });
    });

    it('accepte un identifiant de clé personnalisé', () => {
        const env = { ...completeEnv(), [BACKUP_ENV.encryptionKeyId]: '2026-10' };
        expect(loadBackupConfig(env).encryption.keyId).toBe('2026-10');
    });
});
