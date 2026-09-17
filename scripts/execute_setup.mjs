import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'xkbkcsypftvspmkfnrfm';

async function executeQuery(query, stepName) {
  console.log(`\n⏳ Exécution de : ${stepName}...`);
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${stepName} exécuté avec succès (HTTP ${res.statusCode}) !`);
          resolve(data);
        } else {
          console.error(`❌ Erreur sur ${stepName} (HTTP ${res.statusCode}) :`, data);
          reject(new Error(data));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Erreur réseau sur ${stepName}:`, err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  const schemaSql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'schema_site_vitrine.sql'), 'utf-8');
  const seedSql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'seed_site_vitrine.sql'), 'utf-8');

  // Étape 1 : Création des tables, index et RLS
  await executeQuery(schemaSql, 'Création du Schéma (tables site_*, index, RLS, storage)');

  // Étape 2 : Injection des données initiales (programmes, sessions, équipe, films)
  await executeQuery(seedSql, 'Injection des Données Initiales (Seed)');

  console.log('\n🎉 TOUT EST DÉPLOYÉ ET ACTIF SUR VOTRE BASE SUPABASE !');
}

run().catch((err) => {
  console.error('\nÉchec du déploiement :', err.message);
  process.exit(1);
});
