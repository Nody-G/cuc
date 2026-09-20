/**
 * AUDIT DES LIENS FILMS ↔ ÉQUIPE (site_films.cuc_team_involved)
 * =============================================================
 *
 * Contexte (problème signalé) :
 *   « J'ai l'impression que les gens présents sur certains films sont manquants
 *     dans la page filmographie du cockpit. »
 *
 * Ce script établit un diagnostic factuel :
 *   1. Combien de films n'ont AUCUN membre d'équipe rattaché
 *      (`cuc_team_involved` vide ou absent).
 *   2. Combien de films ont des références ORPHELINES : un id présent dans
 *      `cuc_team_involved` qui ne correspond à aucune ligne de `site_team`.
 *   3. Le taux d'appariement entre les crédits IMDb des coachs
 *      (`site_team.notable_credits`) et les titres du catalogue
 *      (`site_films.title`), via le normaliseur canonique `creditTitleKey`.
 *   4. Les crédits hors catalogue, candidats à une création de fiche film.
 *
 * Aucune écriture : ce script est un diagnostic. Le fichier de revue est
 * produit dans `plans/audit-films-equipe.md`.
 *
 * Usage : node scripts/audit_films_team_links.mjs
 * Sortie : code 2 si des références orphelines sont détectées.
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Réplique exacte de `creditTitleKey` (src/lib/credit-title.ts).
 * Toute divergence ici fausserait le diagnostic — ne pas réimplémenter
 * différemment.
 */
function creditTitleKey(title) {
    if (!title) return '';
    return title
        .trim()
        .replace(/\s*\(\s*\d{4}\s*(?:[-–—]\s*\d{4}\s*)?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Réplique de `parseCredit` pour isoler le titre d'un crédit « Titre — Rôle ». */
function parseTitle(credit) {
    const raw = (credit || '').trim();
    if (raw.includes(' — ')) return raw.split(' — ')[0].trim();
    const m = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (m && !/^\d{4}$/.test(m[2].trim())) return m[1].trim();
    return raw;
}

async function main() {
    console.log('\n=== Audit des liens films ↔ équipe ===\n');

    // NOTE : les rôles par membre sont stockés dans `metadata.cuc_team_roles`
    // (doctrine AGENTS.md), pas dans une colonne de premier niveau.
    const { data: films, error: filmsErr } = await supabase
        .from('site_films')
        .select('id,title,cuc_team_involved,metadata,is_published');
    if (filmsErr) {
        console.error('❌ Lecture site_films :', filmsErr.message);
        process.exit(1);
    }

    const { data: team, error: teamErr } = await supabase
        .from('site_team')
        .select('id,name,notable_credits');
    if (teamErr) {
        console.error('❌ Lecture site_team :', teamErr.message);
        process.exit(1);
    }

    const allFilms = films || [];
    const allTeam = team || [];
    const teamIds = new Set(allTeam.map((t) => t.id));

    console.log(`site_films : ${allFilms.length}`);
    console.log(`site_team  : ${allTeam.length}\n`);

    // 1. Films sans aucun membre rattaché.
    const filmsSansEquipe = allFilms.filter(
        (f) => !Array.isArray(f.cuc_team_involved) || f.cuc_team_involved.length === 0
    );

    // 2. Références orphelines (id inconnu dans site_team).
    const orphelins = [];
    for (const f of allFilms) {
        const involved = Array.isArray(f.cuc_team_involved) ? f.cuc_team_involved : [];
        for (const id of involved) {
            if (!teamIds.has(id)) orphelins.push({ film: f.title, filmId: f.id, memberId: id });
        }
    }

    console.log(`--- Films sans membre d'équipe rattaché (${filmsSansEquipe.length}) ---`);
    for (const f of filmsSansEquipe.slice(0, 40)) {
        console.log(`  • ${f.id.padEnd(40)} ${f.title}`);
    }
    if (filmsSansEquipe.length > 40) {
        console.log(`  … et ${filmsSansEquipe.length - 40} autre(s).`);
    }

    console.log(`\n--- Références orphelines (${orphelins.length}) ---`);
    for (const o of orphelins) {
        console.log(`  ! ${o.film} → membre inconnu « ${o.memberId} »`);
    }

    // 3. Taux d'appariement crédits IMDb ↔ catalogue.
    const catalogue = new Map();
    for (const f of allFilms) catalogue.set(creditTitleKey(f.title), f);

    console.log(`\n--- Appariement crédits ↔ catalogue ---`);
    const coachReports = [];
    for (const t of allTeam) {
        const credits = Array.isArray(t.notable_credits) ? t.notable_credits : [];
        if (credits.length === 0) continue;

        let matched = 0;
        const hors = [];
        for (const c of credits) {
            const title = parseTitle(c);
            if (catalogue.has(creditTitleKey(title))) matched++;
            else hors.push(title);
        }
        const rate = credits.length ? Math.round((matched / credits.length) * 100) : 0;
        coachReports.push({ id: t.id, name: t.name, total: credits.length, matched, rate, hors });
        console.log(
            `  ${t.name.padEnd(24)} ${String(matched).padStart(3)}/${String(credits.length).padEnd(3)} (${String(rate).padStart(3)}%)`
        );
    }

    const zeroMatch = coachReports.filter((c) => c.matched === 0 && c.total > 0);

    // 4. Rapport markdown.
    const lines = [];
    lines.push('# Audit des liens films ↔ équipe');
    lines.push('');
    lines.push(`- Films au catalogue : **${allFilms.length}**`);
    lines.push(`- Membres d'équipe : **${allTeam.length}**`);
    lines.push(`- Films sans membre rattaché : **${filmsSansEquipe.length}**`);
    lines.push(`- Références orphelines : **${orphelins.length}**`);
    lines.push(`- Coachs à 0 % d'appariement : **${zeroMatch.length}**`);
    lines.push('');
    lines.push('## Films sans membre d\'équipe rattaché');
    lines.push('');
    if (filmsSansEquipe.length === 0) lines.push('_Aucun._');
    else for (const f of filmsSansEquipe) lines.push(`- \`${f.id}\` — ${f.title}`);
    lines.push('');
    lines.push('## Références orphelines');
    lines.push('');
    if (orphelins.length === 0) lines.push('_Aucune._');
    else {
        lines.push('| film | id film | membre inconnu |');
        lines.push('|------|---------|----------------|');
        for (const o of orphelins) lines.push(`| ${o.film} | \`${o.filmId}\` | \`${o.memberId}\` |`);
    }
    lines.push('');
    lines.push('## Appariement crédits ↔ catalogue');
    lines.push('');
    lines.push('| coach | appariés | total | taux |');
    lines.push('|-------|----------|-------|------|');
    for (const c of coachReports) {
        lines.push(`| ${c.name} (\`${c.id}\`) | ${c.matched} | ${c.total} | ${c.rate}% |`);
    }
    lines.push('');
    lines.push('## Crédits hors catalogue (candidats à création de fiche)');
    lines.push('');
    for (const c of coachReports) {
        if (c.hors.length === 0) continue;
        lines.push(`### ${c.name} (${c.hors.length})`);
        lines.push('');
        for (const h of c.hors) lines.push(`- ${h}`);
        lines.push('');
    }

    const outDir = path.join(process.cwd(), 'plans');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'audit-films-equipe.md'), lines.join('\n'), 'utf8');
    console.log(`\n📄 Rapport écrit : plans/audit-films-equipe.md`);

    if (orphelins.length > 0) {
        console.log(`\n⚠️  ${orphelins.length} référence(s) orpheline(s) détectée(s).`);
        process.exit(2);
    }
    console.log('\n✅ Liens films ↔ équipe cohérents.');
}

main().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
