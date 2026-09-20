/**
 * ==============================================================================
 * CUC — Vérification du site personnel de Michel Bouis
 * ==============================================================================
 * Le site du campus pointe vers https://www.michel-bouis-cascade.fr/ comme
 * site officiel du coach. Ce script en extrait les informations factuelles
 * (spécialités, filmographie déclarée) pour corroborer la fiche.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const URLS = [
    'https://www.michel-bouis-cascade.fr/',
    'https://michel-bouis-cascade.fr/',
];

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
    for (const url of URLS) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': UA } });
            const html = await res.text();
            console.log(`\n=== ${url} -> ${res.status} (${html.length} o) ===`);
            if (res.status !== 200) continue;

            const text = stripTags(html);
            console.log(text.slice(0, 3000));

            // Recherche de titres de films connus pour corroborer.
            const known = [
                'Lupin',
                'Elyas',
                "L'Amour ouf",
                'Loin du périph',
                "L'Empereur de Paris",
                'Overdrive',
                'Alad',
                'Au nom de la terre',
                'La Révolution',
                'Versailles',
            ];
            const found = known.filter((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text));
            console.log('\nTitres corroborés :', found.join(' | ') || 'aucun');

            fs.writeFileSync(
                path.resolve(process.cwd(), 'scripts', 'michel_bouis_site.txt'),
                text,
                'utf8',
            );
            console.log('Texte écrit dans scripts/michel_bouis_site.txt');
            break;
        } catch (err) {
            console.log(`\n=== ${url} -> ERREUR ${err.message}`);
        }
    }
}

main().catch((err) => {
    console.error('ERREUR', err);
    process.exit(1);
});
