/**
 * GARDE-FOU POST-DÉPLOIEMENT — SONDE DE PRODUCTION
 * ================================================
 *
 * Objectif : détecter automatiquement une régression de la panne
 * « This page couldn't load » AVANT que l'utilisateur ne la constate.
 *
 * Contexte : la panne du site vitrine provenait d'une exception client non
 * capturée (canal Realtime `site_social_links:all` déjà souscrit). Le serveur
 * répondait 200 avec le HTML, mais le navigateur remplaçait la page par la
 * frontière `global-error`. Une sonde HTTP seule ne suffit donc PAS : il faut
 * aussi vérifier que le HTML servi contient bien le contenu attendu et non
 * une signature d'erreur.
 *
 * Usage :
 *   node scripts/probe_production_guard.mjs
 *   node scripts/probe_production_guard.mjs https://cuc-new.vercel.app
 *
 * Sortie : code 0 si tout est sain, code 2 si une régression est détectée.
 */
const BASE = process.argv[2] || 'https://cuc-new.vercel.app';

const ROUTES = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur',
    '/partenaires',
    '/visite-guidee',
    '/visite-virtuelle',
    '/videos-cascadeur',
    '/contact-cuc',
    '/team-building-cascades',
    '/animations-airbag-parkour',
    '/spectacles-cascadeurs-yamakasi',
    '/stunt-workshop-cuc',
    '/cuc-events-agence',
];

// Signatures qui trahissent une page d'erreur (Next.js ou frontière d'erreur).
const ERROR_SIGNATURES = [
    'This page couldn',
    'Application error',
    'Internal Server Error',
    '__next_error__',
    'Une erreur est survenue',
];

// Marqueur de contenu réel attendu sur toutes les pages du site.
const CONTENT_MARKER = 'Campus Univers Cascades';

async function probe(path) {
    const url = `${BASE}${path}`;
    try {
        const res = await fetch(url, {
            redirect: 'follow',
            headers: {
                // Se présenter comme un navigateur réel : Vercel peut servir
                // des réponses différentes aux clients non navigateur.
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml',
            },
        });

        const body = await res.text();
        const errorSignature = ERROR_SIGNATURES.find((sig) => body.includes(sig));
        const hasContent = body.includes(CONTENT_MARKER);

        return {
            path,
            status: res.status,
            ok: res.ok && !errorSignature && hasContent,
            bytes: body.length,
            errorSignature: errorSignature || null,
            hasContent,
        };
    } catch (err) {
        return {
            path,
            status: 0,
            ok: false,
            bytes: 0,
            errorSignature: String(err),
            hasContent: false,
        };
    }
}

async function main() {
    console.log(`=== Garde-fou production — ${BASE} ===\n`);

    const results = [];
    for (const route of ROUTES) {
        const r = await probe(route);
        results.push(r);

        const tag = r.ok ? 'OK ' : 'FAIL';
        const detail = r.errorSignature
            ? `signature: "${r.errorSignature}"`
            : !r.hasContent
                ? 'marqueur de contenu absent'
                : `${r.bytes} octets`;

        console.log(`[${tag}] ${String(r.status).padEnd(3)} ${r.path.padEnd(34)} ${detail}`);
    }

    const failed = results.filter((r) => !r.ok);
    console.log('');

    if (failed.length > 0) {
        console.error(`❌ RÉGRESSION DÉTECTÉE — ${failed.length}/${results.length} route(s) en échec :`);
        for (const f of failed) {
            console.error(`   • ${f.path} (HTTP ${f.status}) — ${f.errorSignature || 'contenu manquant'}`);
        }
        console.error('\n   → Vérifier les logs console navigateur et le déploiement Vercel.');
        process.exit(2);
    }

    console.log(`✅ Production saine — ${results.length}/${results.length} routes vérifiées.`);
}

main().catch((err) => {
    console.error('❌ Erreur de sonde :', err.message);
    process.exit(2);
});
