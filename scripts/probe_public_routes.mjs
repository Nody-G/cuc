/**
 * Sonde les routes publiques du site vitrine et rapporte le code HTTP réel.
 *
 * Objectif : reproduire la panne « This page couldn't load » en local et
 * identifier précisément quelles routes échouent côté serveur.
 *
 * Usage : node scripts/probe_public_routes.mjs [baseUrl]
 *   baseUrl par défaut : http://localhost:3100
 */
const BASE = process.argv[2] || 'http://localhost:3100';

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
    '/admin',
];

async function probe(path) {
    const url = `${BASE}${path}`;
    try {
        const res = await fetch(url, { redirect: 'manual' });
        const body = await res.text();
        // Détecter les signatures d'erreur Next.js / navigateur
        const isNextError =
            body.includes('Application error') ||
            body.includes('Internal Server Error') ||
            body.includes('__next_error__') ||
            body.includes('This page couldn');
        return {
            path,
            status: res.status,
            ok: res.ok,
            bytes: body.length,
            errorSignature: isNextError,
            snippet: isNextError ? body.slice(0, 300).replace(/\s+/g, ' ') : '',
        };
    } catch (err) {
        return { path, status: 0, ok: false, bytes: 0, errorSignature: true, snippet: String(err) };
    }
}

async function main() {
    console.log(`=== Sonde des routes publiques — ${BASE} ===\n`);
    const results = [];
    for (const route of ROUTES) {
        const r = await probe(route);
        results.push(r);
        const flag = r.ok && !r.errorSignature ? 'OK ' : 'ERR';
        console.log(`[${flag}] ${String(r.status).padEnd(4)} ${route.padEnd(34)} ${r.bytes} octets`);
        if (r.snippet) console.log(`        ↳ ${r.snippet.slice(0, 200)}`);
    }

    const failures = results.filter((r) => !r.ok || r.errorSignature);
    console.log(`\n=== Bilan : ${results.length - failures.length}/${results.length} routes saines ===`);
    if (failures.length > 0) {
        console.log('Routes en échec :');
        failures.forEach((f) => console.log(`  - ${f.path} (HTTP ${f.status})`));
        process.exit(2);
    }
}

main().catch((err) => {
    console.error('Échec de la sonde :', err);
    process.exit(1);
});
