import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase URL or Service Key missing from .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Charger les données par défaut de l'application
const { DEFAULT_PAGE_CONTENTS, DEFAULT_SITE_SETTINGS } = await import('../src/lib/data/site-service.ts');
const { CUC_DISCIPLINES } = await import('../src/data/disciplines.ts');
const { CAMPUS_POIS } = await import('../src/components/ui/campus-map/campusMap.data.ts');
const { STUNT_PROGRAMS } = await import('../src/data/programs.ts');
const { CUC_TEAM } = await import('../src/data/team.ts');
const { FILMOGRAPHY_CREDITS } = await import('../src/data/filmography.ts');

async function syncPages() {
  console.log('\n--- 1. Synchronisation des 15 Pages dans site_pages ---');
  for (const [slug, pageData] of Object.entries(DEFAULT_PAGE_CONTENTS)) {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const { error } = await supabase.from('site_pages').upsert({
      slug: cleanSlug,
      title: pageData.title,
      meta_title: pageData.meta_title,
      meta_description: pageData.meta_description,
      og_image: pageData.og_image,
      hero: pageData.hero,
      sections: pageData.sections || [],
      layout_sections: pageData.layout_sections || [],
      sections_data: pageData.sections_data || {},
      is_published: pageData.is_published ?? true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Erreur page [${cleanSlug}]:`, error.message);
    } else {
      console.log(`✓ Page [${cleanSlug}] synchronisée avec sections_data (${Object.keys(pageData.sections_data || {}).length} sections)`);
    }
  }
}

async function syncSettings() {
  console.log('\n--- 2. Synchronisation de site_settings (general, disciplines, campus_pois) ---');
  // General settings
  const { error: errGen } = await supabase.from('site_settings').upsert({
    key: 'general',
    value: DEFAULT_SITE_SETTINGS,
    description: 'Paramètres généraux officiels CUC',
    updated_at: new Date().toISOString(),
  });
  if (errGen) console.error('Erreur site_settings general:', errGen.message);
  else console.log('✓ site_settings [general] synchronisé.');

  // Disciplines mirror
  const { error: errDisc } = await supabase.from('site_settings').upsert({
    key: 'disciplines',
    value: { list: CUC_DISCIPLINES },
    description: 'Liste miroir des 10 disciplines de cascade CUC',
    updated_at: new Date().toISOString(),
  });
  if (errDisc) console.error('Erreur site_settings disciplines:', errDisc.message);
  else console.log('✓ site_settings [disciplines] synchronisé.');

  // Campus POIs mirror
  const { error: errPois } = await supabase.from('site_settings').upsert({
    key: 'campus_pois',
    value: { list: CAMPUS_POIS },
    description: 'Liste miroir des infrastructures et zones tactiques CUC (6 Ha)',
    updated_at: new Date().toISOString(),
  });
  if (errPois) console.error('Erreur site_settings campus_pois:', errPois.message);
  else console.log('✓ site_settings [campus_pois] synchronisé.');
}

async function linkSessionsToFormations() {
  console.log('\n--- 3. Liaison CUC Sign: site_sessions ↔ formations ---');
  const { data: formations } = await supabase.from('formations').select('id, name, start_date, end_date');
  const { data: sessions } = await supabase.from('site_sessions').select('*');

  if (!formations || !sessions) {
    console.log('Impossible de récupérer formations ou sessions.');
    return;
  }

  console.log(`Analyse de ${sessions.length} sessions et ${formations.length} formations...`);
  for (const s of sessions) {
    // Recherche d'une correspondance par date ou nom
    let matchedFormation = formations.find(f => {
      if (s.date_display.includes('16 au 28 août 2026') && f.name.includes('16 au 28 août 2026')) return true;
      if (s.date_display.includes('18 au 30 octobre 2026') && f.name.includes('18 au 30 octobre 2026')) return true;
      if (s.date_display.includes('21 février au 05 mars 2027') && (f.name.includes('21 février') || f.name.includes('Février 2027'))) return true;
      if (s.date_display.includes('18 au 30 avril 2027') && f.name.includes('18 au 30 avril 2027')) return true;
      if (s.date_display.includes('12 et 13 septembre 2026') && f.name.includes('12-13 septembre 2026')) return true;
      if (s.date_display.includes('21 et 22 novembre 2026') && f.name.includes('21-22 novembre 2026')) return true;
      if (s.date_display.includes('09 au 20 novembre 2026') && f.name.includes('novembre 2026')) return true;
      if (s.date_display.includes('15 au 26 mars 2027') && f.name.includes('mars')) return true;
      if (s.date_display.includes('11 au 16 juillet 2027') && f.name.includes('Summer Camp')) return true;
      return false;
    });

    if (matchedFormation) {
      const { error } = await supabase
        .from('site_sessions')
        .update({ cuc_sign_formation_id: matchedFormation.id, updated_at: new Date().toISOString() })
        .eq('id', s.id);

      if (error) {
        console.error(`Erreur liaison session [${s.date_display}]:`, error.message);
      } else {
        console.log(`✓ Session [${s.date_display}] reliée à Formation CUC Sign [${matchedFormation.name}] (UUID: ${matchedFormation.id})`);
      }
    }
  }
}

async function linkTeamToProfiles() {
  console.log('\n--- 4. Liaison CUC Sign: site_team ↔ profiles ---');
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name');
  const { data: team } = await supabase.from('site_team').select('*');

  if (!profiles || !team) {
    console.log('Impossible de récupérer profiles ou site_team.');
    return;
  }

  const profileMap = {
    'lucas-dollfus': profiles.find(p => p.email === 'cuc@cuc.fr'),
    'malik-diouf': profiles.find(p => p.email === 'cuc2@cuc.fr'),
    'bastien-trouve': profiles.find(p => p.email === 'cuc10@cuc.fr'),
    'pierre-gomes': profiles.find(p => p.email === 'cuc4@cuc.fr'),
  };

  for (const member of team) {
    const matchedProfile = profileMap[member.id];
    if (matchedProfile) {
      const { error } = await supabase
        .from('site_team')
        .update({ profile_id: matchedProfile.id, updated_at: new Date().toISOString() })
        .eq('id', member.id);

      if (error) {
        console.error(`Erreur liaison formateur [${member.name}]:`, error.message);
      } else {
        console.log(`✓ Formateur [${member.name}] relié au profil CUC Sign [${matchedProfile.full_name}] (${matchedProfile.email})`);
      }
    }
  }
}

async function syncDisciplinesTable() {
  console.log('\n--- 5. Synchronisation de la table dédiée site_disciplines ---');
  const { error: probeError } = await supabase.from('site_disciplines').select('id').limit(1);
  if (probeError) {
    console.log('ℹ Table site_disciplines pas encore créée dans Supabase (exécutez scripts/migration_sync_cuc_cockpit.sql dans Supabase SQL Editor).');
    return;
  }

  for (const disc of CUC_DISCIPLINES) {
    const { error } = await supabase.from('site_disciplines').upsert({
      id: disc.id,
      number: disc.number,
      name: disc.name,
      category: disc.category,
      level: disc.level,
      duration: disc.duration,
      short_desc: disc.shortDesc,
      full_desc: disc.fullDesc,
      objectives: disc.objectives || [],
      equipment: disc.equipment || [],
      safety_rules: disc.safetyRules || [],
      prerequisites: disc.prerequisites || [],
      instructor_ids: disc.instructor_ids || [],
      film_ids: disc.film_ids || [],
      program_ids: disc.program_ids || [],
      order_index: disc.order_index ?? 0,
      is_active: disc.is_active ?? true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Erreur discipline [${disc.name}]:`, error.message);
    } else {
      console.log(`✓ Discipline [${disc.number} - ${disc.name}] enregistrée.`);
    }
  }
}

async function syncCampusPoisTable() {
  console.log('\n--- 6. Synchronisation de la table dédiée site_campus_pois (avec liaison CUC Sign locations) ---');
  const { error: probeError } = await supabase.from('site_campus_pois').select('id').limit(1);
  if (probeError) {
    console.log('ℹ Table site_campus_pois pas encore créée dans Supabase (exécutez scripts/migration_sync_cuc_cockpit.sql dans Supabase SQL Editor).');
    return;
  }

  const { data: locations } = await supabase.from('locations').select('id, name');

  for (const poi of CAMPUS_POIS) {
    // Match avec CUC Sign location
    let matchedLocation = (locations || []).find(l => {
      const locName = l.name.toLowerCase();
      const poiName = poi.name.toLowerCase();
      return poiName.includes(locName) || locName.includes(poiName) ||
             (poi.id.includes('tower') && locName.includes('tour')) ||
             (poi.id.includes('malik') && locName.includes('malik')) ||
             (poi.id.includes('bell') && locName.includes('bell'));
    });

    const { error } = await supabase.from('site_campus_pois').upsert({
      id: poi.id,
      location_id: matchedLocation ? matchedLocation.id : null,
      name: poi.name,
      type: poi.type || 'indoor',
      category: poi.category || 'technical',
      coords: poi.coords || { x: 50, y: 50 },
      level: poi.level || 'polyvalent',
      surface: poi.surface || null,
      capacity: poi.capacity || null,
      equipment: poi.equipment || [],
      features: poi.features || [],
      disciplines: poi.disciplines || [],
      coaches: poi.coaches || [],
      description: poi.description || null,
      is_active: poi.is_active ?? true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Erreur zone [${poi.name}]:`, error.message);
    } else {
      const linkInfo = matchedLocation ? ` [Relié à CUC Sign location: ${matchedLocation.name}]` : '';
      console.log(`✓ Zone campus [${poi.name}] enregistrée.${linkInfo}`);
    }
  }
}

async function syncInquiriesTable() {
  console.log('\n--- 7. Vérification / Initialisation de site_inquiries ---');
  const { error: probeError } = await supabase.from('site_inquiries').select('id').limit(1);
  if (probeError) {
    console.log('ℹ Table site_inquiries pas encore créée dans Supabase (exécutez scripts/migration_sync_cuc_cockpit.sql dans Supabase SQL Editor).');
    return;
  }

  const SAMPLE_INQUIRIES = [
    {
      id: 'inq_init_001',
      full_name: 'Alexandre Renard',
      email: 'alex.renard.stunt@gmail.com',
      phone: '+33 6 12 34 56 78',
      program_id: 'pro-longue-duree',
      program_title: 'Formation Professionnelle Longue Durée',
      age: '23 ans',
      sport_background: 'Gymnastique artistique (10 ans) & Parkour',
      session_date: '16 au 28 août 2026',
      afdas_status: 'Dossier France Travail AIF en cours',
      message: 'Passionné de cascade depuis toujours, j’ai pratiqué la gym et les arts martiaux. Très motivé pour intégrer le cursus pro.',
      status: 'nouveau',
      admin_notes: 'Dossier prometteur. Bon bagage gymnique. Prévoir convocation audition.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inq_init_002',
      full_name: 'Sophie Moreau',
      email: 's.moreau@production-action.fr',
      phone: '+33 6 98 76 54 32',
      program_id: 'weekend-immersion',
      program_title: 'Week-end Immersion Cascades',
      age: '28 ans',
      sport_background: 'Cascade équestre & Arts Martiaux',
      session_date: '12 et 13 septembre 2026',
      afdas_status: 'Financement personnel',
      message: 'Comédienne souhaitant développer ses compétences d’action et de combat cinéma pour un rôle.',
      status: 'en_cours',
      admin_notes: 'Dossier validé administrativement. En attente de paiement acompte.',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  for (const inq of SAMPLE_INQUIRIES) {
    const { error } = await supabase.from('site_inquiries').upsert(inq);
    if (!error) console.log(`✓ Candidature initiale [${inq.full_name}] insérée.`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('🚀 DÉMARRAGE DE LA SYNCHRONISATION TOTALE CUC ↔ SUPABASE & CUC SIGN');
  console.log('================================================================');

  await syncPages();
  await syncSettings();
  await linkSessionsToFormations();
  await linkTeamToProfiles();
  await syncDisciplinesTable();
  await syncCampusPoisTable();
  await syncInquiriesTable();

  console.log('\n================================================================');
  console.log('🎉 SYNCHRONISATION TERMINÉE AVEC SUCCÈS !');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Erreur fatale lors de la synchronisation:', err);
  process.exit(1);
});
