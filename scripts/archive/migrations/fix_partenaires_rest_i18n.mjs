/**
 * Lot i18n — reste de la page PARTENAIRES (`/partenaires`).
 *
 * 1. Complète `partenaires.partners[]` : deux fiches statiques (MFR Le
 *    Cateau-Cambrésis, BSN Nutrition) n'avaient AUCUNE copie EN — leur rôle,
 *    catégorie et description restaient en français sur la page anglaise.
 * 2. Injecte le chrome de l'encart « Devenir partenaire »
 *    (`ctaBadge`, `ctaTitle`, `ctaBody`, `ctaButton`).
 * 3. Fait passer les partenaires ajoutés en base par le même helper
 *    `localized()` : une description FR saisie dans le Cockpit trouvera sa
 *    copie EN dès qu'elle existe, au lieu d'être affichée telle quelle.
 *
 * Usage : node scripts/fix_partenaires_rest_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const CTA = {
    fr: {
        ctaBadge: 'SPONSORING',
        ctaTitle: 'DEVENIR PARTENAIRE',
        ctaBody:
            "Vous êtes équipementier, fabricant de matériel, société d'effets spéciaux ou marque souhaitant associer son image au campus ?",
        ctaButton: 'Nous contacter',
    },
    en: {
        ctaBadge: 'SPONSORING',
        ctaTitle: 'BECOME A PARTNER',
        ctaBody:
            'Are you an equipment maker, a gear manufacturer, a special effects company or a brand looking to associate its image with the campus?',
        ctaButton: 'Contact us',
    },
};

const MISSING_PARTNERS = {
    fr: [
        {
            name: 'MFR Le Cateau-Cambrésis',
            role: 'Hébergement & Restauration',
            category: 'Hébergement & Accueil',
            description: 'Hébergement et restauration des stagiaires au Cateau-Cambrésis.',
        },
        {
            name: 'BSN Nutrition',
            role: 'Nutrition Sportive',
            category: 'Nutrition Sportive',
            description: 'Nutrition sportive et compléments alimentaires pour athlètes.',
        },
    ],
    en: [
        {
            name: 'MFR Le Cateau-Cambrésis',
            role: 'Accommodation & Catering',
            category: 'Accommodation & Reception',
            description: 'Accommodation and meals for trainees in Le Cateau-Cambrésis.',
        },
        {
            name: 'BSN Nutrition',
            role: 'Sports Nutrition',
            category: 'Sports Nutrition',
            description: 'Sports nutrition and food supplements for athletes.',
        },
    ],
};

for (const rel of ['messages/fr.json', 'messages/en.json']) {
    const path = here(rel);
    const locale = rel.includes('en.json') ? 'en' : 'fr';
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const partenaires = catalog.partenaires ?? {};

    const added = [];
    let partners = partenaires.partners ?? [];
    for (const partner of MISSING_PARTNERS[locale]) {
        const exists = partners.some(
            (entry) => String(entry.name).toLowerCase().trim() === partner.name.toLowerCase()
        );
        if (exists) continue;
        partners = [...partners, partner];
        added.push(partner.name);
    }

    catalog.partenaires = { ...partenaires, ...CTA[locale], partners };
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    console.log(
        `${rel} : ${added.length ? 'fiches ajoutées → ' + added.join(', ') : 'fiches déjà présentes'} ; chrome CTA injecté`
    );
}

// Les partenaires issus du Cockpit passent par le même appariement par nom.
const grid = 'src/components/sections/partenaires/PartenairesGridSection.tsx';
const gridPath = here(grid);
let src = readFileSync(gridPath, 'utf8');
let applied = 0;
for (const [from, to, label] of [
    ['{partner.description && (', '{localized(partner).description && (', 'condition description'],
    ['                {partner.description}\n', '                {localized(partner).description}\n', 'valeur description'],
]) {
    if (!src.includes(from)) continue;
    src = src.replaceAll(from, to);
    applied += 1;
}
if (!dry) writeFileSync(gridPath, src);
console.log(`${grid} : ${applied}/2 édition(s) appliquée(s)`);
if (dry) console.log('Mode --dry : aucun fichier écrit.');
