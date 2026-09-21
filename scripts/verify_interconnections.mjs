/**
 * VÉRIFICATION DES INTERCONNEXIONS CUC ↔ CUC SIGN
 * ===============================================
 *
 * Doctrine (AGENTS.md) : « Interconnexion Bidirectionnelle Maximale ».
 * Chaque table du site vitrine/cockpit doit être reliée aux tables CUC Sign
 * quand c'est pertinent, et une clé étrangère NULL est un état valide
 * (`ON DELETE SET NULL`) — un lien FAUX est pire qu'aucun lien.
 *
 * Ce script contrôle :
 *   1. site_team.profile_id            ↔ profiles.id
 *   2. site_sessions.cuc_sign_formation_id ↔ formations.id
 *   3. site_campus_pois.location_id    ↔ locations.id
 *   4. site_disciplines                ↔ evaluation_disciplines (par nom)
 *   5. site_inquiries.metadata.cuc_sign_student_id ↔ students.id
 *
 * Usage : node scripts/verify_interconnections.mjs
 * Sortie : code 2 si au moins un lien est cassé (FK orpheline).
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

async function fetchAll(table, cols) {
    const { data, error } = await supabase.from(table).select(cols);
    if (error) throw new Error(`${table} : ${error.message}`);
    return data || [];
}

async function main() {
    console.log('🔗 Vérification des interconnexions CUC ↔ CUC Sign\n');

    const [team, sessions, pois, disciplines, inquiries, profiles, formations, locations, evalDisc, students] =
        await Promise.all([
            fetchAll('site_team', 'id, name, profile_id'),
            fetchAll('site_sessions', 'id, program_id, cuc_sign_formation_id, date_display'),
            fetchAll('site_campus_pois', 'id, name, location_id'),
            fetchAll('site_disciplines', 'id, name, is_active'),
            fetchAll('site_inquiries', 'id, full_name, metadata'),
            fetchAll('profiles', 'id, full_name'),
            fetchAll('formations', 'id, name'),
            fetchAll('locations', 'id, name'),
            fetchAll('evaluation_disciplines', 'id, name'),
            fetchAll('students', 'user_id'),
        ]);

    const profileIds = new Set(profiles.map((p) => p.id));
    const formationIds = new Set(formations.map((f) => f.id));
    const locationIds = new Set(locations.map((l) => l.id));
    const studentIds = new Set(students.map((s) => s.user_id));
    const evalDiscKeys = new Set(evalDisc.map((d) => norm(d.name)));

    let broken = 0;
    const report = (label, ok, detail) => {
        if (!ok) broken++;
        console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
    };

    // 1. site_team.profile_id ↔ profiles.id
    const teamLinked = team.filter((t) => t.profile_id);
    const teamBroken = teamLinked.filter((t) => !profileIds.has(t.profile_id));
    report(
        `site_team.profile_id ↔ profiles.id`,
        teamBroken.length === 0,
        `${teamLinked.length}/${team.length} liés${teamBroken.length ? `, ${teamBroken.length} cassés : ${teamBroken.map((t) => t.name).join(', ')}` : ''}`
    );

    // 2. site_sessions.cuc_sign_formation_id ↔ formations.id
    const sessLinked = sessions.filter((s) => s.cuc_sign_formation_id);
    const sessBroken = sessLinked.filter((s) => !formationIds.has(s.cuc_sign_formation_id));
    report(
        `site_sessions.cuc_sign_formation_id ↔ formations.id`,
        sessBroken.length === 0,
        `${sessLinked.length}/${sessions.length} liées${sessBroken.length ? `, ${sessBroken.length} cassées : ${sessBroken.map((s) => s.program_id).join(', ')}` : ''}`
    );

    // 3. site_campus_pois.location_id ↔ locations.id
    const poiLinked = pois.filter((p) => p.location_id);
    const poiBroken = poiLinked.filter((p) => !locationIds.has(p.location_id));
    report(
        `site_campus_pois.location_id ↔ locations.id`,
        poiBroken.length === 0,
        `${poiLinked.length}/${pois.length} liés${poiBroken.length ? `, ${poiBroken.length} cassés : ${poiBroken.map((p) => p.name).join(', ')}` : ''}`
    );

    // 4. site_disciplines ↔ evaluation_disciplines (appariement par nom normalisé)
    const activeDisc = disciplines.filter((d) => d.is_active !== false);
    const discMatched = activeDisc.filter((d) => evalDiscKeys.has(norm(d.name)));
    report(
        `site_disciplines ↔ evaluation_disciplines (nom)`,
        activeDisc.length > 0,
        `${discMatched.length}/${activeDisc.length} disciplines actives appariées`
    );

    // 5. site_inquiries.metadata.cuc_sign_student_id ↔ students.id
    const inqLinked = inquiries.filter((i) => i.metadata?.cuc_sign_student_id);
    const inqBroken = inqLinked.filter((i) => !studentIds.has(i.metadata.cuc_sign_student_id));
    report(
        `site_inquiries.metadata.cuc_sign_student_id ↔ students.id`,
        inqBroken.length === 0,
        `${inqLinked.length}/${inquiries.length} converties${inqBroken.length ? `, ${inqBroken.length} cassées : ${inqBroken.map((i) => i.full_name).join(', ')}` : ''}`
    );

    console.log(`\n📊 Bilan : ${broken} lien(s) cassé(s).`);
    if (broken > 0) {
        console.log('\n⚠️  Des clés étrangères pointent vers des lignes inexistantes.');
        process.exit(2);
    }
    console.log('\n✅ Toutes les interconnexions sont saines.');
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
