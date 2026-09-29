/**
 * Formatage des dates et durées — une seule source de vérité.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions pures. `nowMs` est
 * injectable pour que « Aujourd'hui » et « Hier » restent testables hors horloge
 * réelle ; il vaut `Date.now()` par défaut, ce qui laisse les appels existants
 * inchangés.
 *
 * Ces formateurs vivaient dans le module du journal d'audit ; le hub Journal les
 * partage désormais (`durability_health.md` § 4).
 */

/** Date et heure complètes, à la seconde — pour un événement consultable. */
export function formatFullDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/** Heure seule — utile dans une liste groupée par jour. */
export function formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** Libellé de jour lisible : « Aujourd'hui », « Hier », puis la date longue. */
export function formatDayLabel(iso: string, nowMs: number = Date.now()): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Date inconnue';

    const today = new Date(nowMs);
    const yesterday = new Date(nowMs);
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (sameDay(d, today)) return 'Aujourd’hui';
    if (sameDay(d, yesterday)) return 'Hier';
    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** Clé de regroupement stable (`AAAA-MM-JJ`), indépendante de l'affichage. */
export function dayKey(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Durée d'opération, lisible.
 *
 * Une durée inconnue s'affiche « — » et non « 0 ms » : confondre les deux
 * ferait passer une mesure absente pour une mesure instantanée.
 */
export function formatDuration(ms: number | null | undefined): string {
    if (ms === null || ms === undefined) return '—';
    if (ms < 1000) return `${ms} ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${Math.round(seconds % 60)} s`;
}
