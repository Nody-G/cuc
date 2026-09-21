#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Rôles réellement enregistrés pour les productions mises en avant (accueil)
 * ==============================================================================
 * Les légendes des jaquettes de l'accueil (« Cascades & combats », « Cascadeurs
 * CUC (tournage Paris) », « Équipe cascades CUC »…) étaient écrites en dur dans
 * `messages/fr.json`. Ce script lit ce que la base contient VRAIMENT pour ces
 * productions (rôles par coach, coachs impliqués, comédiens doublés) afin de
 * n'afficher qu'un fait vérifié.
 *
 * Lecture seule.
 * Usage : node scripts/inspect_home_featured_roles.mjs
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

/** Les 4 productions mises en avant par `HomeTournagesSection`. */
const FEATURED = [
    'Le Comte de Monte-Cristo',
    'John Wick : Chapitre 4',
    'The Substance',
    "L'Amour Ouf",
];

/** Clé de comparaison de titre (sans année, accents, ponctuation). */
const titleKey = (value) =>
    String(value || '')
        .replace(/\(\d{4}(?:-\d{4})?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const films = await rest(
    'site_films?select=id,title,year,category,tag,stunt_roles,metadata,cuc_team_involved'
);
const team = await rest('site_team?select=id,name,title,doubled_actors');
const teamById = new Map(team.map((m) => [m.id, m]));

console.log('=== PRODUCTIONS MISES EN AVANT SUR L’ACCUEIL ===\n');

for (const title of FEATURED) {
    const film = films.find((f) => titleKey(f.title) === titleKey(title));
    console.log(`■ ${title}`);
    if (!film) {
        console.log('   ⚠️ Aucune fiche correspondante dans site_films.\n');
        continue;
    }
    console.log(`   id : ${film.id} | année : ${film.year ?? '—'} | catégorie : ${film.category || '—'}`);
    console.log(`   tag : ${film.tag ? `« ${film.tag} »` : '(vide)'}`);

    const roles = film.metadata?.cuc_team_roles || {};
    const involved = new Set([
        ...(Array.isArray(film.cuc_team_involved) ? film.cuc_team_involved : []),
        ...Object.keys(roles),
    ]);

    if (involved.size === 0) {
        console.log('   ℹ️ Aucun coach CUC rattaché à cette fiche.');
    } else {
        for (const memberId of involved) {
            const member = teamById.get(memberId);
            const role = roles[memberId] || film.stunt_roles || '(non renseigné)';
            const doubled = Array.isArray(member?.doubled_actors) ? member.doubled_actors : [];
            console.log(
                `   • ${member ? member.name : memberId} (${memberId}) → « ${role} »${doubled.length > 0 ? ` | doublures déclarées : ${doubled.join(', ')}` : ''
                }`
            );
        }
    }

    const metadataKeys = Object.keys(film.metadata || {});
    if (metadataKeys.length > 0) {
        console.log(`   metadata : ${metadataKeys.join(', ')}`);
    }
    console.log('');
}

console.log('=== COMÉDIENS DOUBLÉS DÉCLARÉS (site_team) ===');
for (const member of team) {
    const doubled = Array.isArray(member.doubled_actors) ? member.doubled_actors : [];
    if (doubled.length > 0) {
        console.log(`  • ${member.name} : ${doubled.join(', ')}`);
    }
}

console.log('\n=== ÉTAT « The Substance » / « John Wick 4 » chez les coachs ===');
const needles = ['Substance', 'John Wick', 'Monte-Cristo', "L'Amour Ouf", 'Amour Ouf'];
const credits = await rest('site_team?select=id,name,notable_credits');
for (const member of credits) {
    const list = Array.isArray(member.notable_credits) ? member.notable_credits : [];
    const hits = list.filter((c) => needles.some((n) => String(c).toLowerCase().includes(n.toLowerCase())));
    if (hits.length > 0) {
        console.log(`  • ${member.name} : ${hits.map((h) => `« ${h} »`).join(' | ')}`);
    }
}
