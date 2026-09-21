#!/usr/bin/env node
/**
 * Normalisation des tags de site_films (doctrine « Zéro AI Slop »).
 *
 * Remplace les tags marketing creux (HOLLYWOOD, BOX-OFFICE, NETFLIX EXTRÊME,
 * SUCCÈS MONDIAL NETFLIX, WORLDWIDE, ÉLITE…) par une taxonomie factuelle
 * alignée sur src/data/filmography.ts.
 *
 * Usage :
 *   node scripts/normalize_film_tags_in_db.mjs --dry-run
 *   node scripts/normalize_film_tags_in_db.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Clé Supabase manquante (SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** Taxonomie factuelle : ancien tag → nouveau tag. */
const TAG_MAP = new Map([
  ['HOLLYWOOD', 'BLOCKBUSTER'],
  ['BOX-OFFICE', 'BLOCKBUSTER'],
  ['BOX OFFICE', 'BLOCKBUSTER'],
  ['NETFLIX EXTRÊME', 'NETFLIX ACTION'],
  ['NETFLIX EXTREME', 'NETFLIX ACTION'],
  ['SUCCÈS MONDIAL NETFLIX', 'SÉRIE NETFLIX'],
  ['SUCCES MONDIAL NETFLIX', 'SÉRIE NETFLIX'],
  ['WORLDWIDE', 'CINÉMA INTERNATIONAL'],
  ['POLAR TACTIQUE', 'POLAR'],
  ['ÉLITE', 'CURSUS DIPLÔMANT'],
  ['ELITE', 'CURSUS DIPLÔMANT'],
]);

async function main() {
  console.log('=== NORMALISATION DES TAGS site_films ===');
  console.log(DRY_RUN ? 'Mode : DRY-RUN (aucune écriture)\n' : 'Mode : ÉCRITURE\n');

  const { data, error } = await supabase.from('site_films').select('id,title,tag');
  if (error) {
    console.error(`❌ Lecture site_films : ${error.message}`);
    process.exit(1);
  }

  const toFix = [];
  for (const row of data ?? []) {
    if (typeof row.tag !== 'string') continue;
    const next = TAG_MAP.get(row.tag.trim().toUpperCase());
    if (next && next !== row.tag) {
      toFix.push({ id: row.id, title: row.title, from: row.tag, to: next });
    }
  }

  if (toFix.length === 0) {
    console.log('✅ Aucun tag à normaliser.');
    return;
  }

  for (const f of toFix) {
    console.log(`  • ${f.id} (« ${f.title} ») : « ${f.from} » → « ${f.to} »`);
  }

  if (DRY_RUN) {
    console.log(`\n${toFix.length} tag(s) à corriger (dry-run, rien écrit).`);
    return;
  }

  let ok = 0;
  for (const f of toFix) {
    const { error: upErr } = await supabase
      .from('site_films')
      .update({ tag: f.to })
      .eq('id', f.id);
    if (upErr) {
      console.error(`  ❌ ${f.id} : ${upErr.message}`);
    } else {
      ok += 1;
    }
  }

  console.log(`\n✅ ${ok}/${toFix.length} tag(s) normalisé(s) en base.`);
}

main().catch((e) => {
  console.error(`❌ Erreur fatale : ${e.message}`);
  process.exit(1);
});
