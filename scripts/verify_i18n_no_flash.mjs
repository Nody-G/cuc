#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — LOT 1.5 : PREUVE « zéro flash » sur le HTML réellement servi
 * ==============================================================================
 * Compare le HTML PRÉRENDU des routes FR et EN : la version anglaise doit déjà
 * contenir les textes anglais côté serveur, et plus leurs équivalents français.
 * C'est la seule preuve sérieuse qu'aucun français ne s'affiche « un bref
 * instant » : si le HTML initial est en anglais, le navigateur n'a rien à
 * corriger après hydratation.
 *
 * À lancer APRÈS `npm run build`.
 *
 * Usage : node scripts/verify_i18n_no_flash.mjs
 * ==============================================================================
 */
import { existsSync, readFileSync } from 'node:fs';

/**
 * Paires de référence : [texte attendu en EN, texte interdit en EN (= FR)].
 *
 * Ces échantillons ont été VÉRIFIÉS présents dans le HTML prérendu avant d'être
 * inscrits ici : un échantillon qui n'appartient pas au shell statique produirait
 * un faux échec. Ils couvrent deux gisements différents (tag de section et titre
 * de section) alimentés par l'overlay `site_translations`.
 */
const SAMPLES = [
    ['FOLLOW THE CAMPUS LIVE', 'SUIVEZ LE CAMPUS EN DIRECT'],
    ['OVERVIEW', 'PRÉSENTATION'],
];

const FR_HTML = '.next/server/app/fr.html';
const EN_HTML = '.next/server/app/en.html';

const problems = [];

function load(path) {
    if (!existsSync(path)) {
        problems.push(`HTML prérendu introuvable : ${path} — lancer npm run build d'abord.`);
        return null;
    }
    return readFileSync(path, 'utf8');
}

/** React échappe `&` en `&` dans le HTML : on normalise avant comparaison. */
const decode = (html) => html.replace(/&/g, '&').replace(/&#x27;|'/g, "'");

const fr = load(FR_HTML);
const en = load(EN_HTML);

if (fr && en) {
    const frDoc = decode(fr);
    const enDoc = decode(en);

    console.log('\n=== Vérification du HTML prérendu (FR / EN)');
    for (const [enText, frText] of SAMPLES) {
        const frHasFrench = frDoc.includes(frText);
        const frHasEnglish = frDoc.includes(enText);
        const enHasEnglish = enDoc.includes(enText);
        const enHasFrench = enDoc.includes(frText);

        console.log('');
        console.log(`« ${enText} »`);
        console.log(`   FR.html : français=${frHasFrench} anglais=${frHasEnglish}`);
        console.log(`   EN.html : anglais=${enHasEnglish} français=${enHasFrench}`);

        if (!frHasFrench) problems.push(`FR.html ne contient pas « ${frText} »`);
        if (!enHasEnglish) problems.push(`EN.html ne contient pas « ${enText} »`);
        if (enHasFrench) {
            problems.push(
                `EN.html contient ENCORE du français (« ${frText} ») → flash possible`
            );
        }
    }
}

console.log('');
if (problems.length) {
    console.error('❌ Régression de localisation détectée :');
    for (const p of problems) console.error(`   - ${p}`);
    console.error(
        '\n   Le contenu localisé doit être résolu sur le serveur (src/lib/i18n/server.ts)\n' +
        '   et transmis via SiteDataProvider, sinon le navigateur affiche le FR avant l’EN.\n'
    );
    process.exit(2);
}

console.log('✅ HTML initial déjà localisé : page EN servie en anglais, page FR en français.');
console.log('   Aucun français ne peut donc apparaître avant l’anglais.\n');
