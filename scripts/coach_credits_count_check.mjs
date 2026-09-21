#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Contrôle des compteurs de crédits par coach
 * ==============================================================================
 * Compare, pour chacun des coachs du registre :
 *
 *   - les crédits de l'artefact curé (`scripts/coach_credits_curated_imdb.json`) ;
 *   - les crédits réellement servis par la base (`site_team.notable_credits`),
 *     qui alimentent le compteur affiché sur `/equipe-cascadeurs-pro` ;
 *   - les crédits de la source locale `src/data/team.ts` (fichier canonique).
 *
 * Sort en code 2 dès qu'un écart est constaté : une filmographie tronquée est un
 * défaut de véracité, pas un détail cosmétique.
 *
 * Usage : node scripts/coach_credits_count_check.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

const curated = JSON.parse(
    fs.readFileSync(path.resolve('scripts', 'coach_credits_curated_imdb.json'), 'utf8')
);

/**
 * Lecture de `src/data/team.ts` par le **chargeur canonique** du dépôt
 * (`scripts/lib/credit-verifier.mjs`) : celui-là même qu'utilisent
 * `coaches:apply` et `coaches:sync`. Réimplémenter un parsing local donnerait un
 * compteur faux — donc un contrôle faux.
 */
const { loadCurrentTeam } = await import('./lib/credit-verifier.mjs');
const teamMembers = loadCurrentTeam();
const teamCounts = new Map(
    teamMembers.map((member) => [member.id, (member.notableCredits || []).length])
);

const dbRows = await rest('site_team?select=id,name,notable_credits&order=order_index.asc');

const curatedById = new Map(
    curated.coaches.map((coach) => [coach.id, coach.credits?.length ?? coach.stats?.kept ?? 0])
);

console.log('=== COMPTEURS DE CRÉDITS PAR COACH ===\n');
console.log(
    `${'id'.padEnd(20)} ${'curé'.padStart(6)} ${'team.ts'.padStart(8)} ${'base'.padStart(6)}  état`
);

let mismatches = 0;
const rows = [];

for (const row of dbRows) {
    const dbCount = Array.isArray(row.notable_credits) ? row.notable_credits.length : 0;
    const curatedCount = curatedById.has(row.id) ? curatedById.get(row.id) : null;
    const teamCount = teamCounts.has(row.id) ? teamCounts.get(row.id) : null;

    const problems = [];
    if (curatedCount === null) problems.push('absent de l’artefact curé');
    else if (curatedCount !== dbCount) problems.push(`curé ${curatedCount} ≠ base ${dbCount}`);
    if (teamCount !== null && teamCount !== dbCount) problems.push(`team.ts ${teamCount} ≠ base ${dbCount}`);

    if (problems.length > 0) mismatches += 1;

    console.log(
        `${row.id.padEnd(20)} ${String(curatedCount ?? '—').padStart(6)} ${String(teamCount ?? '—').padStart(8)} ${String(dbCount).padStart(6)}  ${problems.length === 0 ? '✅ cohérent' : `⚠️ ${problems.join(' ; ')}`
        }`
    );
    rows.push({ id: row.id, name: row.name, curatedCount, teamCount, dbCount, problems });
}

/* Entrées de l'artefact qui ne correspondent à aucun coach en base */
const dbIds = new Set(dbRows.map((r) => r.id));
const orphanCurated = curated.coaches.filter((c) => !dbIds.has(c.id));
if (orphanCurated.length > 0) {
    console.log('\n--- Entrées curées sans coach en base ---');
    for (const c of orphanCurated) {
        console.log(
            `  ⚠️ ${c.id} (${c.name}) — ${c.credits?.length ?? 0} crédit(s), IMDb ${c.imdbId || '—'}`
        );
    }
    mismatches += orphanCurated.length;
}

const md = [];
md.push('# Revue — Compteurs de crédits par coach');
md.push('');
md.push(`Généré le ${new Date().toISOString()} par \`scripts/coach_credits_count_check.mjs\`.`);
md.push('');
md.push('| Coach | Artefact curé | `team.ts` | Base (`site_team`) | État |');
md.push('|---|---|---|---|---|');
for (const r of rows) {
    md.push(
        `| ${r.name} (\`${r.id}\`) | ${r.curatedCount ?? '—'} | ${r.teamCount ?? '—'} | ${r.dbCount} | ${r.problems.length === 0 ? 'cohérent' : r.problems.join(' ; ')
        } |`
    );
}
if (orphanCurated.length > 0) {
    md.push('');
    md.push('## Entrées curées sans coach en base');
    md.push('');
    for (const c of orphanCurated) {
        md.push(`- \`${c.id}\` (${c.name}) — ${c.credits?.length ?? 0} crédit(s), IMDb ${c.imdbId || '—'}`);
    }
}
md.push('');
md.push(
    mismatches === 0
        ? 'Tous les compteurs concordent : la filmographie servie correspond à la curation vérifiée.'
        : `**${mismatches} écart(s)** : une filmographie servie différente de la curation est un défaut de véracité à corriger avant publication.`
);

fs.writeFileSync(path.resolve('plans', 'revue-compteurs-credits-coachs.md'), `${md.join('\n')}\n`, 'utf8');
console.log(`\nRevue écrite : plans/revue-compteurs-credits-coachs.md`);

if (mismatches > 0) {
    console.error(`\n❌ ${mismatches} écart(s) de comptage détecté(s).`);
    process.exit(2);
}
console.log('\n✅ Compteurs cohérents pour tous les coachs.');
