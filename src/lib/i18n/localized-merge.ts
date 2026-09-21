/**
 * ==============================================================================
 * CUC — Fusion FR/EN et édition bilingue : implémentation UNIQUE
 * ==============================================================================
 * Ce module est la **seule** source de vérité pour trois choses :
 *
 *   1. la FUSION d'un overlay de traduction sur le contenu français
 *      (`mergeLocalized`) — utilisée par le serveur (`lib/i18n/server.ts`), par
 *      le client (`hooks/usePageDynamicContent.ts`) et par le Cockpit ;
 *   2. la définition de la SURFACE TRADUISIBLE (`flattenEditorial`) — mêmes
 *      règles d'exclusion que `scripts/audit_i18n_completeness.mjs`, afin que
 *      l'indicateur de couverture du Cockpit et l'audit disent la même chose ;
 *   3. la PRODUCTION de l'overlay à écrire (`diffTranslation`) — jamais de
 *      valeur vide, tableaux toujours complets.
 *
 * Il ne doit JAMAIS importer `next/cache`, `next/headers` ni React : il est
 * chargé des deux côtés de la frontière serveur/client.
 *
 * ------------------------------------------------------------------------------
 * Invariants de fusion (hérités du serveur, verrouillés par les tests)
 * ------------------------------------------------------------------------------
 *   - objet : fusion récursive clé par clé ;
 *   - tableau NON VIDE : **remplacé en bloc**. Un tableau de traduction doit donc
 *     être complet (ancres `id`, images, ordres recopiés du français) : un
 *     tableau partiel casserait une ancre ou un `src` ;
 *   - tableau vide, chaîne vide (ou blanche), `null` : ignorés → le français
 *     reste la source. Une traduction ne peut jamais vider une page ;
 *   - scalaire : remplace la base.
 */

/** Locale éditoriale. `fr` est la source, `en` la traduction. */
export type LocaleCode = 'fr' | 'en';

/**
 * Clés techniques : jamais traduites. `id` sert d'ancre HTML et de clé React,
 * `slug` de segment d'URL — les traduire casserait la page.
 */
const NEVER_TRANSLATED_KEYS = new Set(['id', 'slug', 'key', 'anchor']);

/** Motifs techniques : médias, liens, ordres, états, mesures. */
const TECHNICAL_KEY =
    /(url|link|href|image|img|bg_|poster|logo|icon|video_url|_id|order|is_visible|is_active|show|count|number|price|date|phone|email|code)$/i;

/**
 * Racines du contenu de page jamais traduites :
 *   - `layout_sections` : libellés d'administration de la structure des blocs
 *     (leur ordre et leurs `id` pilotent le rendu public) ;
 *   - `og_image` : média ;
 *   - `slug`, `id`, `is_published`, horodatages : identité et état de la ligne.
 */
export const PAGE_LOCKED_ROOTS: readonly string[] = [
    'layout_sections',
    'og_image',
    'slug',
    'id',
    'is_published',
    'created_at',
    'updated_at',
    'published_at',
];

/** Options communes à l'analyse et à la production d'un overlay. */
export interface OverlayOptions {
    /** Racines jamais traduites. Par défaut : `PAGE_LOCKED_ROOTS`. */
    lockedRoots?: readonly string[];
}

/** Un tableau dont la structure a divergé du français (item ajouté ou retiré). */
export interface StaleArray {
    /** Chemin du tableau dans le contenu (ex. `sections_data.stages_catalogue.items`). */
    path: string;
    frLength: number;
    enLength: number;
    /** `true` si un item n'a plus le même `id` à la même position. */
    idMismatch: boolean;
}

/** Mesure de couverture d'une traduction, calculée sur les feuilles éditoriales. */
export interface TranslationCoverage {
    /** Nombre de feuilles à traduire (français + éventuelles feuilles ajoutées en EN). */
    total: number;
    /** Nombre de feuilles effectivement traduites (valeur différente du français). */
    translated: number;
    /** Pourcentage entier, borné à 100. */
    percent: number;
    /** Chemins restant à traduire (tronqués pour ne pas gonfler l'état React). */
    missing: string[];
    /** Tableaux dont la structure FR a bougé depuis la traduction. */
    staleArrays: StaleArray[];
}

/** Nombre maximal de chemins manquants conservés dans l'état du Cockpit. */
const MISSING_PATHS_LIMIT = 50;

/* ------------------------------------------------------------------ *
 * 1. Fusion
 * ------------------------------------------------------------------ */

/**
 * Fusionne un overlay de traduction sur le contenu source.
 *
 * Sémantique historique du serveur, désormais partagée : une valeur vide ne
 * remplace jamais la base, un tableau non vide la remplace en bloc.
 */
export function mergeLocalized<T>(base: T, overlay: unknown): T {
    if (overlay === null || overlay === undefined) return base;
    if (Array.isArray(overlay)) return (overlay.length > 0 ? overlay : base) as T;
    if (typeof overlay === 'object') {
        if (typeof base !== 'object' || base === null || Array.isArray(base)) {
            return overlay as T;
        }
        const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
        for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
            out[key] = key in out ? mergeLocalized(out[key], value) : value;
        }
        return out as T;
    }
    // Scalaire : une valeur vide (chaîne vide ou blanche) ne doit jamais effacer
    // le français — c'est la protection qui manquait au chemin client.
    if (typeof overlay === 'string' && overlay.trim() === '') return base;
    return overlay as T;
}

/**
 * Contenu « tel que le public le voit » : français fusionné avec l'overlay.
 * Le Cockpit s'en sert pour pré-remplir le formulaire EN et pour alimenter
 * l'aperçu live, ce qui garantit un aperçu fidèle par construction.
 */
export function hydrateLocalized<T>(base: T, overlay: unknown): T {
    return mergeLocalized(base, overlay);
}

/* ------------------------------------------------------------------ *
 * 2. Surface traduisible
 * ------------------------------------------------------------------ */

/** Dernier segment d'un chemin, index de tableau retiré (`items[0].title` → `title`). */
function lastKeyOf(path: string): string {
    return (path.split('.').pop() || '').replace(/\[\d+\]/g, '');
}

/** Clé technique (média, lien, ordre, état, mesure) ou non traduisible par nature. */
export function isTechnicalKey(key: string): boolean {
    return NEVER_TRANSLATED_KEYS.has(key) || TECHNICAL_KEY.test(key);
}

/**
 * Une valeur est-elle du texte éditorial traduisible ?
 * Mêmes règles que `scripts/audit_i18n_completeness.mjs` (seuil de 3 caractères,
 * ni URL, ni valeur purement numérique).
 */
export function isEditorialLeaf(value: unknown, path: string): value is string {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (v.length < 3) return false;
    const key = lastKeyOf(path);
    if (NEVER_TRANSLATED_KEYS.has(key)) return false;
    if (TECHNICAL_KEY.test(key)) return false;
    if (/^(https?:)?\/\//.test(v) || v.startsWith('/')) return false;
    if (/^[#\d\s.,%°+-]+$/.test(v)) return false;
    return true;
}

/**
 * Aplatit un contenu en `{ chemin: texte }` pour toutes les feuilles éditoriales.
 * Les racines verrouillées (structure, médias, identité) sont ignorées, à
 * n'importe quel niveau.
 */
export function flattenEditorial(
    node: unknown,
    options: OverlayOptions = {},
    prefix = '',
    out: Record<string, string> = {}
): Record<string, string> {
    if (node === null || node === undefined) return out;
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;

    if (Array.isArray(node)) {
        node.forEach((item, i) => flattenEditorial(item, options, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
            if (lockedRoots.includes(key)) continue;
            flattenEditorial(value, options, prefix ? `${prefix}.${key}` : key, out);
        }
        return out;
    }
    if (prefix && isEditorialLeaf(node, prefix)) out[prefix] = node;
    return out;
}

/* ------------------------------------------------------------------ *
 * 3. Production de l'overlay à écrire
 * ------------------------------------------------------------------ */

/** Copie JSON profonde (les contenus manipulés sont toujours du JSON pur). */
function cloneJson<T>(value: T): T {
    return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/** Refus explicite d'inventer une structure : seuls des chemins existants sont écrits. */
function diffNode(
    base: unknown,
    localized: unknown,
    path: string,
    options: OverlayOptions
): unknown {
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;
    const key = lastKeyOf(path);
    // Le chemin vide est la racine du contenu : c'est le seul cas autorisé à
    // entrer dans l'objet, les racines verrouillées étant écartées à leur propre
    // chemin (`layout_sections`, `og_image`, identité, états).
    if (path !== '' && lockedRoots.includes(key)) return undefined;

    /* Tableau : remplacé en bloc, donc écrit complet ou pas du tout. */
    if (Array.isArray(base)) {
        if (!Array.isArray(localized) || localized.length === 0) return undefined;
        // Divergence de structure : on n'écrit rien (le Cockpit propose de
        // resynchroniser). Un tableau EN plus court perdrait des items FR.
        if (localized.length !== base.length) return undefined;
        if (!arrayHasTranslation(base, localized, path, options)) return undefined;
        return materializeArray(base, localized, path, options);
    }

    /* Objet : fusion clé par clé sur l'union des clés connues. */
    if (base !== null && typeof base === 'object' && !Array.isArray(base)) {
        const baseObj = base as Record<string, unknown>;
        const localizedObj =
            localized !== null && typeof localized === 'object' && !Array.isArray(localized)
                ? (localized as Record<string, unknown>)
                : {};
        const out: Record<string, unknown> = {};
        for (const childKey of Object.keys(baseObj)) {
            const childPath = path ? `${path}.${childKey}` : childKey;
            const child = diffNode(baseObj[childKey], localizedObj[childKey], childPath, options);
            if (child !== undefined) out[childKey] = child;
        }
        // Feuille nouvelle écrite uniquement en anglais (ex. un badge absent du
        // FR) : autorisée à l'intérieur d'une branche existante, jamais pour
        // créer un objet ou un tableau.
        for (const childKey of Object.keys(localizedObj)) {
            if (childKey in baseObj) continue;
            const childPath = path ? `${path}.${childKey}` : childKey;
            const child = diffLeaf(undefined, localizedObj[childKey], childPath);
            if (child !== undefined) out[childKey] = child;
        }
        return Object.keys(out).length > 0 ? out : undefined;
    }

    /* Feuille. */
    return diffLeaf(base, localized, path);
}

/** Règle d'écriture d'une feuille : non vide, différente du français, traduisible. */
function diffLeaf(base: unknown, localized: unknown, path: string): string | undefined {
    if (typeof localized !== 'string') return undefined;
    const value = localized;
    if (value.trim() === '') return undefined;

    const key = lastKeyOf(path);
    if (isTechnicalKey(key)) return undefined;

    if (typeof base === 'string') {
        // Feuille FR vide : le texte anglais est une création légitime, il faut
        // simplement qu'il soit éditorial lui-même.
        if (!isEditorialLeaf(base, path)) {
            return isEditorialLeaf(value, path) ? value : undefined;
        }
    } else if (base !== undefined && base !== null && base !== '') {
        // La base n'est pas du texte (nombre, booléen) : jamais traduite.
        return undefined;
    } else if (!isEditorialLeaf(value, path)) {
        return undefined;
    }

    if (base === value) return undefined;
    return value;
}

/** Le tableau porte-t-il au moins une traduction réelle ? */
function arrayHasTranslation(
    base: unknown[],
    localized: unknown[],
    path: string,
    options: OverlayOptions
): boolean {
    return base.some((baseItem, i) =>
        diffNode(baseItem, localized[i], `${path}[${i}]`, options) !== undefined
    );
}

/**
 * Recompose un tableau complet, item par item.
 *
 * Un tableau est écrit en bloc : chaque item doit donc être entier. Les clés
 * techniques (ancres `id`, images, ordres, liens) sont **toujours reprises du
 * français** — aucune traduction ne peut casser une ancre ni un média — et une
 * feuille éditoriale vidée dans le formulaire revient au français au lieu de
 * publier du vide.
 */
function materializeArray(
    base: unknown[],
    localized: unknown[],
    path: string,
    options: OverlayOptions
): unknown[] {
    return localized.map((localizedItem, i) => {
        const baseItem = base[i];
        const itemPath = `${path}[${i}]`;

        if (Array.isArray(localizedItem)) {
            return Array.isArray(baseItem)
                ? materializeArray(baseItem, localizedItem, itemPath, options)
                : cloneJson(localizedItem);
        }

        if (localizedItem !== null && typeof localizedItem === 'object') {
            const baseObj =
                baseItem !== null && typeof baseItem === 'object' && !Array.isArray(baseItem)
                    ? (baseItem as Record<string, unknown>)
                    : {};
            const out: Record<string, unknown> = {};
            for (const [childKey, childValue] of Object.entries(
                localizedItem as Record<string, unknown>
            )) {
                const childPath = `${itemPath}.${childKey}`;
                // Clé technique : la valeur française fait autorité.
                if (isTechnicalKey(childKey) && childKey in baseObj) {
                    out[childKey] = cloneJson(baseObj[childKey]);
                    continue;
                }
                if (typeof childValue === 'string') {
                    const baseChild = baseObj[childKey];
                    out[childKey] =
                        childValue.trim() === '' && typeof baseChild === 'string'
                            ? baseChild
                            : childValue;
                    continue;
                }
                if (childValue !== null && typeof childValue === 'object') {
                    out[childKey] = Array.isArray(childValue)
                        ? Array.isArray(baseObj[childKey])
                            ? materializeArray(baseObj[childKey] as unknown[], childValue, childPath, options)
                            : cloneJson(childValue)
                        : cloneJson(childValue);
                    continue;
                }
                out[childKey] = childValue;
            }
            return out;
        }

        // Tableau de scalaires : une valeur vidée revient au français.
        if (typeof localizedItem === 'string' && localizedItem.trim() === '') {
            return typeof baseItem === 'string' ? baseItem : localizedItem;
        }
        return localizedItem;
    });
}

/**
 * Overlay à persister pour un contenu localisé donné.
 *
 * Ne contient que ce qui **diffère** du français : aucune valeur vide, aucune
 * clé technique, aucune racine verrouillée. Un champ vidé dans le formulaire
 * revient au français — il n'est jamais publié vide.
 */
export function diffTranslation(
    base: unknown,
    localized: unknown,
    options: OverlayOptions = {}
): Record<string, unknown> {
    const diff = diffNode(base, localized, '', options);
    if (diff === null || typeof diff !== 'object' || Array.isArray(diff)) return {};
    return diff as Record<string, unknown>;
}

/* ------------------------------------------------------------------ *
 * 4. Mesure et contrôle
 * ------------------------------------------------------------------ */

/** Feuilles d'un payload, à plat. */
function flattenOverlay(
    payload: unknown,
    options: OverlayOptions
): Record<string, string> {
    return flattenEditorial(payload, options);
}

/**
 * Couverture d'une traduction, feuille par feuille.
 *
 * `translated` compte les feuilles dont la valeur anglaise **diffère** du
 * français. Une traduction identique au français (marque, nom propre) est
 * légitime mais n'est pas comptée comme un manque : elle est simplement héritée.
 */
export function translationCoverage(
    base: unknown,
    payload: unknown,
    options: OverlayOptions = {}
): TranslationCoverage {
    const baseLeaves = flattenEditorial(base, options);
    const payloadLeaves = flattenOverlay(payload, options);

    const basePaths = Object.keys(baseLeaves);
    const extraPaths = Object.keys(payloadLeaves).filter((p) => !(p in baseLeaves));

    let translated = 0;
    const missing: string[] = [];
    for (const path of basePaths) {
        const fr = baseLeaves[path];
        const en = payloadLeaves[path];
        if (en !== undefined && en !== fr) {
            translated += 1;
        } else if (missing.length < MISSING_PATHS_LIMIT) {
            missing.push(path);
        }
    }
    translated += extraPaths.length;

    const total = basePaths.length + extraPaths.length;
    const percent = total === 0 ? 100 : Math.min(100, Math.round((translated / total) * 100));

    return {
        total,
        translated,
        percent,
        missing,
        staleArrays: findStaleArrays(base, payload, options),
    };
}

/**
 * Tableaux dont la structure a divergé depuis la traduction (item FR ajouté ou
 * supprimé, ou `id` déplacé). Le Cockpit les signale : sans resynchronisation,
 * l'overlay décrirait une page qui n'existe plus.
 */
export function findStaleArrays(
    base: unknown,
    payload: unknown,
    options: OverlayOptions = {}
): StaleArray[] {
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;
    const out: StaleArray[] = [];

    const walk = (baseNode: unknown, overlayNode: unknown, path: string): void => {
        if (Array.isArray(baseNode)) {
            if (!Array.isArray(overlayNode)) return;
            const idMismatch = baseNode.some((item, i) => {
                const other = overlayNode[i];
                const a = item as { id?: unknown } | null;
                const b = other as { id?: unknown } | null;
                if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
                if (a.id === undefined || b.id === undefined) return false;
                return a.id !== b.id;
            });
            if (overlayNode.length !== baseNode.length || idMismatch) {
                out.push({
                    path,
                    frLength: baseNode.length,
                    enLength: overlayNode.length,
                    idMismatch,
                });
            }
            baseNode.forEach((item, i) => walk(item, overlayNode[i], `${path}[${i}]`));
            return;
        }
        if (baseNode !== null && typeof baseNode === 'object') {
            if (overlayNode === null || typeof overlayNode !== 'object') return;
            for (const [key, value] of Object.entries(baseNode as Record<string, unknown>)) {
                // Une racine verrouillée (structure, médias, identité) n'est jamais
                // traduite : elle ne peut donc pas être « désalignée ».
                if (lockedRoots.includes(key)) continue;
                walk(value, (overlayNode as Record<string, unknown>)[key], `${path}.${key}`);
            }
        }
    };

    walk(base, payload, '');
    return out;
}

/**
 * Nettoyage défensif d'un payload d'overlay avant écriture.
 *
 * - retire les racines verrouillées et les clés techniques au premier niveau ;
 * - supprime les chaînes vides, `null` et objets vides, récursivement ;
 * - **ne filtre jamais l'intérieur d'un tableau** : un tableau est écrit en bloc,
 *   retirer une clé d'un item publierait un champ vide sur la vitrine.
 */
export function sanitizeOverlayPayload(
    payload: unknown,
    options: OverlayOptions = {}
): Record<string, unknown> {
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;

    const clean = (node: unknown): unknown => {
        if (node === null || node === undefined) return undefined;
        if (typeof node === 'string') return node.trim() === '' ? undefined : node;
        if (Array.isArray(node)) return node.length > 0 ? node : undefined;
        if (typeof node === 'object') {
            const out: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
                const cleaned = clean(value);
                if (cleaned !== undefined) out[key] = cleaned;
            }
            return Object.keys(out).length > 0 ? out : undefined;
        }
        return node;
    };

    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        if (lockedRoots.includes(key) || isTechnicalKey(key)) continue;
        if (Array.isArray(value)) {
            if (value.length > 0) out[key] = value;
            continue;
        }
        const cleaned = clean(value);
        if (cleaned !== undefined) out[key] = cleaned;
    }
    return out;
}
