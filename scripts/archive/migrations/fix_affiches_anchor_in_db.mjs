/**
 * Corrige l'ancre `#affiches` → `#filmographie` dans `site_pages.hero`.
 *
 * Contexte : la section `banners` (id="affiches") a été retirée de la page
 * `cuc-team-cascadeur` car elle faisait doublon avec `hall_of_fame`
 * (id="filmographie", catalogue complet de 570 films). Toute ancre `#affiches`
 * est donc devenue orpheline.
 *
 * Ce script met à jour `hero.cta_secondary_link` en base pour pointer vers
 * l'ancre réellement présente dans le DOM.
 *
 * Usage : node scripts/fix_affiches_anchor_in_db.mjs
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
const OLD_ANCHOR = '#affiches';
const NEW_ANCHOR = '#filmographie';

async function main() {
  console.log(`\n=== Correction de l'ancre ${OLD_ANCHOR} → ${NEW_ANCHOR} (${SLUG}) ===\n`);

  const { data: page, error: readError } = await supabase
    .from('site_pages')
    .select('slug, hero')
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

  const hero = page.hero ?? {};
  console.log('hero.cta_secondary_link AVANT :', hero.cta_secondary_link ?? '(absent)');

  if (hero.cta_secondary_link !== OLD_ANCHOR) {
    console.log(`\n⚠️  L'ancre n'est pas « ${OLD_ANCHOR} ». Rien à corriger.`);
    return;
  }

  const nextHero = { ...hero, cta_secondary_link: NEW_ANCHOR };

  const { error: writeError } = await supabase
    .from('site_pages')
    .update({ hero: nextHero })
    .eq('slug', SLUG);

  if (writeError) {
    console.error('❌ Écriture site_pages :', writeError.message);
    process.exit(1);
  }

  // --- Contrôle de non-régression -------------------------------------------
  const { data: check, error: checkError } = await supabase
    .from('site_pages')
    .select('hero')
    .eq('slug', SLUG)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Relecture :', checkError.message);
    process.exit(1);
  }

  const finalLink = check?.hero?.cta_secondary_link;
  console.log('hero.cta_secondary_link APRÈS :', finalLink ?? '(absent)');

  const ok = finalLink === NEW_ANCHOR;
  console.log(`\n${ok ? '✅' : '❌'} ancre corrigée vers ${NEW_ANCHOR}`);

  if (!ok) {
    console.error('\n❌ Régression détectée.');
    process.exit(2);
  }
}

main().catch((e) => {
  console.error('❌ Erreur inattendue :', e);
  process.exit(1);
});
