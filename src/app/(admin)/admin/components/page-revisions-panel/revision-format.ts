/**
 * Formatage de l'historique des versions : libellés de statut, dates FR et
 * résumés de valeurs pour le diff.
 */

import type { SitePageRevision } from '@/lib/data/site-service';

export const STATUS_LABELS: Record<SitePageRevision['status'], string> = {
    draft: 'Brouillon',
    published: 'Publiée',
    archived: 'Archivée',
};

export const STATUS_TONES: Record<SitePageRevision['status'], 'neutral' | 'success' | 'warning'> = {
    draft: 'warning',
    published: 'success',
    archived: 'neutral',
};

export function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export function summarizeValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'string') {
        return value.length > 80 ? `${value.slice(0, 80)}…` : value || '—';
    }
    if (Array.isArray(value)) return `${value.length} élément(s)`;
    if (typeof value === 'object') return 'Objet modifié';
    return String(value);
}

export const FIELD_LABELS: Record<string, string> = {
    title: 'Titre',
    meta_title: 'Meta titre',
    meta_description: 'Meta description',
    og_image: 'Image OG',
    hero: 'Hero',
    sections: 'Sections',
    is_published: 'Publiée',
};
