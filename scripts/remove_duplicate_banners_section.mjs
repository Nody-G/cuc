/**
 * Supprime la section `banners` (TeamBannersSection) de la page `cuc-team-cascadeur`.
 *
 * Contexte : la page Tournage affichait DEUX fois des affiches de films :
 *   1. `banners`  → TeamBannersSection, 6 affiches statiques issues de
 *      `OFFICIAL_FILM_BANNERS` (récupérées initialement sur le site original).
 *   2. `hall_of_fame` → HallOfFame, catalogue complet `site_films` (570 films).
 *
 * Décision éditoriale : ne conserver QUE le catalogue complet (570 films) et
 * retirer la liste statique de 6 affiches, qui faisait doublon.
 *
 * Ce script met à jour `site_pages.layout_sections` en retirant l'entrée
 * `banners`, sans toucher aux autres sections ni à `sections_data`.
 *
 * Doctrine : « marquer plutôt que supprimer » — le composant TeamBannersSection
 * et la constante OFFICIAL_FILM_BANNERS restent dans le code (traçabilité), mais
 * ne sont plus référencés par la page.
 *
 * Usage : node scripts/remove_duplicate_banners_section.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables Supabase manquantes (.env.local).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const SLUG = 'cuc-team-cascadeur';
const SECTION_TO_REMOVE = 'banners';

async function main() {
  console.log(`\n=== Suppression de la section « ${SECTION_TO_REMOVE} » (${SLUG}) ===\n`);

  const { data: page, error: readError } = await supabase
    .from('site_pages')
    .select('slug, title, layout_sections')
    .eq('slug', SLUG)
    .maybeSingle();

  if (readError) {
    console.error('❌ Lecture site_pages :', readError.message);
    process.exit(1);
  }
  if (!page) {
    console.error(`❌ Aucune ligne site_pages pour « ${SLUG} ».`);
    process.exit(1);
  }

  const before = Array.isArray(page.layout_sections) ? page.layout_sections : [];
  console.log('Sections AVANT :');
  before.forEach((s) => console.log(`  - ${s.id} (order ${s.order}) — ${s.name}`));

  const after = before
    .filter((s) => s.id !== SECTION_TO_REMOVE)
    .map((s, idx) => ({ ...s, order: idx + 1 }));

  if (after.length === before.length) {
    console.log(`\n⚠️  La section « ${SECTION_TO_REMOVE} » est déjà absente. Rien à faire.`);
    return;
  }

  console.log('\nSections APRÈS :');
  after.forEach((s) => console.log(`  - ${s.id} (order ${s.order}) — ${s.name}`));

  const { error: writeError } = await supabase
    .from('site_pages')
    .update({ layout_sections: after })
    .eq('slug', SLUG);

  if (writeError) {
    console.error('❌ Écriture site_pages :', writeError.message);
    process.exit(1);
  }

  // --- Contrôle de non-régression -------------------------------------------
  const { data: check, error: checkError } = await supabase
    .from('site_pages')
    .select('layout_sections')
    .eq('slug', SLUG)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Relecture :', checkError.message);
    process.exit(1);
  }

  const final = Array.isArray(check.layout_sections) ? check.layout_sections : [];
  const stillHasBanners = final.some((s) => s.id === SECTION_TO_REMOVE);
  const hasHallOfFame = final.some((s) => s.id === 'hall_of_fame');
  const hasHero = final.some((s) => s.id === 'hero');

  console.log('\n--- Contrôle de non-régression ---');
  console.log(`  ${stillHasBanners ? '❌' : '✅'} section « banners » absente`);
  console.log(`  ${hasHallOfFame ? '✅' : '❌'} section « hall_of_fame » (catalogue 570 films) présente`);
  console.log(`  ${hasHero ? '✅' : '❌'} section « hero » présente`);

  if (stillHasBanners || !hasHallOfFame || !hasHero) {
    console.error('\n❌ Régression détectée.');
    process.exit(2);
  }

  console.log(`\n✅ ${SLUG} — section « banners » retirée (${before.length} → ${final.length} sections).`);
}

main().catch((e) => {
  console.error('❌ Erreur inattendue :', e);
  process.exit(1);
});
