import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3111;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
    '/',
    '/animations-airbag-parkour',
    '/contact-cuc',
    '/cuc-events-agence',
    '/cuc-team-cascadeur',
    '/equipe-cascadeurs-pro',
    '/formation-de-cascadeur',
    '/partenaires',
    '/spectacles-cascadeurs-yamakasi',
    '/stages-cascades-parkour-2',
    '/stunt-workshop-cuc',
    '/team-building-cascades',
    '/videos-cascadeur',
    '/visite-guidee',
    '/visite-virtuelle',
    '/robots.txt',
    '/sitemap.xml',
];

const fetchText = (url) =>
    new Promise((resolve, reject) => {
        http
            .get(url, (r) => {
                const c = [];
                r.on('data', (d) => c.push(d));
                r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(c).toString('utf8'), headers: r.headers }));
            })
            .on('error', reject);
    });

const waitForServer = async (tries = 60) => {
    for (let i = 0; i < tries; i++) {
        try {
            await fetchText(`${BASE}/robots.txt`);
            return true;
        } catch {
            await new Promise((r) => setTimeout(r, 500));
        }
    }
    return false;
};

console.log('Starting production server...');
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d.toString()));
server.stderr.on('data', (d) => (serverLog += d.toString()));

const ok = await waitForServer();
if (!ok) {
    console.error('Server did not start. Log:\n', serverLog);
    server.kill();
    process.exit(1);
}
console.log('Server up.\n');

let failures = 0;

console.log('=== ROUTES HTTP ===');
for (const route of ROUTES) {
    try {
        const { status, body } = await fetchText(`${BASE}${route}`);
        const isHtml = route.endsWith('.txt') || route.endsWith('.xml') ? true : body.includes('</html>');
        const good = status === 200 && isHtml;
        if (!good) failures++;
        console.log(`  ${good ? 'OK ' : 'FAIL'} ${status} ${route}${good ? '' : ' (html=' + isHtml + ')'}`);
    } catch (e) {
        failures++;
        console.log(`  FAIL ERR ${route} :: ${e.message}`);
    }
}

console.log('\n=== MARQUEURS DE CONTENU (page d\'accueil) ===');
const home = await fetchText(`${BASE}/`);
const homeChecks = [
    ['Titre CUC', /Campus Univers Cascades/i],
    ['Hero slider', /slider-6-scaled\.jpg/],
    ['Logo CUC', /cuc-logo-yellow\.png/],
    ['Section partenaires', /partenaire/i],
    ['JSON-LD', /application\/ld\+json/],
    ['Canonical', /rel="canonical"/],
    ['Meta description', /name="description"/],
    ['OpenGraph', /property="og:title"/],
];
for (const [label, re] of homeChecks) {
    const good = re.test(home.body);
    if (!good) failures++;
    console.log(`  ${good ? 'OK ' : 'FAIL'} ${label}`);
}

console.log('\n=== IMAGES LOCALES REFERENCEES (public/) ===');
const srcDir = path.join(process.cwd(), 'src');
const localRefs = new Set();
const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
            const txt = fs.readFileSync(full, 'utf8');
            for (const m of txt.matchAll(/['"](\/images\/[^'"]+)['"]/g)) localRefs.add(m[1]);
        }
    }
};
walk(srcDir);
let missing = 0;
for (const ref of [...localRefs].sort()) {
    const p = path.join(process.cwd(), 'public', ref);
    const exists = fs.existsSync(p);
    if (!exists) {
        missing++;
        failures++;
        console.log(`  MISSING ${ref}`);
    }
}
console.log(`  ${localRefs.size} refs locales, ${missing} manquante(s)`);

console.log('\n=== IMAGES LOCALES SERVIES (HTTP) ===');
const sample = [...localRefs].slice(0, 12);
for (const ref of sample) {
    try {
        const { status } = await fetchText(`${BASE}${ref}`);
        const good = status === 200;
        if (!good) failures++;
        console.log(`  ${good ? 'OK ' : 'FAIL'} ${status} ${ref}`);
    } catch (e) {
        failures++;
        console.log(`  FAIL ERR ${ref} :: ${e.message}`);
    }
}

console.log('\n=== SITEMAP / ROBOTS ===');
const sm = await fetchText(`${BASE}/sitemap.xml`);
const urlCount = (sm.body.match(/<url>/g) || []).length;
console.log(`  sitemap.xml: ${sm.status}, ${urlCount} URLs`);
const rb = await fetchText(`${BASE}/robots.txt`);
console.log(`  robots.txt: ${rb.status}, ${rb.body.split('\n').length} lignes`);

server.kill();
console.log(`\n=== RESULTAT: ${failures === 0 ? 'TOUT OK' : failures + ' ECHEC(S)'} ===`);
process.exit(failures === 0 ? 0 : 1);
