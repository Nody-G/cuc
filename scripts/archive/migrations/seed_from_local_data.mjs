import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables depuis .env.local
const envPath = join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesExist() {
  const { data, error } = await supabase.from('site_programs').select('id').limit(1);
  if (error && error.code === '42P01') {
    return false; // table does not exist
  }
  return true;
}

async function runSeed() {
  console.log('--- VÉRIFICATION DES TABLES SITE_* DANS SUPABASE ---');
  const exists = await checkTablesExist();
  if (!exists) {
    console.log('\n[INFO IMPORTANTE]');
    console.log('Les tables "site_*" ne sont pas encore créées dans Supabase.');
    console.log('Copiez-collez le contenu de "scripts/schema_site_vitrine.sql" dans l\'éditeur SQL Supabase');
    console.log('URL: https://supabase.com/dashboard/project/xkbkcsypftvspmkfnrfm/sql/new');
    console.log('Puis relancez ce script !\n');
    return;
  }

  console.log('Tables détectées ! Préparation de l\'import des données locales...');

  // 1. Lire les programmes et sessions
  const programsContent = fs.readFileSync(join(__dirname, '..', 'src', 'data', 'programs.ts'), 'utf-8');
  // Simple regex parser or import TS data
  // Let's dynamically import or parse
}

runSeed().catch(console.error);
