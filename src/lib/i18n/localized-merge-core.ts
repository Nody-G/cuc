/**
 * Fusion FR/EN : seule source de vérité pour la fusion d'un overlay de
 * traduction sur le contenu français.
 */

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
