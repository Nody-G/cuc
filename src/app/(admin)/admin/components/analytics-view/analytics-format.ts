export const WINDOW_OPTIONS = [7, 30, 90] as const;

/** Formate une durée : heures en deçà de 24 h, jours au-delà ; « — » si inconnue. */
export function formatHours(hours: number | null): string {
    if (hours === null) return '—';
    if (hours < 24) return `${hours} h`;
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} j`;
}
