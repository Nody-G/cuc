/**
 * ==============================================================================
 * CUC — Contexte d'aperçu (iframe du Cockpit)
 * ==============================================================================
 * L'aperçu live encadre la **vraie page publique**, chargée avec le paramètre
 * `?cuc-preview=1`. Dans ce contexte précis, on allège ce qui n'a aucune valeur
 * pour l'édition et coûterait cher :
 *
 *  - **Realtime désactivé** : le Cockpit pousse déjà le brouillon par
 *    `postMessage` ; ouvrir un WebSocket pour re-recevoir le même contenu est un
 *    pur gaspillage (et un canal de moins par éditeur ouvert) ;
 *  - **effets lourds réduits** : carrousel, parallaxe et animations continues
 *    sont mis en veille, ce qui rend l'iframe réactive sur un portable modeste.
 *
 * Hors iframe du Cockpit, tout est inchangé : la vitrine publique garde son
 * Realtime et ses effets.
 */

/** Paramètre d'URL qui identifie l'aperçu du Cockpit. */
export const CUC_PREVIEW_QUERY = 'cuc-preview';

/**
 * Vrai si la page tourne dans l'iframe d'aperçu du Cockpit.
 * Toujours faux côté serveur (aucun accès à `window`).
 */
export function isPreviewFrame(): boolean {
    if (typeof window === 'undefined') return false;
    // Embarquée ? (l'aperçu vit dans une iframe same-origin du Cockpit)
    if (window.parent === window) return false;
    try {
        return new URLSearchParams(window.location.search).has(CUC_PREVIEW_QUERY);
    } catch {
        return false;
    }
}
