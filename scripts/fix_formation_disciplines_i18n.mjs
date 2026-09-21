/**
 * Lot i18n — chrome de la section « LES 10 DISCIPLINES » (`formation`).
 *
 * Injecte `formation.disciplines` (badge, titre, libellés de contexte et
 * d'équipements) dans les catalogues FR/EN. Les intitulés et descriptions des
 * disciplines, eux, sont des DONNÉES : ils vivent en base et sont traduits par
 * l'overlay `discipline` (`scripts/seed_disciplines_translations_en.mjs`).
 *
 * Usage : node scripts/fix_formation_disciplines_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const COPY = {
    fr: {
        badge: 'RÉPERTOIRE TECHNIQUE',
        title: 'LES 10 DISCIPLINES DE LA CASCADE PHYSIQUE',
        cinemaContextLabel: 'Contexte Cinéma & Tournage :',
        equipmentLabel: 'Équipements & Installations :',
    },
    en: {
        badge: 'TECHNICAL REPERTOIRE',
        title: 'THE 10 PHYSICAL STUNT DISCIPLINES',
        cinemaContextLabel: 'Film & Shoot Context:',
        equipmentLabel: 'Equipment & Facilities:',
    },
};

for (const rel of ['messages/fr.json', 'messages/en.json']) {
    const path = here(rel);
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const locale = rel.includes('en.json') ? 'en' : 'fr';
    const existed = Boolean(catalog.formation?.disciplines);
    catalog.formation = { ...catalog.formation, disciplines: COPY[locale] };
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    console.log(`${rel} : formation.disciplines ${existed ? 'remplacé' : 'ajouté'}`);
}

if (dry) console.log('Mode --dry : aucun fichier écrit.');
