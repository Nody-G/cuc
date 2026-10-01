#!/usr/bin/env node
/**
 * Garde statique de périmètre CUC Sign — vérification du code source uniquement,
 * **aucune connexion, aucune requête**. Destiné à la CI :
 *
 *   node scripts/guard_cuc_sign_scope.mjs
 *
 * Code de sortie `1` avec un message précis (`fichier:ligne — règle — extrait`)
 * en cas de violation, `0` sinon.
 *
 * Quatre familles de contrôles sur `src/lib/backup/**` et `scripts/backup/**` :
 *  A. écriture SQL (`INSERT INTO` / `UPDATE` / `DELETE FROM`) visant une table
 *     hors liste blanche ;
 *  B. référence SQL (FROM/JOIN/INTO/UPDATE/REFERENCES/TABLE) à une table CUC Sign
 *     ou au schéma `auth` ;
 *  C. création de clé étrangère vers `evaluation_disciplines` (ou toute table
 *     CUC Sign) ;
 *  D. nom de table écrit **en dur** dans `io/db-restore.ts` (le nom doit venir
 *     du plan, jamais du code) ;
 *  E. toute instruction DDL (`CREATE`/`ALTER`/`DROP`/`TRUNCATE`/`GRANT`).
 *
 * La liste blanche est **recopiée volontairement** ici : un garde qui importerait
 * la constante qu'il surveille ne vérifierait rien. Le recopier rend la garde
 * indépendante — c'est la seconde paire d'yeux.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src/lib/backup', 'scripts/backup'];
const EXTENSIONS = ['.ts', '.tsx', '.mjs', '.js'];

const WHITELIST = new Set([
    'site_programs', 'site_pages', 'site_team', 'site_films', 'site_sessions', 'site_partners', 'site_events',
    'site_settings', 'site_disciplines', 'site_campus_pois', 'site_inquiries', 'site_navigation', 'site_footer',
    'site_translations', 'site_social_links', 'site_announcements', 'site_page_revisions', 'site_audit_logs',
    'site_activity_logs', 'site_vitals',
]);

const CUC_SIGN = new Set([
    'formations', 'profiles', 'students', 'locations', 'groups', 'group_memberships', 'slots', 'signatures',
    'evaluation_disciplines', 'evaluation_sessions',
]);

// Un mot-clé SQL n'est retenu qu'en **position d'instruction** : en début de
// ligne, de littéral, après `;`, `(`, `=` ou `"`. Sans cette contrainte, la prose
// française (« … dans un UPDATE mais … ») produirait de faux positifs.
const STATEMENT_PREFIX = "(?:^|[`'\"();=])";
const WRITE_SQL = new RegExp(`${STATEMENT_PREFIX}(?:INSERT\\s+INTO|UPDATE|DELETE\\s+FROM)\\s+"?([A-Za-z_][A-Za-z0-9_]*)"?`, 'gi');
const READ_SQL = new RegExp(`${STATEMENT_PREFIX}(?:FROM|JOIN|INTO|UPDATE|REFERENCES|TABLE)\\s+"?([A-Za-z_][A-Za-z0-9_]*)"?`, 'gi');
const FK_TARGET = new RegExp(`${STATEMENT_PREFIX}REFERENCES\\s+[^;\\n]*?\\b([A-Za-z_][A-Za-z0-9_]*)\\b`, 'gi');
const DDL = /\b(?:CREATE|ALTER|DROP|TRUNCATE|GRANT)\s+(?:TABLE|POLICY|SCHEMA|INDEX|FUNCTION|TRIGGER|ROLE|VIEW)\b/i;
const HARDCODED_TABLE = /\bsite_[a-z_]+\b/;
/** Schémas techniques : un identifiant suivi d'un point désigne la table, pas le schéma. */
const SCHEMAS = new Set(['public', 'information_schema', 'pg_catalog', 'pg_temp']);

/**
 * Noms de tables cités par une famille de motifs SQL. Une référence
 * schéma-qualifiée (`"public"."x"`) est résolue sur **son dernier segment** :
 * le schéma n'est pas une table.
 */
function referencedTables(text, pattern) {
    const names = [];
    for (const match of text.matchAll(pattern)) {
        const following = /^\s*\.\s*"?([A-Za-z_][A-Za-z0-9_]*)"?/.exec(text.slice(match.index + match[0].length));
        const name = following === null ? match[1] : following[1];
        if (SCHEMAS.has(name) && following === null) continue;
        names.push(name);
    }
    return names;
}

/** Liste récursive des fichiers à analyser. */
function collect(directory) {
    const absolute = path.join(ROOT, directory);
    let entries;
    try {
        entries = readdirSync(absolute, { withFileTypes: true });
    } catch {
        return [];
    }
    const files = [];
    for (const entry of entries) {
        const relative = `${directory}/${entry.name}`;
        if (entry.isDirectory()) files.push(...collect(relative));
        else if (EXTENSIONS.includes(path.extname(entry.name))) files.push(relative);
    }
    return files;
}

const violations = [];
const report = (file, line, rule, excerpt) => violations.push(`${file}:${line} — ${rule} — ${excerpt.trim().slice(0, 120)}`);

/** Applique les quatre familles de contrôles à un fichier. */
function inspect(file) {
    const source = readFileSync(path.join(ROOT, file), 'utf8');
    const lines = source.split(/\r?\n/);
    lines.forEach((text, index) => {
        const line = index + 1;
        for (const name of referencedTables(text, WRITE_SQL)) {
            if (!WHITELIST.has(name)) report(file, line, `écriture SQL hors liste blanche (« ${name} »)`, text);
        }
        for (const name of referencedTables(text, READ_SQL)) {
            if (CUC_SIGN.has(name) || name === 'auth') report(file, line, `référence SQL CUC Sign / auth (« ${name} »)`, text);
        }
        for (const target of referencedTables(text, FK_TARGET)) {
            if (CUC_SIGN.has(target)) report(file, line, `clé étrangère vers CUC Sign (« ${target} »)`, text);
        }
        if (DDL.test(text)) report(file, line, 'instruction DDL interdite', text);
        if (file.endsWith('io/db-restore.ts') && HARDCODED_TABLE.test(text)) {
            report(file, line, 'nom de table en dur dans db-restore.ts', text);
        }
    });
}

const files = SCAN_DIRS.flatMap((directory) => collect(directory));
if (files.length === 0) {
    console.error('Garde de périmètre : aucun fichier analysé — chemins de recherche introuvables, garde invalide.');
    process.exit(1);
}
for (const file of files) inspect(file);

if (violations.length > 0) {
    console.error(`Garde de périmètre CUC Sign : ${violations.length} violation(s) sur ${files.length} fichier(s).`);
    for (const violation of violations) console.error(`  · ${violation}`);
    process.exit(1);
}
console.log(`Garde de périmètre CUC Sign : ${files.length} fichier(s) analysé(s), aucune violation (A–E).`);
