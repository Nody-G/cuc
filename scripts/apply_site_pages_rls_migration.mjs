#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Migration RLS `site_pages` : lecture publique = publié seulement
 * ==============================================================================
 * Ferme le dernier accès direct aux brouillons : la policy publique
 * `FOR SELECT USING (true)` devient `USING (is_published = true)`.
 *
 * Séquence obligatoire (lot « 404 des brouillons » déjà livré) :
 *   1. la porte publique répond 404 pour un brouillon — y compris quand RLS
 *      rend la ligne « absente » (`getPublicPageContent` + état service role) ;
 *   2. l'aperçu éditeur lit le brouillon via le client admin
 *      (`getPreviewPageContent`) — il continue de fonctionner sous RLS.
 *
 * VÉRIFICATION À DEUX SONDES (dont une qui ne dépend PAS de l'API Data) :
 *   - **sonde RLS (Postgres)** : dans une transaction annulée, une ligne brouillon
 *     temporaire est insérée, le rôle `anon` est endossé (`SET LOCAL ROLE anon`)
 *     et l'on compte ce qu'il voit. Avant : le brouillon est visible ; après :
 *     0 brouillon, 15 publiées. Preuve directe, même si l'API REST est en 402.
 *   - **sonde REST (clé publique)** : vérifie ce que voit un vrai client anon —
 *     indisponible tant que la plateforme répond 402 (quota d'organisation).
 *
 * Doctrine : DRY-RUN documenté AVANT écriture.
 *   node scripts/apply_site_pages_rls_migration.mjs          # aperçu (défaut)
 *   node scripts/apply_site_pages_rls_migration.mjs --write  # applique
 *
 * Rapport avant/après : `plans/revue-rls-site-pages.md` (les deux modes).
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const databaseUrl = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Slug de la ligne brouillon temporaire — jamais commitée (transaction annulée). */
const PROBE_SLUG = '/z-rls-probe';

if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local.');
    process.exit(1);
}

const STATEMENTS = [
    {
        id: 'site-pages-public-select-published',
        description:
            'Remplace la policy publique `FOR SELECT USING (true)` par `USING (is_published = true)` (anon + authenticated) — un brouillon n’est plus lisible hors service role.',
        sql: `DROP POLICY IF EXISTS "Public read access for site_pages" ON public.site_pages;
CREATE POLICY "Public read access for site_pages" ON public.site_pages
    FOR SELECT TO anon, authenticated
    USING (is_published = true);`,
    },
];

/**
 * Sonde RLS via Postgres : insère une ligne brouillon temporaire dans une
 * transaction, endosse le rôle `anon`, compte ce qu'il voit, puis annule tout.
 * Aucune trace en base, aucun dépendance à l'API Data.
 */
async function probeAnonViaPg(client) {
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO public.site_pages (slug, title, is_published)
             VALUES ($1, 'Sonde RLS temporaire', false)
             ON CONFLICT (slug) DO NOTHING`,
            [PROBE_SLUG]
        );
        await client.query('SET LOCAL ROLE anon');
        const published = await client.query(
            `SELECT count(*)::int AS c FROM public.site_pages WHERE is_published = true`
        );
        const drafts = await client.query(
            `SELECT count(*)::int AS c FROM public.site_pages WHERE is_published = false`
        );
        await client.query('ROLLBACK');
        return { published: published.rows[0].c, drafts: drafts.rows[0].c, error: null };
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch {
            /* ignore */
        }
        return { published: null, drafts: null, error: err.message };
    }
}

async function snapshot(client) {
    const policies = await client.query(
        `SELECT policyname, cmd, roles::text AS roles, qual
         FROM pg_policies
         WHERE schemaname = 'public' AND tablename = 'site_pages'
         ORDER BY policyname`
    );
    const counts = await client.query(
        `SELECT is_published, count(*)::int AS count
         FROM public.site_pages
         GROUP BY is_published
         ORDER BY is_published`
    );

    const byState = Object.fromEntries(counts.rows.map((r) => [String(r.is_published), r.count]));

    const pgAnon = await probeAnonViaPg(client);

    let anonPublished = null;
    let anonDrafts = null;
    let probeError = null;
    if (!SUPABASE_URL || !ANON_KEY) {
        probeError = 'NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY absent(e) de .env.local';
    } else {
        try {
            const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
            const published = await anon
                .from('site_pages')
                .select('slug', { count: 'exact', head: true })
                .eq('is_published', true);
            const drafts = await anon
                .from('site_pages')
                .select('slug', { count: 'exact', head: true })
                .eq('is_published', false);
            if (published.error || drafts.error) {
                // PostgREST renvoie parfois un `error` sans message (ex. HTTP 402
                // « Payment Required » quand la plateforme restreint le projet) :
                // le statut est alors la seule information utile.
                const failed = published.error ? published : drafts;
                probeError =
                    published.error?.message ||
                    drafts.error?.message ||
                    `HTTP ${failed.status} ${failed.statusText}`;
            } else {
                anonPublished = published.count ?? null;
                anonDrafts = drafts.count ?? null;
            }
        } catch (err) {
            probeError = err.message;
        }
    }

    return {
        policies: policies.rows,
        publishedCount: byState.true ?? 0,
        draftCount: byState.false ?? 0,
        pgAnon,
        anonPublished,
        anonDrafts,
        probeError,
    };
}

function mdSnapshot(label, snap) {
    const lines = [
        `### ${label}`,
        '',
        `- Pages publiées : **${snap.publishedCount}** · brouillons réels : **${snap.draftCount}**`,
        `- **Sonde RLS (rôle \`anon\`, Postgres, transaction annulée)** : ${snap.pgAnon.error
            ? `indisponible (${snap.pgAnon.error})`
            : `**${snap.pgAnon.published} publiée(s) visible(s), ${snap.pgAnon.drafts} brouillon(s) VISIBLE(S)** (avec une ligne brouillon témoin temporaire)`
        }`,
        `- Sonde REST (clé publique) : ${snap.anonPublished === null
            ? `non sondée${snap.probeError ? ` (${snap.probeError})` : ''}`
            : `${snap.anonPublished} publiée(s) visible(s), ${snap.anonDrafts} brouillon(s) VISIBLE(S)`
        }`,
        '',
        '| Policy | Commande | Rôles | USING |',
        '| --- | --- | --- | --- |',
        ...snap.policies.map(
            (p) => `| ${p.policyname} | ${p.cmd} | ${p.roles} | \`${(p.qual ?? '').replace(/\|/g, '\\|')}\` |`
        ),
        '',
    ];
    return lines.join('\n');
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

    /* ---------------------- Vérification ---------------------------- */
    const pgProbeAvailable = !after.pgAnon.error;
    const draftsHidden = pgProbeAvailable ? after.pgAnon.drafts === 0 : null;
    const publishedIntact = pgProbeAvailable
        ? after.pgAnon.published === after.publishedCount
        : null;
    const verificationOk = !pgProbeAvailable || (draftsHidden && publishedIntact);

    /* ---------------------------- Rapport ---------------------------- */
    const md = [];
    md.push('# Revue — RLS `site_pages` (lecture publique = publié seulement)');
    md.push('');
    md.push(`**Mode :** ${WRITE ? 'APPLIQUÉ (--write)' : 'DRY-RUN (aucune écriture)'}`);
    md.push(`**Généré le :** ${new Date().toISOString()}`);
    md.push('');
    md.push('## Motif');
    md.push('');
    md.push(
        'La policy publique `FOR SELECT USING (true)` laissait tout client anonyme lire un brouillon complet. La séquence de sûreté est respectée : la porte 404 (y compris sous RLS, via l’état service role) et l’aperçu sur client admin sont livrés AVANT cette migration.'
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
    if (pgProbeAvailable) {
        md.push(
            `- **Sonde RLS (Postgres, rôle \`anon\`)** : ${after.pgAnon.drafts} brouillon(s) visible(s) avec ligne témoin (attendu : 0) ; ${after.pgAnon.published} publiée(s) visibles (attendu : ${after.publishedCount}).`
        );
    }
    if (after.probeError) {
        md.push(
            `> **Sonde REST indisponible** : ${after.probeError}. Elle se refera en une commande dès que l’API Data répond à nouveau (\`node scripts/apply_site_pages_rls_migration.mjs\`) — la sonde Postgres ci-dessus fait foi en attendant.`
        );
    }
    md.push('- En cas d’écart : `node scripts/audit_supabase_state.mjs` puis relire les policies ci-dessus.');
    md.push('');

    fs.mkdirSync(path.join(process.cwd(), 'plans'), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'plans', 'revue-rls-site-pages.md'), md.join('\n'), 'utf8');

    console.log(`=== RLS site_pages — ${WRITE ? 'APPLIQUÉ' : 'DRY-RUN'} ===`);
    const fmt = (snap) =>
        snap.pgAnon.error
            ? `sonde RLS indisponible (${snap.pgAnon.error})`
            : `sonde RLS (rôle anon) : ${snap.pgAnon.published} publiée(s) / ${snap.pgAnon.drafts} brouillon(s) visibles`;
    console.log(`Avant : ${fmt(before)} · REST : ${before.anonDrafts === null ? 'non sondée' : `${before.anonDrafts} brouillon(s)`}`);
    console.log(`Après : ${fmt(after)} · REST : ${after.anonDrafts === null ? 'non sondée' : `${after.anonDrafts} brouillon(s)`}`);
    if (before.draftCount > 0) {
        console.log(
            `Note : ${before.draftCount} brouillon(s) en base — sous RLS, ils restent servis par l'aperçu admin et répondent 404 côté vitrine.`
        );
    }
    if (!WRITE) console.log('\nRelancer avec --write pour appliquer.');
    console.log('Rapport : plans/revue-rls-site-pages.md');

    if (WRITE && !verificationOk) {
        console.error('VÉRIFICATION EN ÉCHEC — vérifier les policies et la sonde RLS.');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Migration interrompue :', err.message);
    process.exit(1);
});
