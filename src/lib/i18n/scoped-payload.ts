/**
 * ==============================================================================
 * [Domain] — Sélection PURE du payload i18n/overlay par route (WS-F / F1)
 * ==============================================================================
 * Fonctions déterministes, sans React ni réseau : elles ne font que **copier un
 * sous-ensemble** d'un catalogue déjà résolu. Toute la décision « quoi envoyer
 * au client » est testable hors du cycle de vie UI.
 *
 * Le contrat (quels namespaces / overlays par route) vit dans
 * `public-namespaces.ts` [Types]. La composition React vit dans
 * `ScopedIntlProvider.tsx` [Hooks]. Règle SRP : `AGENTS.md` § 1.
 */

import {
    ROUTE_NAMESPACES,
    ROUTE_OVERLAYS,
    SHELL_NAMESPACES,
    type PublicNamespace,
    type PublicOverlayEntity,
    type PublicRouteSlug,
} from './public-namespaces';

/**
 * Copie uniquement les namespaces demandés, s'ils existent.
 * Un namespace absent de la source est simplement omis (jamais inventé).
 */
export function pickMessages<T extends Record<string, unknown>>(
    all: T,
    namespaces: readonly string[]
): Partial<T> {
    const out: Partial<T> = {};
    for (const namespace of namespaces) {
        if (Object.prototype.hasOwnProperty.call(all, namespace)) {
            out[namespace as keyof T] = all[namespace as keyof T];
        }
    }
    return out;
}

/** Payload minimal de la coquille (layout de locale). */
export function pickShellMessages<T extends Record<string, unknown>>(
    all: T
): Partial<T> {
    return pickMessages(all, SHELL_NAMESPACES);
}

/** Payload PROPRE à une route (la coquille est héritée du provider parent). */
export function pickRouteMessages<T extends Record<string, unknown>>(
    all: T,
    slug: PublicRouteSlug
): Partial<T> {
    return pickMessages(all, ROUTE_NAMESPACES[slug] ?? []);
}

/**
 * Union réellement disponible sous le provider de route : coquille + route.
 * C'est cette union que le garde-fou (`public-namespaces.test.ts`) vérifie.
 */
export function resolveRouteNamespaces(slug: PublicRouteSlug): readonly PublicNamespace[] {
    return [...SHELL_NAMESPACES, ...(ROUTE_NAMESPACES[slug] ?? [])];
}

/** Copie un sous-ensemble d'overlays déclarés par route. */
export function pickOverlays<T>(
    all: Record<string, T> | null | undefined,
    keys: readonly string[]
): Record<string, T> {
    const out: Record<string, T> = {};
    if (!all) return out;
    for (const key of keys) {
        const value = all[key];
        if (value !== undefined) out[key] = value;
    }
    return out;
}

/** Entités d'overlay proprement déclarées pour une route. */
export function resolveRouteOverlays(slug: PublicRouteSlug): readonly PublicOverlayEntity[] {
    return ROUTE_OVERLAYS[slug] ?? [];
}
