/**
 * Inspection ciblée :
 *  1. Combien de films ont un `stunt_roles` composé (texte inventé type
 *     "Chorégraphies martiales au corps-à-corps en milieu industriel...").
 *  2. État exact du coach Niels Dalery : crédits, film_roles, notable_credits.
 *  3. Recherche du film "Loin du périph" / "The Takedown" en base.
 *
 * Lecture seule. Aucune écriture.
 */
import 'dotenv/config';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const COMPOSED_PATTERNS = [
    '%Chorégraphies martiales%',
    '%corps-à-corps%',
    '%combats armés%',
    '%chutes sur sol dur%',
    '%Interventions CUC%',
    '%Cascades d\'action urbaine%',
    '%Projections t%',
    '%chutes surnaturelles%',
    '%Cascades physiques, combats, chutes%',
];

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // 1. Films avec stunt_roles non vide
    const total = await client.query(
        `select count(*)::int as n from site_films where coalesce(stunt_roles,'') <> ''`
    );
    console.log(`\n=== site_films avec stunt_roles non vide : ${total.rows[0].n} ===`);

    // 2. Films avec stunt_roles composé
    const whereClause = COMPOSED_PATTERNS.map((_, i) => `stunt_roles ilike $${i + 1}`).join(' or ');
    const composed = await client.query(
        `select id, title, year, stunt_roles from site_films where ${whereClause} order by title`,
        COMPOSED_PATTERNS
    );
    console.log(`\n=== Films avec stunt_roles COMPOSÉ (inventé) : ${composed.rowCount} ===`);
    for (const r of composed.rows) {
        console.log(`  - [${r.id}] ${r.title} (${r.year})`);
        console.log(`      "${r.stunt_roles}"`);
    }

    // 3. Échantillon de stunt_roles courts (probablement légitimes)
    const shortOnes = await client.query(
        `select id, title, stunt_roles from site_films
     where coalesce(stunt_roles,'') <> ''
       and not (${whereClause})
     order by length(stunt_roles) desc limit 15`,
        COMPOSED_PATTERNS
    );
    console.log(`\n=== Échantillon stunt_roles NON composés (15 plus longs) ===`);
    for (const r of shortOnes.rows) {
        console.log(`  - ${r.title} :: "${r.stunt_roles}"`);
    }

    // 4. Niels Dalery
    const niels = await client.query(
        `select id, name, title, notable_credits, metadata, featured_credits, credits_display_limit
     from site_team where id ilike '%niels%' or name ilike '%niels%'`
    );
    console.log(`\n=== site_team Niels : ${niels.rowCount} ligne(s) ===`);
    for (const r of niels.rows) {
        console.log(`  id=${r.id} name=${r.name} title=${r.title}`);
        console.log(`  notable_credits=${JSON.stringify(r.notable_credits)}`);
        console.log(`  featured_credits=${JSON.stringify(r.featured_credits)}`);
        console.log(`  credits_display_limit=${r.credits_display_limit}`);
        console.log(`  metadata.film_roles=${JSON.stringify(r.metadata?.film_roles || {})}`);
    }

    // 5. Film "Loin du périph" / "The Takedown"
    const takedown = await client.query(
        `select id, title, year, imdb_url, stunt_roles, cuc_team_involved, metadata
     from site_films
     where title ilike '%périph%' or title ilike '%periph%' or title ilike '%takedown%'`
    );
    console.log(`\n=== Films "Loin du périph" / "The Takedown" : ${takedown.rowCount} ===`);
    for (const r of takedown.rows) {
        console.log(`  id=${r.id} title=${r.title} (${r.year}) imdb=${r.imdb_url}`);
        console.log(`  stunt_roles="${r.stunt_roles}"`);
        console.log(`  cuc_team_involved=${JSON.stringify(r.cuc_team_involved)}`);
        console.log(`  metadata.cuc_team_roles=${JSON.stringify(r.metadata?.cuc_team_roles || {})}`);
    }

    // 6. Films où Niels est impliqué
    const nielsFilms = await client.query(
        `select id, title, year, stunt_roles, metadata
     from site_films
     where cuc_team_involved @> $1::text[] or metadata->'cuc_team_roles' ? $2`,
        [['niels-dalery'], 'niels-dalery']
    );
    console.log(`\n=== Films liés à niels-dalery : ${nielsFilms.rowCount} ===`);
    for (const r of nielsFilms.rows) {
        console.log(`  - ${r.title} (${r.year}) :: stunt_roles="${r.stunt_roles}"`);
        console.log(`      cuc_team_roles=${JSON.stringify(r.metadata?.cuc_team_roles || {})}`);
    }

    await client.end();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
