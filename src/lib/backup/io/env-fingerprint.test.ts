import { DEFAULT_FINGERPRINT_KEYS, buildEnvFingerprint } from './env-fingerprint';

const SECRET_VALUE = 'super-secret-patron-42';

describe('backup/io/env-fingerprint — aucune valeur ne peut fuiter', () => {
    it('ne contient que des noms et des booléens, jamais de valeur', () => {
        const fingerprint = buildEnvFingerprint(['BACKUP_ENCRYPTION_KEY', 'DATABASE_URL'], {
            BACKUP_ENCRYPTION_KEY: SECRET_VALUE,
            DATABASE_URL: `postgres://user:${SECRET_VALUE}@host/db`,
        });

        const serialized = JSON.stringify(fingerprint);

        expect(serialized).not.toContain(SECRET_VALUE);
        expect(fingerprint.keys).toEqual(['BACKUP_ENCRYPTION_KEY', 'DATABASE_URL']);
        expect(fingerprint.present).toEqual({ BACKUP_ENCRYPTION_KEY: true, DATABASE_URL: true });
        for (const value of Object.values(fingerprint.present)) {
            expect(typeof value).toBe('boolean');
        }
    });

    it('ne contient pas non plus de fragment de valeur (nom du secret seul)', () => {
        const fingerprint = buildEnvFingerprint(['BACKUP_S3_SECRET_ACCESS_KEY'], {
            BACKUP_S3_SECRET_ACCESS_KEY: SECRET_VALUE,
        });

        expect(JSON.stringify(fingerprint)).not.toContain('patron');
    });

    it('marque une variable absente ou vide comme non présente', () => {
        const fingerprint = buildEnvFingerprint(['DATABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_DB_URL'], {
            DATABASE_URL: 'postgres://localhost/db',
            SUPABASE_SERVICE_ROLE_KEY: '   ',
        });

        expect(fingerprint.present).toEqual({
            DATABASE_URL: true,
            SUPABASE_SERVICE_ROLE_KEY: false,
            SUPABASE_DB_URL: false,
        });
    });

    it('produit une empreinte SHA-256 hexadécimale calculée sur les noms seuls', () => {
        const first = buildEnvFingerprint(['A', 'B'], { A: SECRET_VALUE });
        const second = buildEnvFingerprint(['A', 'B'], { A: 'autre-valeur' });
        const third = buildEnvFingerprint(['A', 'C'], { A: SECRET_VALUE });

        expect(first.sha256OfNames).toMatch(/^[0-9a-f]{64}$/);
        expect(first.sha256OfNames).toBe(second.sha256OfNames);
        expect(first.sha256OfNames).not.toBe(third.sha256OfNames);
    });

    it('utilise la liste de clés par défaut sans exposer aucun secret', () => {
        const fingerprint = buildEnvFingerprint(DEFAULT_FINGERPRINT_KEYS, {
            DATABASE_URL: SECRET_VALUE,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: SECRET_VALUE,
        });

        expect(fingerprint.keys).toEqual([...DEFAULT_FINGERPRINT_KEYS]);
        expect(JSON.stringify(fingerprint)).not.toContain(SECRET_VALUE);
    });
});
