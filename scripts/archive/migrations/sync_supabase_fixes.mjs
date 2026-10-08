import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateDb() {
  console.log('--- Updating Supabase site_films ---');
  const films = JSON.parse(fs.readFileSync('scripts/all_63_films_resolved.json', 'utf8'));
  for (const f of films) {
    const { error } = await supabase.from('site_films').update({
      imdb_url: f.imdb_url,
      allocine_url: f.allocine_url,
      trailer_url: f.trailer_url
    }).eq('id', f.id);
    if (error) console.error(`Error updating film ${f.id}:`, error.message);
  }
  console.log('Updated 63 films in site_films.');

  console.log('\n--- Updating site_settings (key="films") ---');
  const { data: currentCredits } = await supabase.from('site_settings').select('value').eq('key', 'films').single();
  if (currentCredits && currentCredits.value) {
    const updatedValue = currentCredits.value.map(c => {
      const found = films.find(f => f.id === c.id);
      if (found) {
        return {
          ...c,
          imdbUrl: found.imdb_url,
          allocineUrl: found.allocine_url,
          trailerUrl: found.trailer_url
        };
      }
      return c;
    });
    const { error: errFilms } = await supabase.from('site_settings').update({
      value: updatedValue
    }).eq('key', 'films');
    if (errFilms) console.error('Error updating site_settings films:', errFilms.message);
    else console.log('Successfully updated site_settings (key="films").');
  }

  console.log('\n--- Updating site_settings (key="general") ---');
  const { data: generalData } = await supabase.from('site_settings').select('value').eq('key', 'general').single();
  if (generalData && generalData.value) {
    const updatedGeneral = {
      ...generalData.value,
      instagram: 'https://www.instagram.com/campus.univers.cascades/',
      tiktok: 'https://www.tiktok.com/@campus.univers.cascades',
      facebook: 'https://www.facebook.com/campus.univers.cascades',
      youtube: 'https://www.youtube.com/@campusuniverscascades',
      linkedin: ''
    };
    const { error: errGen } = await supabase.from('site_settings').update({
      value: updatedGeneral
    }).eq('key', 'general');
    if (errGen) console.error('Error updating site_settings general:', errGen.message);
    else console.log('Successfully updated site_settings (key="general").');
  }

  console.log('\n--- Updating site_team ---');
  const { error: errTeam } = await supabase.from('site_team').update({
    website_url: 'https://www.kefiabrikh.com/'
  }).eq('id', 'kefi-abrikh');
  if (errTeam) console.error('Error updating kefi website:', errTeam.message);

  console.log('Database synchronization complete!');
}

updateDb();
