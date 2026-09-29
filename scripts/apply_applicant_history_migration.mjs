#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Migration : historique de candidature sur le profil CUC Sign
 * ==============================================================================
 * Ajoute `public.profiles.applicant_history` (JSONB, nullable), où le Cockpit
 * verse l'historique d'une personne — candidatures passées, décisions rendues,
 * verdict de la session Découverte — afin qu'il survive à la clôture d'un
 * dossier et reste disponible si elle candidate à nouveau.
 *
 * Décisions de conception, explicites :
 *  - **strictement additive** : une colonne nullable, aucune contrainte, aucun
 *    index, aucune donnée existante touchée. `profiles` appartient à CUC Sign
 *    et sa structure métier n'est pas modifiée ;
 *  - **aucune écriture depuis la vitrine** : la colonne est alimentée par le
 *    Cockpit (`syncApplicantHistoryToProfile`), et seulement pour une personne
 *    qui a déjà un profil ;
 *  - **preuve d'innocuité** : le nombre de lignes de `profiles` est relevé avant
 *    et après l'application ; une variation fait échouer la commande.
 *
 * Usage (dry-run par défaut, aucune écriture) :
 *   npm run db:migrate:applicant-history
 *   npm run db:migrate:applicant-history:write
 * ==============================================================================
 */

import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const TABLE = 'profiles';
const COLUMN = 'applicant_history';

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — migration impossible.');
    process.exit(1);
}

const STATEMENTS = [
    `ALTER TABLE public.${TABLE} ADD COLUMN IF NOT EXISTS ${COLUMN} JSONB`,
    `COMMENT ON COLUMN public.${TABLE}.${COLUMN} IS 'Historique de candidature vitrine (candidatures, décisions, verdict Découverte). Écrit par le Cockpit CUC, lecture seule pour CUC Sign.'`,
];

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function snapshot() {
    const { rows: column } = await client.query(
        `SELECT data_type, is_nullable FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [TABLE, COLUMN]
    );
    const { rows: count } = await client.query(`SELECT COUNT(*)::int AS n FROM public.${TABLE}`);
    return { column: column[0] ?? null, rows: count[0]?.n ?? 0 };
}

function describe(state) {
    return `colonne ${state.column ? `présente (${state.column.data_type})` : 'ABSENTE'} | lignes : ${state.rows}`;
}

async function main() {
    await client.connect();

    const before = await snapshot();
    console.log(`=== Migration ${TABLE}.${COLUMN} — ${WRITE ? 'APPLICATION' : 'DRY-RUN'} ===`);
    console.log(`Avant : ${describe(before)}`);
    console.log('');
    for (const statement of STATEMENTS) console.log(`${statement};`);
    console.log('');

    if (!WRITE) {
        console.log('Aucune écriture. Relancer avec --write (npm run db:migrate:applicant-history:write).');
        await client.end();
        return;
    }

    for (const statement of STATEMENTS) await client.query(statement);

    const after = await snapshot();
    console.log(`Après : ${describe(after)}`);

    // Preuve d'innocuité : la colonne apparaît, et aucune ligne n'est perdue.
    if (!after.column) {
        console.error('ÉCHEC : la colonne est toujours absente après application.');
        await client.end();
        process.exit(1);
    }
    if (after.rows !== before.rows) {
        console.error(
            `ÉCHEC : le nombre de lignes de ${TABLE} a changé (${before.rows} → ${after.rows}).`
        );
        await client.end();
        process.exit(1);
    }

    console.log(`OK — colonne ajoutée, ${after.rows} profil(s) intact(s).`);
    await client.end();
}

main().catch(async (error) => {
    console.error(`Erreur de migration : ${error instanceof Error ? error.message : error}`);
    try {
        await client.end();
    } catch {
        // connexion déjà fermée
    }
    process.exit(1);
});
