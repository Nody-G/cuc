/**
 * ==============================================================================
 * CUC — Codes d'entité (projections pures brouillon ⇄ overlay)
 * ==============================================================================
 * Couche « Domaine & Services » (`AGENTS.md` § 1.3) : fonctions pures,
 * déterministes, testables hors du cycle de vie UI.
 *
 * `pickCodec` construit un codec générique dont l'allow-list EST la surface
 * traduisible. Les constantes nommées ci-dessous reprennent **exactement** les
 * contrats de lecture des appliers `src/lib/i18n/apply-*-overlay.ts` (vérifiés
 * un par un) : un champ absent ici serait une traduction muette.
 *
 * ⚠️ Ces objets sont des constantes de module : ils sont passés tels quels au
 * hook `useEntityEditorLocale` et NE DOIVENT JAMAIS être recréés au rendu (une
 * identité instable déclencherait la boucle de l'effet de réalignement de
 * `useEntityTranslation`).
 */

import type { Discipline, FilmCredit, Instructor } from '@/types';
import type { SiteEvent } from '@/lib/data/site/types';
import type { SiteSocialLink } from '@/data/navigation';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import type { EntityCodec, TranslationRow } from './entity-translation.contract';

// ------------------------------------------------------------------------------
// Allow-lists — miroir des appliers (source de vérité en lecture)
// ------------------------------------------------------------------------------

/** `apply-team-overlay.ts` : role, title, bio, specialties. */
const TEAM_FIELDS = ['role', 'title', 'bio', 'specialties'] as const;
/** `apply-event-overlay.ts` : title, subtitle, badge, description, price_indicator, cta_text, features. */
const EVENT_FIELDS = [
    'title',
    'subtitle',
    'badge',
    'description',
    'price_indicator',
    'cta_text',
    'features',
] as const;
/** `apply-discipline-overlay.ts` : name, shortDesc, fullDesc, cinemaContext, equipment. */
const DISCIPLINE_FIELDS = ['name', 'shortDesc', 'fullDesc', 'cinemaContext', 'equipment'] as const;
/** `apply-poi-overlay.ts` : name, category, description, badge, specs. */
const ZONE_FIELDS = ['name', 'category', 'description', 'badge', 'specs'] as const;
/** Colonnes `site_social_links` traduisibles. */
const SOCIAL_FIELDS = ['label', 'display_hint'] as const;

/**
 * Sélection de champs par liste blanche.
 *
 * Seul un champ **présent** et **défini** est recopié : les valeurs `undefined`
 * sont écartées pour que la ligne d'overlay reste propre (et que `JSON.stringify`
 * ne laisse pas de trou de sérialisation). Les clés techniques absentes de
 * l'allow-list ne peuvent, par construction, jamais fuiter.
 */
function pick(source: object, fields: readonly string[]): Record<string, unknown> {
    const record = source as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(source, field)) {
            const value = record[field];
            if (value !== undefined) out[field] = value;
        }
    }
    return out;
}

/**
 * Codec générique : `toRow = pick(draft, fields)`,
 * `fromRow = { ...draft, ...pick(row, fields) }`.
 *
 * `fromRow` reconstruit un brouillon complet en repartant du français, puis en
 * écrasant les seuls champs traduisibles par la surcharge : les champs hors
 * allow-list du brouillon sont préservés à l'identique.
 */
export function pickCodec<TDraft extends object, TRow extends object>(
    entity: string,
    fields: readonly string[]
): EntityCodec<TDraft, TRow> {
    return {
        entity,
        fields,
        toRow: (draft) => pick(draft, fields) as TRow,
        fromRow: (row, draft) => ({ ...draft, ...pick(row, fields) }) as TDraft,
    };
}

// ------------------------------------------------------------------------------
// Codecs nommés — importables par les ateliers d'édition (workstreams suivants)
// ------------------------------------------------------------------------------

export const TEAM_CODEC = pickCodec<Instructor, TranslationRow>('team', TEAM_FIELDS);
export const EVENT_CODEC = pickCodec<SiteEvent, TranslationRow>('event', EVENT_FIELDS);
export const DISCIPLINE_CODEC = pickCodec<Discipline, TranslationRow>(
    'discipline',
    DISCIPLINE_FIELDS
);
export const ZONE_CODEC = pickCodec<POI, TranslationRow>('campus_poi', ZONE_FIELDS);
export const SOCIAL_CODEC = pickCodec<SiteSocialLink, TranslationRow>('social_link', SOCIAL_FIELDS);

/**
 * Ligne d'overlay `film`. Différente des autres : la colonne source est
 * `stunt_roles` (snake_case) tandis que le brouillon d'éditeur porte
 * `stuntRoles` (camelCase). Sans ce pont explicite, la traduction des cascades
 * serait écrite… puis jamais relue par `apply-film-overlay.ts`.
 */
export interface FilmRow {
    description?: string;
    stunt_roles?: string;
}

export const FILM_CODEC: EntityCodec<FilmCredit, FilmRow> = {
    entity: 'film',
    fields: ['description', 'stunt_roles'],
    toRow: (draft) => {
        const row: FilmRow = {};
        if (Object.prototype.hasOwnProperty.call(draft, 'description')) {
            row.description = draft.description;
        }
        if (Object.prototype.hasOwnProperty.call(draft, 'stuntRoles')) {
            row.stunt_roles = draft.stuntRoles;
        }
        return row;
    },
    fromRow: (row, draft) => {
        const next: FilmCredit = { ...draft };
        if (row.description !== undefined) next.description = row.description;
        if (row.stunt_roles !== undefined) next.stuntRoles = row.stunt_roles;
        return next;
    },
};
