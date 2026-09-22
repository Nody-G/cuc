import {
    DRAFT_STORAGE_PREFIX,
    DRAFT_STORAGE_VERSION,
    clearDraftSnapshot,
    draftStorageKey,
    isDraftPersistable,
    readDraftSnapshot,
    recoveredDraftMessage,
    writeDraftSnapshot,
} from './draft-storage';

/** Stockage mémoire minimal, injecté : aucun besoin de navigateur. */
function memoryStorage(): Storage {
    const map = new Map<string, string>();
    return {
        get length() {
            return map.size;
        },
        clear: () => map.clear(),
        getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
        key: (index: number) => [...map.keys()][index] ?? null,
        removeItem: (key: string) => void map.delete(key),
        setItem: (key: string, value: string) => void map.set(key, value),
    } as Storage;
}

const DRAFT = { hero: { title: 'Campus' }, sections_data: { about: { title: 'À propos' } } };

describe('draftStorageKey', () => {
    it('normalise le slug racine et l’espace de noms', () => {
        expect(draftStorageKey('/', 'fr')).toBe(`${DRAFT_STORAGE_PREFIX}.home.fr`);
        expect(draftStorageKey('/formation-de-cascadeur', 'en')).toBe(
            `${DRAFT_STORAGE_PREFIX}.formation-de-cascadeur.en`
        );
    });
});

describe('isDraftPersistable', () => {
    it('n’écrit que s’il y a une vraie modification', () => {
        expect(isDraftPersistable(0)).toBe(false);
        expect(isDraftPersistable(3)).toBe(true);
        expect(isDraftPersistable(Number.NaN)).toBe(false);
    });
});

describe('writeDraftSnapshot / readDraftSnapshot', () => {
    it('écrit puis relit un brouillon', () => {
        const storage = memoryStorage();
        expect(writeDraftSnapshot('/', 'fr', DRAFT, { storage, now: 1_000 })).toBe(true);

        const stored = readDraftSnapshot('/', 'fr', { storage, now: 1_500 });
        expect(stored?.draft).toEqual(DRAFT);
        expect(stored?.version).toBe(DRAFT_STORAGE_VERSION);
        expect(stored?.savedAt).toBe(1_000);
    });

    it('isole les langues et les pages', () => {
        const storage = memoryStorage();
        writeDraftSnapshot('/', 'fr', DRAFT, { storage });

        expect(readDraftSnapshot('/', 'en', { storage })).toBeNull();
        expect(readDraftSnapshot('/contact-cuc', 'fr', { storage })).toBeNull();
    });

    it('ignore un brouillon expiré et nettoie l’entrée', () => {
        const storage = memoryStorage();
        writeDraftSnapshot('/', 'fr', DRAFT, { storage, now: 0 });

        const eightDays = 8 * 24 * 60 * 60 * 1000;
        expect(readDraftSnapshot('/', 'fr', { storage, now: eightDays })).toBeNull();
        expect(storage.getItem(draftStorageKey('/', 'fr'))).toBeNull();
    });

    it('ignore un contenu illisible ou d’une autre version', () => {
        const storage = memoryStorage();
        storage.setItem(draftStorageKey('/', 'fr'), '{ceci n’est pas du json');
        expect(readDraftSnapshot('/', 'fr', { storage })).toBeNull();

        storage.setItem(
            draftStorageKey('/', 'fr'),
            JSON.stringify({ version: 0, savedAt: Date.now(), slug: '/', locale: 'fr', draft: DRAFT })
        );
        expect(readDraftSnapshot('/', 'fr', { storage })).toBeNull();
    });

    it('reste silencieux sans stockage disponible', () => {
        expect(writeDraftSnapshot('/', 'fr', DRAFT, { storage: null })).toBe(false);
        expect(readDraftSnapshot('/', 'fr', { storage: null })).toBeNull();
        expect(() => clearDraftSnapshot('/', 'fr', { storage: null })).not.toThrow();
    });

    it('n’échoue pas si le stockage refuse l’écriture (quota)', () => {
        const failing = {
            ...memoryStorage(),
            setItem: () => {
                throw new Error('QuotaExceededError');
            },
        } as unknown as Storage;

        expect(writeDraftSnapshot('/', 'fr', DRAFT, { storage: failing })).toBe(false);
    });
});

describe('clearDraftSnapshot', () => {
    it('efface le brouillon de la page et de la langue visées', () => {
        const storage = memoryStorage();
        writeDraftSnapshot('/', 'fr', DRAFT, { storage });
        writeDraftSnapshot('/', 'en', DRAFT, { storage });

        clearDraftSnapshot('/', 'fr', { storage });

        expect(readDraftSnapshot('/', 'fr', { storage })).toBeNull();
        expect(readDraftSnapshot('/', 'en', { storage })).not.toBeNull();
    });
});

describe('recoveredDraftMessage', () => {
    it('annonce la date de récupération', () => {
        const message = recoveredDraftMessage({
            version: DRAFT_STORAGE_VERSION,
            savedAt: Date.UTC(2026, 0, 2, 10, 30),
            slug: '/',
            locale: 'fr',
            draft: DRAFT,
        });
        expect(message).toContain('brouillon non enregistré');
        expect(message).toContain('2026');
    });

    it('reste lisible avec un horodatage invalide', () => {
        const message = recoveredDraftMessage({
            version: DRAFT_STORAGE_VERSION,
            savedAt: Number.NaN,
            slug: '/',
            locale: 'fr',
            draft: DRAFT,
        });
        expect(message).toContain('précédemment');
    });
});
