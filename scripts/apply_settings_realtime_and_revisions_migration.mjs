#!/usr/bin/env node
/**
 * MIGRATION CORRECTIVE SUPABASE — Realtime `site_settings` + table des
 * révisions de pages + correction d'interconnexion campus.
 * ============================================================
 *
 * Constats d'audit (2026-09-21) corrigés par ce script :
 *
 *   1. `site_settings` était ABSENTE de la publication `supabase_realtime`
 *      (22 tables publiées, `site_settings` manquante). Toutes les
 *      souscriptions Realtime à cette table — CockpitApp et 7 surfaces
 *      publiques (navigation, footer, CTA mobile, vidéos, célébrités,
 *      installations, disciplines/POI via miroir) — ne se déclenchaient
 *      donc JAMAIS, silencieusement.
 *
 *   2. La table `site_page_revisions` N'EXISTE PAS en base alors que
 *      l'interface éditoriale (`PageRevisionsPanel` du Cockpit) et
 *      `site-service` (getPageRevisions / createPageRevision /
 *      restorePageRevision / deletePageRevision) l'utilisent : l'historique
 *      de versions était silencieusement inopérant.
 *
 *   3. Interconnexion campus : la zone « Résidence Stagiaires & Réfectoire »
 *      était reliée au lieu CUC Sign « Amphithéatre » — liaison non prouvée
 *      (hébergement ≠ amphithéâtre). Doctrine AGENTS.md : « un lien FAUX est
 *      pire qu'aucun lien » → passage à NULL (re-liaison possible en un clic
 *      depuis le Cockpit si un lieu adapté est créé).
 *
 * Doctrine : DRY-RUN documenté AVANT écriture.
 *   node scripts/apply_settings_realtime_and_revisions_migration.mjs          # aperçu
 *   node scripts/apply_settings_realtime_and_revisions_migration.mjs --write  # applique
 *
 * Rapport avant/après : `plans/revue-migration-supabase-2026.md` (les deux modes).
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const databaseUrl = process.env.DATABASE_URL;
const RESIDENCE_POI_ID = 'mfr-residence';

if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local.');
    process.exit(1);
}

const STATEMENTS = [
    {
        id: 'publication-site-settings',
        description:
            'Ajoute `site_settings` à la publication Realtime (les abonnements à cette table ne se déclenchaient pas).',
        sql: `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;`,
    },
    {
        id: 'table-site-page-revisions',
        description:
            'Crée `site_page_revisions` (historique de versions des pages du Cockpit — table absente).',
        sql: `CREATE TABLE IF NOT EXISTS public.site_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  label TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_page_revisions_slug_number_unique UNIQUE (page_slug, revision_number)
);`,
    },
    {
        id: 'index-site-page-revisions',
        description: 'Index de lecture par page (liste triée par numéro de révision).',
        sql: `CREATE INDEX IF NOT EXISTS site_page_revisions_slug_idx
  ON public.site_page_revisions (page_slug, revision_number DESC);`,
    },
    {
        id: 'rls-site-page-revisions',
        description: 'Active RLS sur la nouvelle table.',
        sql: `ALTER TABLE public.site_page_revisions ENABLE ROW LEVEL SECURITY;`,
    },
    {
        id: 'policy-site-page-revisions',
        description:
            'Politique d’écriture STAFF (admin / directeur / secretaire) — même modèle que `site_pages`. Aucune lecture publique : l’historique éditorial reste interne.',
        sql: `DROP POLICY IF EXISTS page_revisions_staff_all ON public.site_page_revisions;
CREATE POLICY page_revisions_staff_all ON public.site_page_revisions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin','directeur','secretaire'])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin','directeur','secretaire'])
  ));`,
    },
    {
        id: 'publication-site-page-revisions',
        description: 'Publie `site_page_revisions` pour le Realtime.',
        sql: `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_page_revisions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_page_revisions;
  END IF;
END $$;`,
    },
    {
        id: 'unlink-residence-location',
        description:
            'Délie la « Résidence Stagiaires & Réfectoire » du lieu « Amphithéatre » (liaison non prouvée — doctrine « un lien FAUX est pire qu’aucun lien »).',
        sql: `UPDATE public.site_campus_pois
SET location_id = NULL
WHERE id = '${RESIDENCE_POI_ID}'
  AND location_id IS NOT NULL;`,
    },
];

async function snapshot(client) {
    const pub = await client.query(
        `SELECT tablename FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND tablename IN ('site_settings','site_page_revisions')
         ORDER BY tablename`
    );
    const table = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='site_page_revisions'
         ) AS exists`
    );
    let residence = null;
    try {
        const r = await client.query(
            `SELECT id, name, location_id FROM public.site_campus_pois WHERE id = $1`,
            [RESIDENCE_POI_ID]
        );
        residence = r.rows[0] ?? null;
    } catch {
        residence = null;
    }
    return {
        publicationTables: pub.rows.map((r) => r.tablename),
        revisionsTableExists: table.rows[0].exists,
        residence,
    };
}

function mdSnapshot(label, snap) {
    return [
        `### ${label}`,
        '',
        `- Tables publiées (ciblées) : ${snap.publicationTables.length ? snap.publicationTables.map((t) => `\`${t}\``).join(', ') : '— aucune'}`,
        `- Table \`site_page_revisions\` : ${snap.revisionsTableExists ? 'existante' : 'ABSENTE'}`,
        `- Résidence (\`${RESIDENCE_POI_ID}\`) : location_id = ${snap.residence?.location_id ? `\`${snap.residence.location_id}\`` : 'NULL'}`,
        '',
    ].join('\n');
}

async function main() {
    const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const before = await snapshot(client);

    const results = [];
    if (WRITE) {
        await client.query('BEGIN');
        try {
            for (const st of STATEMENTS) {
                await client.query(st.sql);
                results.push({ id: st.id, ok: true });
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            results.push({ id: 'transaction', ok: false, error: err.message });
        }
    }

    const after = await snapshot(client);
    await client.end();

    /* ---------------------- Rapport ---------------------------- */
    const md = [];
    md.push('# Revue — Migration corrective Supabase (Realtime, révisions, campus)');
    md.push('');
    md.push(`**Mode :** ${WRITE ? 'APPLIQUÉ (--write)' : 'DRY-RUN (aucune écriture)'}`);
    md.push(`**Généré le :** ${new Date().toISOString()}`);
    md.push('');
    md.push('## Motifs (constats d’audit)');
    md.push('');
    md.push(
        '1. `site_settings` absente de la publication `supabase_realtime` → tous les abonnements Realtime à cette table (Cockpit + 7 surfaces publiques) étaient inertes.'
    );
    md.push(
        '2. `site_page_revisions` inexistante → l’historique de versions des pages du Cockpit était silencieusement inopérant.'
    );
    md.push(
        '3. « Résidence Stagiaires & Réfectoire » reliée au lieu CUC Sign « Amphithéatre » : liaison non prouvée, déliée (doctrine « un lien FAUX est pire qu’aucun lien »).'
    );
    md.push('');
    md.push('## Nature des opérations');
    md.push('');
    for (const st of STATEMENTS) {
        md.push(`- **\`${st.id}\`** — ${st.description}`);
    }
    md.push('');
    md.push('## Avant / Après');
    md.push('');
    md.push(mdSnapshot('AVANT', before));
    md.push(mdSnapshot('APRÈS', after));
    if (WRITE) {
        md.push('### Exécution');
        md.push('');
        for (const r of results) {
            md.push(`- \`${r.id}\` : ${r.ok ? '✔' : `✖ ${r.error}`}`);
        }
        md.push('');
    }
    md.push('## Vérification');
    md.push('');
    md.push('- `node scripts/audit_supabase_state.mjs` — publication complète, table présente, liaison corrigée.');
    md.push('');

    fs.mkdirSync(path.join(process.cwd(), 'plans'), { recursive: true });
    fs.writeFileSync(
        path.join(process.cwd(), 'plans', 'revue-migration-supabase-2026.md'),
        md.join('\n'),
        'utf8'
    );

    console.log(`=== Migration Supabase — ${WRITE ? 'APPLIQUÉE' : 'DRY-RUN'} ===`);
    console.log(`Avant : site_settings publiée : ${before.publicationTables.includes('site_settings') ? 'oui' : 'NON'} | site_page_revisions : ${before.revisionsTableExists ? 'présente' : 'ABSENTE'}`);
    console.log(`Après : site_settings publiée : ${after.publicationTables.includes('site_settings') ? 'oui' : 'NON'} | site_page_revisions : ${after.revisionsTableExists ? 'présente' : 'ABSENTE'}`);
    console.log(`Résidence location_id : ${after.residence?.location_id ?? 'NULL'}`);
    if (!WRITE) console.log('\nRelancer avec --write pour appliquer.');
    console.log('Rapport : plans/revue-migration-supabase-2026.md');
}

main().catch((err) => {
    console.error('Migration interrompue :', err.message);
    process.exit(1);
});
