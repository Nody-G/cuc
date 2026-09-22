import {
    CHROME_DRAFT_STORAGE_VERSION,
    chromeDraftStorageKey,
    clearChromeDraftSnapshot,
    isChromeDraftPersistable,
    readChromeDraftSnapshot,
    recoveredChromeDraftMessage,
    writeChromeDraftSnapshot,
} from './chrome-draft-storage';

/** Stockage en mémoire : la logique est testée sans navigateur. */
function createStorage(): Storage {
    const map = new Map<string, string>();
    return {
        get length() {
            return map.size;
        },
        clear: () => map.clear(),
        getItem: (key: string) => map.get(key) ?? null,
        key: (index: number) => [...map.keys()][index] ?? null,
        removeItem: (key: string) => {
            map.delete(key);
        },
        setItem: (key: string, value: string) => {
            map.set(key, value);
        },
    };
}

const DRAFT = {
    settings: { phone: '(+33) 06 00 00 00 00' },
    microcopy: { 'common.call': 'Appel direct' },
};

describe('writeChromeDraftSnapshot / readChromeDraftSnapshot', () => {
    it('écrit puis relit un brouillon', () => {
        const storage = createStorage();
        expect(writeChromeDraftSnapshot('fr', DRAFT, { storage, now: 1_000 })).toBe(true);

        const stored = readChromeDraftSnapshot('fr', { storage, now: 1_500 });
        expect(stored?.settings).toEqual(DRAFT.settings);
        expect(stored?.microcopy).toEqual(DRAFT.microcopy);
        expect(stored?.savedAt).toBe(1_000);
    });

    it('isole les locales : aucun micro-texte rejoué dans l’autre langue', () => {
        const storage = createStorage();
        writeChromeDraftSnapshot('en', DRAFT, { storage });

        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();
        expect(readChromeDraftSnapshot('en', { storage })).not.toBeNull();
    });

    it('expire au-delà du TTL et nettoie l’entrée périmée', () => {
        const storage = createStorage();
        writeChromeDraftSnapshot('fr', DRAFT, { storage, now: 0 });

        const eightDays = 8 * 24 * 60 * 60 * 1000;
        expect(readChromeDraftSnapshot('fr', { storage, now: eightDays })).toBeNull();
        expect(storage.getItem(chromeDraftStorageKey('fr'))).toBeNull();
    });

    it('ignore un contenu corrompu, une mauvaise version ou une locale divergente', () => {
        const storage = createStorage();

        storage.setItem(chromeDraftStorageKey('fr'), '{ceci n’est pas du json');
        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();

        storage.setItem(
            chromeDraftStorageKey('fr'),
            JSON.stringify({ version: CHROME_DRAFT_STORAGE_VERSION + 1, savedAt: 0, locale: 'fr', settings: {}, microcopy: {} })
        );
        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();

        storage.setItem(
            chromeDraftStorageKey('fr'),
            JSON.stringify({ version: CHROME_DRAFT_STORAGE_VERSION, savedAt: 0, locale: 'en', settings: {}, microcopy: {} })
        );
        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();
    });

    it('ignore une forme invalide : valeurs non textuelles ou cartes manquantes', () => {
        const storage = createStorage();
        storage.setItem(
            chromeDraftStorageKey('fr'),
            JSON.stringify({
                version: CHROME_DRAFT_STORAGE_VERSION,
                savedAt: 0,
                locale: 'fr',
                settings: { phone: 42 },
                microcopy: {},
            })
        );
        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();

        storage.setItem(
            chromeDraftStorageKey('fr'),
            JSON.stringify({ version: CHROME_DRAFT_STORAGE_VERSION, savedAt: 0, locale: 'fr' })
        );
        expect(readChromeDraftSnapshot('fr', { storage })).toBeNull();
    });

    it('reste silencieux si le stockage est indisponible', () => {
        expect(writeChromeDraftSnapshot('fr', DRAFT, { storage: null })).toBe(false);
        expect(readChromeDraftSnapshot('fr', { storage: null })).toBeNull();
        expect(() => clearChromeDraftSnapshot('fr', { storage: null })).not.toThrow();
    });

    it('efface l’instantané à la demande', () => {
        const storage = createStorage();
        writeChromeDraftSnapshot('fr', DRAFT, { storage });
        clearChromeDraftSnapshot('fr', { storage });
        expect(storage.getItem(chromeDraftStorageKey('fr'))).toBeNull();
    });
});

describe('isChromeDraftPersistable', () => {
    it('refuse un brouillon vide', () => {
        expect(isChromeDraftPersistable({ settings: {}, microcopy: {} })).toBe(false);
    });

    it('accepte un brouillon de réglages ou de micro-textes', () => {
        expect(isChromeDraftPersistable({ settings: { phone: '06' }, microcopy: {} })).toBe(true);
        expect(isChromeDraftPersistable({ settings: {}, microcopy: { 'common.call': 'Appel' } })).toBe(
            true
        );
    });
});

describe('recoveredChromeDraftMessage', () => {
    it('annonce la date de récupération', () => {
        const message = recoveredChromeDraftMessage({
            version: CHROME_DRAFT_STORAGE_VERSION,
            savedAt: Date.now(),
            locale: 'fr',
            settings: {},
            microcopy: {},
        });
        expect(message).toContain('retrouvés');
        expect(message).toContain('restaurer');
    });

    it('reste lisible avec un horodatage invalide', () => {
        const message = recoveredChromeDraftMessage({
            version: CHROME_DRAFT_STORAGE_VERSION,
            savedAt: Number.NaN,
            locale: 'fr',
            settings: {},
            microcopy: {},
        });
        expect(message).toContain('précédemment');
    });
});
