import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('--- 1. Syncing site_team to Supabase ---');
  
  // Read src/data/team.ts cleanly
  const teamCode = fs.readFileSync('src/data/team.ts', 'utf8');
  // Extract JSON-like array
  const match = teamCode.match(/export const CUC_TEAM: Instructor\[\] = (\[[\s\S]*?\]);\s*$/);
  if (!match) {
    throw new Error('Could not parse CUC_TEAM from src/data/team.ts');
  }
  
  // Evaluation of the JS array
  const CUC_TEAM = eval(match[1]);
  console.log(`Loaded ${CUC_TEAM.length} team members from src/data/team.ts`);
  
  for (const m of CUC_TEAM) {
    const payload = {
      name: m.name,
      role: m.role,
      title: m.title,
      specialties: m.specialties,
      bio: m.bio,
      notable_credits: m.notableCredits,
      doubled_actors: m.doubledActors || [],
      imdb: m.imdb || null,
      external_url: m.externalUrl || null,
      instagram: m.instagram || null,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('site_team').update(payload).eq('id', m.id);
    if (error) {
      console.error(`❌ Error updating team member ${m.id}:`, error.message);
    } else {
      console.log(`✅ Updated team member ${m.id} (IMDb: ${m.imdb || 'none'})`);
    }
  }

  console.log('\n--- 2. Syncing site_films cuc_team_involved to Supabase ---');
  const filmCode = fs.readFileSync('src/data/filmography.ts', 'utf8');
  const arrayStart = filmCode.indexOf('export const FILMOGRAPHY_CREDITS: FilmCredit[] = [');
  const arrayJson = filmCode.slice(arrayStart + 'export const FILMOGRAPHY_CREDITS: FilmCredit[] = '.length).replace(/;\s*$/, '');
  const films = JSON.parse(arrayJson);

  console.log(`Loaded ${films.length} films from src/data/filmography.ts`);
  
  for (const f of films) {
    const { error } = await supabase
      .from('site_films')
      .update({
        cuc_team_involved: f.cuc_team_involved || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', f.id);
      
    if (error) {
      console.error(`❌ Error updating film ${f.id}:`, error.message);
    } else {
      const teamCount = (f.cuc_team_involved || []).length;
      if (teamCount > 0) {
        console.log(`✅ Updated film ${f.id} (${teamCount} coachs: ${f.cuc_team_involved.join(', ')})`);
      }
    }
  }
  
  console.log('\n--- All data successfully synced to Supabase! ---');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
