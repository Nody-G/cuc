/**
 * Classification et catégorisation sémantique des médias de la médiathèque CUC.
 *
 * Module DOMAINE PUR (Directive AGENTS.md § 1) :
 * - Aucune dépendance réseau ni 'use server'
 * - Fonctions pures, déterministes et testables (< 300 lignes)
 * - Organisation par thématiques métier (Campus, Équipe, Stages, Cascades, etc.)
 */

import type { MediaObject } from '@/app/(admin)/admin/media-shared';
import type { MediaUsageItem } from '@/lib/media-library/media-usage';

export type MediaCategory =
    | 'accueil'
    | 'campus'
    | 'formations'
    | 'tournage'
    | 'equipe'
    | 'events'
    | 'films'
    | 'partenaires'
    | 'reels'
    | 'documents'
    | 'autres';

export interface MediaCategoryMeta {
    id: MediaCategory;
    label: string;
    shortLabel: string;
    description: string;
    iconName: string;
    badgeClass: string;
    dotClass: string;
}

export const MEDIA_CATEGORIES: MediaCategoryMeta[] = [
    {
        id: 'accueil',
        label: 'Accueil & Couvertures',
        shortLabel: 'Accueil',
        description: "Photos de couverture, bandeaux d'accueil et héros du site",
        iconName: 'Home',
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotClass: 'bg-amber-400',
    },
    {
        id: 'campus',
        label: 'Le Campus & Espaces',
        shortLabel: 'Campus',
        description: 'Zoe Bell Hall, CUC Tower, dojos, city stade, équipements et studios',
        iconName: 'Building2',
        badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        dotClass: 'bg-sky-400',
    },
    {
        id: 'formations',
        label: 'Stages & Formations',
        shortLabel: 'Formations',
        description: 'Formation Pro, Workshop, Summer Camp, Immersion, Parkour et École de cascade',
        iconName: 'GraduationCap',
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        dotClass: 'bg-emerald-400',
    },
    {
        id: 'tournage',
        label: 'Tournage & Cascades',
        shortLabel: 'Tournage',
        description: 'Cascades cinéma, câblage, rigging, combats, torches et défenestration',
        iconName: 'Clapperboard',
        badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
        dotClass: 'bg-red-400',
    },
    {
        id: 'equipe',
        label: 'Équipe & Cascadeurs',
        shortLabel: 'Équipe',
        description: 'Cascadeurs professionnels, portraits coachs, staff et trombinoscope',
        iconName: 'Users',
        badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        dotClass: 'bg-purple-400',
    },
    {
        id: 'events',
        label: 'Événements & Spectacles',
        shortLabel: 'Événements',
        description: 'Spectacles cascades & Yamakasi, team building, démonstrations et shows',
        iconName: 'Sparkles',
        badgeClass: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
        dotClass: 'bg-pink-400',
    },
    {
        id: 'films',
        label: 'Affiches & Cinéma',
        shortLabel: 'Cinéma',
        description: 'Affiches officielles de films, génériques et productions cinéma',
        iconName: 'Film',
        badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        dotClass: 'bg-indigo-400',
    },
    {
        id: 'partenaires',
        label: 'Partenaires & Presse',
        shortLabel: 'Partenaires',
        description: 'Logos partenaires, institutions, sponsors et reportages presse',
        iconName: 'Handshake',
        badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        dotClass: 'bg-teal-400',
    },
    {
        id: 'reels',
        label: 'Vidéos & Reels',
        shortLabel: 'Vidéos',
        description: 'Instagram Reels, extraits vidéo et archives audiovisuelles',
        iconName: 'Video',
        badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
        dotClass: 'bg-orange-400',
    },
    {
        id: 'documents',
        label: 'Documents & Fiches',
        shortLabel: 'Documents',
        description: "Plaquettes d'information, fiches d'inscription et PDF",
        iconName: 'FileText',
        badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        dotClass: 'bg-slate-400',
    },
    {
        id: 'autres',
        label: 'Autres ressources',
        shortLabel: 'Autres',
        description: 'Éléments graphiques, icônes, séparateurs et visuels divers',
        iconName: 'LayoutGrid',
        badgeClass: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
        dotClass: 'bg-zinc-400',
    },
];

export const CATEGORY_META_BY_ID = new Map<MediaCategory, MediaCategoryMeta>(
    MEDIA_CATEGORIES.map((cat) => [cat.id, cat])
);

const CAMPUS_KW = ['campus', 'zoe-bell', 'zoebell', 'salle-', 'salle_', 'salle-3', 'matelas', 'cuc-tower', 'city-stade', 'airbag', 'equipement', 'studio', 'domaine', 'espace-mecanique', 'qg-staff'];
const FORMATIONS_KW = ['stage', 'formation', 'workshop', 'summer-camp', 'immersion', 'ecole-de-cascade', 'parkour', 'xtrem-jump', 'sse-', 'cuc-5', 'cuc-session', 'session-aout', 'atelier-cinema'];
const TOURNAGE_KW = ['tournage', 'cascade-action', 'defenestration', 'défenestration', 'cuc-prod', 'cuc-bri', 'nero', 'rigging', 'combat', 'torche', 'cablage', 'saut-niels'];
const EQUIPE_KW = ['team', 'cascadeur', 'coach', 'staff', 'portrait', 'bg-equipe', 'img-equipe', 'alex', 'lucas', 'anthony', 'nicolas', 'teddy', 'jonathan', 'maurice', 'franck', 'jerome', 'frederic', 'kefi', 'sarah', 'michel', 'bastien', 'alan-cueff'];
const EVENTS_KW = ['spectacle', 'team-building', 'freejump', 'show', 'anniversaire', 'happybirthday'];
const FILMS_KW = ['bandes-affiches', 'affiches-film', 'bandeau-images-films', 'bandeau-films', 'coeur-de-cascadeurs', 'stuntrider'];
const ACCUEIL_KW = ['couv', 'hero', 'slider', 'bandeau-2023', 'accueil'];

const hasAny = (target: string, keywords: string[]): boolean =>
    keywords.some((kw) => target.includes(kw));

/**
 * Déduit la catégorie métier d'un média à partir de :
 * 1. Une surcharge manuelle explicite (overrides)
 * 2. Son index d'utilisation dans les tables de contenu
 * 3. Son dossier de stockage Supabase
 * 4. Son nom de fichier et mots-clés sémantiques
 */
export function inferMediaCategory(
    file: Pick<MediaObject, 'path' | 'name' | 'kind'>,
    usageItem?: MediaUsageItem | null,
    overrides?: Record<string, MediaCategory> | null
): MediaCategory {
    if (overrides && overrides[file.path]) return overrides[file.path];

    const p = file.path.toLowerCase();
    const filename = (file.name || file.path.split('/').pop() || '').toLowerCase();

    if (file.kind === 'video' || p.includes('/reels') || filename.includes('reel') || p.endsWith('.mp4') || p.endsWith('.webm') || p.endsWith('.mov')) return 'reels';
    if (file.kind === 'document' || p.startsWith('media/document') || filename.endsWith('.pdf') || filename.endsWith('.docx') || filename.endsWith('.doc')) return 'documents';
    if (p.startsWith('media/film-poster')) return 'films';
    if (p.startsWith('media/partner-logo') || p.startsWith('media/reportages')) return 'partenaires';
    if (p.startsWith('media/events')) return 'events';

    if (usageItem?.locations?.length) {
        for (const loc of usageItem.locations) {
            if (loc.table === 'site_films') return 'films';
            if (loc.table === 'site_team') return 'equipe';
            if (loc.table === 'site_campus_pois') return 'campus';
            if (loc.table === 'site_disciplines' || loc.table === 'site_sessions') return 'formations';
            if (loc.table === 'site_events') return 'events';
            if (loc.table === 'site_partners') return 'partenaires';
            if (loc.label.includes('Page "/"') || loc.context?.includes('Hero')) return 'accueil';
        }
    }

    if (filename.startsWith('home-') || hasAny(filename, ACCUEIL_KW)) return 'accueil';
    if (filename.startsWith('campus-') || hasAny(filename, CAMPUS_KW)) return 'campus';
    if (filename.startsWith('stages-') || filename.startsWith('formation-') || hasAny(filename, FORMATIONS_KW)) return 'formations';
    if (filename.startsWith('tournage-') || filename.startsWith('cascade-') || filename.startsWith('cascadeur-') || hasAny(filename, TOURNAGE_KW)) return 'tournage';
    if (filename.startsWith('equipe-') || /^\d+-([a-z]+)/.test(filename) || hasAny(filename, EQUIPE_KW)) return 'equipe';
    if (filename.startsWith('events-') || hasAny(filename, EVENTS_KW)) return 'events';
    if (hasAny(filename, FILMS_KW)) return 'films';
    if (filename.includes('partenaire') || filename.includes('logo')) return 'partenaires';

    return 'autres';
}

/**
 * Regroupe une liste d'objets médias par catégorie.
 */
export function groupMediaByCategory(
    files: MediaObject[],
    categoryOf: (file: MediaObject) => MediaCategory
): Record<MediaCategory, MediaObject[]> {
    const groups = MEDIA_CATEGORIES.reduce<Record<MediaCategory, MediaObject[]>>((acc, cat) => {
        acc[cat.id] = [];
        return acc;
    }, {} as Record<MediaCategory, MediaObject[]>);

    for (const file of files) {
        const cat = categoryOf(file);
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(file);
    }

    return groups;
}
