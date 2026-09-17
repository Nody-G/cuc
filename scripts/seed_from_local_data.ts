import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { STUNT_PROGRAMS } from '../src/data/programs';
import { CUC_TEAM } from '../src/data/team';
import { FILMOGRAPHY_CREDITS } from '../src/data/filmography';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur : Clés Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Synchronisation des données locales vers Supabase...');

  // 1. Programmes
  for (let i = 0; i < STUNT_PROGRAMS.length; i++) {
    const p = STUNT_PROGRAMS[i];
    const { error: progError } = await supabase.from('site_programs').upsert({
      id: p.id,
      category: p.category,
      title: p.title,
      badge: p.badge,
      highlight: !!p.highlight,
      tagline: p.tagline,
      duration: p.duration,
      hours: p.hours,
      location: p.location,
      price: p.price,
      price_note: p.priceNote,
      age_requirement: p.ageRequirement,
      eligibility: p.eligibility,
      description: p.description,
      objectives: p.objectives,
      key_modules: p.keyModules,
      certification: p.certification,
      cta_text: p.ctaText,
      brochure_url: p.brochureUrl,
      order_index: i,
      is_published: true,
    });

    if (progError) {
      console.error(`Erreur insertion programme ${p.id}:`, progError.message);
      return;
    }

    // Sessions
    if (p.nextSessions) {
      for (let sIdx = 0; sIdx < p.nextSessions.length; sIdx++) {
        const s = p.nextSessions[sIdx];
        await supabase.from('site_sessions').insert({
          program_id: p.id,
          date_display: s.date,
          status: s.status,
          order_index: sIdx,
          is_published: true,
        });
      }
    }
  }
  console.log(`✅ ${STUNT_PROGRAMS.length} programmes et leurs sessions insérés.`);

  // 2. Équipe
  for (let i = 0; i < CUC_TEAM.length; i++) {
    const t = CUC_TEAM[i];
    const { error: teamError } = await supabase.from('site_team').upsert({
      id: t.id,
      name: t.name,
      role: t.role,
      title: t.title,
      specialties: t.specialties,
      bio: t.bio,
      doubled_actors: t.doubledActors || [],
      notable_credits: t.notableCredits,
      avatar_url: t.avatarUrl,
      instagram: t.instagram,
      imdb: t.imdb,
      external_url: t.externalUrl,
      order_index: i,
      is_published: true,
    });
    if (teamError) {
      console.error(`Erreur insertion instructeur ${t.id}:`, teamError.message);
    }
  }
  console.log(`✅ ${CUC_TEAM.length} instructeurs insérés.`);

  // 3. Filmographie
  for (let i = 0; i < FILMOGRAPHY_CREDITS.length; i++) {
    const f = FILMOGRAPHY_CREDITS[i];
    const { error: filmError } = await supabase.from('site_films').upsert({
      id: f.id,
      title: f.title,
      year: f.year,
      category: f.category,
      director: f.director,
      stunt_roles: f.stuntRoles,
      doubled_actors: f.doubledActors || [],
      highlight: !!f.highlight,
      image: f.image,
      tag: f.tag,
      imdb_url: f.imdbUrl,
      allocine_url: f.allocineUrl,
      trailer_url: f.trailerUrl,
      order_index: i,
      is_published: true,
    });
    if (filmError) {
      console.error(`Erreur insertion film ${f.id}:`, filmError.message);
    }
  }
  console.log(`✅ ${FILMOGRAPHY_CREDITS.length} films insérés.`);

  console.log('🎉 Synchronisation terminée avec succès !');
}

seed().catch(console.error);
