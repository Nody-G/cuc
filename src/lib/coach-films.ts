/**
 * ==============================================================================
 * CUC — Domaine de la filmographie d'un coach
 * ==============================================================================
 * Appariement des crédits aux films du catalogue, ordre de mise en avant, tri de
 * la filmographie et résolution du rôle du coach sur un film. Module **pur**
 * (`AGENTS.md` § 1).
 *
 * Déplacé depuis `[slug]/coach-detail/` : la **carte** de la liste et la **fiche**
 * du coach doivent lire la même vérité. Auparavant la carte filtrait à sa façon,
 * sans tri, et affichait donc trois films différents des trois premiers de la
 * fiche. Un seul sélecteur les sert désormais (`selectCoachFilms`).
 */

import type { FilmCredit, Instructor, ParsedCredit } from '@/types';
import { parseCredit } from '@/types';
import { creditTitleKey } from '@/lib/credit-title';
import { normalizeRole, type RoleSetSummary } from '@/lib/credit-role';
import { renderRoleSet } from '@/lib/i18n/role-labels';

export type FilmSort = 'year-desc' | 'year-asc' | 'title-asc' | 'title-desc';

/**
 * Tri par défaut d'une filmographie. Les deux surfaces (carte et fiche)
 * l'utilisent : c'est lui qui garantit que « les 3 mis en avant » sont les mêmes
 * des deux côtés.
 */
export const DEFAULT_COACH_FILM_SORT: FilmSort = 'year-desc';

/**
 * Clé canonique d'un titre de film : délègue au helper partagé `creditTitleKey`
 * (retrait du suffixe d'année « (2021) », accents, ponctuation) afin que la
 * mise en avant définie côté admin soit reconnue côté public — y compris pour
 * les crédits sourcés IMDb qui portent toujours leur année.
 */
export function normalizeTitleKey(title: string): string {
    return creditTitleKey(title);
}

/**
 * Films associés au coach : liens explicites (`film_ids`,
 * `cuc_team_involved`) puis appariement par **titre normalisé** (suffixe
 * d'année retiré) — « Lupin (2021) — Cascadeur » correspond au film « Lupin ».
 */
export function findRelatedFilms(films: FilmCredit[], member?: Instructor): FilmCredit[] {
    if (!member) return [];
    return films.filter((f) => {
        if (member.film_ids && member.film_ids.includes(f.id)) return true;
        if (f.cuc_team_involved && f.cuc_team_involved.includes(member.id)) return true;
        if (!member.notableCredits) return false;
        const filmKey = normalizeTitleKey(f.title);
        return member.notableCredits.some((c) => {
            const creditKey = normalizeTitleKey(parseCredit(c).title || c);
            return creditKey && creditKey === filmKey;
        });
    });
}

/**
 * Crédits mis en avant depuis le cockpit (ordre d'affichage prioritaire).
 * Le libellé stocké peut être « Titre — Rôle » : on ne compare que le titre,
 * normalisé exactement comme dans le cockpit.
 */
export function buildFeaturedOrder(member?: Instructor): Map<string, number> {
    const map = new Map<string, number>();
    (member?.featuredCredits || []).forEach((raw, idx) => {
        const title = parseCredit(raw).title || raw;
        map.set(normalizeTitleKey(title), idx);
    });
    return map;
}

function yearOf(film: FilmCredit): number {
    const parsed = parseInt(String(film.year ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Tri de la filmographie : les crédits mis en avant d'abord (dans l'ordre
 * défini dans le cockpit), puis le reste selon le tri choisi par le visiteur.
 */
export function sortCoachFilms(
    films: FilmCredit[],
    filmSort: FilmSort,
    featuredOrder: Map<string, number>
): FilmCredit[] {
    const list = [...films];
    const compare = (a: FilmCredit, b: FilmCredit) => {
        switch (filmSort) {
            case 'year-asc':
                return yearOf(a) - yearOf(b);
            case 'title-asc':
                return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
            case 'title-desc':
                return b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' });
            case 'year-desc':
            default:
                return yearOf(b) - yearOf(a);
        }
    };
    return list.sort((a, b) => {
        const rankA = featuredOrder.get(normalizeTitleKey(a.title));
        const rankB = featuredOrder.get(normalizeTitleKey(b.title));
        const isFeaturedA = rankA !== undefined;
        const isFeaturedB = rankB !== undefined;
        if (isFeaturedA && isFeaturedB) return (rankA as number) - (rankB as number);
        if (isFeaturedA) return -1;
        if (isFeaturedB) return 1;
        return compare(a, b);
    });
}

/**
 * Filmographie d'un coach, **dans l'ordre exact de sa fiche** : mise en avant du
 * Cockpit d'abord, puis tri par défaut.
 *
 * C'est le sélecteur partagé : la carte en affiche les trois premiers, la fiche
 * les présente tous. Une seule source, donc aucune divergence possible entre ce
 * qu'on annonce et ce qu'on montre.
 */
export function selectCoachFilms(
    films: FilmCredit[],
    member?: Instructor,
    filmSort: FilmSort = DEFAULT_COACH_FILM_SORT
): FilmCredit[] {
    return sortCoachFilms(findRelatedFilms(films, member), filmSort, buildFeaturedOrder(member));
}

export interface CoachFilmRole {
    role: string;
    isCoord: boolean;
    isDoublure: boolean;
}

/** Traducteur des libellés de rôles (namespace `team`). */
export type RoleTranslator = Parameters<typeof renderRoleSet>[1];

/**
 * Rôles **sans langue** tenus par le coach sur un film, selon la priorité de
 * sources canonique : rôle enregistré sur le film (`cuc_team_roles`), puis
 * metadata du membre (`film_roles`), puis crédit parsé apparié par titre, puis
 * déduction depuis le titre du coach.
 *
 * Source unique de [`createCoachFilmRoleResolver`](src/lib/coach-films.ts:1)
 * (fiche/carte coach) et de
 * [`selectCoordinatedFilms`](src/lib/coach-films.ts:1) (vitrine TOURNAGE) : la
 * vitrine ne peut donc pas annoncer une coordination que la fiche ignore.
 */
function resolveRoleSet(
    film: FilmCredit,
    member: Instructor,
    parsedCredits: ParsedCredit[]
): RoleSetSummary {
    const fromRaw = (raw: string): RoleSetSummary => normalizeRole(raw);

    // 1. Rôle direct dans cuc_team_roles du film
    if (film.cuc_team_roles && film.cuc_team_roles[member.id]) {
        return fromRaw(film.cuc_team_roles[member.id]);
    }
    // 2. Rôle dans les metadata du membre
    if (member.metadata?.film_roles && member.metadata.film_roles[film.id]) {
        return fromRaw(member.metadata.film_roles[film.id]);
    }
    // 3. Correspondance dans les crédits parsés
    const matched = parsedCredits.find(
        (c) =>
            c.title.toLowerCase().includes(film.title.toLowerCase()) ||
            film.title.toLowerCase().includes(c.title.toLowerCase())
    );
    if (matched && matched.role) {
        return fromRaw(matched.role);
    }
    // 4. Déduction basée sur le titre principal du coach
    if (member.title.toLowerCase().includes('coordinateur')) {
        return normalizeRole('Coordinateur des cascades');
    }
    return normalizeRole('Cascadeur');
}

/**
 * Résout le rôle précis du coach sur un film donné. Le libellé brut est
 * systématiquement ramené à un rôle canonique lisible (Coordinateur des
 * cascades · Doublure de X · Cascadeur · Parkour · Câblage), **rendu traduit**
 * (auparavant le rôle canonique français s'affichait tel quel sur les pages EN).
 */
export function createCoachFilmRoleResolver({
    member,
    parsedCredits,
    tt,
}: {
    member: Instructor;
    parsedCredits: ParsedCredit[];
    tt: RoleTranslator;
}) {
    return (film: FilmCredit): CoachFilmRole => {
        const summary = resolveRoleSet(film, member, parsedCredits);
        return {
            role: renderRoleSet(
                { roles: summary.roles, doubledActors: summary.doubledActors },
                tt
            ),
            isCoord: summary.roles.includes('Coordinateur des cascades'),
            isDoublure: summary.roles.includes('Doublure'),
        };
    };
}

/**
 * Films du catalogue sur lesquels le coach a tenu un **rôle de coordination**,
 * dans l'ordre de sa fiche (mise en avant Cockpit puis tri par défaut).
 *
 * Sert la vitrine « LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC » de la page
 * TOURNAGE : seuls les films coordonnés par le référent y sont exposés ; le
 * reste de la filmographie se découvre au cas par cas sur la fiche du coach.
 */
export function selectCoordinatedFilms(
    films: FilmCredit[],
    member?: Instructor,
    filmSort: FilmSort = DEFAULT_COACH_FILM_SORT
): FilmCredit[] {
    if (!member) return [];
    const parsedCredits = (member.notableCredits || []).map(parseCredit);
    const coordinated = findRelatedFilms(films, member).filter((film) =>
        resolveRoleSet(film, member, parsedCredits).roles.includes('Coordinateur des cascades')
    );
    return sortCoachFilms(coordinated, filmSort, buildFeaturedOrder(member));
}
