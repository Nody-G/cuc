/**
 * Tests de la classification des erreurs.
 *
 * Ces cas sont ceux qui se sont réellement produits dans le projet : table
 * absente (`site_audit_logs` avant migration), écriture refusée par RLS, envoi
 * d'invitation sans SMTP. Chacun doit être reconnu **par son code**, pas par son
 * message — c'est la seule information que `supabase-js` ne traduit pas.
 */
import { classifyError, classifyStatus, extractErrorCode, extractErrorMessage } from './classify';

const FALLBACK = { source: 'cockpit' as const, category: 'page.save' };

describe('extractErrorMessage', () => {
    it('lit une chaîne, une Error et un objet PostgREST', () => {
        expect(extractErrorMessage('brut')).toBe('brut');
        expect(extractErrorMessage(new Error('boom'))).toBe('boom');
        expect(extractErrorMessage({ message: 'message objet' })).toBe('message objet');
        expect(extractErrorMessage({ error_description: 'description' })).toBe('description');
        expect(extractErrorMessage(null)).toBe('');
    });
});

describe('extractErrorCode', () => {
    it('lit un code texte, un code numérique et un statut', () => {
        expect(extractErrorCode({ code: '42P01' })).toBe('42P01');
        expect(extractErrorCode({ status: 500 })).toBe('500');
        expect(extractErrorCode({ statusCode: '429' })).toBe('429');
        expect(extractErrorCode(new Error('sans code'))).toBeNull();
    });
});

describe('classifyStatus', () => {
    it('classe les statuts en niveaux exploitables', () => {
        expect(classifyStatus(401).level).toBe('error');
        expect(classifyStatus(404).level).toBe('warning');
        expect(classifyStatus(429).category).toBe('http.rate_limited');
        expect(classifyStatus(503).level).toBe('error');
        expect(classifyStatus(302).level).toBe('info');
    });
});

describe('classifyError', () => {
    it('reconnaît une table absente et nomme la cause probable', () => {
        const out = classifyError(
            { code: '42P01', message: 'relation "public.site_audit_logs" does not exist' },
            FALLBACK,
        );
        expect(out.source).toBe('supabase');
        expect(out.category).toBe('db.table_missing');
        expect(out.level).toBe('error');
        expect(out.message).toContain('migration');
        expect(out.context.code).toBe('42P01');
    });

    it('reconnaît un refus RLS', () => {
        const out = classifyError(
            { code: '42501', message: 'new row violates row-level security policy' },
            FALLBACK,
        );
        expect(out.category).toBe('db.rls_denied');
    });

    it('reconnaît une colonne absente du schéma', () => {
        const out = classifyError({ code: '42703', message: 'column x does not exist' }, FALLBACK);
        expect(out.category).toBe('db.column_missing');
    });

    it('reconnaît un doublon (avertissement, pas incident)', () => {
        const out = classifyError({ code: '23505', message: 'duplicate key value' }, FALLBACK);
        expect(out.level).toBe('warning');
        expect(out.category).toBe('db.unique_violation');
    });

    it('reconnaît une référence vers une ligne inexistante', () => {
        const out = classifyError({ code: '23503', message: 'violates foreign key constraint' }, FALLBACK);
        expect(out.category).toBe('db.foreign_key_violation');
    });

    it('reconnaît un jeton expiré', () => {
        const out = classifyError({ code: 'PGRST301', message: 'JWT expired' }, FALLBACK);
        expect(out.category).toBe('auth.jwt_expired');
        expect(out.level).toBe('warning');
    });

    it('reconnaît un bucket de stockage absent', () => {
        const out = classifyError(new Error('Bucket not found'), FALLBACK);
        expect(out.source).toBe('media');
        expect(out.category).toBe('media.bucket_missing');
    });

    it('reconnaît un fichier trop lourd', () => {
        const out = classifyError(new Error('The object exceeded the maximum allowed size'), FALLBACK);
        expect(out.category).toBe('media.payload_too_large');
    });

    it('reconnaît un refus SMTP', () => {
        const out = classifyError(new Error('Error sending invite: SMTP connection refused'), FALLBACK);
        expect(out.source).toBe('email');
        expect(out.category).toBe('email.smtp_failed');
        expect(out.level).toBe('warning');
    });

    it('reconnaît un jeton Instagram expiré', () => {
        const out = classifyError({ error: 'OAuthException', code: 190 }, FALLBACK);
        expect(out.source).toBe('instagram');
        expect(out.category).toBe('instagram.token_expired');
    });

    it('reconnaît un service injoignable', () => {
        const out = classifyError(new Error('fetch failed'), FALLBACK);
        expect(out.category).toBe('network.unreachable');
    });

    it('retombe sur le statut HTTP quand aucune règle ne correspond', () => {
        const out = classifyError(new Error('Request failed with status code 503'), FALLBACK);
        expect(out.category).toBe('http.503');
        expect(out.level).toBe('error');
        expect(out.context.status).toBe(503);
    });

    it('respecte le contexte d’appel fourni par le code appelant', () => {
        const out = classifyError(new Error('échec inattendu'), {
            source: 'media',
            category: 'media.move',
            level: 'warning',
        });
        expect(out.source).toBe('media');
        expect(out.category).toBe('media.move');
        expect(out.level).toBe('warning');
        expect(out.message).toBe('échec inattendu');
    });

    it('produit un message de repli quand rien n’est exploitable', () => {
        const out = classifyError(null, FALLBACK);
        expect(out.message).toBe('Échec sans message exploitable.');
        expect(out.level).toBe('error');
    });
});
