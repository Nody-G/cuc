/**
 * CORRECTION DES LIENS site_sessions.cuc_sign_formation_id ↔ formations.id
 * ========================================================================
 *
 * Contexte (preuve) : `node scripts/verify_session_formation_links.mjs` a détecté
 * 4 appariements incohérents (mois/année différents entre la session vitrine et
 * la formation CUC Sign liée).
 *
 * Doctrine (AGENTS.md) : « Zéro Texte ni Valeur Orpheline » + « Interconnexion
 * Bidirectionnelle Maximale ». Un lien erroné est PIRE qu'une absence de lien :
 * il propage une donnée fausse. La clé étrangère est `ON DELETE SET NULL` :
 * une valeur NULL est donc un état valide et sûr.
 *
 * Règle appliquée : on ne DEVINE jamais un appariement. Si aucune formation
 * CUC Sign ne correspond réellement (programme + mois + année), on DÉLIE la
 * session (NULL) plutôt que de conserver un lien faux.
 *
 * Cas traités :
 *   1. afdas-artistes-interpretes « 09 au 20 novembre 2026 » → db3c4a64
 *      (Week-end Immersion) : programme incompatible → DÉLIER.
 *   2. afdas-artistes-interpretes « 15 au 26 mars 2027 » → 97ff5176
 *      (AFDAS 2-13 mars 2026) : année incompatible → DÉLIER.
 *   3. stunt-summer-camp « 11 au 16 juillet 2027 » → bcebe7ff
 *      (Stunt Summer Camp 9-14 août 2026) : année/mois incompatibles → DÉLIER.
 *
 * Cas légitimes conservés (simple coquille dans le titre CUC Sign) :
 *   - pro-longue-duree / stage-decouverte « 21 février au 05 mars 2027 »
 *     → 589932df « Formation Prou — Février 2027 » (Prou = Pro).
 *
 * Usage :
 *   node scripts/fix_session_formation_links.mjs --dry-run
 *   node scripts/fix_session_formation_links.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

const DRY_RUN = process.argv.includes('--dry-run');

// (program_id, date_display) → lien à retirer
const TO_UNLINK = [
    { program_id: 'afdas-artistes-interpretes', date_display: '09 au 20 novembre 2026', reason: 'programme incompatible (Week-end Immersion)' },
    { program_id: 'afdas-artistes-interpretes', date_display: '15 au 26 mars 2027', reason: 'année incompatible (formation 2026)' },
    { program_id: 'stunt-summer-camp', date_display: '11 au 16 juillet 2027', reason: 'année/mois incompatibles (formation août 2026)' },
];

async function main() {
    console.log('🔧 Correction des liens site_sessions ↔ formations\n');
    console.log(`   Mode : ${DRY_RUN ? 'DRY-RUN' : 'APPLICATION'}\n`);

    const { data: sessions, error } = await supabase
        .from('site_sessions')
        .select('id, program_id, date_display, cuc_sign_formation_id');
    if (error) throw new Error(`site_sessions : ${error.message}`);

    let fixed = 0;
    for (const target of TO_UNLINK) {
        const s = sessions.find(
            (x) => x.program_id === target.program_id && x.date_display === target.date_display
        );
        if (!s) {
            console.log(`⚪ Introuvable : ${target.program_id} | ${target.date_display}`);
            continue;
        }
        if (!s.cuc_sign_formation_id) {
            console.log(`⚪ Déjà non liée : ${target.program_id} | ${target.date_display}`);
            continue;
        }
        console.log(`🔗 ${target.program_id} | ${target.date_display}`);
        console.log(`   lien actuel : ${s.cuc_sign_formation_id} → retiré (${target.reason})`);

        if (!DRY_RUN) {
            const { error: upErr } = await supabase
                .from('site_sessions')
                .update({ cuc_sign_formation_id: null, updated_at: new Date().toISOString() })
                .eq('id', s.id);
            if (upErr) {
                console.error(`   ❌ Échec : ${upErr.message}`);
                continue;
            }
            console.log('   ✅ DÉLIÉE');
        }
        fixed++;
    }

    console.log(`\n📊 ${fixed} session(s) ${DRY_RUN ? 'à délier' : 'déliée(s)'}.`);
    if (!DRY_RUN && fixed > 0) {
        console.log('\n▶️  Relancer `node scripts/verify_session_formation_links.mjs` pour confirmer.');
    }
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
