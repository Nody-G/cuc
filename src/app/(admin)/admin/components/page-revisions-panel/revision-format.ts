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
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '(vide)';
        return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return '(aucun élément)';
        const previewItems = value.slice(0, 2).map((item) => {
            if (typeof item === 'string' || typeof item === 'number') return String(item);
            if (item && typeof item === 'object') {
                const rec = item as Record<string, unknown>;
                if (rec.value && rec.title) return `${rec.value} (${rec.title})`;
                if (rec.title) return String(rec.title);
                if (rec.name) return String(rec.name);
            }
            return 'Élément';
        });
        const extra = value.length > 2 ? ` (+${value.length - 2})` : '';
        return `${value.length} élém. : [${previewItems.join(', ')}${extra}]`;
    }
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (keys.length === 0) return '(vide)';
        if (obj.value || obj.title) {
            const parts = [obj.value, obj.title].filter(Boolean).map(String);
            return parts.join(' — ') || '(détail indicateur)';
        }
        const entries = keys.slice(0, 3).map((k) => {
            const v = obj[k];
            const strVal = typeof v === 'string' ? `"${v.length > 25 ? `${v.slice(0, 25)}…` : v}"` : String(v);
            return `${k}: ${strVal}`;
        });
        const extra = keys.length > 3 ? ` (+${keys.length - 3})` : '';
        return `{ ${entries.join(', ')}${extra} }`;
    }
    return String(value);
}

export const FIELD_LABELS: Record<string, string> = {
    title: 'Titre de la page',
    meta_title: 'Balise Meta Titre (SEO)',
    meta_description: 'Balise Meta Description (SEO)',
    og_image: 'Image Open Graph (partage)',
    hero: 'Bannière Hero',
    sections: 'Chiffres clés & Indicateurs',
    layout_sections: 'Agencement des sections',
    sections_data: 'Contenu des sections',
    is_published: 'Statut de publication',
};

const HERO_SUB_LABELS: Record<string, string> = {
    title: 'Hero › Titre principal',
    subtitle: 'Hero › Sous-titre',
    badge: 'Hero › Badge / Surtitre',
    meta: 'Hero › Métadonnées',
    bg_image: 'Hero › Image d’arrière-plan',
    video_url: 'Hero › Vidéo de démonstration',
    cta_primary_text: 'Hero › Bouton principal (texte)',
    cta_primary_link: 'Hero › Bouton principal (lien)',
    cta_secondary_text: 'Hero › Bouton secondaire (texte)',
    cta_secondary_link: 'Hero › Bouton secondaire (lien)',
    cta_tertiary_text: 'Hero › Bouton tertiaire (texte)',
    cta_tertiary_link: 'Hero › Bouton tertiaire (lien)',
    since: 'Hero › Mention d’ancienneté',
    metrics: 'Hero › Métriques rapides',
};

const INDICATOR_PROP_LABELS: Record<string, string> = {
    value: 'Chiffre / Valeur',
    title: 'Intitulé',
    description: 'Sous-texte descriptif',
    content: 'Corps de texte',
    image: 'Visuel / Image',
};

const SECTION_PROP_LABELS: Record<string, string> = {
    value: 'Valeur',
    title: 'Titre',
    subtitle: 'Sous-titre',
    badge: 'Badge',
    description: 'Description',
    content: 'Corps de texte',
    image: 'Visuel / Image',
    video_url: 'Vidéo',
};

const KNOWN_SECTION_NAMES: Record<string, string> = {
    about: 'À propos',
    story: 'Notre Histoire',
    stats: 'Statistiques & Chiffres',
    campus: 'Campus & Équipements',
    disciplines: 'Disciplines',
    tournages: 'Tournages & Productions',
    virtual_tour: 'Visite virtuelle',
    qualiopi: 'Certification Qualiopi',
    partners: 'Partenaires',
    social: 'Réseaux & Médias',
    formules: 'Formules & Tarifs',
    stages_catalogue: 'Catalogue des stages',
    workshops: 'Workshops',
    overview: 'Présentation',
    reels: 'Bandes démo',
};

/**
 * Traduit un identifiant de champ (éventuellement pointé ou indexé)
 * en un libellé clair, lisible et professionnel pour l'administrateur.
 */
export function formatFieldLabel(field: string): string {
    if (FIELD_LABELS[field]) return FIELD_LABELS[field];

    if (field.startsWith('hero.')) {
        const sub = field.replace('hero.', '');
        return HERO_SUB_LABELS[sub] ?? `Hero › ${sub}`;
    }

    const sectionMatch = field.match(/^sections\[(\d+)\](?:\.(.+))?$/);
    if (sectionMatch) {
        const index = parseInt(sectionMatch[1], 10) + 1;
        const prop = sectionMatch[2];
        if (!prop) return `Indicateur #${index} (Chiffre clé)`;
        const label = INDICATOR_PROP_LABELS[prop] ?? prop;
        return `Indicateur #${index} › ${label}`;
    }

    if (field.startsWith('sections_data.')) {
        const parts = field.split('.');
        const secKey = parts[1];
        const prop = parts.slice(2).join('.');
        const secLabel = KNOWN_SECTION_NAMES[secKey] ?? secKey;
        const propLabel = SECTION_PROP_LABELS[prop] ?? prop;
        return `Section « ${secLabel} » › ${propLabel}`;
    }

    return field;
}

