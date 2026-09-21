/**
 * Lot i18n — chrome résiduel de la page ÉQUIPE (`/equipe-cascadeurs-pro`).
 *
 * 1. Injecte les clés manquantes du namespace `team` (fil d'Ariane + encart bas
 *    de page) dans les catalogues FR/EN.
 * 2. Remplace les chaînes FR en dur de `equipe-cascadeurs-pro/page.tsx` par les
 *    clés du catalogue.
 *
 * Usage : node scripts/fix_equipe_chrome_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const KEYS = {
    fr: {
        breadcrumbHome: 'ACCUEIL',
        breadcrumbCurrent: "L'ÉQUIPE",
        ctaBlockTitle: 'FORMEZ-VOUS AVEC LES MEILLEURS PROFESSIONNELS DU SECTEUR',
        ctaBlockBody:
            'Chaque instructeur du Campus Univers Cascades est actif sur les plateaux de tournage et transmet les exigences actuelles du cinéma mondial.',
        ctaBlockButton: 'Découvrir les Formations du CUC',
    },
    en: {
        breadcrumbHome: 'HOME',
        breadcrumbCurrent: 'THE TEAM',
        ctaBlockTitle: 'TRAIN WITH THE BEST PROFESSIONALS IN THE INDUSTRY',
        ctaBlockBody:
            'Every Campus Univers Cascades instructor works on film sets and passes on the current demands of international cinema.',
        ctaBlockButton: 'Explore CUC Courses',
    },
};

const EDITS = [
    [
        '                ACCUEIL\n',
        "                {t('breadcrumbHome')}\n",
        'fil d\u2019Ariane — accueil',
    ],
    [
        "              <span className=\"text-[#FFE500]\">L'ÉQUIPE</span>",
        "              <span className=\"text-[#FFE500]\">{t('breadcrumbCurrent')}</span>",
        'fil d\u2019Ariane — page',
    ],
    [
        '                FORMEZ-VOUS AVEC LES MEILLEURS PROFESSIONNELS DU SECTEUR\n',
        "                {t('ctaBlockTitle')}\n",
        'titre de l\u2019encart',
    ],
    [
        '                Chaque instructeur du Campus Univers Cascades est actif sur les plateaux de tournage\n                et transmet les exigences actuelles du cinéma mondial.\n',
        "                {t('ctaBlockBody')}\n",
        'texte de l\u2019encart',
    ],
    [
        '                  Découvrir les Formations du CUC\n',
        "                  {t('ctaBlockButton')}\n",
        'bouton de l\u2019encart',
    ],
];

for (const rel of ['messages/fr.json', 'messages/en.json']) {
    const path = here(rel);
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const locale = rel.includes('en.json') ? 'en' : 'fr';
    const added = [];
    for (const [key, value] of Object.entries(KEYS[locale])) {
        if (catalog.team[key]) continue;
        catalog.team[key] = value;
        added.push(key);
    }
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    console.log(`${rel} : ${added.length ? added.join(', ') : 'rien à ajouter'}`);
}

/**
 * Le fichier de page peut être enregistré en CRLF : on construit un motif
 * tolérant aux fins de ligne au lieu de comparer des chaînes littérales.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toPattern = (value) =>
    new RegExp(escapeRegExp(value).replace(/\n/g, '\\r?\\n'), 'g');

const page = 'src/app/(site)/[locale]/equipe-cascadeurs-pro/page.tsx';
const pagePath = here(page);
let src = readFileSync(pagePath, 'utf8');
let applied = 0;
const missed = [];
for (const [from, to, label] of EDITS) {
    const pattern = toPattern(from);
    if (!pattern.test(src)) {
        missed.push(label);
        continue;
    }
    src = src.replace(pattern, to);
    applied += 1;
}
if (!dry) writeFileSync(pagePath, src);
console.log(`${page} : ${applied}/${EDITS.length} édition(s) appliquée(s)`);
for (const m of missed) console.log(`  MANQUÉ → ${m}`);
if (dry) console.log('Mode --dry : aucun fichier écrit.');
