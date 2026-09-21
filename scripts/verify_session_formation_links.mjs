/**
 * VÉRIFICATION DES LIENS site_sessions.cuc_sign_formation_id ↔ formations.id
 * ==========================================================================
 *
 * Contexte (preuve) : `node scripts/deep_audit_interconnection.mjs` a signalé
 * « site_sessions ↔ formations : 13/18 interconnectés » mais avec des
 * incohérences visibles (session « 09 au 20 novembre 2026 » liée à une
 * formation « 21-22 novembre 2026 »).
 *
 * Ce script croise chaque session publiée avec la formation CUC Sign liée et
 * compare les dates (mois/année) pour détecter les appariements erronés.
 *
 * Usage : node scripts/verify_session_formation_links.mjs
 * Sortie : code 2 si au moins un appariement est incohérent.
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

const MONTHS = {
    janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12,
};

/**
 * Extrait {month, year} du DÉBUT de la plage d'une chaîne libre type
 * « 09 au 20 novembre 2026 » ou « 21 février au 05 mars 2027 ».
 *
 * On prend le PREMIER mois rencontré (le début de la session), car
 * `formations.start_date` est la date de DÉBUT. Une session à cheval sur deux
 * mois (février → mars) doit donc être comparée à son mois de départ, pas à
 * son mois de fin.
 *
 * Piège : dans « 21 février au 05 mars 2027 », le mois « février » n'est PAS
 * suivi directement d'une année (c'est « mars 2027 » qui l'est). On apparie
 * donc chaque mois au PREMIER millésime qui suit (en tolérant des chiffres
 * intermédiaires comme le jour « 05 »), et on retient le premier couple.
 */
function parseDateDisplay(s) {
    if (!s) return null;
    const str = String(s);
    const monthRe = /([a-zéûôA-Z]+)/g;
    let m;
    while ((m = monthRe.exec(str)) !== null) {
        const month = MONTHS[m[1].toLowerCase()];
        if (!month) continue;
        // Premier millésime (4 chiffres) après ce mois.
        const tail = str.slice(m.index + m[1].length);
        const ym = tail.match(/(\d{4})/);
        if (ym) return { month, year: Number(ym[1]) };
    }
    return null;
}

/** Extrait {month, year} d'une date ISO « 2026-11-21 ». */
function parseIso(s) {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})/);
    return m ? { month: Number(m[2]), year: Number(m[1]) } : null;
}

async function main() {
    console.log('🔎 Vérification des liens site_sessions ↔ formations\n');

    const { data: sessions, error: e1 } = await supabase
        .from('site_sessions')
        .select('id, program_id, cuc_sign_formation_id, date_display, is_published')
        .order('program_id');
    if (e1) throw new Error(`site_sessions : ${e1.message}`);

    const { data: formations, error: e2 } = await supabase
        .from('formations')
        .select('id, name, start_date, end_date, is_active');
    if (e2) throw new Error(`formations : ${e2.message}`);

    const fmap = new Map(formations.map((f) => [f.id, f]));

    let linked = 0;
    let orphans = 0;
    let mismatches = 0;

    for (const s of sessions) {
        if (!s.cuc_sign_formation_id) {
            orphans++;
            console.log(`⚪ ${s.program_id} | ${s.date_display} | non liée`);
            continue;
        }
        const f = fmap.get(s.cuc_sign_formation_id);
        if (!f) {
            mismatches++;
            console.log(`❌ ${s.program_id} | ${s.date_display} | lien cassé → ${s.cuc_sign_formation_id}`);
            continue;
        }
        linked++;
        const sd = parseDateDisplay(s.date_display);
        const fd = parseIso(f.start_date);
        const sameMonth = sd && fd && sd.month === fd.month && sd.year === fd.year;
        const flag = sameMonth ? '✅' : '⚠️ ';
        if (!sameMonth) mismatches++;
        console.log(
            `${flag} ${s.program_id} | session « ${s.date_display} » → formation « ${f.name} » [${f.start_date}]`
        );
    }

    console.log(`\n📊 Bilan : ${linked} liées, ${orphans} non liées, ${mismatches} incohérentes / ${sessions.length} sessions.`);
    if (mismatches > 0) {
        console.log('\n⚠️  Des appariements session ↔ formation sont incohérents (mois/année différents).');
        process.exit(2);
    }
    console.log('\n✅ Tous les appariements sont cohérents.');
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
