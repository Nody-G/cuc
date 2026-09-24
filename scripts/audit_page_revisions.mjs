#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Historique des révisions de pages : mesure et rétention
 * ==============================================================================
 * `site_page_revisions` est la **seule table de la vitrine qui grossit toute
 * seule** : chaque écriture d'une page y dépose un instantané complet (trigger
 * SQL), et rien ne plafonne ce volume. Sur un site dont tout le reste est servi
 * par le cache serveur, c'est le point de dérive à tenir.
 *
 * Ce script ne porte que des entrées-sorties : la règle de rétention vit dans
 * `src/lib/data/site/page-revision-retention.ts` (pure, testée par Vitest).
 *
 * Doctrine appliquée :
 *  - **mesure d'abord** : le volume réel par page est rapporté avant décision,
 *    ainsi que **qui alimente** l'historique (écrivain applicatif ou trigger SQL) ;
 *  - **aucune suppression sans `--write`** : par défaut, rien n'est effacé ;
 *  - **rien d'intentionnel n'est purgé** : une révision étiquetée est un jalon
 *    volontaire, elle survit quelle que soit son ancienneté ;
 *  - la règle est **par page**, jamais un seuil global.
 *
 * Usage (exécution via `tsx`, car le module importé est en TypeScript) :
 *   node_modules/.bin/tsx scripts/audit_page_revisions.mjs                # mesure
 *   node_modules/.bin/tsx scripts/audit_page_revisions.mjs --keep=10      # simulation
 *   node_modules/.bin/tsx scripts/audit_page_revisions.mjs --keep=10 --write
 *   npm run audit:revisions
 *   npm run cms:purge:revisions
 *
 * Sortie : `plans/revue-revisions-pages.md` — code 2 si la mesure échoue.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'node:url';
import {
    countPlannedRemovals,
    normalizeKeepPerPage,
    planRevisionRetention,
} from '../src/lib/data/site/page-revision-retention.ts';

dotenv.config({ path: '.env.local' });

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'plans', 'revue-revisions-pages.md');
const TABLE = 'site_page_revisions';
const DEFAULT_KEEP = 20;
/** Écrivain applicatif attendu : le seul chemin qui dépose un instantané. */
const PAGES_ACTION = path.join(ROOT, 'src', 'app', '(admin)', 'admin', 'actions', 'pages.ts');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const keepArg = args.find((arg) => arg.startsWith('--keep='));
const KEEP_PER_PAGE = normalizeKeepPerPage(
    keepArg ? Number.parseInt(keepArg.split('=')[1], 10) : DEFAULT_KEEP,
    DEFAULT_KEEP
);

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — mesure impossible.');
    process.exit(2);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function main() {
    await client.connect();

    const { rows } = await client.query(
        `SELECT id, page_slug, revision_number, label, created_at,
                pg_column_size(snapshot) AS bytes
           FROM ${TABLE}
          ORDER BY page_slug, revision_number DESC`
    );

    const { rows: sizeRows } = await client.query(
        `SELECT pg_size_pretty(pg_total_relation_size($1)) AS total_size`,
        [TABLE]
    );

    /**
     * Diagnostic « qui alimente l'historique ? » : une table vide avec la bonne
     * taille ne dit pas *pourquoi* elle est vide. On regarde donc les triggers
     * réellement posés en base (le SQL du dépôt peut ne jamais avoir été
     * appliqué) et les fonctions attendues.
     */
    const { rows: triggerRows } = await client.query(
        `SELECT t.tgname, c.relname AS on_table, p.proname AS via_function, t.tgenabled
           FROM pg_trigger t
           JOIN pg_class c ON c.oid = t.tgrelid
           JOIN pg_proc p ON p.oid = t.tgfoid
          WHERE NOT t.tgisinternal
            AND c.relname IN ('site_pages', 'site_page_revisions')
          ORDER BY c.relname, t.tgname`
    );
    const { rows: functionRows } = await client.query(
        `SELECT proname FROM pg_proc
          WHERE proname IN ('snapshot_site_page_revision', 'next_page_revision_number')
          ORDER BY proname`
    );
    const hasSnapshotTrigger = triggerRows.some(
        (trigger) => trigger.via_function === 'snapshot_site_page_revision'
    );

    /**
     * Deux alimentations possibles, et une seule suffit : l'écrivain applicatif
     * (`recordPageRevision` appelé par `upsertPageContent`) ou le trigger SQL.
     * Les confondre ferait dire au rapport « historique inerte » alors qu'il
     * fonctionne — c'est la version applicative qui fait foi ici.
     */
    const pagesAction = fs.existsSync(PAGES_ACTION) ? fs.readFileSync(PAGES_ACTION, 'utf8') : '';
    const hasAppWriter = /recordPageRevision\(/.test(pagesAction);
    const historyIsFed = hasAppWriter || hasSnapshotTrigger;

    const revisions = rows.map((row) => ({ ...row, bytes: Number(row.bytes) }));
    const plan = planRevisionRetention(revisions, KEEP_PER_PAGE);
    const totalRemoved = countPlannedRemovals(plan);
    const totalRemovedBytes = plan.reduce((sum, page) => sum + page.removedBytes, 0);

    let deleted = 0;
    if (WRITE && totalRemoved > 0) {
        await client.query('BEGIN');
        try {
            const ids = plan.flatMap((page) => page.removedIds);
            for (let index = 0; index < ids.length; index += 200) {
                const chunk = ids.slice(index, index + 200);
                const result = await client.query(`DELETE FROM ${TABLE} WHERE id = ANY($1::uuid[])`, [
                    chunk,
                ]);
                deleted += result.rowCount ?? 0;
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }

    const lines = [];
    lines.push('# Revue — Historique des révisions de pages');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_page_revisions.mjs\`.`);
    lines.push('');
    lines.push(
        `Règle de rétention : **${KEEP_PER_PAGE} révisions les plus récentes par page**, plus toute révision étiquetée (jalon volontaire). Mode : ${WRITE ? 'application' : 'simulation (aucune suppression)'
        }.`
    );
    lines.push('');
    lines.push(`- Révisions en base : ${revisions.length}`);
    lines.push(`- Pages concernées : ${plan.length}`);
    lines.push(`- Taille de la table (données + index) : ${sizeRows[0]?.total_size ?? '—'}`);
    lines.push(
        `- Révisions ${WRITE ? 'supprimées' : 'à supprimer'} : ${totalRemoved} (${(totalRemovedBytes / 1024).toFixed(0)} Ko de snapshots)`
    );
    if (WRITE) lines.push(`- Lignes réellement supprimées : ${deleted}`);
    lines.push('');
    lines.push(
        `| Page | Révisions | Conservées | ${WRITE ? 'Supprimées' : 'À supprimer'} | Plus ancienne | Snapshots conservés |`
    );
    lines.push('| --- | ---: | ---: | ---: | --- | ---: |');
    for (const page of plan) {
        lines.push(
            `| \`${page.slug}\` | ${page.total} | ${page.kept} | ${page.removed} | ${page.oldest ? new Date(page.oldest).toISOString().slice(0, 10) : '—'
            } | ${(page.bytes / 1024).toFixed(0)} Ko |`
        );
    }
    lines.push('');
    lines.push('');
    lines.push('## Diagnostic — qui alimente cet historique ?');
    lines.push('');
    lines.push(
        hasAppWriter
            ? 'Écrivain **applicatif** présent : `upsertPageContent` dépose un instantané après chaque enregistrement réussi (`recordPageRevision`, client admin — la policy d’écriture exige un rôle administrateur).'
            : 'Aucun écrivain applicatif détecté dans `upsertPageContent` : plus rien ne dépose d’instantané.'
    );
    lines.push(
        hasSnapshotTrigger
            ? 'Trigger SQL d’instantané **posé** (`snapshot_site_page_revision`) : une seconde alimentation existe côté base.'
            : 'Trigger SQL d’instantané **absent** en base — alimentation assurée par le seul écrivain applicatif (le SQL de référence reste `scripts/schema_page_revisions.sql`).'
    );
    lines.push('');
    lines.push(
        triggerRows.length > 0
            ? `Triggers posés : ${triggerRows
                .map((trigger) => `\`${trigger.tgname}\` sur \`${trigger.on_table}\` → \`${trigger.via_function}\``)
                .join(' · ')}`
            : 'Triggers posés sur `site_pages` / `site_page_revisions` : aucun.'
    );
    lines.push(
        functionRows.length > 0
            ? `Fonctions attendues présentes : ${functionRows.map((row) => `\`${row.proname}\``).join(', ')}`
            : 'Fonctions attendues (`snapshot_site_page_revision`, `next_page_revision_number`) : **absentes**.'
    );
    if (revisions.length === 0 && !historyIsFed) {
        lines.push('');
        lines.push(
            '> Historique **inerte** : la table existe (et est publiée en Realtime), l’interface du Cockpit affiche un panneau de versions, mais rien n’écrit d’instantané. À traiter — soit en branchant l’écrivain, soit en assumant la suppression du panneau.'
        );
    } else if (revisions.length === 0) {
        lines.push('');
        lines.push(
            '> Historique alimenté mais encore **vide** : normal tant qu’aucune page n’a été enregistrée depuis la mise en place de l’écrivain. Enregistrer une page dans le Cockpit, puis relancer cette mesure.'
        );
    }
    lines.push('');
    lines.push(
        WRITE
            ? 'Rétention appliquée. Relancer sans `--write` pour vérifier l’état.'
            : 'Simulation : relancer avec `--write` (ou `npm run cms:purge:revisions`) pour appliquer la rétention.'
    );
    lines.push('');

    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

    console.log(
        `[audit:revisions] ${revisions.length} révision(s) sur ${plan.length} page(s) — table : ${sizeRows[0]?.total_size ?? '—'}`
    );
    console.log(
        `[audit:revisions] ${WRITE ? 'Supprimées' : 'À supprimer'} : ${totalRemoved} (garde ${KEEP_PER_PAGE}/page + jalons étiquetés)`
    );
    console.log(
        `[audit:revisions] Écrivain d’instantané : ${hasAppWriter
            ? 'applicatif (upsertPageContent)'
            : hasSnapshotTrigger
                ? 'trigger SQL'
                : 'AUCUN — historique inerte'
        }`
    );
    console.log(`[audit:revisions] Rapport : ${path.relative(ROOT, REPORT)}`);

    await client.end();
    process.exit(0);
}

main().catch(async (error) => {
    console.error(`[audit:revisions] Échec : ${error.message}`);
    try {
        await client.end();
    } catch {
        /* connexion déjà fermée */
    }
    process.exit(2);
});
