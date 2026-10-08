import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function creditTitleKey(title) {
  if (!title) return '';
  return title
    .trim()
    .replace(/\s*\(\s*\d{4}\s*(?:[-–—]\s*\d{4}\s*)?\)\s*$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('=== SYNCHRONISATION SITE_FILMS AVEC LES 20 COACHS & DOUBLURES ===\n');

  // 1. Fetch all films from site_films
  const { data: films, error: errFilms } = await supabase
    .from('site_films')
    .select('id, title, year, cuc_team_involved, metadata, doubled_actors');
  if (errFilms) {
    console.error('Erreur chargement site_films:', errFilms.message);
    process.exit(1);
  }
  console.log(`Chargé ${films.length} films depuis Supabase site_films.`);

  // 2. Load scraped coaches data
  const scrapedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'coaches_scraped_full_imdb.json'), 'utf8'));

  // Index films by creditTitleKey
  const filmsByKey = new Map();
  for (const f of films) {
    const key = creditTitleKey(f.title);
    if (!filmsByKey.has(key)) {
      filmsByKey.set(key, []);
    }
    filmsByKey.get(key).push(f);
  }

  // Aggregate coach involvement and doubled actors per film
  let matchCount = 0;
  const updates = new Map(); // filmId -> { cuc_team_involved: Set, roles: {}, doubled_actors: Set }

  for (const coach of scrapedData.coaches) {
    for (const credit of coach.credits) {
      const key = creditTitleKey(credit.title);
      const matches = filmsByKey.get(key);
      if (!matches || matches.length === 0) continue;

      for (const film of matches) {
        if (!updates.has(film.id)) {
          updates.set(film.id, {
            film,
            coachIds: new Set(film.cuc_team_involved || []),
            roles: { ...(film.metadata?.cuc_team_roles || {}) },
            doubledActors: new Set(film.doubled_actors || []),
          });
        }
        const u = updates.get(film.id);
        u.coachIds.add(coach.id);
        u.roles[coach.id] = credit.roleLabel;
        if (credit.doubledActor) {
          u.doubledActors.add(`${credit.doubledActor} (doublé par ${coach.name})`);
        }
        matchCount++;
      }
    }
  }

  console.log(`Total correspondances trouvées : ${matchCount} sur ${updates.size} films distincts.`);

  // 3. Appliquer les mises à jour sur site_films
  let updatedFilmsCount = 0;
  for (const [filmId, u] of updates.entries()) {
    const newTeamInvolved = Array.from(u.coachIds);
    const newRoles = u.roles;
    const newDoubledActors = Array.from(u.doubledActors);

    const metadata = {
      ...(u.film.metadata || {}),
      cuc_team_roles: newRoles,
    };

    const { error } = await supabase
      .from('site_films')
      .update({
        cuc_team_involved: newTeamInvolved,
        doubled_actors: newDoubledActors,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', filmId);

    if (error) {
      console.error(`  ✗ Erreur mise à jour film ${filmId}:`, error.message);
    } else {
      updatedFilmsCount++;
    }
  }

  console.log(`✓ ${updatedFilmsCount} films mis à jour avec succès dans Supabase.`);

  // 4. Update site_settings['films'] mirror
  const { data: updatedFilms } = await supabase.from('site_films').select('*');
  if (updatedFilms) {
    const { error: errMirror } = await supabase.from('site_settings').upsert({
      key: 'films',
      value: updatedFilms,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    if (errMirror) {
      console.error('  ✗ Erreur miroir site_settings[films]:', errMirror.message);
    } else {
      console.log('✓ Miroir site_settings[films] synchronisé.');
    }
  }
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
