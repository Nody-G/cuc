/**
 * ==============================================================================
 * CUC — Extraction de la fiche « Michel Bouis » depuis le site du campus
 * ==============================================================================
 * Extraction ciblée : fenêtre entre l'avatar `14-michel.png` (index 201574) et
 * les occurrences du nom (index 202027 / 202883).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const URL = 'https://www.campus-universcascades.com/equipe/';

function stripTags(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&/g, '&')
        .replace(/&#8217;|&rsquo;/g, "'")
        .replace(/&#8211;|&ndash;/g, '–')
        .replace(/"/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    const res = await fetch(URL, { headers: { 'User-Agent': UA } });
    const html = await res.text();

    const imgIdx = html.indexOf('14-michel.png');
    const nameIdx = html.indexOf('Michel Bouis');

    console.log(`image=${imgIdx} nom=${nameIdx}\n`);

    // Fenêtre resserrée : de 1200 avant l'image à 2500 après le nom.
    const start = Math.max(0, imgIdx - 1200);
    const end = Math.min(html.length, nameIdx + 2500);
    const focused = stripTags(html.slice(start, end));

    console.log('=== FICHE MICHEL BOUIS (texte) ===\n');
    console.log(focused);

    // Extraction du HTML brut pour repérer la structure (nom, rôle, bio).
    const rawBlock = html.slice(start, end);
    console.log('\n=== STRUCTURE HTML (balises seules) ===\n');
    console.log(
        rawBlock
            .replace(/>[^<]{40,}</g, '>…<')
            .replace(/\s+/g, ' ')
            .slice(0, 4000),
    );

    fs.writeFileSync(
        path.resolve(process.cwd(), 'scripts', 'michel_bouis_campus_block.txt'),
        focused,
        'utf8',
    );
    console.log('\nBloc écrit dans scripts/michel_bouis_campus_block.txt');
}

main().catch((err) => {
    console.error('ERREUR', err);
    process.exit(1);
});
