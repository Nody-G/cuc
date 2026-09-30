#!/usr/bin/env node
/**
 * INVENTAIRE DES ROUTES — source unique du comptage (CUC)
 * ======================================================
 *
 * POURQUOI CE MODULE
 * ------------------
 * Le projet comptait ses routes de trois façons indépendantes, qui donnaient
 * trois valeurs différentes : `scripts/audit.mjs`, `scripts/audit_full_app.mjs`
 * (copie quasi identique du même détecteur) et la constante éditoriale
 * `routes` de `scripts/generate_metrics_report.mjs`. Ce module met fin à ces
 * comptages divergents : il est la SEULE source de mesure, importée par les
 * scripts consommateurs ; aucune copie ne doit subsister.
 *
 * RÈGLES DE DÉFINITION (tranchées)
 * --------------------------------
 * 1. Une route = un fichier `page.tsx` (ou `page.ts`). Les segments dynamiques
 *    comme `[locale]` comptent pour UNE seule route, servie en français ET en
 *    anglais : on ne multiplie jamais le total par le nombre de langues.
 * 2. Périmètre :
 *      - publiques      = tout `page.tsx` sous `src/app/(site)/**` ;
 *      - administration = tout `page.tsx` sous `src/app/(admin)/**`
 *                         (y compris la connexion `/admin/login`) ;
 *      - total          = publiques + administration.
 *    Une éventuelle page hors de ces deux groupes est comptée à part
 *    (`other`) et exclue du total, conformément au périmètre décidé.
 * 3. Les routes d'API (`route.ts`) ne sont PAS des pages : elles sont comptées
 *    séparément (`api`) et n'entrent jamais dans le total des pages.
 *
 * Chaque route est rendue avec son segment dynamique brut
 * (ex. `/[locale]/contact-cuc`) ; le champ `normalized` retire le segment de
 * locale racine (`/contact-cuc`) pour les comparaisons à iso-locale.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Dossiers jamais parcourus. */
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', 'coverage', '.cache', '.staging']);

/** Groupes racine de l'App Router (segments entre parenthèses). */
const GROUP_PUBLIC = '(site)';
const GROUP_ADMIN = '(admin)';

/** Fichiers de page reconnus par l'App Router. */
const PAGE_FILES = new Set(['page.tsx', 'page.ts']);
/** Gestionnaires de route (API) — pas des pages. */
const ROUTE_FILES = new Set(['route.ts', 'route.tsx']);

/**
 * Retire un éventuel segment de locale racine (`/[locale]`, `/[lang]`…) :
 * les liens applicatifs sont écrits SANS locale (next-intl l'injecte au
 * moment de la navigation), donc la comparaison doit être faite à iso-locale.
 * @param {string} route
 * @returns {string}
 */
export function stripLocaleSegment(route) {
    return route.replace(/^\/(\[[^\]]+\])/, '') || '/';
}

/**
 * Parcours récursif : collecte les `page.tsx`/`page.ts` avec leur route, le
 * dossier qui les contient et leur groupe racine.
 * @param {string} dir
 * @param {string} base
 * @param {'public'|'admin'|'other'|null} group
 * @param {Array<{route:string, file:string, dir:string, group:string}>} acc
 */
function walkPages(dir, base, group, acc) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            // Un segment `(...)` ou `_...` n'entre pas dans l'URL.
            const isGroup = entry.name.startsWith('(') || entry.name.startsWith('_');
            let nextGroup = group;
            if (group === null) {
                if (entry.name === GROUP_PUBLIC) nextGroup = 'public';
                else if (entry.name === GROUP_ADMIN) nextGroup = 'admin';
                else nextGroup = 'other';
            }
            walkPages(
                path.join(dir, entry.name),
                isGroup ? base : `${base}/${entry.name}`,
                nextGroup,
                acc
            );
        } else if (PAGE_FILES.has(entry.name)) {
            acc.push({
                route: base === '' ? '/' : base,
                file: path.join(dir, entry.name),
                dir,
                group: group ?? 'other',
            });
        }
    }
    return acc;
}

/**
 * Parcours récursif des gestionnaires de route (`route.ts`) — hors pages.
 * @param {string} dir
 * @param {string[]} acc
 */
function walkRouteHandlers(dir, acc) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            walkRouteHandlers(path.join(dir, entry.name), acc);
        } else if (ROUTE_FILES.has(entry.name)) {
            acc.push(path.join(dir, entry.name));
        }
    }
    return acc;
}

/**
 * Inventaire unique des routes de l'App Router.
 *
 * @param {{ appDir?: string }} [options] Racine `src/app` (par défaut `process.cwd()/src/app`).
 * @returns {{
 *   pages: Array<{route:string, file:string, dir:string, group:string, normalized:string}>,
 *   publicPages: Array<object>, adminPages: Array<object>, otherPages: Array<object>,
 *   publicRoutes: string[], adminRoutes: string[], otherRoutes: string[],
 *   totals: { total:number, public:number, admin:number, other:number, api:number }
 * }}
 */
export function detectRouteInventory({ appDir = path.join(process.cwd(), 'src', 'app') } = {}) {
    const raw = walkPages(appDir, '', null, []);

    // Une route = un `page.tsx` : déduplication par route (première occurrence).
    const pages = [];
    const seen = new Set();
    for (const entry of raw) {
        if (seen.has(entry.route)) continue;
        seen.add(entry.route);
        pages.push({ ...entry, normalized: stripLocaleSegment(entry.route) });
    }
    pages.sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));

    const publicPages = pages.filter((p) => p.group === 'public');
    const adminPages = pages.filter((p) => p.group === 'admin');
    const otherPages = pages.filter((p) => p.group === 'other');
    const api = walkRouteHandlers(appDir, []);

    return {
        pages,
        publicPages,
        adminPages,
        otherPages,
        publicRoutes: publicPages.map((p) => p.route),
        adminRoutes: adminPages.map((p) => p.route),
        otherRoutes: otherPages.map((p) => p.route),
        totals: {
            // Règle 2 : le total est la somme publiques + administration.
            total: publicPages.length + adminPages.length,
            public: publicPages.length,
            admin: adminPages.length,
            other: otherPages.length,
            api: api.length,
        },
    };
}
