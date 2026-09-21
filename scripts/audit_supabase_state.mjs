#!/usr/bin/env node
/**
 * AUDIT DE L'ÉTAT SUPABASE — VITRINE CUC (lecture seule)
 * ======================================================
 *
 * État des lieux factuel et reproductible de la base (projet
 * `xkbkcsypftvspmkfnrfm`) : tables `site_*`, publication Realtime, RLS,
 * clés étrangères, doublons de sessions, miroirs `site_settings` et
 * interconnexion CUC Sign (formations / profiles / locations).
 *
 * CE SCRIPT NE CORRIGE RIEN : il lit et rapporte. Toute correction passe par
 * un script dédié avec dry-run documenté (doctrine AGENTS.md).
 *
 * Connexion : chaîne PostgreSQL directe `DATABASE_URL` de `.env.local`.
 *
 * Usage :
 *   node scripts/audit_supabase_state.mjs
 *
 * Sorties :
 *   scripts/audit_supabase_state_report.json
 *   plans/audit-supabase-2026.md
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const ROOT = process.cwd();
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — audit difficile.');
    process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

const report = {
    generatedAt: new Date().toISOString(),
    tables: {}, // name -> rowCount
    realtimePublication: [],
    realtimeMissing: [],
    rls: {}, // name -> hasRls
    foreignKeys: [],
    sessions: { total: 0, linked: 0, unlinked: [], duplicates: [] },
    team: { total: 0, linked: 0, withoutProfile: [] },
    campusPois: [],
    disciplines: { table: 0, settingMirror: 0 },
    settingsMirrors: {},
    mirrorsDrift: [],
    inquiries: 0,
    auditLogs: 0,
    cucSign: { formations: 0, profiles: 0, locations: 0 },
};

const TABLE_CANDIDATES = [
    'site_pages',
    'site_page_revisions',
    'site_team',
    'site_films',
    'site_partners',
    'site_events',
    'site_disciplines',
    'site_sessions',
    'site_programs',
    'site_inquiries',
    'site_audit_logs',
    'site_announcements',
    'site_settings',
    'site_navigation',
    'site_footer',
    'site_social_links',
    'site_translations',
    'site_campus_pois',
    'site_campus_facilities',
    'site_media',
    'site_videos',
];

/** Tables qui doivent être publiées pour le Realtime (doctrine de synchro). */
const REALTIME_REQUIRED = [
    'site_pages',
    'site_page_revisions',
    'site_team',
    'site_films',
    'site_partners',
    'site_events',
    'site_disciplines',
    'site_sessions',
    'site_inquiries',
    'site_announcements',
    'site_settings',
    'site_navigation',
    'site_footer',
    'site_social_links',
    'site_translations',
    'site_campus_pois',
];

async function main() {
    await client.connect();

    /* 1. Comptages des tables site_* ---------------------------------- */
    for (const table of TABLE_CANDIDATES) {
        try {
            const res = await client.query(`SELECT COUNT(*)::int AS n FROM public.${table}`);
            report.tables[table] = res.rows[0].n;
        } catch {
            // Table absente : statut volontaire, pas une anomalie en soi.
            report.tables[table] = null;
        }
    }

    /* 2. Publication Realtime ----------------------------------------- */
    const pub = await client.query(
        `SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename`
    );
    report.realtimePublication = pub.rows.map((r) => r.tablename);
    for (const required of REALTIME_REQUIRED) {
        if (
            report.tables[required] !== null &&
            !report.realtimePublication.includes(required)
        ) {
            report.realtimeMissing.push(required);
        }
    }

    /* 3. RLS ----------------------------------------------------------- */
    const rls = await client.query(
        `SELECT relname, relrowsecurity FROM pg_class
         WHERE relkind = 'r' AND relname LIKE 'site\\_%' ORDER BY relname`
    );
    for (const row of rls.rows) report.rls[row.relname] = row.relrowsecurity;

    /* 4. Clés étrangères impliquant les tables site_* ------------------ */
    const fks = await client.query(
        `SELECT conname,
                conrelid::regclass::text AS from_table,
                confrelid::regclass::text AS to_table,
                confdeltype
         FROM pg_constraint
         WHERE contype = 'f'
           AND (conrelid::regclass::text LIKE 'site\\_%'
                OR confrelid::regclass::text LIKE 'site\\_%')
         ORDER BY 2, 1`
    );
    report.foreignKeys = fks.rows.map((r) => ({
        name: r.conname,
        from: r.from_table,
        to: r.to_table,
        onDelete: { a: 'NO ACTION', r: 'RESTRICT', c: 'CASCADE', n: 'SET NULL', d: 'SET DEFAULT' }[
            r.confdeltype
        ],
    }));

    /* 5. Sessions : liaisons + doublons -------------------------------- */
    const sessions = await client.query(
        `SELECT id, date_display, program_id, status, cuc_sign_formation_id
         FROM site_sessions ORDER BY date_display NULLS LAST, id`
    );
    report.sessions.total = sessions.rows.length;
    const formationIds = new Set(
        (await client.query(`SELECT id FROM formations`)).rows.map((r) => r.id)
    );
    const seen = new Map();
    for (const s of sessions.rows) {
        if (s.cuc_sign_formation_id && formationIds.has(s.cuc_sign_formation_id)) {
            report.sessions.linked++;
        } else {
            report.sessions.unlinked.push({
                id: s.id,
                date_display: s.date_display,
                program_id: s.program_id,
                status: s.status,
            });
        }
        const key = `${s.program_id ?? ''}|${s.date_display ?? ''}`;
        if (seen.has(key)) {
            report.sessions.duplicates.push({
                key,
                ids: [seen.get(key), s.id],
                date_display: s.date_display,
                program_id: s.program_id,
                statuses: [seen.get(`${key}:status`), s.status].filter(Boolean),
            });
        } else {
            seen.set(key, s.id);
            seen.set(`${key}:status`, s.status);
        }
    }

    /* 6. Équipe : profils CUC Sign -------------------------------------- */
    const team = await client.query(
        `SELECT id, name, role, profile_id FROM site_team ORDER BY order_index NULLS LAST, name`
    );
    report.team.total = team.rows.length;
    const profileIds = new Set((await client.query(`SELECT id FROM profiles`)).rows.map((r) => r.id));
    for (const m of team.rows) {
        if (m.profile_id && profileIds.has(m.profile_id)) report.team.linked++;
        else report.team.withoutProfile.push({ id: m.id, name: m.name, role: m.role });
    }

    /* 7. Campus POIs : locations CUC Sign ------------------------------- */
    try {
        const pois = await client.query(
            `SELECT id, name, category, location_id FROM site_campus_pois ORDER BY order_index NULLS LAST, name`
        );
        const locationIds = new Set(
            (await client.query(`SELECT id FROM locations`)).rows.map((r) => r.id)
        );
        report.campusPois = pois.rows.map((p) => ({
            id: p.id,
            name: p.name,
            location_id: p.location_id,
            locationValid: p.location_id ? locationIds.has(p.location_id) : false,
        }));
    } catch {
        report.campusPois = [];
    }

    /* 8. Disciplines : table vs miroir ---------------------------------- */
    const discTable = await client.query(`SELECT COUNT(*)::int AS n FROM site_disciplines`);
    report.disciplines.table = discTable.rows[0].n;
    const settings = await client.query(`SELECT key, value FROM site_settings`);
    const settingsMap = new Map(settings.rows.map((r) => [r.key, r.value]));
    /**
     * Forme réelle de chaque miroir : les clés `team`, `films`, `disciplines`
     * et `campus_pois` sont des TABLEAUX JSON directs ; `celebrities`,
     * `videos`, `campus_facilities` exposent `{ list: [...] }`. Compter sans
     * distinguer ces formes produisait des « dérives » fantômes.
     */
    for (const [key, value] of settingsMap) {
        if (Array.isArray(value)) {
            report.settingsMirrors[key] = { shape: 'array', length: value.length };
        } else if (value && typeof value === 'object' && Array.isArray(value.list)) {
            report.settingsMirrors[key] = { shape: 'list', length: value.list.length };
        } else if (value && typeof value === 'object') {
            report.settingsMirrors[key] = { shape: 'object', keys: Object.keys(value) };
        } else {
            report.settingsMirrors[key] = { shape: typeof value, length: 0 };
        }
    }
    report.disciplines.settingMirror =
        report.settingsMirrors['disciplines']?.length ?? 0;

    /* 9. Dérives de miroirs --------------------------------------------- */
    /**
     * Comparaison pertinente : miroirs qui servent de REPLI direct à une table
     * (`team`, `disciplines`, `campus_pois`). Le miroir `films` (63) est une
     * sélection éditoriale de repli assumée face au catalogue complet
     * (`site_films`, 569 publiés) : ce n'est pas une dérive.
     */
    const mirrorPairs = [
        ['site_team', 'team'],
        ['site_disciplines', 'disciplines'],
        ['site_campus_pois', 'campus_pois'],
    ];
    for (const [table, key] of mirrorPairs) {
        const tableCount = report.tables[table];
        const mirrorCount = report.settingsMirrors[key]?.length ?? 0;
        if (typeof tableCount === 'number' && tableCount !== mirrorCount) {
            report.mirrorsDrift.push({ table, tableCount, mirrorKey: key, mirrorCount });
        }
    }

    /* 10. Divers ---------------------------------------------------------- */
    report.inquiries = report.tables['site_inquiries'] ?? 0;
    report.auditLogs = report.tables['site_audit_logs'] ?? 0;
    report.cucSign.formations = (await client.query(`SELECT COUNT(*)::int AS n FROM formations`))
        .rows[0].n;
    report.cucSign.profiles = (await client.query(`SELECT COUNT(*)::int AS n FROM profiles`))
        .rows[0].n;
    report.cucSign.locations = (await client.query(`SELECT COUNT(*)::int AS n FROM locations`))
        .rows[0].n;

    await client.end();

    /* ---------------------- Rapport JSON ------------------------------ */
    fs.writeFileSync(
        path.join(ROOT, 'scripts', 'audit_supabase_state_report.json'),
        JSON.stringify(report, null, 2),
        'utf8'
    );

    /* ---------------------- Rapport markdown -------------------------- */
    const md = [];
    md.push('# Audit Supabase — état de la base vitrine CUC');
    md.push('');
    md.push(`**Généré le :** ${report.generatedAt}  `);
    md.push('**Lecture seule** — aucune écriture base.');
    md.push('');
    md.push('## Publication Realtime');
    md.push('');
    md.push(`- Tables publiées : **${report.realtimePublication.length}**`);
    md.push(
        report.realtimeMissing.length === 0
            ? '- ✔ Toutes les tables attendues sont publiées.'
            : `- ✖ Manquantes : ${report.realtimeMissing.map((t) => `\`${t}\``).join(', ')}`
    );
    md.push('');
    md.push('## Tables `site_*`');
    md.push('');
    md.push('| Table | Lignes | RLS |');
    md.push('| --- | ---: | --- |');
    for (const [t, n] of Object.entries(report.tables)) {
        md.push(`| \`${t}\` | ${n === null ? '— (absente)' : n} | ${report.rls[t] ? '✔' : '✖'} |`);
    }
    md.push('');
    md.push('## Interconnexion CUC Sign');
    md.push('');
    md.push('| Entité | Liaison | Couverture |');
    md.push('| --- | --- | --- |');
    md.push(
        `| Sessions | \`cuc_sign_formation_id\` → \`formations\` | ${report.sessions.linked}/${report.sessions.total} |`
    );
    md.push(
        `| Équipe | \`profile_id\` → \`profiles\` | ${report.team.linked}/${report.team.total} |`
    );
    md.push(
        `| Campus | \`location_id\` → \`locations\` | ${report.campusPois.filter((p) => p.locationValid).length}/${report.campusPois.length} |`
    );
    md.push('');
    if (report.sessions.duplicates.length > 0) {
        md.push('### Doublons de sessions suspectés');
        md.push('');
        for (const d of report.sessions.duplicates) {
            md.push(`- \`${d.date_display}\` (programme \`${d.program_id}\`) — ids ${d.ids.join(', ')}`);
        }
        md.push('');
    }
    if (report.mirrorsDrift.length > 0) {
        md.push('### Dérives de miroirs `site_settings`');
        md.push('');
        for (const d of report.mirrorsDrift) {
            md.push(
                `- \`${d.table}\` (${d.tableCount}) ≠ \`site_settings.${d.mirrorKey}\` (${d.mirrorCount})`
            );
        }
        md.push('');
    }
    md.push('## Clés étrangères site_*');
    md.push('');
    for (const fk of report.foreignKeys) {
        md.push(`- \`${fk.from}\` → \`${fk.to}\` (${fk.name}, ON DELETE ${fk.onDelete})`);
    }
    md.push('');
    md.push('## Fichiers');
    md.push('');
    md.push('- Données complètes : `scripts/audit_supabase_state_report.json`');
    md.push('');

    fs.writeFileSync(path.join(ROOT, 'plans', 'audit-supabase-2026.md'), md.join('\n'), 'utf8');

    /* ---------------------- Console ------------------------------------ */
    console.log('=== Audit Supabase (lecture seule) ===');
    console.log('');
    console.log(`Realtime publiées      : ${report.realtimePublication.length}`);
    console.log(`Realtime manquantes    : ${report.realtimeMissing.length}${report.realtimeMissing.length ? ' → ' + report.realtimeMissing.join(', ') : ''}`);
    console.log(
        `Sessions liées CUC Sign: ${report.sessions.linked}/${report.sessions.total} (doublons suspectés : ${report.sessions.duplicates.length})`
    );
    console.log(`Équipe liée CUC Sign   : ${report.team.linked}/${report.team.total}`);
    console.log(`Disciplines (table)    : ${report.disciplines.table} (miroir : ${report.disciplines.settingMirror})`);
    console.log(`Dérives de miroirs     : ${report.mirrorsDrift.length}`);
    console.log(`Candidatures           : ${report.inquiries} | Logs d'audit : ${report.auditLogs}`);
    console.log('');
    console.log('Rapports : scripts/audit_supabase_state_report.json · plans/audit-supabase-2026.md');
}

main().catch((err) => {
    console.error('Audit Supabase interrompu :', err.message);
    process.exit(1);
});
