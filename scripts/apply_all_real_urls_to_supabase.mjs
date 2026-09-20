import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TEAM_UPDATES = [
  {
    id: 'lucas-dollfus',
    instagram: 'https://www.instagram.com/lucas.dollfus/',
    external_url: 'https://www.instagram.com/lucas.dollfus/',
    imdb: 'https://www.imdb.com/name/nm8686683/'
  },
  {
    id: 'jerome-gaspard',
    imdb: 'https://www.imdb.com/name/nm2285249/',
    external_url: 'https://www.action-cascade.com/coordinateur-de-cascades/',
    instagram: null
  },
  {
    id: 'vincent-bouillon',
    imdb: 'https://www.imdb.com/name/nm3763784/',
    external_url: 'https://vincentbouillon.com/',
    instagram: 'https://www.instagram.com/vincentbouillon/'
  },
  {
    id: 'malik-diouf',
    imdb: 'https://www.imdb.com/name/nm0228086/',
    external_url: 'https://www.imdb.com/name/nm0228086/',
    instagram: 'https://www.instagram.com/malikdiouf_yamakasi/'
  },
  {
    id: 'franck-blanc',
    imdb: 'https://www.imdb.com/name/nm6923086/',
    external_url: 'https://www.imdb.com/name/nm6923086/',
    instagram: null
  },
  {
    id: 'kefi-abrikh',
    imdb: 'https://www.imdb.com/name/nm3768608/',
    external_url: 'https://www.kefiabrikh.com/',
    instagram: null
  },
  {
    id: 'maurice-chan',
    imdb: 'https://www.imdb.com/name/nm0151023/',
    external_url: 'https://mauricechan.book.fr',
    instagram: null
  },
  {
    id: 'michael-troude',
    imdb: 'https://www.imdb.com/name/nm0873735/',
    external_url: null,
    instagram: null
  },
  {
    id: 'amedeo-cazzella',
    imdb: 'https://www.imdb.com/name/nm5449764/',
    external_url: null,
    instagram: null
  },
  {
    id: 'niels-dalery',
    imdb: 'https://www.imdb.com/name/nm9102434/',
    external_url: 'https://nielsdalery.com/',
    instagram: 'https://www.instagram.com/nielsdalery'
  }
];

async function applyUpdates() {
  if (!fs.existsSync('scripts/all_63_films_resolved.json')) {
    console.error('Wait for scripts/all_63_films_resolved.json to be generated first!');
    return;
  }

  const resolvedFilms = JSON.parse(fs.readFileSync('scripts/all_63_films_resolved.json', 'utf8'));
  console.log(`Applying updates for ${resolvedFilms.length} films to Supabase...`);

  let updatedCount = 0;
  for (const f of resolvedFilms) {
    const { error } = await supabase
      .from('site_films')
      .update({
        imdb_url: f.imdb_url,
        allocine_url: f.allocine_url,
        trailer_url: f.trailer_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', f.id);

    if (error) {
      console.error(`Error updating film ${f.id}:`, error);
    } else {
      updatedCount++;
    }
  }
  console.log(`Successfully updated ${updatedCount}/${resolvedFilms.length} films in site_films!`);

  // Update site_settings 'films' cache
  const { data: allFilmsFromDb } = await supabase
    .from('site_films')
    .select('*')
    .order('year', { ascending: false });

  if (allFilmsFromDb && allFilmsFromDb.length > 0) {
    await supabase
      .from('site_settings')
      .upsert({
        key: 'films',
        value: allFilmsFromDb,
        updated_at: new Date().toISOString()
      });
    console.log('Synchronized site_settings.films cache!');
  }

  // Update site_team instructors
  console.log('\nUpdating site_team instructors with real profiles...');
  for (const t of TEAM_UPDATES) {
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    if (t.imdb !== undefined) updatePayload.imdb = t.imdb;
    if (t.external_url !== undefined) updatePayload.external_url = t.external_url;
    if (t.instagram !== undefined) updatePayload.instagram = t.instagram;

    const { error: teamErr } = await supabase
      .from('site_team')
      .update(updatePayload)
      .eq('id', t.id);

    if (teamErr) {
      console.error(`Error updating team member ${t.id}:`, teamErr);
    } else {
      console.log(`Updated team member ${t.id} (IMDb: ${t.imdb || 'N/A'}, Instagram: ${t.instagram || 'N/A'})`);
    }
  }

  console.log('\nAll Supabase database records updated successfully!');
}

applyUpdates();
