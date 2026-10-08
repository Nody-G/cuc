/**
 * Vérification post-synchronisation : films réels + rôles canoniques.
 * Usage : node scripts/verify_synced_films_and_roles.mjs
 */
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

await client.connect();

const total = await client.query('select count(*)::int n from site_films');
console.log('FILMS TOTAL                 :', total.rows[0].n);

const withDesc = await client.query(
    "select count(*)::int n from site_films where description is not null and description <> ''"
);
console.log('AVEC DESCRIPTION            :', withDesc.rows[0].n);

const withPoster = await client.query(
    "select count(*)::int n from site_films where image is not null and image <> ''"
);
console.log('AVEC JAQUETTE               :', withPoster.rows[0].n);

const fake = await client.query(
    `select count(*)::int n from site_films
   where description ilike '%Interventions CUC%'
      or description ilike '%Cascades d''action urbaine%'
      or description ilike '%Projections t%'
      or description ilike '%chutes surnaturelles%'`
);
console.log('DESCRIPTIONS COMPOSEES REST.:', fake.rows[0].n);

const roles = await client.query(
    `select distinct value as role
   from site_films, jsonb_each_text(metadata->'cuc_team_roles')
   order by 1`
);
console.log('ROLES DISTINCTS (films)     :', JSON.stringify(roles.rows.map((r) => r.role)));

const team = await client.query(
    `select id, jsonb_array_length(to_jsonb(notable_credits)) n
   from site_team order by n desc`
);
console.log('CREDITS PAR COACH           :');
for (const row of team.rows) {
    console.log(`  ${row.id.padEnd(18)} ${String(row.n).padStart(4)}`);
}

const niels = await client.query(
    `select notable_credits from site_team where id = 'niels-dalery'`
);
console.log('NIELS DALERY                :', JSON.stringify(niels.rows[0]?.notable_credits));

const sample = await client.query(
    `select title, year, left(description, 90) as d, left(image, 60) as img
   from site_films
   where description is not null and description <> ''
   order by year desc nulls last limit 3`
);
console.log('ECHANTILLON FILMS           :');
for (const row of sample.rows) {
    console.log(`  ${row.title} (${row.year})`);
    console.log(`    desc: ${row.d}`);
    console.log(`    img : ${row.img}`);
}

await client.end();
