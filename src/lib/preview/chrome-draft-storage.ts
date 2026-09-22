/**
 * ==============================================================================
 * CUC — Persistance locale du brouillon « chrome » (Mode Studio)
 * ==============================================================================
 * Les réglages du site et les micro-textes modifiés dans l'aperçu vivent en
 * mémoire : un rechargement d'onglet, une coupure réseau ou un crash navigateur
 * les effaçait sans avertissement. Ce module leur donne le même filet de
 * sécurité que le contenu de page (`draft-storage.ts`), avec les mêmes
 * invariants :
 *   - la base ne voit **rien** tant que « Enregistrer » n'a pas réussi ;
 *   - rien n'est écrit sans modification réelle : pas de déchets ;
 *   - un instantané illisible, périmé (TTL) ou d'une autre version est ignoré
 *     et nettoyé — mieux vaut repartir du contenu publié ;
 *   - le stockage est **injectable** : toute la logique est testable sans
 *     navigateur, et une indisponibilité du `localStorage` (navigation privée,
 *     quota) n'échoue jamais bruyamment.
 *
 * Différence assumée avec le contenu de page : le chrome est global (aucune
 * page), il est donc stocké **par locale d'édition** — un micro-texte appartient
 * à une langue précise et ne doit jamais être rejoué dans l'autre.
 */

export const CHROME_DRAFT_STORAGE_PREFIX = 'cuc.studio.chrome';
/** Au-delà, un brouillon local n'est plus proposé : la base a pu changer. */
export const CHROME_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Version du format stocké : un ancien format est ignoré, jamais migré à l'aveugle. */
export const CHROME_DRAFT_STORAGE_VERSION = 1;

/** Contenu du brouillon chrome : réglages, micro-textes et entités en attente. */
export interface ChromeDraftSnapshot {
    settings: Record<string, string>;
    microcopy: Record<string, string>;
    /** Entités éditées en place : référence `table:id:champ` → valeur. */
    entities: Record<string, string>;
}

export interface StoredChromeDraft {
    version: number;
    savedAt: number;
    locale: string;
    settings: Record<string, string>;
    microcopy: Record<string, string>;
    /** Absent d'un instantané antérieur au canal d'entité → `{}`. */
    entities: Record<string, string>;
}

export interface ChromeDraftStorageOptions {
    /** Stockage cible (par défaut `window.localStorage` si disponible). */
    storage?: Storage | null;
    /** Horodatage injecté (tests). */
    now?: number;
}

export function chromeDraftStorageKey(locale: string): string {
    return `${CHROME_DRAFT_STORAGE_PREFIX}.${locale}`;
}

function resolveStorage(options: ChromeDraftStorageOptions): Storage | null {
    if (options.storage !== undefined) return options.storage;
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        // Navigation privée : l'accès peut lever, ce n'est pas une erreur.
        return null;
    }
}

/** Garde-fou de forme : une carte de chaînes, jamais de valeur non textuelle. */
function isStringRecord(value: unknown): value is Record<string, string> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.values(value).every((entry) => typeof entry === 'string');
}

/** Un brouillon sans aucune modification ne mérite pas d'être stocké. */
export function isChromeDraftPersistable(draft: ChromeDraftSnapshot): boolean {
    return (
        Object.keys(draft.settings).length +
        Object.keys(draft.microcopy).length +
        Object.keys(draft.entities).length >
        0
    );
}

/** Écrit l'instantané (silencieux si le stockage est indisponible). */
export function writeChromeDraftSnapshot(
    locale: string,
    draft: ChromeDraftSnapshot,
    options: ChromeDraftStorageOptions = {}
): boolean {
    const storage = resolveStorage(options);
    if (!storage) return false;

    const payload: StoredChromeDraft = {
        version: CHROME_DRAFT_STORAGE_VERSION,
        savedAt: options.now ?? Date.now(),
        locale,
        settings: draft.settings,
        microcopy: draft.microcopy,
        entities: draft.entities,
    };

    try {
        storage.setItem(chromeDraftStorageKey(locale), JSON.stringify(payload));
        return true;
    } catch {
        // Quota dépassé ou stockage verrouillé : on n'interrompt jamais l'édition.
        return false;
    }
}

/**
 * Relit l'instantané s'il est valide : bon format, bonne version, non expiré.
 * Toute anomalie renvoie `null` (et nettoie l'entrée périmée).
 */
export function readChromeDraftSnapshot(
    locale: string,
    options: ChromeDraftStorageOptions = {}
): StoredChromeDraft | null {
    const storage = resolveStorage(options);
    if (!storage) return null;

    const key = chromeDraftStorageKey(locale);
    let raw: string | null = null;
    try {
        raw = storage.getItem(key);
    } catch {
        return null;
    }
    if (!raw) return null;

    const discard = (): null => {
        try {
            storage.removeItem(key);
        } catch {
            /* rien à faire : l'entrée sera écrasée à la prochaine écriture */
        }
        return null;
    };

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return discard();
    }

    if (typeof parsed !== 'object' || parsed === null) return discard();
    const candidate = parsed as Partial<StoredChromeDraft>;

    if (candidate.version !== CHROME_DRAFT_STORAGE_VERSION) return discard();
    if (candidate.locale !== locale) return discard();
    if (typeof candidate.savedAt !== 'number') return discard();
    if (!isStringRecord(candidate.settings)) return discard();
    if (!isStringRecord(candidate.microcopy)) return discard();
    // Entités : canal postérieur → absence tolérée, forme stricte si présent.
    const entities = candidate.entities === undefined ? {} : candidate.entities;
    if (!isStringRecord(entities)) return discard();

    const now = options.now ?? Date.now();
    if (now - candidate.savedAt > CHROME_DRAFT_TTL_MS) return discard();

    return {
        version: candidate.version,
        savedAt: candidate.savedAt,
        locale: candidate.locale,
        settings: candidate.settings,
        microcopy: candidate.microcopy,
        entities,
    };
}

/** Efface l'instantané (après publication réussie ou abandon total). */
export function clearChromeDraftSnapshot(
    locale: string,
    options: ChromeDraftStorageOptions = {}
): void {
    const storage = resolveStorage(options);
    if (!storage) return;
    try {
        storage.removeItem(chromeDraftStorageKey(locale));
    } catch {
        /* silencieux par conception */
    }
}

/** Phrase affichée quand un brouillon chrome local est retrouvé. */
export function recoveredChromeDraftMessage(stored: StoredChromeDraft): string {
    const date = new Date(stored.savedAt);
    const when = Number.isNaN(date.getTime())
        ? 'précédemment'
        : date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    return `Des réglages ou micro-textes non enregistrés ont été retrouvés (${when}). Les restaurer ?`;
}
