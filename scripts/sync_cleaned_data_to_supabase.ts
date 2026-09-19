import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CUC_DISCIPLINES } from '../src/data/disciplines';
import { CAMPUS_FACILITIES } from '../src/data/campus';
import { STUNT_PROGRAMS } from '../src/data/programs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function sync() {
  console.log('--- Syncing Cleaned Data to Supabase ---');

  // 1. Sync site_settings: disciplines
  const { error: errDisc } = await supabase
    .from('site_settings')
    .upsert({ key: 'disciplines', value: CUC_DISCIPLINES, updated_at: new Date().toISOString() });
  console.log('Sync disciplines:', errDisc ? errDisc.message : 'OK');

  // 2. Sync site_settings: campus_facilities
  const { error: errFac } = await supabase
    .from('site_settings')
    .upsert({ key: 'campus_facilities', value: CAMPUS_FACILITIES, updated_at: new Date().toISOString() });
  console.log('Sync campus_facilities:', errFac ? errFac.message : 'OK');

  // 3. Sync site_settings: programs
  const { error: errProg } = await supabase
    .from('site_settings')
    .upsert({ key: 'programs', value: STUNT_PROGRAMS, updated_at: new Date().toISOString() });
  console.log('Sync programs:', errProg ? errProg.message : 'OK');

  // 4. Update site_pages
  // 4a. contact-cuc
  const { data: contactPage } = await supabase.from('site_pages').select('*').eq('slug', 'contact-cuc').single();
  if (contactPage) {
    const hero = contactPage.hero || {};
    hero.badge = 'CONTACT & ADMISSIONS';
    await supabase.from('site_pages').update({ hero, updated_at: new Date().toISOString() }).eq('slug', 'contact-cuc');
    console.log('Updated site_pages contact-cuc');
  }

  // 4b. formation-de-cascadeur
  const { data: formationPage } = await supabase.from('site_pages').select('*').eq('slug', 'formation-de-cascadeur').single();
  if (formationPage) {
    const hero = formationPage.hero || {};
    hero.badge = 'FORMATION PROFESSIONNELLE • 2 ANS';
    const sectionsData = formationPage.sections_data || {};
    if (sectionsData.formules && Array.isArray(sectionsData.formules.items)) {
      sectionsData.formules.items.forEach((item: any) => {
        if (item.id === 'pro_longue_duree') {
          item.step_badge = 'ÉTAPE 02 • FORMATION PROFESSIONNELLE';
        }
      });
    }
    await supabase.from('site_pages').update({
      hero,
      sections_data: sectionsData,
      updated_at: new Date().toISOString()
    }).eq('slug', 'formation-de-cascadeur');
    console.log('Updated site_pages formation-de-cascadeur');
  }

  // 4c. animations-airbag-parkour
  const { data: airbagPage } = await supabase.from('site_pages').select('*').eq('slug', 'animations-airbag-parkour').single();
  if (airbagPage) {
    const hero = airbagPage.hero || {};
    hero.badge = 'AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL';
    hero.subtitle = "Faites vivre au grand public les sensations uniques de la chute libre sur coussin d'air géant de cinéma dans un cadre sécurisé.";
    await supabase.from('site_pages').update({
      hero,
      meta_description: "Faites vivre le grand frisson du saut dans le vide sur coussin d'air géant de cinéma. Animation encadrée par des cascadeurs professionnels.",
      updated_at: new Date().toISOString()
    }).eq('slug', 'animations-airbag-parkour');
    console.log('Updated site_pages animations-airbag-parkour');
  }

  // 4d. team-building-cascades
  const { data: tbPage } = await supabase.from('site_pages').select('*').eq('slug', 'team-building-cascades').single();
  if (tbPage && tbPage.sections_data?.ateliers) {
    const sectionsData = tbPage.sections_data;
    if (Array.isArray(sectionsData.ateliers.items)) {
      sectionsData.ateliers.items.forEach((item: any) => {
        if (item.id === 'combat') {
          item.desc = "Initiation aux techniques de combats de films : esquives, feintes, coups scéniques et synchronisation avec les axes caméra.";
        }
      });
    }
    await supabase.from('site_pages').update({ sections_data: sectionsData, updated_at: new Date().toISOString() }).eq('slug', 'team-building-cascades');
    console.log('Updated site_pages team-building-cascades');
  }

  // 4e. videos-cascadeur
  const { data: videosPage } = await supabase.from('site_pages').select('*').eq('slug', 'videos-cascadeur').single();
  if (videosPage) {
    const hero = videosPage.hero || {};
    hero.subtitle = "Découvrez les coulisses de l'entraînement des cascadeurs avec les reportages de TF1, France 2 et les showreels du Campus Univers Cascades.";
    await supabase.from('site_pages').update({ hero, updated_at: new Date().toISOString() }).eq('slug', 'videos-cascadeur');
    console.log('Updated site_pages videos-cascadeur');
  }

  console.log('--- All Supabase tables and settings synced! ---');
}

sync().catch(console.error);
