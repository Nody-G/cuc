/**
 * Vérifie si des libellés `doubled_actors` douteux subsistent dans les miroirs
 * (site_settings, site_pages.sections_data) — doctrine « Zéro Texte Orphelin ».
 * Lecture seule.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};

const url = get('NEXT_PUBLIC_SUPABASE_URL') || get('SUPABASE_URL');
const key = get('SUPABASE_SECRET_KEY') || get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(url, key, { auth: { persistSession: false } });

const SUSPECT = /Équipe cascades CUC|Cascadeurs CUC|Doublures cascades CUC|CUC Performers|CUC Team|Performers de Combat|Spécialistes Rigging|Co-fondateur CUC|Stunt Support|Stunt Doubling|Enforcers/i;

// site_settings
const { data: settings, error: sErr } = await supabase.from('site_settings').select('key,value');
if (sErr) {
    console.error('ERREUR site_settings:', sErr.message);
} else {
    console.log('=== site_settings ===');
    let hits = 0;
    for (const s of settings) {
        const flat = JSON.stringify(s.value);
        if (SUSPECT.test(flat)) {
            hits++;
            console.log(`[${s.key}] contient un libellé douteux`);
        }
    }
    console.log(hits === 0 ? '✅ Aucun libellé douteux dans site_settings.' : `⚠️ ${hits} clé(s) à revoir.`);
}

// site_pages.sections_data
const { data: pages, error: pErr } = await supabase.from('site_pages').select('slug,sections_data');
if (pErr) {
    console.error('ERREUR site_pages:', pErr.message);
} else {
    console.log('\n=== site_pages.sections_data ===');
    let hits = 0;
    for (const p of pages) {
        const flat = JSON.stringify(p.sections_data || {});
        if (SUSPECT.test(flat)) {
            hits++;
            console.log(`[${p.slug}] contient un libellé douteux`);
        }
    }
    console.log(hits === 0 ? '✅ Aucun libellé douteux dans site_pages.' : `⚠️ ${hits} page(s) à revoir.`);
}
