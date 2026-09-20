/**
 * ==============================================================================
 * CUC — Synchronisation des crédits coachs vers Supabase
 * ==============================================================================
 * Synchronise les crédits validés (issus de src/data/team.ts après application)
 * vers les tables du site vitrine :
 *
 *   site_team  : notable_credits, doubled_actors, metadata.film_roles, imdb
 *   site_films : cuc_team_involved, metadata.cuc_team_roles
 *
 * Conformité doctrinale :
 *   - Tables strictement préfixées `site_` (isolation CUC Sign préservée)
 *   - Aucune écriture dans les tables CUC Sign (formations, profiles, locations)
 *   - Upsert idempotent : relancer le script ne crée aucun doublon
 *
 * Usage :
 *   node scripts/sync_coach_credits_supabase.mjs --dry-run   (aperçu, défaut)
 *   node scripts/sync_coach_credits_supabase.mjs --write     (écriture réelle)
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { loadCurrentTeam } from './lib/credit-verifier.mjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Variables Supabase manquantes dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

/**
 * Charge la filmographie locale pour reconstruire les liens coach ↔ film.
 * @returns {any[]}
 */
function loadFilms() {
    const filmPath = path.resolve(process.cwd(), 'src', 'data', 'filmography.ts');
    const code = fs.readFileSync(filmPath, 'utf8');
    const start = code.indexOf('export const FILMOGRAPHY_CREDITS: FilmCredit[] = [');
    if (start === -1) throw new Error('Impossible de parser FILMOGRAPHY_CREDITS');
    const jsonStart = code.indexOf('[', start);
    const jsonEnd = code.lastIndexOf(']');
    return JSON.parse(code.slice(jsonStart, jsonEnd + 1));
}

async function main() {
    const write = process.argv.includes('--write');

    console.log('=== SYNCHRONISATION DES CRÉDITS COACHS VERS SUPABASE ===\n');
    console.log(write ? '⚠ MODE ÉCRITURE RÉELLE\n' : 'ℹ MODE APERÇU (--dry-run par défaut)\n');

    const team = loadCurrentTeam();
    const films = loadFilms();

    // ---------------------------------------------------------------------------
    // 1. site_team
    // ---------------------------------------------------------------------------
    console.log('--- 1. site_team ---');
    let teamOk = 0;
    let teamFail = 0;

    for (const member of team) {
        const payload = {
            name: member.name,
            role: member.role,
            title: member.title,
            specialties: member.specialties || [],
            bio: member.bio || '',
            notable_credits: member.notableCredits || [],
            doubled_actors: member.doubledActors || [],
            imdb: member.imdb || null,
            external_url: member.externalUrl || null,
            instagram: member.instagram || null,
            avatar_url: member.avatarUrl || null,
            metadata: member.metadata || {},
            updated_at: new Date().toISOString(),
        };

        const creditCount = payload.notable_credits.length;
        const roleCount = Object.keys(payload.metadata?.film_roles || {}).length;

        if (!write) {
            console.log(`  [aperçu] ${member.id} — ${creditCount} crédits, ${roleCount} rôles par film`);
            teamOk++;
            continue;
        }

        const { error } = await supabase.from('site_team').update(payload).eq('id', member.id);
        if (error) {
            console.error(`  ✗ ${member.id} : ${error.message}`);
            teamFail++;
        } else {
            console.log(`  ✓ ${member.id} — ${creditCount} crédits, ${roleCount} rôles par film`);
            teamOk++;
        }
    }

    // ---------------------------------------------------------------------------
    // 2. site_films — reconstruction de cuc_team_involved et cuc_team_roles
    // ---------------------------------------------------------------------------
    console.log('\n--- 2. site_films ---');

    // Index inverse : titre normalisé → id de film
    const normalize = (s) =>
        String(s || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

    const filmByTitle = new Map();
    for (const f of films) {
        filmByTitle.set(normalize(f.title), f);
    }

    // Construit la carte film → { coachIds, roles }
    const filmLinks = new Map();
    for (const member of team) {
        const filmRoles = member.metadata?.film_roles || {};
        for (const [filmSlug, role] of Object.entries(filmRoles)) {
            if (!filmLinks.has(filmSlug)) {
                filmLinks.set(filmSlug, { coachIds: new Set(), roles: {} });
            }
            const link = filmLinks.get(filmSlug);
            link.coachIds.add(member.id);
            link.roles[member.id] = role;
        }

        // Rattachement complémentaire par correspondance de titre dans notableCredits
        for (const credit of member.notableCredits || []) {
            const titlePart = credit.split(' — ')[0].replace(/\s*\([^)]*\)\s*/g, ' ').trim();
            const film = filmByTitle.get(normalize(titlePart));
            if (!film) continue;
            if (!filmLinks.has(film.id)) {
                filmLinks.set(film.id, { coachIds: new Set(), roles: {} });
            }
            const link = filmLinks.get(film.id);
            link.coachIds.add(member.id);
            if (!link.roles[member.id]) {
                const rolePart = credit.includes(' — ') ? credit.split(' — ').slice(1).join(' — ').trim() : '';
                if (rolePart) link.roles[member.id] = rolePart;
            }
        }
    }

    let filmOk = 0;
    let filmFail = 0;

    for (const [filmId, link] of filmLinks.entries()) {
        const coachIds = Array.from(link.coachIds);
        const payload = {
            cuc_team_involved: coachIds,
            metadata: { cuc_team_roles: link.roles },
            updated_at: new Date().toISOString(),
        };

        if (!write) {
            console.log(`  [aperçu] ${filmId} — ${coachIds.length} coach(s) : ${coachIds.join(', ')}`);
            filmOk++;
            continue;
        }

        // Fusion du metadata existant pour ne pas écraser d'autres clés
        const { data: existing } = await supabase
            .from('site_films')
            .select('metadata')
            .eq('id', filmId)
            .maybeSingle();

        const mergedMetadata = { ...(existing?.metadata || {}), ...payload.metadata };

        const { error } = await supabase
            .from('site_films')
            .update({ ...payload, metadata: mergedMetadata })
            .eq('id', filmId);

        if (error) {
            console.error(`  ✗ ${filmId} : ${error.message}`);
            filmFail++;
        } else {
            console.log(`  ✓ ${filmId} — ${coachIds.length} coach(s)`);
            filmOk++;
        }
    }

    // ---------------------------------------------------------------------------
    // 3. site_settings miroir (clé 'team')
    // ---------------------------------------------------------------------------
    console.log('\n--- 3. site_settings (miroir team) ---');
    if (!write) {
        console.log(`  [aperçu] upsert site_settings key='team' (${team.length} membres)`);
    } else {
        const { error } = await supabase.from('site_settings').upsert({
            key: 'team',
            value: team,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            console.error(`  ✗ site_settings : ${error.message}`);
        } else {
            console.log(`  ✓ site_settings key='team' synchronisé (${team.length} membres)`);
        }
    }

    console.log('\n--- SYNTHÈSE ---');
    console.log(`site_team  : ${teamOk} OK, ${teamFail} échec(s)`);
    console.log(`site_films : ${filmOk} OK, ${filmFail} échec(s)`);

    if (!write) {
        console.log('\nℹ Aperçu terminé. Relancez avec --write pour synchroniser.');
    } else {
        console.log('\n✓ Synchronisation terminée.');
    }
}

main().catch((err) => {
    console.error('Erreur fatale :', err.message);
    process.exit(1);
});
