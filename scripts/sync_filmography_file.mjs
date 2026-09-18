import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncLocalFilmography() {
  const { data, error } = await supabase
    .from('site_films')
    .select('*')
    .eq('is_published', true)
    .order('year', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch site_films:', error);
    return;
  }

  const filmCredits = data.map(f => ({
    id: f.id,
    title: f.title,
    year: f.year || '',
    category: f.category || 'Cinéma',
    director: f.director,
    stuntRoles: f.stunt_roles || '',
    doubledActors: f.doubled_actors,
    highlight: !!f.highlight,
    image: f.image || '',
    tag: f.tag || '',
    imdbUrl: f.imdb_url || '',
    allocineUrl: f.allocine_url || '',
    trailerUrl: f.trailer_url || '',
    cuc_team_involved: f.cuc_team_involved || []
  }));

  const fileHeader = `import { FilmCredit } from '@/types';

export { OFFICIAL_FILM_BANNERS } from './filmBanners';
export type { FilmBanner } from './filmBanners';
export { DOUBLED_CELEBRITIES } from './celebrities';

export const FILMOGRAPHY_CREDITS: FilmCredit[] = `;

  const fullContent = fileHeader + JSON.stringify(filmCredits, null, 2) + ';\n';
  fs.writeFileSync('src/data/filmography.ts', fullContent, 'utf8');
  console.log(`Updated src/data/filmography.ts with all ${filmCredits.length} fully verified films!`);
}

syncLocalFilmography();
