#!/usr/bin/env node
/**
 * Vérifie que l'optimiseur d'images Next.js accepte bien les hôtes Supabase
 * en production (correctif `remotePatterns`).
 *
 * Avant correctif : `/_next/image?url=https://xkbkcsypftvspmkfnrfm.supabase.co/...`
 * renvoyait systématiquement HTTP 400 (hôte absent de l'allowlist).
 *
 * Ce script :
 *   1. récupère une vraie URL d'IMAGE Supabase depuis les pages publiques ;
 *   2. la passe à `/_next/image` sur la production ;
 *   3. exige un HTTP 200 avec un Content-Type image/*.
 *
 * Les PDF et vidéos sont ignorés : next/image les rejette légitimement en 400,
 * ce qui produirait un faux négatif.
 *
 * Usage :
 *   node scripts/verify_prod_image_optimizer.mjs [baseUrl]
 *
 * Sortie :
 *   0 = optimiseur OK
 *   2 = régression (400 ou Content-Type inattendu)
 */

const BASE = (process.argv[2] || 'https://cuc-new.vercel.app').replace(/\/$/, '');
const SUPABASE_HOST = 'xkbkcsypftvspmkfnrfm.supabase.co';

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** Extensions réellement optimisables par next/image. */
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i;

async function get(url) {
    return fetch(url, { headers: { 'User-Agent': UA } });
}

/**
 * Extrait les URLs Supabase Storage d'IMAGES présentes dans le HTML.
 */
function extractSupabaseImageUrls(html) {
    const urls = new Set();

    // URL directe dans le HTML
    const direct = /https:\/\/xkbkcsypftvspmkfnrfm\.supabase\.co\/storage\/v1\/object\/public\/[^"'\s,)]+/g;
    let m;
    while ((m = direct.exec(html)) !== null) urls.add(m[0]);

    // URL encodée dans /_next/image?url=...
    const encoded = /url=([^&"']*xkbkcsypftvspmkfnrfm[^&"']*)/g;
    while ((m = encoded.exec(html)) !== null) {
        try {
            urls.add(decodeURIComponent(m[1]));
        } catch {
            /* ignore */
        }
    }

    return [...urls].filter((u) => IMAGE_EXT.test(u));
}

async function main() {
    console.log(`=== Vérification de l'optimiseur d'images — ${BASE} ===\n`);

    // 1. Trouver une vraie image Supabase
    let candidate = null;
    for (const route of ['/equipe-cascadeurs-pro', '/cuc-team-cascadeur', '/', '/partenaires']) {
        let html;
        try {
            const res = await get(`${BASE}${route}`);
            if (!res.ok) continue;
            html = await res.text();
        } catch {
            continue;
        }
        const urls = extractSupabaseImageUrls(html);
        if (urls.length > 0) {
            candidate = urls[0];
            console.log(`Image Supabase trouvée sur ${route} :`);
            console.log(`  ${candidate}\n`);
            break;
        }
    }

    if (!candidate) {
        console.error(
            "⚠️  Aucune URL d'image Supabase trouvée dans le HTML public.\n" +
            "   Impossible de tester l'optimiseur avec un asset réel."
        );
        process.exit(2);
    }

    // 2. Vérifier que l'asset source existe réellement
    const srcRes = await get(candidate);
    if (!srcRes.ok) {
        console.error(`❌ L'asset source renvoie HTTP ${srcRes.status} — test non concluant.`);
        process.exit(2);
    }
    console.log(`[OK ] Asset source accessible (HTTP ${srcRes.status})`);

    // 3. Passer par l'optimiseur Next.js
    const optimized = `${BASE}/_next/image?url=${encodeURIComponent(candidate)}&w=384&q=75`;
    const optRes = await get(optimized);
    const ct = optRes.headers.get('content-type') || '';

    if (optRes.status !== 200) {
        console.error(
            `\n❌ /_next/image renvoie HTTP ${optRes.status} pour un hôte Supabase.\n` +
            `   → remotePatterns ne couvre pas ${SUPABASE_HOST}.\n` +
            `   Vérifiez next.config.ts (images.remotePatterns) et redéployez.`
        );
        process.exit(2);
    }

    if (!ct.startsWith('image/')) {
        console.error(`\n❌ Content-Type inattendu : ${ct} (attendu image/*).`);
        process.exit(2);
    }

    console.log(`[OK ] /_next/image renvoie HTTP 200 (${ct})`);
    console.log("\n✅ Optimiseur d'images opérationnel pour les hôtes Supabase.");
}

main().catch((err) => {
    console.error(`❌ Erreur inattendue : ${err.message}`);
    process.exit(2);
});
