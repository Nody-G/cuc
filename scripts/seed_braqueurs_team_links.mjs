/**
 * SEMIS DES LIENS ÉQUIPE ↔ FILM « BRAQUEURS »
 * ===========================================
 *
 * Contexte (problème signalé) :
 *   « J'ai l'impression que les gens présents sur certains films sont manquants
 *     dans la page filmographie du cockpit. »
 *
 * Diagnostic : `plans/audit-films-equipe.md` — 5 films ont `cuc_team_involved`
 * vide. Revue : `plans/revue-appariement-films.md`.
 *
 * Décision (doctrine « Zéro Invention ») : UNE SEULE écriture est autorisée —
 * la fiche `braqueurs` (Braqueurs, 2021, Julien Leclercq) est déclarée par
 * 5 coachs sous la forme « Braqueurs: La série (2021) — Cascadeur ».
 * Les 4 autres films (wednesday-mercredi, dune, uncharted, black-widow) n'ont
 * AUCUN crédit coach correspondant → aucune écriture.
 *
 * Ce script est IDEMPOTENT : il relit l'état courant, n'ajoute que les ids
 * manquants et préserve les éventuels rattachements déjà présents.
 *
 * Usage :
 *   node scripts/seed_braqueurs_team_links.mjs --dry-run
 *   node scripts/seed_braqueurs_team_links.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const DRY_RUN = process.argv.includes('--dry-run');

/** Fiche cible et coachs rattachés (fondés sur 5 crédits IMDb concordants). */
const FILM_ID = 'braqueurs';
const ROLE = 'Cascadeur';
const COACH_IDS = [
    'franck-blanc',
    'jerome-gaspard',
    'lucas-dollfus',
    'malik-diouf',
    'bastien-trouve',
];

async function main() {
    console.log('\n=== Semis des liens équipe ↔ film « braqueurs » ===\n');
    if (DRY_RUN) console.log('(mode --dry-run : aucune écriture)\n');

    // 1. Vérifier que la fiche film existe.
    const { data: film, error: filmErr } = await supabase
        .from('site_films')
        .select('id,title,year,cuc_team_involved,metadata')
        .eq('id', FILM_ID)
        .maybeSingle();

    if (filmErr) {
        console.error('❌ Lecture site_films :', filmErr.message);
        process.exit(1);
    }
    if (!film) {
        console.error(`❌ Fiche film « ${FILM_ID} » introuvable.`);
        process.exit(1);
    }
    console.log(`Fiche cible : ${film.id} — ${film.title} (${film.year})`);

    // 2. Vérifier que les 5 coachs existent réellement dans site_team.
    const { data: team, error: teamErr } = await supabase
        .from('site_team')
        .select('id,name');
    if (teamErr) {
        console.error('❌ Lecture site_team :', teamErr.message);
        process.exit(1);
    }
    const teamIds = new Set((team || []).map((t) => t.id));
    const missing = COACH_IDS.filter((id) => !teamIds.has(id));
    if (missing.length > 0) {
        console.error(`❌ Coachs introuvables dans site_team : ${missing.join(', ')}`);
        process.exit(1);
    }
    console.log(`Coachs vérifiés : ${COACH_IDS.length}/${COACH_IDS.length}\n`);

    // 3. Fusion idempotente de cuc_team_involved.
    const current = Array.isArray(film.cuc_team_involved) ? film.cuc_team_involved : [];
    const merged = [...current];
    const added = [];
    for (const id of COACH_IDS) {
        if (!merged.includes(id)) {
            merged.push(id);
            added.push(id);
        }
    }

    // 4. Fusion idempotente de metadata.cuc_team_roles.
    const metadata = film.metadata && typeof film.metadata === 'object' ? { ...film.metadata } : {};
    const roles =
        metadata.cuc_team_roles && typeof metadata.cuc_team_roles === 'object'
            ? { ...metadata.cuc_team_roles }
            : {};
    const rolesAdded = [];
    for (const id of COACH_IDS) {
        if (roles[id] !== ROLE) {
            roles[id] = ROLE;
            rolesAdded.push(id);
        }
    }
    metadata.cuc_team_roles = roles;

    console.log(`cuc_team_involved : ${current.length} → ${merged.length}`);
    if (added.length === 0) console.log('  (aucun ajout : déjà à jour)');
    else for (const id of added) console.log(`  + ${id}`);
    console.log(`\nmetadata.cuc_team_roles : ${rolesAdded.length} rôle(s) posé(s) à « ${ROLE} »`);

    if (added.length === 0 && rolesAdded.length === 0) {
        console.log('\n✅ Déjà à jour — rien à écrire.');
        return;
    }

    if (DRY_RUN) {
        console.log('\n(dry-run) Écriture simulée avec succès.');
        return;
    }

    // 5. Écriture.
    const { error: updateErr } = await supabase
        .from('site_films')
        .update({ cuc_team_involved: merged, metadata })
        .eq('id', FILM_ID);

    if (updateErr) {
        console.error('❌ Écriture site_films :', updateErr.message);
        process.exit(1);
    }

    console.log(`\n✅ Fiche « ${FILM_ID} » mise à jour : ${merged.length} membre(s) rattaché(s).`);
}

main().catch((err) => {
    console.error('❌ Erreur inattendue :', err);
    process.exit(1);
});
