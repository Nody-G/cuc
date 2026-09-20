/**
 * ==============================================================================
 * CUC — Extraction complète des crédits IMDb de Michel Bouis (nm0099365)
 * ==============================================================================
 * Produit un JSON structuré de tous les crédits cascades, triés par année
 * décroissante, pour construire la fiche corrigée.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { ImdbClient } from './lib/imdb-client.mjs';

const IMDB_ID = 'nm0099365';

async function main() {
    const client = new ImdbClient();
    const person = await client.getPersonCredits(IMDB_ID);
    if (!person) {
        console.log('Profil introuvable.');
        return;
    }

    console.log(`Nom IMDb : ${person.name}`);
    console.log(`Crédits totaux : ${person.total}`);

    const stunts = person.credits
        .filter((c) => ['stunts', 'stunt_department'].includes(c.categoryId))
        .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

    console.log(`Crédits cascades : ${stunts.length}\n`);

    // Répartition par catégorie
    const byCat = {};
    stunts.forEach((c) => {
        byCat[c.category] = (byCat[c.category] || 0) + 1;
    });
    console.log('Répartition par catégorie :');
    Object.entries(byCat)
        .sort((a, b) => b[1] - a[1])
        .forEach(([k, v]) => console.log(`   ${k} : ${v}`));

    // Types de titres
    const byType = {};
    stunts.forEach((c) => {
        byType[c.titleTypeLabel] = (byType[c.titleTypeLabel] || 0) + 1;
    });
    console.log('\nRépartition par type :');
    Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .forEach(([k, v]) => console.log(`   ${k} : ${v}`));

    console.log('\n=== FILMOGRAPHIE COMPLÈTE (cascades, année desc) ===\n');
    stunts.forEach((c) => {
        console.log(`${c.year ?? '????'} | ${c.title} | ${c.category} | ${c.titleTypeLabel}`);
    });

    const out = {
        imdbId: IMDB_ID,
        name: person.name,
        totalCredits: person.total,
        stuntCredits: stunts.length,
        byCategory: byCat,
        byType,
        credits: stunts.map((c) => ({
            titleId: c.titleId,
            title: c.title,
            year: c.year,
            category: c.category,
            categoryId: c.categoryId,
            titleType: c.titleType,
            titleTypeLabel: c.titleTypeLabel,
        })),
    };

    const outPath = path.resolve(process.cwd(), 'scripts', 'michel_bouis_credits_imdb.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`\nJSON écrit : ${outPath}`);
}

main().catch((err) => {
    console.error('ERREUR', err);
    process.exit(1);
});
