/**
 * Synchronise `site_navigation` (source de vérité live) avec le nouvel ordre
 * du header demandé :
 *
 *   ACCUEIL, LE CAMPUS, STAGES & FORMATIONS, WORKSHOP, TOURNAGE,
 *   L'ÉQUIPE, EVENTS, VIDÉOS, PARTENAIRES, BOUTIQUE, CONTACT
 *
 * Doctrine « Zéro Texte Orphelin » : on réordonne et on normalise les libellés
 * en MAJUSCULES, sans toucher aux href, aux enfants ni au CTA.
 *
 * Idempotent : relançable sans effet de bord.
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

// Ordre canonique demandé : id → { order, label }
const CANONICAL = [
    { id: 'home', order: 1, label: 'ACCUEIL' },
    { id: 'campus', order: 2, label: 'LE CAMPUS' },
    { id: 'formations', order: 3, label: 'STAGES & FORMATIONS' },
    { id: 'workshop', order: 4, label: 'WORKSHOP' },
    { id: 'tournages', order: 5, label: 'TOURNAGE' },
    { id: 'equipe', order: 6, label: 'L’ÉQUIPE' },
    { id: 'events', order: 7, label: 'EVENTS' },
    { id: 'videos', order: 8, label: 'VIDÉOS' },
    { id: 'partenaires', order: 9, label: 'PARTENAIRES' },
    { id: 'boutique', order: 10, label: 'BOUTIQUE' },
    { id: 'contact', order: 11, label: 'CONTACT' },
];

const { data: row, error } = await supabase
    .from('site_navigation')
    .select('id,structure')
    .eq('id', 'main')
    .maybeSingle();

if (error) {
    console.error('ERREUR lecture site_navigation:', error.message);
    process.exit(1);
}
if (!row) {
    console.log('ℹ️  Aucune ligne site_navigation[main] — le fallback code fait foi.');
    process.exit(0);
}

const items = row.structure?.items || [];
const byId = new Map(items.map((it) => [it.id, it]));

const missing = CANONICAL.filter((c) => !byId.has(c.id)).map((c) => c.id);
if (missing.length) {
    console.error('✗ Items absents de site_navigation:', missing.join(', '));
    process.exit(1);
}

const extra = items.filter((it) => !CANONICAL.some((c) => c.id === it.id)).map((it) => it.id);
if (extra.length) {
    console.warn('⚠️  Items hors liste canonique (conservés en fin):', extra.join(', '));
}

let changed = 0;
const nextItems = CANONICAL.map((c) => {
    const it = byId.get(c.id);
    if (it.order !== c.order || it.label !== c.label) {
        changed++;
        console.log(`  ✓ [${c.id}] order ${it.order}→${c.order} | "${it.label}" → "${c.label}"`);
    }
    return { ...it, order: c.order, label: c.label };
});

// Conserver les éventuels items hors liste, à la suite
for (const it of items) {
    if (!CANONICAL.some((c) => c.id === it.id)) {
        nextItems.push({ ...it, order: nextItems.length + 1 });
    }
}

if (changed === 0) {
    console.log('✅ site_navigation déjà conforme (aucune modification).');
    process.exit(0);
}

const nextStructure = { ...row.structure, items: nextItems };

const { error: upErr } = await supabase
    .from('site_navigation')
    .update({ structure: nextStructure, updated_at: new Date().toISOString() })
    .eq('id', 'main');

if (upErr) {
    console.error('ERREUR écriture:', upErr.message);
    process.exit(1);
}

console.log(`\n✅ site_navigation[main] synchronisée (${changed} item(s) modifié(s)).`);

// Non-régression : vérifier l'ordre final
const { data: after } = await supabase
    .from('site_navigation')
    .select('structure')
    .eq('id', 'main')
    .maybeSingle();

const finalItems = (after?.structure?.items || []).slice().sort((a, b) => a.order - b.order);
const finalIds = finalItems.map((i) => i.id).join(',');
const expectedIds = CANONICAL.map((c) => c.id).join(',');
if (finalIds !== expectedIds) {
    console.error('✗ Ordre final inattendu:', finalIds);
    process.exit(2);
}
console.log('✅ Vérification : ordre final =', finalItems.map((i) => i.label).join(' · '));
