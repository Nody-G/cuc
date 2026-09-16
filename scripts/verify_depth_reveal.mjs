import { spawn, execSync } from 'node:child_process';
import http from 'node:http';

const PORT = 3113;
const BASE = `http://127.0.0.1:${PORT}`;

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
        /* rien n'écoute */
    }
};

const get = (url) =>
    new Promise((resolve, reject) => {
        http
            .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
                const c = [];
                r.on('data', (d) => c.push(d));
                r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(c).toString('utf8') }));
            })
            .on('error', reject);
    });

killPort();
console.log('Starting production server...');
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
server.stdout.on('data', (d) => (log += d.toString()));
server.stderr.on('data', (d) => (log += d.toString()));

let up = false;
for (let i = 0; i < 60; i++) {
    try {
        await get(`${BASE}/robots.txt`);
        up = true;
        break;
    } catch {
        await new Promise((r) => setTimeout(r, 500));
    }
}
if (!up) {
    console.error('Server failed:\n', log);
    killPort();
    process.exit(1);
}
console.log('Server up.\n');

const { body } = await get(`${BASE}/`);

const CHECKS = {
    'Section Depth Reveal (ancre aria)': 'depth-reveal-title',
    'Titre « Six hectares »': 'Six hectares',
    'Sous-titre « taillés pour l’action »': 'taillés pour l’action',
    'Tuile Formation Pro': 'Formation Pro',
    'Tuile Visite Guidée': 'Visite Guidée',
    'Tuile Équipe & Formateurs': 'Formateurs',
    'Tuile Stages Immersion': 'Stages Immersion',
    'Rail de progression': 'Progression',
    'Grain argentique (film-grain)': 'film-grain',
    'Grille tactique (depth-grid)': 'depth-grid',
    'Scanline dorée': 'scanline-gold',
    'Traitement duotone': 'duotone-cuc',
    'Lien /formation-de-cascadeur': 'href="/formation-de-cascadeur"',
    'Lien /visite-guidee': 'href="/visite-guidee"',
    'Lien /equipe-cascadeurs-pro': 'href="/equipe-cascadeurs-pro"',
    'Lien /stages-cascades-parkour-2': 'href="/stages-cascades-parkour-2"',
};

// Mode debug : affiche le contexte HTML autour du libellé « Formateurs »
// pour diagnostiquer les écarts d'encodage (apostrophes typographiques, &).
if (process.argv.includes('--debug')) {
    const i = body.indexOf('Formateurs');
    console.log('CONTEXTE HTML:', JSON.stringify(body.slice(Math.max(0, i - 160), i + 80)));
    console.log('');
}

console.log('=== RENDU DE LA SECTION DEPTH REVEAL (page d’accueil) ===');
let ok = 0;
let bad = 0;
for (const [label, needle] of Object.entries(CHECKS)) {
    const found = body.includes(needle);
    console.log(`  ${found ? 'OK  ' : 'FAIL'} ${label}`);
    found ? ok++ : bad++;
}

killPort();
console.log(`\n=== RESULTAT: ${bad === 0 ? 'TOUT OK' : bad + ' MANQUANT(S)'} (${ok}/${ok + bad}) ===`);
process.exit(bad === 0 ? 0 : 1);
