#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Inspection : libellés de rôle affichés sur les jaquettes
 * ==============================================================================
 * Les jaquettes portent, sous forme de légende, le rôle tenu par le coach
 * (« Cascadeurs CUC (Tournage Paris) »…). Ces libellés viennent de
 * `site_films.stunt_roles`, `site_films.metadata.cuc_team_roles` et du miroir
 * `site_settings.films`. Lecture seule.
 *
 * Usage : node scripts/inspect_film_role_labels.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

/** Libellés interdits par la doctrine « zéro invention » : auto-références au campus. */
const SUSPECT =
    /(Équipe cascades CUC|Cascadeurs CUC|Doublures cascades CUC|CUC Performers|CUC Team|Performers de Combat|Spécialistes Rigging|Co-fondateur CUC|Stunt Support|Stunt Doubling|Enforcers|Tournage Paris|tournage paris|\(tournage)/i;

const films = await rest('site_films?select=id,title,stunt_roles,metadata&order=title.asc');

console.log(`=== Libellés de rôle — ${films.length} films ===`);

const counts = new Map();
const suspects = [];

for (const film of films) {
    const labels = [];
    if (typeof film.stunt_roles === 'string' && film.stunt_roles.trim() !== '') {
        labels.push({ source: 'stunt_roles', value: film.stunt_roles.trim() });
    }
    const roles = film.metadata?.cuc_team_roles;
    if (roles && typeof roles === 'object') {
        for (const [memberId, role] of Object.entries(roles)) {
            if (typeof role === 'string' && role.trim() !== '') {
                labels.push({ source: `cuc_team_roles.${memberId}`, value: role.trim() });
            }
        }
    }
    const metaRoles = film.metadata?.roles;
    if (Array.isArray(metaRoles)) {
        metaRoles.forEach((role, i) => {
            if (typeof role === 'string' && role.trim() !== '') {
                labels.push({ source: `metadata.roles[${i}]`, value: role.trim() });
            }
        });
    }

    for (const label of labels) {
        counts.set(label.value, (counts.get(label.value) || 0) + 1);
        if (SUSPECT.test(label.value)) {
            suspects.push({ film: film.id, title: film.title, ...label });
        }
    }
}

console.log('\n--- Libellés de rôle les plus fréquents ---');
for (const [value, count] of [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60)) {
    console.log(`${String(count).padStart(4)} × « ${value} »`);
}

console.log(`\n--- Libellés suspects (« CUC », « tournage »…) : ${suspects.length} ---`);
for (const s of suspects.slice(0, 80)) {
    console.log(`  • ${s.film} | « ${s.title} » | ${s.source} = « ${s.value} »`);
}

/* ------------------------------------------------------------------ *
 * 2. Coachs : libellés de crédits et rôles de film
 * ------------------------------------------------------------------ */
const team = await rest('site_team?select=id,name,notable_credits,featured_credits,metadata');

console.log(`\n=== Libellés de crédits des coachs (site_team) — ${team.length} coachs ===`);
const coachSuspects = [];

for (const member of team) {
    const credits = Array.isArray(member.notable_credits) ? member.notable_credits : [];
    for (const credit of credits) {
        if (SUSPECT.test(String(credit))) {
            coachSuspects.push({ coach: member.id, source: 'notable_credits', value: credit });
        }
    }
    const filmRoles = member.metadata?.film_roles;
    if (filmRoles && typeof filmRoles === 'object') {
        for (const [filmId, role] of Object.entries(filmRoles)) {
            if (SUSPECT.test(String(role))) {
                coachSuspects.push({
                    coach: member.id,
                    source: `metadata.film_roles.${filmId}`,
                    value: role,
                });
            }
        }
    }
    for (const [key, value] of Object.entries(member.metadata || {})) {
        if (key === 'film_roles') continue;
        if (typeof value === 'string' && SUSPECT.test(value)) {
            coachSuspects.push({ coach: member.id, source: `metadata.${key}`, value });
        }
    }
}

console.log(`--- Libellés suspects chez les coachs : ${coachSuspects.length} ---`);
for (const s of coachSuspects.slice(0, 60)) {
    console.log(`  • ${s.coach} | ${s.source} = « ${s.value} »`);
}
if (coachSuspects.length === 0) console.log('  (aucun)');

/* Échantillon de libellés de crédits pour contrôle visuel */
console.log('\n--- Échantillon de libellés de crédits (20) ---');
for (const member of team.slice(0, 6)) {
    const credits = Array.isArray(member.notable_credits) ? member.notable_credits : [];
    for (const credit of credits.slice(0, 4)) {
        console.log(`  • ${member.id} : « ${credit} »`);
    }
}

const settings = await rest('site_settings?select=key,value&key=eq.films');
const mirror = settings?.[0]?.value?.list;
console.log(
    `\n--- Miroir site_settings.films : ${Array.isArray(mirror) ? mirror.length : 0} film(s) ---`
);
if (Array.isArray(mirror)) {
    const flat = JSON.stringify(mirror);
    const hits = flat.match(new RegExp(`.{0,100}${SUSPECT.source}.{0,100}`, 'gi')) || [];
    console.log(`  Occurrences suspectes dans le miroir : ${hits.length}`);
    for (const hit of hits.slice(0, 20)) console.log(`  • …${hit}…`);
}
