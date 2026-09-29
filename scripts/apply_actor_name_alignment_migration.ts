#!/usr/bin/env node
/**
 * MIGRATION — Alignement des noms de comédiens doublés sur le CATALOGUE
 * =====================================================================
 *
 * Problème corrigé
 * ----------------
 * La base publie des noms de comédiens en **texte libre** (`site_team` :
 * `doubled_actors`, `notable_credits`, `metadata` ; `site_films` :
 * `doubled_actors`, `metadata`, `cuc_team_roles`). Or l'identité d'un comédien
 * n'a qu'UNE source de vérité : le catalogue `site_settings.key='celebrities'`
 * (miroir du dépôt `src/data/celebrities.ts`). Quand la base écrit
 * « Aahmir Khan » là où le catalogue dit « Aamir Khan » (IMDb nm0451148), le
 * rapprochement échoue et le nom reste sans fiche.
 *
 * Règles appliquées (aucune n'est approximative)
 * ---------------------------------------------
 *   1. **Coquilles vérifiées** : `CELEBRITY_SPELLING_FIXES`
 *      (`src/lib/celebrity-match.ts`) associe une forme publiée fautive à un
 *      `id` de catalogue avec sa preuve externe. Application et migration
 *      partagent cette table : une seule source par sujet.
 *   2. **Doublons** : deux entrées de même clé canonique (accents, casse,
 *      ponctuation) sont fusionnées ; l'orthographe retenue est celle que le
 *      catalogue déclare (nom ou alias), sinon la première publiée.
 *   3. **Aucune invention** : tout autre nom (rôle, prénom seul, comédien hors
 *      catalogue) est signalé puis LAISSÉ INTACT.
 *   4. Le catalogue est lu **en base** : s'il est absent, la migration s'arrête
 *      sans rien écrire (aucun repli local, donc aucune supposition).
 *
 * Exécution par `tsx` (le script importe la table de corrections en TS) : le
 * corps vit dans `main()` car la sortie est transformée en CJS.
 *
 * Doctrine : DRY-RUN documenté AVANT écriture, puis vérification après écriture.
 *   npm run db:migrate:actor-names          # aperçu (aucune écriture)
 *   npm run db:migrate:actor-names:write    # applique puis vérifie
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';
import {
    CELEBRITY_SPELLING_FIXES,
    celebrityNameKey,
    isNonActorDoubledEntry,
} from '../src/lib/celebrity-match';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const databaseUrl = process.env.DATABASE_URL;

interface CatalogueEntry {
    id: string;
    name: string;
}

interface TeamRow {
    id: string;
    name: string;
    doubled_actors: string[] | null;
    notable_credits: string[] | null;
    metadata: Record<string, unknown> | null;
}

interface FilmRow {
    id: string;
    title: string;
    doubled_actors: string[] | null;
    metadata: Record<string, unknown> | null;
    cuc_team_roles?: Record<string, unknown> | null;
}

/** Alias déclarés entre parenthèses par le catalogue lui-même. */
function declaredAliases(name: string): string[] {
    return [...name.matchAll(/\(([^)]+)\)/g)].map((match) => match[1]);
}

/**
 * Signature de comparaison d'une orthographe : espaces normalisés et casse
 * repliée, accents CONSERVÉS. « Benjamin De LA Fère » et « Benjamin de la Fère »
 * partagent donc une signature, contrairement à « Benjamin De LA Fere ».
 */
function spellingSignature(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Construit le remplacement des formes fautives par leur nom canonique. */
function makeTextRenamer(
    renames: ReadonlyArray<{ published: string; canonical: string }>,
): (text: string) => string {
    const patterns = renames.map(({ published, canonical }) => ({
        regex: new RegExp(published.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        canonical,
    }));
    return (text: string) => {
        let out = text;
        for (const { regex, canonical } of patterns) out = out.replace(regex, canonical);
        return out;
    };
}

/** Applique le renommage à toutes les chaînes d'un JSONB, récursivement. */
function renameDeep(value: unknown, rename: (text: string) => string): unknown {
    if (typeof value === 'string') return rename(value);
    if (Array.isArray(value)) return value.map((item) => renameDeep(item, rename));
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, renameDeep(item, rename)]),
        );
    }
    return value;
}

async function main(): Promise<number> {
    const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    /* 1. Catalogue = source de vérité. Aucun repli local. */
    const catalogueResult = await client.query(
        `SELECT key, value FROM site_settings WHERE key = 'celebrities' LIMIT 1`,
    );
    const rawCatalogue: unknown = catalogueResult.rows[0]?.value;
    const rawList = Array.isArray(rawCatalogue)
        ? rawCatalogue
        : Array.isArray((rawCatalogue as { list?: unknown })?.list)
            ? (rawCatalogue as { list: unknown[] }).list
            : [];
    const catalogue = (rawList as CatalogueEntry[]).filter((entry) => entry?.id && entry?.name);

    if (catalogue.length === 0) {
        const keysResult = await client.query(`SELECT key FROM site_settings ORDER BY key`);
        const keys = (keysResult.rows as Array<{ key: string }>).map((row) => row.key);
        const teamCount = await client.query(`SELECT count(*)::int AS n FROM site_team`);
        console.error("Catalogue introuvable (site_settings.key = 'celebrities') : migration annulée.");
        console.error(`  clés disponibles dans site_settings : ${keys.join(', ') || '(aucune)'}`);
        console.error(`  lignes site_team : ${(teamCount.rows[0] as { n: number })?.n ?? 0}`);
        await client.end();
        return 1;
    }

    const byId = new Map<string, CatalogueEntry>(catalogue.map((entry) => [entry.id, entry]));
    /** Orthographes que le catalogue déclare lui-même (nom complet, sans parenthèses, alias). */
    const declaredSpellings = new Set<string>();
    /** Clés canoniques de toutes les fiches : sert à distinguer « hors catalogue ». */
    const knownKeys = new Set<string>();
    for (const entry of catalogue) {
        for (const spelling of [
            entry.name,
            entry.name.replace(/\([^)]*\)/g, ' '),
            ...declaredAliases(entry.name),
        ]) {
            declaredSpellings.add(spellingSignature(spelling));
            knownKeys.add(celebrityNameKey(spelling));
        }
    }

    /** Corrections vérifiées, résolues contre le catalogue réellement publié. */
    const renames = CELEBRITY_SPELLING_FIXES.flatMap((fix) => {
        const target = byId.get(fix.catalogueId);
        return target ? [{ published: fix.published, canonical: target.name, source: fix.source }] : [];
    });
    const renameText = makeTextRenamer(renames);
    const faultyNames = new Map(
        renames.map((rename) => [celebrityNameKey(rename.published), rename.canonical]),
    );

    /**
     * Note d'une orthographe : 0 = telle que le catalogue l'écrit (nom ou alias),
     * 1 = autre orthographe d'une fiche connue, 2 = hors catalogue.
     */
    const spellingRank = (spelling: string): number => {
        if (declaredSpellings.has(spellingSignature(spelling))) return 0;
        if (knownKeys.has(celebrityNameKey(spelling))) return 1;
        return 2;
    };

    /**
     * Retire les entrées non-comédiens, corrige les coquilles, fusionne les
     * doublons et signale ce qui reste sans fiche.
     */
    const alignActorList = (
        names: string[],
    ): { next: string[]; withoutFiche: string[]; retired: string[] } => {
        const groups = new Map<string, string[]>();
        const order: string[] = [];
        const withoutFiche: string[] = [];
        const retired: string[] = [];

        for (const raw of names) {
            const published = String(raw).trim();
            if (!published) continue;
            if (isNonActorDoubledEntry(published)) {
                retired.push(published);
                continue;
            }
            const renamed = faultyNames.get(celebrityNameKey(published)) ?? published;
            const key = celebrityNameKey(renamed);
            if (!knownKeys.has(key)) withoutFiche.push(published);
            if (!groups.has(key)) {
                groups.set(key, []);
                order.push(key);
            }
            groups.get(key)?.push(renamed);
        }

        const next: string[] = order.map((key) => {
            const spellings = groups.get(key) ?? [];
            return spellings.reduce((best, candidate) =>
                spellingRank(candidate) < spellingRank(best) ? candidate : best,
            );
        });

        return { next, withoutFiche, retired };
    };

    const plan: string[] = [];
    const updates: Array<{ table: string; id: string; column: string; value: unknown }> = [];
    const unresolved = new Map<string, string[]>();
    /** Entrées non-comédiens retirées de `doubled_actors` (source : voir le domaine). */
    const retired = new Map<string, string[]>();

    const teamResult = await client.query(
        `SELECT id, name, doubled_actors, notable_credits, metadata FROM site_team ORDER BY order_index`,
    );
    for (const row of teamResult.rows as TeamRow[]) {
        if (Array.isArray(row.doubled_actors) && row.doubled_actors.length > 0) {
            const aligned = alignActorList(row.doubled_actors);
            for (const name of aligned.withoutFiche) {
                const owners = unresolved.get(name) ?? [];
                owners.push(row.name);
                unresolved.set(name, owners);
            }
            for (const name of aligned.retired) {
                const owners = retired.get(name) ?? [];
                owners.push(row.name);
                retired.set(name, owners);
            }
            if (JSON.stringify(aligned.next) !== JSON.stringify(row.doubled_actors)) {
                plan.push(
                    `site_team ${row.id} · doubled_actors : ${row.doubled_actors.length} → ${aligned.next.length} entrée(s)` +
                    (aligned.retired.length > 0 ? ` (retirées : ${aligned.retired.join(', ')})` : ''),
                );
                updates.push({ table: 'site_team', id: row.id, column: 'doubled_actors', value: aligned.next });
            }
        }

        if (Array.isArray(row.notable_credits) && row.notable_credits.length > 0) {
            const next = row.notable_credits.map(renameText);
            const renamedCredits = row.notable_credits
                .map((credit, index) => ({ from: credit, to: next[index] }))
                .filter((pair) => pair.from !== pair.to);
            if (renamedCredits.length > 0) {
                plan.push(
                    `site_team ${row.id} · notable_credits : ${renamedCredits
                        .map((pair) => `« ${pair.from} » → « ${pair.to} »`)
                        .join(' | ')}`,
                );
                updates.push({ table: 'site_team', id: row.id, column: 'notable_credits', value: next });
            }
        }

        if (row.metadata) {
            const next = renameDeep(row.metadata, renameText);
            if (JSON.stringify(next) !== JSON.stringify(row.metadata)) {
                plan.push(`site_team ${row.id} · metadata : rôles renommés`);
                updates.push({ table: 'site_team', id: row.id, column: 'metadata', value: next });
            }
        }
    }

    const columnCheck = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_name = 'site_films' AND column_name = 'cuc_team_roles'`,
    );
    const filmsHaveRolesColumn = (columnCheck.rows as Array<{ column_name: string }>).length > 0;

    const filmResult = await client.query(
        `SELECT id, title, doubled_actors, metadata${filmsHaveRolesColumn ? ', cuc_team_roles' : ''} FROM site_films`,
    );
    for (const row of filmResult.rows as FilmRow[]) {
        if (Array.isArray(row.doubled_actors) && row.doubled_actors.length > 0) {
            const next = row.doubled_actors.map(renameText);
            if (JSON.stringify(next) !== JSON.stringify(row.doubled_actors)) {
                plan.push(
                    `site_films ${row.id} · doubled_actors : ${JSON.stringify(row.doubled_actors)} → ${JSON.stringify(next)}`,
                );
                updates.push({ table: 'site_films', id: row.id, column: 'doubled_actors', value: next });
            }
        }

        if (row.metadata) {
            const next = renameDeep(row.metadata, renameText);
            if (JSON.stringify(next) !== JSON.stringify(row.metadata)) {
                plan.push(`site_films ${row.id} · metadata : rôles renommés`);
                updates.push({ table: 'site_films', id: row.id, column: 'metadata', value: next });
            }
        }

        if (filmsHaveRolesColumn && row.cuc_team_roles) {
            const next = renameDeep(row.cuc_team_roles, renameText);
            if (JSON.stringify(next) !== JSON.stringify(row.cuc_team_roles)) {
                plan.push(`site_films ${row.id} · cuc_team_roles : rôles renommés`);
                updates.push({ table: 'site_films', id: row.id, column: 'cuc_team_roles', value: next });
            }
        }
    }

    /* 2. Rapport — identique en aperçu et en écriture. */
    console.log(`\nCatalogue : ${catalogue.length} fiches · corrections vérifiées : ${renames.length}`);
    for (const rename of renames) {
        console.log(`  · « ${rename.published} » → « ${rename.canonical} »  (${rename.source})`);
    }

    console.log(`\nModifications prévues : ${updates.length}`);
    for (const line of plan) console.log(`  ~ ${line}`);
    if (updates.length === 0) console.log('  (base déjà alignée)');

    console.log(`\nNoms sans fiche au catalogue — CONSERVÉS tels quels : ${unresolved.size}`);
    for (const [name, owners] of unresolved) console.log(`  ? ${name}  <- ${owners.join(', ')}`);

    console.log(`\nEntrées non-comédiens retirées de doubled_actors : ${retired.size}`);
    console.log(
        '  (sources : IMDb « stunt double: <personnage> » + scripts/curate_doubled_actors.mjs — voir src/lib/celebrity-match.ts)',
    );
    for (const [name, owners] of retired) console.log(`  − ${name}  <- ${owners.join(', ')}`);

    /*
     * Seed du dépôt : `src/data/team.ts` = import + `export const CUC_TEAM:
     * Instructor[] = [ …JSON… ];`. On ne réécrit QUE le tableau, en conservant le
     * saut de ligne du fichier — le reste (import, commentaire d'en-tête) intact.
     */
    const seedPath = path.join(process.cwd(), 'src', 'data', 'team.ts');
    const seedSource = fs.readFileSync(seedPath, 'utf8');
    const seedEol = seedSource.includes('\r\n') ? '\r\n' : '\n';
    const marker = 'export const CUC_TEAM: Instructor[] = ';
    const markerIndex = seedSource.indexOf(marker);
    /* Le marqueur contient lui-même « Instructor[] » : on cherche le tableau
       APRÈS le marqueur complet, jamais dedans. */
    const arrayStart =
        markerIndex === -1 ? -1 : seedSource.indexOf('[', markerIndex + marker.length);
    const arrayClose = seedSource.lastIndexOf('];');
    let seedNext: string | null = null;

    if (arrayStart === -1 || arrayClose === -1 || arrayClose < arrayStart) {
        console.warn('⚠️  Seed src/data/team.ts : structure inattendue, aucune réécriture prévue.');
    } else {
        const team = JSON.parse(seedSource.slice(arrayStart, arrayClose + 1)) as Array<{
            name?: string;
            doubledActors?: string[];
        }>;
        let touched = 0;
        for (const member of team) {
            if (!Array.isArray(member.doubledActors)) continue;
            const aligned = alignActorList(member.doubledActors);
            if (JSON.stringify(aligned.next) === JSON.stringify(member.doubledActors)) continue;
            touched += 1;
            console.log(
                `  ~ seed ${member.name ?? '(sans nom)'} : ${member.doubledActors.length} → ${aligned.next.length} entrée(s)`,
            );
            for (const name of aligned.retired) {
                const owners = retired.get(name) ?? [];
                if (!owners.includes('seed')) owners.push('seed');
                retired.set(name, owners);
            }
            member.doubledActors = aligned.next;
        }
        if (touched > 0) {
            const serialized = JSON.stringify(team, null, 2).split('\n').join(seedEol);
            seedNext = `${seedSource.slice(0, arrayStart)}${serialized}${seedSource.slice(arrayClose + 1)}`;
        }
    }

    console.log(`\nSeed src/data/team.ts : ${seedNext ? 'réécriture prévue' : 'déjà aligné'}`);

    if (!WRITE) {
        console.log('\nDRY-RUN : aucune écriture. Relancer avec --write pour appliquer.\n');
        await client.end();
        return 0;
    }

    /* 3. Écriture, puis vérification des invariants. */
    /* Deux familles de colonnes : des listes `text[]` (doubled_actors,
       notable_credits) et des JSONB (metadata, cuc_team_roles). Un tableau JS
       est encodé en littéral de tableau par `pg` ; seuls les JSONB passent par
       `JSON.stringify` + cast explicite. */
    const JSON_COLUMNS = new Set(['metadata', 'cuc_team_roles']);

    await client.query('BEGIN');
    for (const update of updates) {
        const isJson = JSON_COLUMNS.has(update.column);
        await client.query(
            `UPDATE ${update.table} SET ${update.column} = ${isJson ? '$1::jsonb' : '$1'} WHERE id = $2`,
            [isJson ? JSON.stringify(update.value) : update.value, update.id],
        );
    }
    await client.query('COMMIT');
    console.log(`\nÉcriture appliquée : ${updates.length} ligne(s).`);

    if (seedNext) {
        fs.writeFileSync(seedPath, seedNext, 'utf8');
        console.log('Seed src/data/team.ts réécrit.');
    }

    const faultyPatterns = renames.map((rename) => new RegExp(rename.published, 'g'));
    const verifyTeam = await client.query(
        `SELECT id, doubled_actors, notable_credits, metadata FROM site_team`,
    );
    let anomalies = 0;
    for (const row of verifyTeam.rows as TeamRow[]) {
        const haystack = JSON.stringify([row.doubled_actors, row.notable_credits, row.metadata]);
        if (faultyPatterns.some((pattern) => pattern.test(haystack))) {
            anomalies += 1;
            console.log(`  ❌ site_team ${row.id} conserve une forme fautive`);
        }
        const keys = (row.doubled_actors ?? []).map((name) => celebrityNameKey(name));
        if (new Set(keys).size !== keys.length) {
            anomalies += 1;
            console.log(`  ❌ site_team ${row.id} conserve un doublon dans doubled_actors`);
        }
    }

    const verifyFilms = await client.query(
        `SELECT id, doubled_actors, metadata${filmsHaveRolesColumn ? ', cuc_team_roles' : ''} FROM site_films`,
    );
    for (const row of verifyFilms.rows as FilmRow[]) {
        const haystack = JSON.stringify([row.doubled_actors, row.metadata, row.cuc_team_roles]);
        if (faultyPatterns.some((pattern) => pattern.test(haystack))) {
            anomalies += 1;
            console.log(`  ❌ site_films ${row.id} conserve une forme fautive`);
        }
    }

    console.log(
        anomalies === 0
            ? '✅ Vérification : aucune forme fautive, aucun doublon.\n'
            : `❌ ${anomalies} anomalie(s) restante(s).\n`,
    );

    await client.end();
    return anomalies === 0 ? 0 : 1;
}

main()
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
