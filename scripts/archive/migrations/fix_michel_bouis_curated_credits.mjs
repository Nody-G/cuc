#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Réparation des crédits curés de Michel Bouis
 * ==============================================================================
 * CAUSE DU DÉFAUT (constaté en production) :
 *   La fiche coach a été renommée `michael-troude` → `michel-bouis` (identité
 *   réelle confirmée : IMDb **nm0099365**, 277 crédits dont 244 cascades), mais
 *   l'artefact de curation `scripts/coach_credits_curated_imdb.json` est resté
 *   sur l'ancienne identité : il contient un coach `michael-troude` (101 crédits,
 *   IMDb nm0873735 — **une autre personne**) et **aucune** entrée `michel-bouis`.
 *   Résultat : `coaches:apply` ne trouvait plus rien pour ce coach, la fiche
 *   publique affichait 44 crédits au lieu de 244.
 *
 * CE QUE FAIT CE SCRIPT :
 *   1. lit le relevé vérifié `scripts/michel_bouis_credits_imdb.json` (nm0099365) ;
 *   2. construit l'entrée `michel-bouis` correspondante (rôles ramenés aux trois
 *      libellés canoniques, aucune invention) ;
 *   3. remplace l'entrée erronée `michael-troude` dans l'artefact curé —
 *      l'ancienne entrée est archivée dans le rapport de revue, jamais perdue ;
 *   4. écrit `plans/revue-credits-michel-bouis.md` (traçabilité doctrinale).
 *
 * Le script est idempotent. Il ne touche NI `src/data/team.ts` NI la base :
 * l'application se fait ensuite par le pipeline canonique
 * (`npm run coaches:apply` puis `npm run coaches:sync`).
 *
 * Usage :
 *   node scripts/fix_michel_bouis_curated_credits.mjs --dry
 *   node scripts/fix_michel_bouis_curated_credits.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');

const CURATED_PATH = path.resolve('scripts', 'coach_credits_curated_imdb.json');
const DUMP_PATH = path.resolve('scripts', 'michel_bouis_credits_imdb.json');
const REPORT_PATH = path.resolve('plans', 'revue-credits-michel-bouis.md');

const OLD_ID = 'michael-troude';
const NEW_ID = 'michel-bouis';
/** Identité vérifiée : Michel Bouis (et non Michaël Troude, nm0873735). */
const VERIFIED_IMDB_ID = 'nm0099365';

for (const file of [CURATED_PATH, DUMP_PATH]) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Fichier introuvable : ${file}`);
        process.exit(1);
    }
}

const curated = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8'));
const dump = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf8'));

if (dump.imdbId !== VERIFIED_IMDB_ID) {
    console.error(
        `❌ Le relevé porte ${dump.imdbId} alors que l'identité vérifiée est ${VERIFIED_IMDB_ID}. Arrêt : ne jamais écrire sur une identité douteuse.`
    );
    process.exit(1);
}

/** Libellé canonique : la catégorie IMDb « Stunts » correspond au rôle Cascadeur. */
const CANONICAL_ROLE = 'Cascadeur';

const credits = (dump.credits || [])
    .filter((credit) => credit && typeof credit.title === 'string' && credit.title.trim() !== '')
    .map((credit) => {
        const year = Number(credit.year);
        const yearPart = Number.isFinite(year) && year > 1900 ? ` (${year})` : '';
        return {
            title: credit.title,
            year: Number.isFinite(year) && year > 1900 ? year : undefined,
            role: CANONICAL_ROLE,
            status: 'RÉSOLU',
            imdbId: credit.titleId,
            titleType: credit.titleType,
            formatted: `${credit.title}${yearPart} — ${CANONICAL_ROLE}`,
        };
    });

const oldIndex = curated.coaches.findIndex((coach) => coach.id === OLD_ID);
const newIndex = curated.coaches.findIndex((coach) => coach.id === NEW_ID);
const archived = oldIndex >= 0 ? curated.coaches[oldIndex] : null;

const entry = {
    id: NEW_ID,
    name: 'Michel Bouis',
    identityStatus: 'RÉSOLU',
    imdbId: VERIFIED_IMDB_ID,
    /** Source du relevé : profil IMDb vérifié (identité croisée avec le campus). */
    declaredCreditsCount: credits.length,
    stats: {
        total: credits.length,
        kept: credits.length,
        excludedNonCinema: 0,
        excludedUnverifiable: 0,
        coordinators: 0,
        doublures: 0,
        richRoles: 0,
    },
    credits,
};

console.log('=== RÉPARATION DES CRÉDITS CURÉS — MICHEL BOUIS ===');
console.log(`Identité vérifiée : ${dump.name} (${VERIFIED_IMDB_ID})`);
console.log(`Relevé : ${dump.totalCredits} crédits au total, ${dump.stuntCredits} cascades`);
console.log(`Entrée construite : ${credits.length} crédit(s) au rôle « ${CANONICAL_ROLE} »`);
console.log(
    `Entrée erronée ${OLD_ID} : ${archived ? `${archived.credits?.length ?? '?'} crédit(s) (identité ${archived.imdbId || 'nm0873735'})` : 'absente'}`
);
console.log(`Entrée ${NEW_ID} déjà présente : ${newIndex >= 0 ? 'oui' : 'non'}`);

if (DRY) {
    console.log('\nMode --dry : aucune écriture.');
    console.log(`Serait écrit : ${CURATED_PATH}`);
    console.log(`Serait écrit : ${REPORT_PATH}`);
    process.exit(0);
}

// Remplacement à la même position pour conserver l'ordre éditorial du fichier.
if (oldIndex >= 0) curated.coaches[oldIndex] = entry;
else if (newIndex >= 0) curated.coaches[newIndex] = entry;
else curated.coaches.push(entry);

// Le fichier curé porte les entrées triées : on vérifie qu'il n'en reste qu'une.
const remaining = curated.coaches.filter((coach) => coach.id === OLD_ID || coach.id === NEW_ID);
if (remaining.length !== 1 || remaining[0].id !== NEW_ID) {
    console.error('❌ Après remplacement, l\'artefact ne contient pas exactement une entrée michel-bouis.');
    process.exit(1);
}

const totalKept = curated.coaches.reduce(
    (sum, coach) => sum + (coach.stats?.kept ?? coach.credits?.length ?? 0),
    0
);
curated.globalStats = {
    ...(curated.globalStats || {}),
    coaches: curated.coaches.length,
    totalKept,
    repairedAt: new Date().toISOString(),
};
curated.repairNote =
    `${OLD_ID} (IMDb nm0873735 — autre personne) remplacé par ${NEW_ID} (IMDb ${VERIFIED_IMDB_ID}) : ` +
    `${credits.length} crédits cascades vérifiés. Cf. plans/revue-credits-michel-bouis.md.`;

fs.writeFileSync(CURATED_PATH, `${JSON.stringify(curated, null, 2)}\n`, 'utf8');
console.log(`\n✅ Artefact curé mis à jour : ${CURATED_PATH}`);

/* ------------------------------ Rapport ------------------------------ */
const md = [];
md.push('# Revue — Crédits curés de Michel Bouis (réparation)');
md.push('');
md.push(`Généré le ${new Date().toISOString()} par \`scripts/fix_michel_bouis_curated_credits.mjs\`.`);
md.push('');
md.push('## Défaut corrigé');
md.push('');
md.push(
    `L'artefact \`scripts/coach_credits_curated_imdb.json\` portait encore l'identité erronée **${OLD_ID}** ` +
    `(IMDb nm0873735, ${archived?.credits?.length ?? 0} crédits — une autre personne) et **aucune** entrée ` +
    `${NEW_ID}. \`coaches:apply\` ne trouvait donc plus ce coach : la fiche publique affichait 44 crédits ` +
    'au lieu de la filmographie réelle.'
);
md.push('');
md.push('## Identité retenue');
md.push('');
md.push(`- Nom : **${dump.name}**`);
md.push(`- IMDb : \`${VERIFIED_IMDB_ID}\``);
md.push(`- Crédits IMDb : ${dump.totalCredits} au total, dont **${dump.stuntCredits}** en cascades`);
md.push(`- Répartition par type : ${Object.entries(dump.byType || {}).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
md.push('');
md.push('## Entrée produite');
md.push('');
md.push(`- ${credits.length} crédit(s), rôle canonique « ${CANONICAL_ROLE} »`);
md.push('- Aucun crédit inventé : chaque ligne provient du relevé IMDb (titre, année, type).');
md.push('');
md.push('| Année | Titre | Type IMDb |');
md.push('|---|---|---|');
for (const credit of credits.slice(0, 40)) {
    md.push(`| ${credit.year ?? '—'} | ${credit.title} | ${credit.titleType || '—'} |`);
}
if (credits.length > 40) md.push(`| … | ${credits.length - 40} autre(s) crédit(s) | — |`);
md.push('');
if (archived) {
    md.push('## Entrée erronée archivée (traçabilité)');
    md.push('');
    md.push('```json');
    md.push(
        JSON.stringify(
            {
                id: archived.id,
                name: archived.name,
                imdbId: archived.imdbId,
                creditsCount: archived.credits?.length ?? 0,
                firstFormatted: archived.credits?.[0]?.formatted ?? null,
            },
            null,
            2
        )
    );
    md.push('```');
    md.push('');
    md.push(
        '> Cette identité (Michaël Troude) n\'est **pas** celle du coach du campus : elle ne doit jamais être réintroduite.'
    );
    md.push('');
}
md.push('## Suite du pipeline');
md.push('');
md.push('```');
md.push('npm run coaches:apply:preview   # vérifier l\'aperçu avant écriture');
md.push('npm run coaches:apply           # écrit src/data/team.ts');
md.push('npm run coaches:sync            # synchronise Supabase (site_team, site_films)');
md.push('node scripts/coach_credits_count_check.mjs   # contrôle des compteurs');
md.push('```');

fs.writeFileSync(REPORT_PATH, `${md.join('\n')}\n`, 'utf8');
console.log(`✅ Revue écrite : ${REPORT_PATH}`);
console.log(`\nTotal curé après réparation : ${totalKept} crédit(s) pour ${curated.coaches.length} coachs.`);
