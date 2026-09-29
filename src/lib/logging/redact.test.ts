/**
 * Tests de l'expurgation.
 *
 * L'enjeu n'est pas cosmétique : un journal qui conserve un jeton de service
 * transforme un outil d'exploitation en incident de sécurité. Ces cas
 * verrouillent donc l'absence de fuite **et** la conservation de ce qui reste
 * utile au diagnostic (le code d'erreur, le domaine de l'adresse).
 *
 * Aucun import de `vitest` : `globals: true` est activé (cf. `vitest.config.mts`).
 */
import { REDACTED, redactContext, redactEntry, redactText, redactValue } from './redact';

describe('redactText', () => {
    it('masque la boîte d’une adresse e-mail et conserve son domaine', () => {
        expect(redactText('destinataire : niels.dalery@gmail.com')).toBe(
            `destinataire : ${REDACTED}@gmail.com`,
        );
    });

    it('retire une clé de service Supabase', () => {
        const out = redactText('clé refusée sb_secret_abcdefgh1234 (SDK)');
        expect(out).not.toContain('abcdefgh1234');
        expect(out).toContain(REDACTED);
    });

    it('retire un jeton JWT complet', () => {
        const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.c2ln';
        expect(redactText(`Authorization: ${jwt}`)).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    });

    it('neutralise un en-tête Bearer recopié dans un message', () => {
        expect(redactText('rejet : bearer abcDEF123456')).toBe(`rejet : Bearer ${REDACTED}`);
    });

    it('retire une empreinte hexadécimale longue', () => {
        const hash = 'a'.repeat(40);
        expect(redactText(`checksum ${hash}`)).toBe(`checksum ${REDACTED}`);
    });

    it('laisse intact un message technique ordinaire', () => {
        const message = 'Table absente en base — une migration n’a pas été appliquée.';
        expect(redactText(message)).toBe(message);
    });

    it('tronque une chaîne démesurée', () => {
        const out = redactText('x'.repeat(600));
        expect(out.endsWith('…')).toBe(true);
        expect(out.length).toBeLessThanOrEqual(501);
    });
});

describe('redactValue', () => {
    it('remplace la valeur d’une clé sensible sans descendre dedans', () => {
        const out = redactValue({ access_token: { nested: 'valeur' }, slug: 'home' }) as Record<
            string,
            unknown
        >;
        expect(out.access_token).toBe(REDACTED);
        expect(out.slug).toBe('home');
    });

    it('reconnaît les variantes de nommage d’une clé secrète', () => {
        const out = redactValue({
            password: 'p',
            API_KEY: 'k',
            refresh_token: 'r',
            authorization: 'a',
            SUPABASE_SERVICE_ROLE_KEY: 's',
        }) as Record<string, unknown>;
        for (const value of Object.values(out)) expect(value).toBe(REDACTED);
    });

    it('conserve les valeurs numériques et booléennes utiles', () => {
        expect(redactValue({ attempts: 3, ok: false })).toEqual({ attempts: 3, ok: false });
    });

    it('résume au-delà de la profondeur maximale', () => {
        const deep = { a: { b: { c: { d: { e: { f: 'trop profond' } } } } } };
        expect(JSON.stringify(redactValue(deep))).toContain(REDACTED);
    });

    it('borne les tableaux volumineux', () => {
        const out = redactValue(Array.from({ length: 80 }, (_, i) => i)) as unknown[];
        expect(out.length).toBe(50);
    });

    it('convertit une erreur en structure sûre', () => {
        const out = redactValue(new Error('échec sur niels@cuc.fr')) as Record<string, unknown>;
        expect(out.name).toBe('Error');
        expect(String(out.message)).toContain(`${REDACTED}@cuc.fr`);
    });
});

describe('redactContext', () => {
    it('renvoie null pour un contexte vide', () => {
        expect(redactContext(null)).toBeNull();
        expect(redactContext({})).toBeNull();
    });

    it('expurge un contexte complet', () => {
        const out = redactContext({ slug: 'home', token: 'sb_secret_abcdefgh1234' });
        expect(out?.slug).toBe('home');
        expect(out?.token).toBe(REDACTED);
    });
});

describe('redactEntry', () => {
    it('expurge message, cible, origine et contexte en un seul passage', () => {
        const out = redactEntry({
            level: 'error',
            source: 'supabase',
            category: 'db.rls_denied',
            message: 'refus pour niels@cuc.fr',
            target: 'sb_secret_abcdefgh1234',
            origin: 'actions/pages.ts',
            context: { email: 'niels@cuc.fr' },
        });

        expect(out.message).toContain(`${REDACTED}@cuc.fr`);
        expect(out.target).toBe(REDACTED);
        expect(out.origin).toBe('actions/pages.ts');
        expect(out.context?.email).toBe(`${REDACTED}@cuc.fr`);
    });
});
