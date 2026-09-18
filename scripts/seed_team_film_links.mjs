import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/)[1].trim();
const client = createClient(url, key);

const FILM_TEAM_MAPPINGS = {
  'yamakasi': ['malik-diouf'],
  'largo-winch-3': ['vincent-bouillon', 'lucas-dollfus', 'bastien-trouve'],
  'monte-cristo': ['jerome-gaspard', 'vincent-bouillon', 'amedeo-cazzella'],
  'the-substance': ['michael-troude', 'vincent-bouillon'],
  'lamour-ouf': ['vincent-bouillon', 'lucas-dollfus', 'bastien-trouve'],
  'john-wick-4': ['jerome-gaspard', 'vincent-bouillon', 'maurice-chan', 'kefi-abrikh'],
  'the-killer': ['vincent-bouillon', 'maurice-chan', 'franck-blanc'],
  'elyas': ['vincent-bouillon', 'michael-troude', 'alan-cueff'],
  'sous-la-seine': ['franck-blanc', 'niels-dalery', 'lucas-dollfus'],
  'fast-furious-6': ['jerome-gaspard'],
  'james-bond-spectre': ['jerome-gaspard', 'vincent-bouillon'],
  'lucy': ['maurice-chan', 'jerome-gaspard'],
  'valerian': ['jerome-gaspard', 'franck-blanc'],
  'dunkirk': ['jerome-gaspard', 'michael-troude'],
};

async function run() {
  console.log('--- RELIAGE SITE_FILMS <-> SITE_TEAM DANS SUPABASE ---');

  for (const [filmId, teamIds] of Object.entries(FILM_TEAM_MAPPINGS)) {
    const { data, error } = await client
      .from('site_films')
      .update({ cuc_team_involved: teamIds, updated_at: new Date().toISOString() })
      .eq('id', filmId)
      .select('id, title, cuc_team_involved');

    if (error) {
      console.error(`Erreur sur film ${filmId}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✓ Film "${data[0].title}" (${filmId}) relié à :`, data[0].cuc_team_involved);
    } else {
      console.warn(`! Film ${filmId} non trouvé dans site_films.`);
    }
  }

  // Vérification de la liaison dans site_settings miroir
  const { data: settingRow } = await client
    .from('site_settings')
    .select('value')
    .eq('key', 'films')
    .maybeSingle();

  if (settingRow?.value?.list) {
    const updatedList = settingRow.value.list.map((f) => ({
      ...f,
      cuc_team_involved: FILM_TEAM_MAPPINGS[f.id] || f.cuc_team_involved || [],
    }));
    await client
      .from('site_settings')
      .upsert({
        key: 'films',
        value: { list: updatedList },
        updated_at: new Date().toISOString(),
      });
    console.log('✓ site_settings (key=films) synchronisé avec succès.');
  }

  console.log('--- RELIAGE TERMINÉ AVEC SUCCÈS ---');
}

run().catch(console.error);
