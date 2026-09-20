#!/usr/bin/env node
/**
 * Vérifie que le correctif Realtime est bien présent dans le bundle JS servi
 * par la production Vercel.
 *
 * Contexte : un probe HTTP ne peut pas détecter un crash React côté client.
 * Ce script télécharge les chunks JS référencés par la page d'accueil et
 * cherche les helpers `createSafeChannel` / `removeSafeChannel`.
 *
 * Pourquoi ces marqueurs ? Le template literal `${base}#${seq}` de
 * `uniqueChannelName()` est compilé en concaténation : la chaîne littérale
 * `site_social_links#` n'existe JAMAIS dans le bundle. En revanche, les noms
 * des helpers importés nommément depuis `@/lib/supabase/realtime` survivent à
 * la minification. Leur présence prouve que le correctif est déployé.
 *
 * Usage :
 *   node scripts/verify_prod_bundle_fix.mjs [baseUrl]
 *
 * Sortie :
 *   0 = correctif présent dans le bundle
 *   2 = correctif absent (déploiement obsolète ou régression)
 */

const BASE = (process.argv[2] || 'https://cuc-new.vercel.app').replace(/\/$/, '');

/** Marqueurs attendus dans le bundle client après correctif. */
const MARKERS = [
    { label: 'helper removeSafeChannel', re: /removeSafeChannel/ },
    { label: 'helper createSafeChannel', re: /createSafeChannel/ },
];

async function fetchText(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
    return res.text();
}

function extractChunkUrls(html) {
    const urls = new Set();
    const re = /\/_next\/static\/[^"'\s)]+\.js/g;
    let m;
    while ((m = re.exec(html)) !== null) urls.add(m[0]);
    return [...urls];
}

async function main() {
    console.log(`=== Vérification du bundle production — ${BASE} ===\n`);

    let html;
    try {
        html = await fetchText(`${BASE}/`);
    } catch (err) {
        console.error(`❌ Impossible de charger la page d'accueil : ${err.message}`);
        process.exit(2);
    }

    const chunks = extractChunkUrls(html);
    console.log(`Chunks JS référencés par la page d'accueil : ${chunks.length}\n`);

    if (chunks.length === 0) {
        console.error('❌ Aucun chunk JS trouvé dans le HTML — structure inattendue.');
        process.exit(2);
    }

    const hits = new Map(MARKERS.map((m) => [m.label, []]));
    let scanned = 0;

    for (const chunk of chunks) {
        let js;
        try {
            js = await fetchText(`${BASE}${chunk}`);
        } catch {
            continue; // chunk non critique / supprimé
        }
        scanned += 1;
        for (const marker of MARKERS) {
            if (marker.re.test(js)) hits.get(marker.label).push(chunk);
        }
    }

    console.log(`Chunks analysés : ${scanned}\n`);

    let missing = 0;
    for (const marker of MARKERS) {
        const found = hits.get(marker.label);
        if (found.length > 0) {
            console.log(`[OK ] ${marker.label} — ${found.length} chunk(s)`);
        } else {
            console.log(`[MANQUANT] ${marker.label}`);
            missing += 1;
        }
    }

    console.log('');
    if (missing > 0) {
        console.error(
            `❌ Correctif ABSENT du bundle en ligne (${missing} marqueur(s) manquant(s)).\n` +
            `   Le déploiement Vercel n'a probablement pas encore pris le commit 4efff33.\n` +
            `   Vérifiez le tableau de bord Vercel puis relancez ce script.`
        );
        process.exit(2);
    }

    console.log('✅ Correctif Realtime présent dans le bundle de production.');
    console.log('   Les canaux utilisent des noms uniques — plus de collision .on() après .subscribe().');
}

main().catch((err) => {
    console.error(`❌ Erreur inattendue : ${err.message}`);
    process.exit(2);
});
