import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3112;
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * Tue tout processus qui écoute déjà sur le port cible.
 * Indispensable sous Windows : `server.kill()` ne tue que le shell `cmd.exe`
 * intermédiaire et laisse le vrai `next start` orphelin, ce qui fait que le
 * run suivant se reconnecte silencieusement à l'ancien serveur (métadonnées périmées).
 */
const killPort = () => {
    try {
        const out = execSync(`netstat -ano | findstr ":${PORT}"`, { encoding: 'utf8' });
        const pids = new Set(
            out
                .split(/\r?\n/)
                .filter((l) => l.includes('LISTENING'))
                .map((l) => l.trim().split(/\s+/).pop())
                .filter((p) => p && p !== '0')
        );
        for (const pid of pids) {
            try {
                execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
            } catch {
                /* déjà mort */
            }
        }
    } catch {
        /* rien n'écoute sur le port */
    }
};

killPort();

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
];

const get = (url, mod = http) =>
    new Promise((resolve, reject) => {
        mod
            .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
                const c = [];
                r.on('data', (d) => c.push(d));
                r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(c).toString('utf8') }));
            })
            .on('error', reject);
    });

const waitForServer = async (tries = 60) => {
    for (let i = 0; i < tries; i++) {
        try {
            await get(`${BASE}/robots.txt`);
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
    detached: false,
});
let log = '';
server.stdout.on('data', (d) => (log += d.toString()));
server.stderr.on('data', (d) => (log += d.toString()));

if (!(await waitForServer())) {
    console.error('Server failed:\n', log);
    server.kill();
    process.exit(1);
}
console.log('Server up.\n');

let failures = 0;

console.log('=== SEO / METADATA PAR PAGE ===');
for (const route of ROUTES) {
    const { body } = await get(`${BASE}${route}`);
    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const desc = (body.match(/name="description" content="([^"]*)"/) || [])[1] || '';
    const canonical = (body.match(/rel="canonical" href="([^"]*)"/) || [])[1] || '';
    const ogTitle = (body.match(/property="og:title" content="([^"]*)"/) || [])[1] || '';
    const ogImg = (body.match(/property="og:image" content="([^"]*)"/) || [])[1] || '';
    const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
    const h1Text = h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

    const issues = [];
    if (!title) issues.push('no-title');
    if (!desc) issues.push('no-desc');
    if (!canonical) issues.push('no-canonical');
    if (!ogTitle) issues.push('no-og:title');
    if (!ogImg) issues.push('no-og:image');
    if (!h1Text) issues.push('no-h1');
    if (title.length > 70) issues.push(`title-long(${title.length})`);
    if (desc.length > 175) issues.push(`desc-long(${desc.length})`);

    if (issues.length) failures++;
    console.log(`  ${issues.length ? 'WARN' : 'OK  '} ${route}`);
    console.log(`       title: ${title.slice(0, 68)}`);
    console.log(`       desc : ${desc.slice(0, 68)}`);
    console.log(`       h1   : ${h1Text.slice(0, 68)}`);
    if (issues.length) console.log(`       ISSUES: ${issues.join(', ')}`);
}

console.log('\n=== IMAGES DISTANTES (echantillon) ===');
const remoteRefs = new Set();
const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(e.name)) {
            const txt = fs.readFileSync(full, 'utf8');
            for (const m of txt.matchAll(/['"](https:\/\/www\.campus-universcascades\.com\/[^'"]+\.(?:jpg|jpeg|png|webp))['"]/g)) {
                remoteRefs.add(m[1]);
            }
        }
    }
};
walk(path.join(process.cwd(), 'src'));
const all = [...remoteRefs];
console.log(`  ${all.length} images distantes referencees au total`);
const sample = all.filter((_, i) => i % Math.max(1, Math.floor(all.length / 25)) === 0).slice(0, 25);
let remoteFail = 0;
for (const url of sample) {
    try {
        const { status } = await get(url, https);
        const good = status === 200;
        if (!good) {
            remoteFail++;
            failures++;
        }
        console.log(`  ${good ? 'OK ' : 'FAIL'} ${status} ${url.split('/').pop()}`);
    } catch (e) {
        remoteFail++;
        failures++;
        console.log(`  FAIL ERR ${url.split('/').pop()} :: ${e.message}`);
    }
}
console.log(`  ${sample.length} testees, ${remoteFail} en echec`);

// `server.kill()` ne suffit pas sous Windows (shell intermédiaire) : on tue
// l'arbre de processus complet via le port pour ne laisser aucun orphelin.
killPort();
console.log(`\n=== RESULTAT: ${failures === 0 ? 'TOUT OK' : failures + ' PROBLEME(S)'} ===`);
process.exit(failures === 0 ? 0 : 1);
