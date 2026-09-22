/**
 * ==============================================================================
 * CUC — Surcharges de micro-textes (Cockpit → catalogues de traduction)
 * ==============================================================================
 * Les micro-textes d'interface (« Cliquez sur une affiche… », « Spécifications
 * techniques », libellés de boutons…) vivent dans `messages/<locale>.json`. Ils
 * sont donc, en l'état, non modifiables depuis le Cockpit — ce qui contredit la
 * règle « zéro texte orphelin ».
 *
 * Ce module porte l'unique mécanisme qui rend ces libellés éditables **sans
 * redéploiement et sans réécrire un seul site d'appel** : une surcharge stockée
 * dans `site_settings.microcopy_overrides`, appliquée au catalogue au moment de
 * la résolution i18n (cf. `src/i18n/request.ts`).
 *
 * Invariants non négociables (mêmes règles que la doctrine bilingue) :
 *   1. **Aucune valeur vide publiée** : une saisie vide est retirée, jamais
 *      écrite — le catalogue redevient la source.
 *   2. **Aucune structure inventée** : la surcharge ne peut pas créer une clé
 *      dont la forme est invalide, ni transformer un texte en objet/tableau.
 *   3. **Les tableaux sont hors périmètre** : un micro-texte reste une chaîne ;
 *      les listes éditoriales passent par les sections (`sections_data`).
 *   4. **Même résolution que next-intl** : les clés utilisent le point comme
 *      séparateur de namespace (`home.about.title`).
 */

/** Clé `site_settings` qui porte la surcharge (une seule, jamais dupliquée). */
export const MICROCOPY_SETTINGS_KEY = 'microcopy_overrides';

/** Locales pouvant porter une surcharge — alignées sur `routing.locales`. */
export const MICROCOPY_LOCALES = ['fr', 'en'] as const;

export type MicrocopyLocale = (typeof MICROCOPY_LOCALES)[number];
export type MicrocopyValues = Record<string, string>;
export type MicrocopyOverlay = Partial<Record<MicrocopyLocale, MicrocopyValues>>;

/** Garde-fou de longueur : un micro-texte n'est pas un paragraphe de page. */
const MAX_VALUE_LENGTH = 4000;

/** Clé de traduction valide : namespaces en points, segments simples. */
const KEY_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMicrocopyLocale(locale: string): locale is MicrocopyLocale {
    return (MICROCOPY_LOCALES as readonly string[]).includes(locale);
}

/**
 * Aplatit un catalogue en `chemin → chaîne`. Les objets sont parcourus, les
 * tableaux sont ignorés (cf. invariant 3) : ils ne produisent jamais de clé.
 */
export function flattenMessages(messages: unknown, prefix = ''): MicrocopyValues {
    const out: MicrocopyValues = {};
    if (!isPlainObject(messages)) return out;

    for (const [key, value] of Object.entries(messages)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') out[path] = value;
        else if (isPlainObject(value)) Object.assign(out, flattenMessages(value, path));
    }

    return out;
}

/** Écrit une valeur dans un objet imbriqué, en créant les objets intermédiaires. */
function setPath(target: Record<string, unknown>, path: string, value: string): void {
    const segments = path.split('.').filter((segment) => segment.length > 0);
    if (segments.length === 0) return;

    let cursor: Record<string, unknown> = target;
    for (const segment of segments.slice(0, -1)) {
        if (!isPlainObject(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[segments[segments.length - 1]] = value;
}

/** Copie profonde des seules structures attendues (objets + tableaux). */
function cloneMessages<T>(value: T): T {
    if (Array.isArray(value)) return value.map((entry) => cloneMessages(entry)) as unknown as T;
    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, cloneMessages(entry)])
        ) as unknown as T;
    }
    return value;
}

/**
 * Applique la surcharge au catalogue (sans muter la source). Une valeur vide ou
 * blanche est ignorée : le catalogue d'origine reste alors la référence.
 */
export function applyMicrocopyOverlay<T>(messages: T, values?: MicrocopyValues | null): T {
    if (!values) return messages;

    const entries = Object.entries(values).filter(
        ([, value]) => typeof value === 'string' && value.trim().length > 0
    );
    if (entries.length === 0) return messages;

    const clone = cloneMessages(messages) as Record<string, unknown>;
    for (const [path, value] of entries) setPath(clone, path, value);
    return clone as unknown as T;
}

/** Nettoie une carte de valeurs : chaînes non vides et clés valides uniquement. */
export function sanitizeMicrocopyValues(input: unknown): MicrocopyValues {
    if (!isPlainObject(input)) return {};

    const out: MicrocopyValues = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value !== 'string') continue;
        if (!KEY_PATTERN.test(key)) continue;
        const trimmed = value.trim();
        if (trimmed.length === 0) continue;
        out[key] = trimmed.slice(0, MAX_VALUE_LENGTH);
    }
    return out;
}

/** Nettoie la surcharge complète, locale par locale. */
export function sanitizeMicrocopyOverlay(input: unknown): MicrocopyOverlay {
    if (!isPlainObject(input)) return {};

    const out: MicrocopyOverlay = {};
    for (const locale of MICROCOPY_LOCALES) {
        const values = sanitizeMicrocopyValues(input[locale]);
        if (Object.keys(values).length > 0) out[locale] = values;
    }
    return out;
}

/** Valeurs applicables à une locale donnée (toujours nettoyées). */
export function pickMicrocopyValues(overlay: unknown, locale: string): MicrocopyValues {
    if (!isMicrocopyLocale(locale)) return {};
    const sanitized = sanitizeMicrocopyOverlay(overlay);
    return sanitized[locale] ?? {};
}

export interface MicrocopyEntry {
    /** Chemin canonique de la clé (`home.about.title`). */
    key: string;
    /** Premier segment de la clé : le namespace, utilisé comme groupe. */
    group: string;
    /** Texte français du catalogue (source). */
    fr: string;
    /** Texte anglais du catalogue (repli sur le français s'il manque). */
    en: string;
}

/**
 * Construit la table éditable : les clés françaises font foi, l'anglais est
 * rapproché par clé (jamais par index) et retombe sur le français s'il manque.
 */
export function buildMicrocopyEntries(frMessages: unknown, enMessages: unknown): MicrocopyEntry[] {
    const fr = flattenMessages(frMessages);
    const en = flattenMessages(enMessages);

    return Object.keys(fr)
        .sort()
        .map((key) => ({
            key,
            group: key.split('.')[0],
            fr: fr[key],
            en: en[key] ?? fr[key],
        }));
}

/** Regroupe les entrées par namespace, groupes triés par volume décroissant. */
export function groupMicrocopyEntries(
    entries: readonly MicrocopyEntry[]
): Array<{ group: string; entries: MicrocopyEntry[] }> {
    const buckets = new Map<string, MicrocopyEntry[]>();
    for (const entry of entries) {
        const bucket = buckets.get(entry.group);
        if (bucket) bucket.push(entry);
        else buckets.set(entry.group, [entry]);
    }

    return [...buckets.entries()]
        .map(([group, groupEntries]) => ({ group, entries: groupEntries }))
        .sort((a, b) => b.entries.length - a.entries.length || a.group.localeCompare(b.group));
}
