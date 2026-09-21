#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Codemod : purge des mentions « 6 hectares / 6 Ha / 6 HECTARES »
 * ==============================================================================
 * Demande client : « tu marques trop 6ha de partout, retire-en, c'est bien trop ».
 *
 * Principe :
 *   - Table de remplacements EXPLICITE (from → to), contextuelle et réversible.
 *   - Zéro regex "sauvage" : chaque `from` doit correspondre littéralement,
 *     sinon l'entrée est signalée (drift detecté) sans casser la phrase.
 *   - Écriture UTF-8 stricte (le dépôt est sensible au mojibake).
 *
 * Usage :
 *   node scripts/purge_6ha_mentions.mjs          # applique
 *   node scripts/purge_6ha_mentions.mjs --dry     # simulation
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');

/** @typedef {{ file: string, from: string, to: string, nth?: number }} Entry */
/** @type {Entry[]} */
const E = [];
const add = (file, from, to, nth) => E.push({ file, from, to, nth });

// --- SEO / métadonnées globales -------------------------------------------------
add('src/lib/seo.ts', ': domaine de 6 hectares, CUC Tower', ': CUC Tower');
add('src/lib/seo.ts', '6 hectares — Domaine du Campus Univers Cascades', 'Domaine du Campus Univers Cascades');
add('src/lib/og-image.tsx', '["6 HECTARES", "CUC TOWER 21 M"', '["11 000 M²", "CUC TOWER 21 M"');
add('src/app/layout.tsx', "6 hectares d'infrastructures, tour d'impact 21m", "11 000 m² d'infrastructures, tour d'impact 21m");
add('src/app/opengraph-image.tsx', '<span>6 HECTARES</span>', '<span>11 000 M²</span>');

// --- site-service (contenu CMS de secours) -------------------------------------
add('src/lib/data/site-service.ts', 'sur un domaine privé de 6 hectares au Cateau-Cambrésis', 'au Cateau-Cambrésis');
add('src/lib/data/site-service.ts', 'Sur notre domaine de 6 hectares ou sur le lieu de votre séminaire', 'Sur notre domaine ou sur le lieu de votre séminaire');
add('src/lib/data/site-service.ts', 'Le Domaine CUC de 6 hectares est situé', 'Le Domaine CUC est situé');
add('src/lib/data/site-service.ts', 'Immersion entreprise sur le domaine de 6 hectares du CUC', 'Immersion entreprise sur le domaine du CUC');
add('src/lib/data/site-service.ts', 'Hébergement et restauration sur site (domaine 6 Ha)', 'Hébergement et restauration sur site');
add('src/lib/data/site-service.ts', '11 000 m² (Domaine de 6 hectares)', '11 000 m²');
add('src/lib/data/site-service.ts', 'infrastructures du campus (6 hectares).', 'infrastructures du campus.');

// --- Données éditoriales --------------------------------------------------------
add('src/data/programs.ts', 'Immersion nocturne sur le campus de 6 hectares', 'Immersion nocturne sur le campus');
add('src/data/programs.ts', String.raw`sur 6 hectares d\'infrastructures`, 'sur nos infrastructures');
add('src/data/navigation.ts', "6 hectares d'installations de pointe.", 'Des installations de pointe.');
add('src/data/navigation.ts', "label: 'Visite Guidée des 6 Ha'", "label: 'Visite Guidée du Campus'");
// NB : les deux lignes identiques `size: 'Domaine de 6 hectares',` de campus.ts
// sont traitées par un remplacement ordinal dédié après la boucle (voir plus bas).
add('src/data/campus.ts', "'Domaine arboré clos de 6 hectares',", "'Domaine arboré clos',");

// --- Composants UI --------------------------------------------------------------
add('src/components/ui/VirtualTourViewer.tsx', '6 HECTARES • LE CATEAU-CAMBRÉSIS', 'LE CATEAU-CAMBRÉSIS');
add('src/components/ui/parallax-hero/parallaxHero.data.ts', 'DOMAINE DE 6 HECTARES • LE CATEAU-CAMBRÉSIS', 'DOMAINE PRIVÉ • LE CATEAU-CAMBRÉSIS');
add('src/components/ui/InteractiveCampusMap.tsx', 'Le Cateau-Cambrésis • Domaine 6 Ha', 'Le Cateau-Cambrésis • Domaine CUC');
add('src/components/ui/InteractiveCampusMap.tsx', 'Radar Satellite 6 Ha', 'Radar Satellite');
add('src/components/ui/InteractiveCampusMap.tsx', 'DOMAINE CUC — 6 HECTARES', 'DOMAINE CUC');
add('src/components/ui/campus-map/campusMap.data.ts', 'salles de debriefing vidéo sur le parc arboré de 6 hectares.', 'salles de debriefing vidéo sur le parc arboré.');
add('src/components/ui/campus-map/campusMap.data.ts', 'Foyer stagiaires • Parc 6 ha', 'Foyer stagiaires');
add('src/components/ui/campus-map/CampusRadarView.tsx', 'CARTOGRAPHIE DU CAMPUS — 6 HA', 'CARTOGRAPHIE DU CAMPUS');
add('src/components/ui/parallax-hero/HeroHudOverlay.tsx', 'Domaine de 6 Hectares', 'Domaine privé');
add('src/components/3d/data/realFacilities.ts', "name: 'Site Extérieur (6 Hectares)',", "name: 'Site Extérieur',");
add('src/components/layout/footer-sections/FooterBrandAndSites.tsx', 'CAMPUS PRINCIPAL (6 HA) :', 'CAMPUS PRINCIPAL :');
add('src/app/admin/CockpitApp.tsx', 'INFRASTRUCTURES & ZONES CAMPUS (6 HA)', 'INFRASTRUCTURES & ZONES CAMPUS');
add('src/app/visite-virtuelle/layout.tsx', 'Visite Virtuelle 360° du Campus (6 Hectares)', 'Visite Virtuelle 360° du Campus');
add('src/app/visite-virtuelle/page.tsx', "6 Hectares d'Infrastructures", "11 000 m² d'Infrastructures");
add('src/components/ui/InteractiveCampusMap.tsx', 'Tactical Radar Layout for 6 Hectares Domain', 'Tactical Radar Layout for the Campus Domain');

// --- Sections vitrine -----------------------------------------------------------
add('src/components/sections/team/TeamProductionServices.tsx', 'mise à disposition du domaine de 6 hectares comme décor naturel.', 'mise à disposition du domaine comme décor naturel.');
add('src/components/sections/stages/StagesHeroSection.tsx', "Summer Camp estival sur 6 hectares d'installations.", 'Summer Camp estival sur nos installations.');
add('src/components/sections/home/HomeVirtualTourSection.tsx', 'Découvrez nos 6 hectares comme si vous y étiez !', 'Découvrez notre domaine comme si vous y étiez !');
add('src/components/sections/home/HomeTournagesSection.tsx', 'domaine privé de 6 hectares privatisable', 'domaine privé privatisable');
add('src/components/sections/home/HomeAboutSection.tsx', 'établi sur un domaine privé de 6 hectares au Cateau-Cambrésis (59).', 'établi au Cateau-Cambrésis (59).');
add('src/components/sections/home/HomeAboutSection.tsx', 'manège équestre sur 6 hectares.', 'manège équestre.');
add('src/components/sections/home/HomeAboutSection.tsx', "tag: '6 HECTARES',", "tag: 'DOMAINE PRIVÉ',");
add('src/components/sections/formation/FormationHeroSection.tsx', 'immersion technique sur le domaine de 6 hectares au Cateau-Cambrésis', 'immersion technique au Cateau-Cambrésis');
add('src/components/sections/events/EventsPillarsSection.tsx', 'au cœur du domaine de 6 hectares du CUC au Cateau-Cambrésis', 'au cœur du domaine du CUC au Cateau-Cambrésis');
add('src/components/sections/contact/ContactCoordinatesSidebar.tsx', 'CAMPUS PRINCIPAL (6 HECTARES) :', 'CAMPUS PRINCIPAL :');

// --- Routes / layouts / OG ------------------------------------------------------
add('src/app/visite-virtuelle/page.tsx', 'LE CATEAU-CAMBRÉSIS • 6 HECTARES', 'LE CATEAU-CAMBRÉSIS');
add('src/app/visite-guidee/opengraph-image.tsx', "Découvrez 6 hectares d'installations uniques", 'Découvrez des installations uniques');
add('src/app/visite-guidee/opengraph-image.tsx', '"6 HECTARES", "CUC TOWER"', '"11 000 M²", "CUC TOWER"');
add('src/app/visite-guidee/layout.tsx', 'Détail complet des 6 hectares du CUC :', 'Détail complet des installations du CUC :');
add('src/app/team-building-cascades/opengraph-image.tsx', '"SUR-MESURE", "6 HECTARES"', '"SUR-MESURE", "DEPUIS 2008"');
add('src/app/team-building-cascades/layout.tsx', "cohésion d'équipe pour entreprises sur notre campus de 6 hectares.", "cohésion d'équipe pour entreprises sur notre campus.");

// --- Cockpit --------------------------------------------------------------------
add('src/app/admin/components/CampusZonesView.tsx', 'Infrastructures & Zones du Campus (6 Ha)', 'Infrastructures & Zones du Campus');
add('src/app/admin/components/CampusZonesView.tsx', 'points d’intérêt du parc de 6 hectares', 'points d’intérêt du parc du campus');
add('src/app/admin/components/SettingsView.tsx', '"Ex: 11 000 m² (6 ha)"', '"Ex: 11 000 m²"');
add('src/app/admin/components/pages-editor/ContactPageEditor.tsx', 'accès au domaine de 6 hectares.', 'accès au domaine.');
add('src/app/admin/CockpitApp.tsx', "label: 'Infrastructures (6 Ha)',", "label: 'Infrastructures',");

// --- Seeds actifs (évite la réintroduction au reseed) ---------------------------
add('scripts/seed_campus_pois.mjs', "surface: '6 ha',", "surface: 'Parc arboré',");
add('scripts/seed_campus_pois.mjs', "features: ['Parc arboré 6 hectares', 'Salles de debriefing vidéo'],", "features: ['Parc arboré', 'Salles de debriefing vidéo'],");
add('scripts/seed_campus_pois.mjs', 'salles de debriefing vidéo sur le parc arboré de 6 hectares.', 'salles de debriefing vidéo sur le parc arboré.');
add('scripts/seed_navigation_footer.mjs', "description: 'Découvrez les 6 hectares',", "description: 'Découvrez le campus',");
add('scripts/seed_navigation_footer.mjs', "label: 'Visite Guidée des 6 Ha'", "label: 'Visite Guidée du Campus'");
add('scripts/seed_navigation_footer.mjs', "6 hectares d'installations de pointe.", 'Des installations de pointe.');
add('scripts/seed_site_vitrine.sql', "Immersion nocturne sur le campus de 6 hectares", 'Immersion nocturne sur le campus');
add('scripts/seed_site_vitrine.sql', "sur 6 hectares d''infrastructures", 'sur nos infrastructures');
add('scripts/setup_complete_vitrine.sql', "Immersion nocturne sur le campus de 6 hectares", 'Immersion nocturne sur le campus');
add('scripts/setup_complete_vitrine.sql', "sur 6 hectares d''infrastructures", 'sur nos infrastructures');

// ------------------------------------------------------------------------------
// Application
// ------------------------------------------------------------------------------
const fileCache = new Map();
const read = (f) => {
    if (!fileCache.has(f)) {
        const abs = path.join(ROOT, f);
        fileCache.set(f, fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null);
    }
    return fileCache.get(f);
};

let applied = 0;
let already = 0;
let missed = 0;
/** @type {string[]} */
const problems = [];

for (const { file, from, to, nth } of E) {
    const original = read(file);
    if (original == null) {
        problems.push(`FICHIER ABSENT : ${file}`);
        missed++;
        continue;
    }

    let content = original;
    const parts = content.split(from);
    const occurrences = parts.length - 1;

    if (occurrences === 0) {
        // Idempotence : si le remplacement est déjà présent, l'entrée est considérée faite.
        if (content.includes(to)) {
            already += 1;
            continue;
        }
        problems.push(`INTROUVABLE : "${from}" dans ${file}`);
        missed++;
        continue;
    }

    if (nth != null) {
        if (occurrences < nth) {
            problems.push(`OCCURRENCE #${nth} absente : "${from}" dans ${file}`);
            missed++;
            continue;
        }
        parts.splice(nth, 0, to);
        content = parts.join('');
    } else {
        content = parts.join(to);
    }

    fileCache.set(file, content);
    applied += nth != null ? 1 : occurrences;
}

// --- Cas particulier : campus.ts (deux lignes `size:` identiques) ---------------
{
    const file = 'src/data/campus.ts';
    const content = read(file);
    if (content != null) {
        const from = "size: 'Domaine de 6 hectares',";
        const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const targets = ["size: 'Domaine privé clos',", "size: '90 lits sur site',"];
        let i = 0;
        const replaced = content.replace(new RegExp(escaped, 'g'), (m) => {
            const to = targets[i];
            i += 1;
            return to ?? m;
        });
        if (i > 0) {
            fileCache.set(file, replaced);
            applied += i;
        }
        if (i < targets.length) already += targets.length - i;
    }
}

if (!DRY) {
    for (const [file, content] of fileCache.entries()) {
        if (content == null) continue;
        const abs = path.join(ROOT, file);
        const before = fs.readFileSync(abs, 'utf8');
        if (before !== content) fs.writeFileSync(abs, content, 'utf8');
    }
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — remplacements : ${applied}, déjà faits : ${already}, entrées en échec : ${missed}\n`);
if (problems.length) {
    console.log('Points à vérifier :');
    for (const p of problems) console.log(`  • ${p}`);
    console.log('');
    process.exitCode = missed > 0 ? 2 : 0;
}
