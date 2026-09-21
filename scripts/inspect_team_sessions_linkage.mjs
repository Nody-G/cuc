/**
 * INSPECTION DE L'APPARIEMENT site_team ↔ profiles ET site_sessions ↔ formations
 * ==============================================================================
 *
 * Objectif : déterminer, pour chaque ligne NON liée, s'il existe une
 * correspondance plausible côté CUC Sign (donc un lien à créer) ou si la ligne
 * est légitimement non appariable (donc un NULL valide).
 *
 * Doctrine (AGENTS.md) : « Un lien FAUX est pire qu'aucun lien ». Ce script est
 * en LECTURE SEULE — il ne crée aucune FK, il produit un diagnostic.
 *
 * Usage : node scripts/inspect_team_sessions_linkage.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

/** Normalise un libellé pour comparaison souple (accents, casse, ponctuation). */
function norm(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Extrait les jetons significatifs d'un nom (ignore les prénoms trop courts). */
function tokens(s) {
    return norm(s)
        .split(' ')
        .filter((t) => t.length >= 3);
}

async function fetchAll(table, cols) {
    const { data, error } = await supabase.from(table).select(cols);
    if (error) throw new Error(`${table} : ${error.message}`);
    return data || [];
}

async function main() {
    console.log('🔍 Inspection de l\'appariement site_team ↔ profiles et site_sessions ↔ formations\n');

    const [team, sessions, profiles, formations] = await Promise.all([
        fetchAll('site_team', 'id, name, role, profile_id'),
        fetchAll('site_sessions', 'id, program_id, date_display, cuc_sign_formation_id'),
        fetchAll('profiles', 'id, full_name, role'),
        fetchAll('formations', 'id, name'),
    ]);

    // ------------------------------------------------------------------
    // 1. site_team ↔ profiles
    // ------------------------------------------------------------------
    console.log('=== 1. site_team ↔ profiles ===\n');
    const unlinkedTeam = team.filter((t) => !t.profile_id);
    console.log(`Total site_team : ${team.length} | liés : ${team.length - unlinkedTeam.length} | non liés : ${unlinkedTeam.length}\n`);

    for (const t of unlinkedTeam) {
        const tTokens = tokens(t.name);
        // Candidats : profils partageant au moins un jeton significatif.
        const candidates = profiles
            .map((p) => {
                const pTokens = tokens(p.full_name);
                const shared = tTokens.filter((tok) => pTokens.includes(tok));
                return { p, shared };
            })
            .filter((c) => c.shared.length > 0)
            .sort((a, b) => b.shared.length - a.shared.length);

        console.log(`• ${t.name} (${t.role || 'rôle inconnu'})`);
        if (candidates.length === 0) {
            console.log(`    ⛔ Aucun profil CUC Sign ne partage de jeton → NULL légitime.`);
        } else {
            for (const c of candidates.slice(0, 3)) {
                console.log(`    ↳ candidat : ${c.p.full_name} [${c.p.role || '—'}] (jetons communs : ${c.shared.join(', ')})`);
            }
        }
        console.log('');
    }

    // ------------------------------------------------------------------
    // 2. site_sessions ↔ formations
    // ------------------------------------------------------------------
    console.log('=== 2. site_sessions ↔ formations ===\n');
    const unlinkedSessions = sessions.filter((s) => !s.cuc_sign_formation_id);
    console.log(`Total site_sessions : ${sessions.length} | liées : ${sessions.length - unlinkedSessions.length} | non liées : ${unlinkedSessions.length}\n`);

    console.log('Formations CUC Sign disponibles :');
    for (const f of formations) console.log(`    - ${f.name}  (${f.id})`);
    console.log('');

    for (const s of unlinkedSessions) {
        const sTokens = tokens(s.program_id);
        const candidates = formations
            .map((f) => {
                const fTokens = tokens(f.name);
                const shared = sTokens.filter((tok) => fTokens.includes(tok));
                return { f, shared };
            })
            .filter((c) => c.shared.length > 0)
            .sort((a, b) => b.shared.length - a.shared.length);

        console.log(`• ${s.program_id} (${s.date_display || 'date inconnue'})`);
        if (candidates.length === 0) {
            console.log(`    ⛔ Aucune formation CUC Sign ne partage de jeton → NULL légitime.`);
        } else {
            for (const c of candidates.slice(0, 3)) {
                console.log(`    ↳ candidat : ${c.f.name} (jetons communs : ${c.shared.join(', ')})`);
            }
        }
        console.log('');
    }

    console.log('ℹ️  Ce diagnostic est indicatif : un jeton commun ne prouve pas l\'identité.');
    console.log('   Ne créer une FK que si la correspondance est certaine (cf. doctrine AGENTS.md).');
}

main().catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
});
