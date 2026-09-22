/**
 * Production de l'overlay à écrire : jamais de valeur vide, tableaux toujours
 * complets, structure jamais inventée.
 */
import { isEditorialLeaf, isTechnicalKey, lastKeyOf } from './localized-merge-editorial';
import { PAGE_LOCKED_ROOTS, type OverlayOptions } from './localized-merge-types';

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
