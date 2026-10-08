/**
 * Inspecte la table `site_navigation` (source de vérité live) :
 * ordre, libellés et visibilité des items. Lecture seule.
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

const { data, error } = await supabase
    .from('site_navigation')
    .select('id,label,structure,is_published,updated_at');

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

if (!data || data.length === 0) {
    console.log('ℹ️  Table site_navigation vide — le fallback code fait foi.');
    process.exit(0);
}

for (const row of data) {
    console.log(`\n=== site_navigation [${row.id}] "${row.label}" — published=${row.is_published} — ${row.updated_at} ===`);
    const items = row.structure?.items || [];
    const sorted = items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const it of sorted) {
        console.log(`  ${String(it.order).padStart(2)} | ${it.type.padEnd(8)} | visible=${it.is_visible} | "${it.label}" → ${it.href ?? '(dropdown)'}`);
        for (const c of (it.children || [])) {
            console.log(`       └ ${String(c.order).padStart(2)} | "${c.label}" → ${c.href}`);
        }
    }
    console.log(`  CTA: "${row.structure?.cta?.label}" → ${row.structure?.cta?.href}`);
}
