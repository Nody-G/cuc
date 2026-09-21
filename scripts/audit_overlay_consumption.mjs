#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Garde : toute traduction semée est-elle RÉELLEMENT affichée ?
 * ==============================================================================
 * DÉFAUT RÉEL À L'ORIGINE DE CETTE GARDE (2026-09-21)
 * --------------------------------------------------
 * Les 501 synopsis anglais de l'entité `film` étaient semés dans
 * `site_translations`, comptabilisés à 100 % de couverture… et **jamais
 * affichés** : aucun écran n'appliquait l'overlay `film`, et
 * `FilmDetailsModal` rendait `movie.description` brut, donc en français sur les
 * pages anglaises.
 *
 * Pourquoi aucun contrôle ne l'avait vu :
 *   - les audits d'intégrité mesurent la QUALITÉ des textes, pas leur usage ;
 *   - l'audit de couverture mesure la présence des lignes, pas leur lecture ;
 *   - le crawler lit le HTML initial, or le synopsis vit dans une modale cliente.
 *
 * Cette garde comble le trou : pour chaque entité connue du registre, elle
 * compare le nombre d'overlays EN en base au nombre de **points de lecture**
 * trouvés dans `src/`. Une entité traduite sans aucun lecteur est du travail
 * invisible — et un site anglais qui reste partiellement français.
 *
 * Une exception doit être ÉCRITE et JUSTIFIÉE (`CATALOG_LOCALIZED`) : jamais
 * implicite.
 *
 * Usage : node scripts/audit_overlay_consumption.mjs
 * Sort en code 2 si une entité possède des overlays sans consommateur.
 * ==============================================================================
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

/**
 * Exceptions DOCUMENTÉES : entité → raison, quand l'affichage ne passe pas par un
 * appel littéral à l'overlay. Chaque entrée est une décision relue, jamais un
 * contournement ; un site anglais incomplet se cacherait derrière une exception
 * injustifiée.
 */
const DOCUMENTED_EXCEPTIONS = new Map([
    [
        'partner',
        "la copie EN des partenaires vient du catalogue `partenaires.partners` (appariement par NOM) ; les overlays `site_translations` de l'entité `partner` en sont un doublon",
    ],
    [
        'program',
        "les lignes `site_programs` ne sont affichées que dans le Cockpit (interface française) — les overlays EN n'ont pas de surface publique",
    ],
]);

/**
 * Entités dont la lecture ne peut pas être détectée par un littéral : la
 * résolution passe par une variable (`fetchOverlay(entity, …)`) ou par un
 * sélecteur. `evidence` doit rester la preuve EXACTE de la lecture.
 */
const INDIRECT_EVIDENCE = new Map([
    ['page', /fetchOverlay\(\s*'page'/],
    ['navigation', /entity === 'navigation'|getChrome\('navigation'/],
    ['footer', /entity === 'footer'|getChrome\('footer'/],
    ['social_link', /getEntityOverlays\(\s*'social_link'/],
]);

const registry = JSON.parse(readFileSync('src/lib/i18n/entities.json', 'utf8'));
const entities = registry.entities.map((entity) => entity.entity);

const overlays = await (async () => {
    const res = await fetch(
        `${URL_BASE}/rest/v1/site_translations?select=entity,entity_id&locale=eq.en&is_published=eq.true`,
        { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!res.ok) {
        console.error(`❌ Lecture site_translations → HTTP ${res.status}`);
        process.exit(1);
    }
    return res.json();
})();

const overlayCount = new Map();
for (const row of overlays) {
    overlayCount.set(row.entity, (overlayCount.get(row.entity) ?? 0) + 1);
}

/** Liste récursive des fichiers `.ts`/`.tsx` de `src/`. */
function sourceFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            sourceFiles(path, out);
            continue;
        }
        if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) out.push(path);
    }
    return out;
}

const files = sourceFiles('src').map((path) => ({
    path: path.replace(/\\/g, '/'),
    content: readFileSync(path, 'utf8'),
}));

/** Cherche les points de lecture d'une entité dans le code. */
function findConsumers(entity) {
    const readers = [
        new RegExp(`useEntityOverlays\\(\\s*'${entity}'`),
        new RegExp(`getEntityOverlays\\(\\s*'${entity}'`),
        new RegExp(`fetchOverlay\\(\\s*'${entity}'`),
    ];

    const indirect = INDIRECT_EVIDENCE.get(entity);
    if (indirect) readers.push(indirect);

    return files
        .filter((file) => readers.some((reader) => reader.test(file.content)))
        .map((file) => file.path);
}

console.log('');
console.log('Entité            Overlays EN   Points de lecture');
console.log('---------------------------------------------------------------');

const orphans = [];

for (const entity of entities) {
    const count = overlayCount.get(entity) ?? 0;
    const consumers = findConsumers(entity);
    const exception = DOCUMENTED_EXCEPTIONS.get(entity);

    let status = 'aucun';
    if (consumers.length) {
        status = `${consumers.length} fichier(s)`;
    } else if (exception) {
        status = 'exception documentée';
    }

    if (count > 0 && !consumers.length && !exception) orphans.push({ entity, count });

    console.log(`${entity.padEnd(18)} ${String(count).padStart(10)}   ${status}`);
}

if (DOCUMENTED_EXCEPTIONS.size) {
    console.log('');
    console.log('Exceptions documentées :');
    for (const [entity, reason] of DOCUMENTED_EXCEPTIONS) {
        console.log(`   - ${entity} : ${reason}`);
    }
}

console.log('');

if (orphans.length) {
    console.log(
        `❌ ${orphans.length} entité(s) traduite(s) mais JAMAIS lue(s) — travail invisible et site partiellement français :`
    );
    for (const orphan of orphans) {
        console.log(`   - ${orphan.entity} : ${orphan.count} overlay(s) sans consommateur dans src/`);
    }
    console.log('');
    process.exit(2);
}

console.log('✅ Toute entité traduite possède un point de lecture dans src/.');
console.log('');
