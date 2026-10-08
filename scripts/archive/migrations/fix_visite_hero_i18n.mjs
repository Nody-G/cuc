/**
 * Lot i18n — héro de la page VISITE GUIDÉE (`/visite-guidee`).
 *
 * 1. Injecte `visite.hero` (chrome + 4 chiffres clés) dans les catalogues FR/EN.
 * 2. Corrige le libellé EN du pôle parisien : « Île-de-France centre » contenait
 *    la particule française « de » (faux positif du contrôle sur les pages EN).
 *
 * Injection JSON : aucune séquence d'entité HTML écrite, donc aucun décodage
 * parasite possible.
 *
 * Usage : node scripts/fix_visite_hero_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const HERO = {
    fr: {
        breadcrumbHome: 'ACCUEIL',
        breadcrumbCurrent: 'LE CAMPUS',
        badge: 'INFRASTRUCTURES DE FORMATION',
        location: 'LE CATEAU-CAMBRÉSIS (59)',
        titleLead: 'LE',
        titleAccent: 'CAMPUS',
        subtitle:
            'Découvrez les infrastructures du Campus Univers Cascades : la tour de saut de 21 mètres, 1300 m² de hangars couverts, fosse de réception, dojos, manège équestre, hébergement 90 lits et studio de répétition en région parisienne.',
        ctaFacilities: 'Infrastructures',
        ctaTour360: 'Visite 360°',
        ctaPlan3D: 'Plan 3D',
        bgAlt: 'Domaine du Campus Univers Cascades',
        stats: [
            { value: '11 000 M²', label: "Surface d'Infrastructures" },
            { value: '21 MÈTRES', label: 'Hauteur de la Tour CUC' },
            { value: '90 LITS', label: 'Hébergement Sur Site' },
            { value: '2 SITES', label: 'Nord (59) & Paris (92)' },
        ],
    },
    en: {
        breadcrumbHome: 'HOME',
        breadcrumbCurrent: 'THE CAMPUS',
        badge: 'TRAINING FACILITIES',
        location: 'LE CATEAU-CAMBRÉSIS (59)',
        titleLead: 'THE',
        titleAccent: 'CAMPUS',
        subtitle:
            'Discover the Campus Univers Cascades facilities: the 21-metre jump tower, 1300 m² of covered hangars, landing pit, dojos, indoor riding arena, 90-bed accommodation and a rehearsal studio in the Paris region.',
        ctaFacilities: 'Facilities',
        ctaTour360: '360° tour',
        ctaPlan3D: '3D plan',
        bgAlt: 'Campus Univers Cascades estate',
        stats: [
            { value: '11 000 M²', label: 'Facility area' },
            { value: '21 METRES', label: 'CUC Tower height' },
            { value: '90 BEDS', label: 'On-site accommodation' },
            { value: '2 SITES', label: 'North (59) & Paris (92)' },
        ],
    },
};

/** Libellé EN du pôle parisien : sans particule française (« de »). */
const EN_IDF_LABEL = 'Paris studio:';

function patch(rel, locale) {
    const path = here(rel);
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const visite = catalog.visite ?? {};
    const existed = Boolean(visite.hero);
    catalog.visite = { ...visite, hero: HERO[locale] };

    let idf = 'absent';
    if (locale === 'en' && catalog.visiteGuidee?.idfLabel) {
        const before = catalog.visiteGuidee.idfLabel;
        catalog.visiteGuidee.idfLabel = EN_IDF_LABEL;
        idf = `« ${before} » → « ${EN_IDF_LABEL} »`;
    }

    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    return `${rel} : visite.hero ${existed ? 'remplacé' : 'ajouté'} ; idfLabel ${idf}`;
}

console.log(patch('messages/fr.json', 'fr'));
console.log(patch('messages/en.json', 'en'));
if (dry) console.log('Mode --dry : aucun fichier écrit.');
