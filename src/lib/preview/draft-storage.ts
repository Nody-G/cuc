/**
 * ==============================================================================
 * CUC — Persistance locale du brouillon (Mode Studio)
 * ==============================================================================
 * Le brouillon d'édition vit en mémoire : un rechargement d'onglet, une coupure
 * réseau ou un crash navigateur faisait perdre le travail en cours **sans
 * avertissement**. C'est le pire défaut d'expérience possible pour un outil
 * d'édition — il est traité ici, et nulle part ailleurs.
 *
 * Principes :
 *   - la base ne voit **toujours rien** : la sauvegarde locale n'est qu'un filet
 *     de sécurité du poste de travail, effacé dès que la page est enregistrée ;
 *   - rien n'est écrit sans modification réelle (`isDraftPersistable`) : on ne
 *     laisse pas de déchets dans le navigateur ;
 *   - un brouillon illisible, périmé (TTL) ou d'une autre version est ignoré :
 *     mieux vaut repartir de la version enregistrée qu'injecter un état douteux ;
 *   - le stockage est **injectable** : toute la logique est testable sans
 *     navigateur, et une indisponibilité du `localStorage` (navigation privée,
 *     quota) n'échoue jamais bruyamment.
 */

export const DRAFT_STORAGE_PREFIX = 'cuc.studio.draft';
/** Au-delà, un brouillon local n'est plus proposé : la page a pu changer. */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Version du format stocké : un ancien format est ignoré, jamais migré à l'aveugle. */
export const DRAFT_STORAGE_VERSION = 1;

export interface StoredDraft {
    version: number;
    savedAt: number;
    slug: string;
    locale: string;
    draft: unknown;
}

export interface DraftStorageOptions {
    /** Stockage cible (par défaut `window.localStorage` si disponible). */
    storage?: Storage | null;
    /** Horodatage injecté (tests). */
    now?: number;
}

export function draftStorageKey(slug: string, locale: string): string {
    const cleanSlug = slug === '/' ? 'home' : slug.replace(/^\//, '');
    return `${DRAFT_STORAGE_PREFIX}.${cleanSlug}.${locale}`;
}

function resolveStorage(options: DraftStorageOptions): Storage | null {
    if (options.storage !== undefined) return options.storage;
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        // Navigation privée : l'accès peut lever, ce n'est pas une erreur.
        return null;
    }
}

/** Un brouillon sans modification réelle ne mérite pas d'être stocké. */
export function isDraftPersistable(changedFields: number): boolean {
    return Number.isFinite(changedFields) && changedFields > 0;
}

/** Écrit l'instantané du brouillon (silencieux si le stockage est indisponible). */
export function writeDraftSnapshot(
    slug: string,
    locale: string,
    draft: unknown,
    options: DraftStorageOptions = {}
): boolean {
    const storage = resolveStorage(options);
    if (!storage) return false;

    const payload: StoredDraft = {
        version: DRAFT_STORAGE_VERSION,
        savedAt: options.now ?? Date.now(),
        slug,
        locale,
        draft,
    };

    try {
        storage.setItem(draftStorageKey(slug, locale), JSON.stringify(payload));
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
export function readDraftSnapshot(
    slug: string,
    locale: string,
    options: DraftStorageOptions = {}
): StoredDraft | null {
    const storage = resolveStorage(options);
    if (!storage) return null;

    const key = draftStorageKey(slug, locale);
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
    const candidate = parsed as Partial<StoredDraft>;

    if (candidate.version !== DRAFT_STORAGE_VERSION) return discard();
    if (candidate.slug !== slug || candidate.locale !== locale) return discard();
    if (typeof candidate.savedAt !== 'number') return discard();

    const now = options.now ?? Date.now();
    if (now - candidate.savedAt > DRAFT_TTL_MS) return discard();

    return {
        version: candidate.version,
        savedAt: candidate.savedAt,
        slug: candidate.slug,
        locale: candidate.locale,
        draft: candidate.draft,
    };
}

/** Efface l'instantané (après enregistrement réussi ou annulation totale). */
export function clearDraftSnapshot(
    slug: string,
    locale: string,
    options: DraftStorageOptions = {}
): void {
    const storage = resolveStorage(options);
    if (!storage) return;
    try {
        storage.removeItem(draftStorageKey(slug, locale));
    } catch {
        /* silencieux par conception */
    }
}

/** Phrase affichée à l'utilisateur quand un brouillon local est retrouvé. */
export function recoveredDraftMessage(stored: StoredDraft): string {
    const date = new Date(stored.savedAt);
    const when = Number.isNaN(date.getTime())
        ? 'précédemment'
        : date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    return `Un brouillon non enregistré de cette page a été retrouvé (${when}). Le restaurer ?`;
}
