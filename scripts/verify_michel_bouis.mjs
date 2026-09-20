/**
 * ==============================================================================
 * CUC — Vérification d'identité : Michel Bouis (ex-« Michaël Troude »)
 * ==============================================================================
 * Contexte : la fiche coach `michael-troude` du site vitrine portait le nom
 * « Michaël Troude » avec l'identifiant IMDb nm0873735, alors que la photo
 * source est `14-michel.png`. La direction indique que le coach est en réalité
 * **Michel Bouis**.
 *
 * Ce script :
 *   1. interroge le site du campus pour retrouver le nom réel du coach ;
 *   2. résout l'identité IMDb de « Michel Bouis » via l'API de suggestion ;
 *   3. compare les filmographies IMDb de nm0099365 (Michel Bouis) et
 *      nm0873735 (Michaël Troude) ;
 *   4. produit un rapport de revue `plans/revue-identite-michel-bouis.md`.
 *
 * Aucune écriture en base. Doctrine « Zéro Invention ».
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { ImdbClient } from './lib/imdb-client.mjs';

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CAMPUS_URLS = [
    'https://www.campus-universcascades.com/equipe/',
    'https://www.campus-universcascades.com/notre-equipe/',
    'https://www.campus-universcascades.com/lequipe/',
    'https://www.campus-universcascades.com/',
];

const NAME_RE = /(Michel|Micha[eë]l|Micka[eë]l)\s+(Bouis|Troude)/gi;
const IMG_RE = /wp-content\/uploads\/[^"')\s]*?(michel|troude|bouis)[^"')\s]*/gi;

async function probeCampus() {
    const findings = [];
    for (const url of CAMPUS_URLS) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': UA } });
            const html = await res.text();
            const names = [...new Set([...html.matchAll(NAME_RE)].map((m) => m[0]))];
            const imgs = [...new Set([...html.matchAll(IMG_RE)].map((m) => m[0]))];
            findings.push({ url, status: res.status, length: html.length, names, imgs });
            console.log(`[campus] ${url} -> ${res.status} (${html.length} o)`);
            if (names.length) console.log(`         noms : ${names.join(' | ')}`);
            if (imgs.length) console.log(`         images : ${imgs.slice(0, 8).join(' | ')}`);
        } catch (err) {
            findings.push({ url, error: err.message });
            console.log(`[campus] ${url} -> ERREUR ${err.message}`);
        }
    }
    return findings;
}

async function main() {
    const client = new ImdbClient();

    console.log('\n=== 1. Résolution nominative IMDb ===');
    for (const name of ['Michel Bouis', 'Michaël Troude', 'Michael Troude']) {
        const results = await client.suggest(name);
        console.log(`\n« ${name} » :`);
        results.slice(0, 6).forEach((r) => console.log(`   ${r.imdbId} | ${r.name} | ${r.description}`));
    }

    console.log('\n=== 2. Filmographies comparées ===');
    const people = {};
    for (const id of ['nm0099365', 'nm0873735']) {
        const person = await client.getPersonCredits(id);
        if (!person) {
            console.log(`${id} -> introuvable`);
            continue;
        }
        const stunts = person.credits.filter((c) =>
            ['stunts', 'stunt_department'].includes(c.categoryId),
        );
        people[id] = { ...person, stunts };
        console.log(`${id} | ${person.name} | total=${person.total} | cascades=${stunts.length}`);
    }

    console.log('\n=== 3. Site du campus ===');
    const campus = await probeCampus();

    // Rapport de revue
    const lines = [];
    lines.push('# Revue d\'identité — Michel Bouis (ex-« Michaël Troude »)');
    lines.push('');
    lines.push('> Rapport généré par `scripts/verify_michel_bouis.mjs`. Aucune écriture en base.');
    lines.push('');
    lines.push('## Constat');
    lines.push('');
    lines.push('La fiche `michael-troude` du site vitrine portait :');
    lines.push('');
    lines.push('- nom affiché : **Michaël Troude**');
    lines.push('- IMDb : `nm0873735` (Michaël Troude — Stunts, *Mourir peut attendre*)');
    lines.push('- photo source : `14-michel.png` (indice « Michel »)');
    lines.push('');
    lines.push('La direction indique que le coach est en réalité **Michel Bouis**.');
    lines.push('');
    lines.push('## Identités IMDb');
    lines.push('');
    for (const [id, p] of Object.entries(people)) {
        lines.push(`### ${id} — ${p.name}`);
        lines.push('');
        lines.push(`- crédits totaux : **${p.total}**`);
        lines.push(`- crédits cascades : **${p.stunts.length}**`);
        lines.push('');
        lines.push('| Année | Titre | Catégorie |');
        lines.push('| --- | --- | --- |');
        p.stunts.slice(0, 40).forEach((c) => {
            lines.push(`| ${c.year ?? '—'} | ${c.title ?? '—'} | ${c.category ?? '—'} |`);
        });
        lines.push('');
    }
    lines.push('## Site du campus');
    lines.push('');
    lines.push('| URL | Statut | Noms détectés | Images détectées |');
    lines.push('| --- | --- | --- | --- |');
    campus.forEach((f) => {
        lines.push(
            `| ${f.url} | ${f.status ?? f.error ?? '—'} | ${(f.names || []).join(', ') || '—'} | ${(f.imgs || []).slice(0, 4).join(', ') || '—'} |`,
        );
    });
    lines.push('');

    const outPath = path.resolve(process.cwd(), 'plans', 'revue-identite-michel-bouis.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log(`\nRapport écrit : ${outPath}`);
}

main().catch((err) => {
    console.error('ERREUR', err);
    process.exit(1);
});
