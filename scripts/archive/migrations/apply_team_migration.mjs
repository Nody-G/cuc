/**
 * Applique la migration `site_team.featured_credits` + `credits_display_limit`.
 *
 * Connexion : utilise la chaîne PostgreSQL directe `DATABASE_URL` définie dans
 * `.env.local` (Dashboard Supabase → Project Settings → Database → Connection string → URI).
 *
 * Usage :
 *   node scripts/apply_team_migration.mjs            # aperçu (dry-run)
 *   node scripts/apply_team_migration.mjs --write    # applique la migration
 */

import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
    console.error(
        'DATABASE_URL manquant dans .env.local.\n' +
        'Ajoutez la chaîne PostgreSQL directe :\n' +
        '  DATABASE_URL=postgresql://postgres:[MOT_DE_PASSE]@db.xkbkcsypftvspmkfnrfm.supabase.co:5432/postgres'
    );
    process.exit(1);
}

if (/\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error(
        'DATABASE_URL contient encore le placeholder de mot de passe.\n' +
        'Remplacez [YOUR-PASSWORD] par le mot de passe réel de la base (Project Settings → Database → Reset database password si oublié).'
    );
    process.exit(1);
}

const STATEMENTS = [
    `ALTER TABLE site_team ADD COLUMN IF NOT EXISTS featured_credits TEXT[] DEFAULT '{}'::TEXT[]`,
    `ALTER TABLE site_team ADD COLUMN IF NOT EXISTS credits_display_limit INTEGER DEFAULT 8`,
    `ALTER TABLE site_team DROP CONSTRAINT IF EXISTS site_team_credits_display_limit_check`,
    `ALTER TABLE site_team ADD CONSTRAINT site_team_credits_display_limit_check CHECK (credits_display_limit IS NULL OR (credits_display_limit >= 1 AND credits_display_limit <= 50))`,
    `COMMENT ON COLUMN site_team.featured_credits IS 'Crédits (chaînes de notable_credits) mis en avant sur la fiche publique, dans l''ordre d''affichage.'`,
    `COMMENT ON COLUMN site_team.credits_display_limit IS 'Nombre de crédits affichés par défaut sur la fiche publique (défaut 8).'`,
];

async function main() {
    const client = new pg.Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
    });

    console.log(`Mode : ${WRITE ? 'ÉCRITURE' : 'APERÇU (dry-run)'}`);
    console.log(`Hôte : ${databaseUrl.replace(/:[^:@/]+@/, ':****@')}\n`);

    await client.connect();

    // État initial
    const before = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'site_team'
           AND column_name IN ('featured_credits', 'credits_display_limit')`
    );
    const existing = before.rows.map((r) => r.column_name);
    console.log(`Colonnes déjà présentes : ${existing.length ? existing.join(', ') : 'aucune'}\n`);

    if (!WRITE) {
        for (const sql of STATEMENTS) {
            console.log(`  [dry-run] ${sql}`);
        }
        console.log('\nAperçu terminé. Relancez avec --write pour appliquer.');
        await client.end();
        return;
    }

    for (const sql of STATEMENTS) {
        await client.query(sql);
        console.log(`  ✓ ${sql.slice(0, 72)}${sql.length > 72 ? '…' : ''}`);
    }

    // Vérification finale
    const after = await client.query(
        `SELECT column_name, data_type, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'site_team'
           AND column_name IN ('featured_credits', 'credits_display_limit')
         ORDER BY column_name`
    );

    console.log('\nVérification :');
    for (const row of after.rows) {
        console.log(`  • ${row.column_name} (${row.data_type}) défaut=${row.column_default}`);
    }

    const ok = after.rows.length === 2;
    console.log(ok ? '\n✓ Migration appliquée avec succès.' : '\n✗ Migration incomplète.');

    await client.end();
    process.exit(ok ? 0 : 1);
}

main().catch((err) => {
    console.error('Erreur migration :', err.message);
    process.exit(1);
});
