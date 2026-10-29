#!/usr/bin/env node
/**
 * Synchronise les nouvelles bios rédigées et authentiques des 20 coachs dans :
 * 1. La table `site_team` (colonne `bio` et `updated_at`)
 * 2. La clé `team` de la table `site_settings`
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase URL ou Service Role Key manquant dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Charger le team.ts en lisant le fichier JSON extrait ou en l'important
const teamFilePath = path.resolve('src/data/team.ts');
const teamFileContent = fs.readFileSync(teamFilePath, 'utf8');

// Extraction de CUC_TEAM via regex ou évaluation sécurisée
const match = teamFileContent.match(/export const CUC_TEAM:\s*Instructor\[\]\s*=\s*(\[[\s\S]*?\]);/);
if (!match) {
  console.error('❌ Impossible de trouver CUC_TEAM dans src/data/team.ts');
  process.exit(1);
}

const team = JSON.parse(match[1]);
console.log(`✓ ${team.length} coachs trouvés dans src/data/team.ts`);

async function main() {
  console.log('\n--- 1. Mise à jour de la table site_team (colonnes bio & specialties) ---');
  for (const coach of team) {
    const { error } = await supabase
      .from('site_team')
      .update({
        bio: coach.bio,
        specialties: coach.specialties,
        updated_at: new Date().toISOString()
      })
      .eq('id', coach.id);

    if (error) {
      console.error(`  ✗ Erreur mise à jour site_team [${coach.id}]:`, error.message);
    } else {
      console.log(`  ✓ site_team [${coach.id}] (${coach.name}) mis à jour.`);
    }
  }

  console.log('\n--- 2. Mise à jour du miroir site_settings [team] ---');
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({
      key: 'team',
      value: team,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (settingsError) {
    console.error('  ✗ Erreur mise à jour site_settings [team]:', settingsError.message);
  } else {
    console.log('  ✓ site_settings [team] synchronisé avec succès.');
  }

  console.log('\n✓ Synchronisation Supabase terminée.');
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
