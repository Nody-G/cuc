/**
 * Nettoyage éditorial (doctrine « Zéro Invention ») :
 *
 *  1. Vide le champ `stunt_roles` de TOUS les films : ces textes étaient
 *     des descriptions composées/inventées ("Chorégraphies martiales au
 *     corps-à-corps en milieu industriel…", "gun-fu", etc.). Le rôle réel
 *     d'un coach est déjà porté par `metadata.cuc_team_roles` (3 libellés
 *     canoniques : Cascadeur / Doublure / Coordinateur des cascades).
 *
 *  2. Corrige la fiche Niels Dalery :
 *     - retire le crédit non vérifiable "Sous la Seine"
 *     - retire le faux lien IMDb nm9102434 (ID inexistant)
 *     - ajoute le crédit vérifié par la direction CUC :
 *       "Loin du périph (2022) — Cascadeur"
 *     - rattache Niels au film `loin-du-periph` avec le rôle Cascadeur
 *     - retire Niels de `sous-la-seine`
 *
 * Dry-run par défaut. `--apply` pour écrire.
 *
 * Usage : node scripts/clean_stunt_roles_and_fix_niels.mjs [--apply]
 */
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const APPLY = process.argv.includes('--apply');

const NIELS_ID = 'niels-dalery';
const NIELS_CREDIT = 'Loin du périph (2022) — Cascadeur';
const NIELS_FILM_ID = 'loin-du-periph';
const REMOVED_FILM_ID = 'sous-la-seine';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

await client.connect();

// ---------------------------------------------------------------------------
// 1. Nettoyage des stunt_roles composés
// ---------------------------------------------------------------------------
const before = await client.query(
    `select count(*)::int as n from site_films where coalesce(stunt_roles,'') <> ''`
);
console.log(`\n=== 1. stunt_roles ===`);
console.log(`Films avec stunt_roles non vide AVANT : ${before.rows[0].n}`);

if (APPLY) {
    const res = await client.query(
        `update site_films set stunt_roles = null, updated_at = now()
     where coalesce(stunt_roles,'') <> ''`
    );
    console.log(`→ ${res.rowCount} film(s) nettoyé(s) (stunt_roles = NULL).`);
} else {
    console.log('→ [dry-run] les stunt_roles seraient mis à NULL.');
}

// ---------------------------------------------------------------------------
// 2. Fiche Niels Dalery
// ---------------------------------------------------------------------------
console.log(`\n=== 2. Fiche Niels Dalery ===`);

const niels = await client.query(
    `select id, name, notable_credits, featured_credits, imdb, metadata
   from site_team where id = $1`,
    [NIELS_ID]
);

if (niels.rowCount === 0) {
    console.log(`Aucune ligne site_team pour ${NIELS_ID}.`);
} else {
    const row = niels.rows[0];
    console.log(`AVANT :`);
    console.log(`  notable_credits  = ${JSON.stringify(row.notable_credits)}`);
    console.log(`  featured_credits = ${JSON.stringify(row.featured_credits)}`);
    console.log(`  imdb             = ${row.imdb}`);
    console.log(`  metadata.film_roles = ${JSON.stringify(row.metadata?.film_roles || {})}`);

    const newNotable = [NIELS_CREDIT];
    const newFeatured = [NIELS_CREDIT];
    const newFilmRoles = { [NIELS_FILM_ID]: 'Cascadeur' };
    const newMetadata = { ...(row.metadata || {}), film_roles: newFilmRoles };

    console.log(`APRÈS :`);
    console.log(`  notable_credits  = ${JSON.stringify(newNotable)}`);
    console.log(`  featured_credits = ${JSON.stringify(newFeatured)}`);
    console.log(`  imdb             = null (faux ID nm9102434 retiré)`);
    console.log(`  metadata.film_roles = ${JSON.stringify(newFilmRoles)}`);

    if (APPLY) {
        await client.query(
            `update site_team
       set notable_credits = $2,
           featured_credits = $3,
           imdb = null,
           metadata = $4,
           updated_at = now()
       where id = $1`,
            [NIELS_ID, newNotable, newFeatured, JSON.stringify(newMetadata)]
        );
        console.log('→ site_team mis à jour.');
    } else {
        console.log('→ [dry-run] site_team serait mis à jour.');
    }
}

// ---------------------------------------------------------------------------
// 3. Rattachement au film "Loin du périph"
// ---------------------------------------------------------------------------
console.log(`\n=== 3. Film "Loin du périph" ===`);

const film = await client.query(
    `select id, title, year, cuc_team_involved, metadata
   from site_films where id = $1`,
    [NIELS_FILM_ID]
);

if (film.rowCount === 0) {
    console.log(`Film ${NIELS_FILM_ID} introuvable.`);
} else {
    const f = film.rows[0];
    const involved = Array.isArray(f.cuc_team_involved) ? f.cuc_team_involved : [];
    const newInvolved = involved.includes(NIELS_ID) ? involved : [...involved, NIELS_ID];
    const newRoles = { ...(f.metadata?.cuc_team_roles || {}), [NIELS_ID]: 'Cascadeur' };
    const newFilmMeta = { ...(f.metadata || {}), cuc_team_roles: newRoles };

    console.log(`AVANT :`);
    console.log(`  cuc_team_involved = ${JSON.stringify(involved)}`);
    console.log(`  cuc_team_roles    = ${JSON.stringify(f.metadata?.cuc_team_roles || {})}`);
    console.log(`APRÈS :`);
    console.log(`  cuc_team_involved = ${JSON.stringify(newInvolved)}`);
    console.log(`  cuc_team_roles    = ${JSON.stringify(newRoles)}`);

    if (APPLY) {
        await client.query(
            `update site_films
       set cuc_team_involved = $2, metadata = $3, updated_at = now()
       where id = $1`,
            [NIELS_FILM_ID, newInvolved, JSON.stringify(newFilmMeta)]
        );
        console.log('→ site_films mis à jour.');
    } else {
        console.log('→ [dry-run] site_films serait mis à jour.');
    }
}

// ---------------------------------------------------------------------------
// 4. Retirer Niels de "Sous la Seine"
// ---------------------------------------------------------------------------
console.log(`\n=== 4. Retrait de Niels de "Sous la Seine" ===`);

const sds = await client.query(
    `select id, title, cuc_team_involved, metadata from site_films where id = $1`,
    [REMOVED_FILM_ID]
);

if (sds.rowCount === 0) {
    console.log(`Film ${REMOVED_FILM_ID} introuvable.`);
} else {
    const s = sds.rows[0];
    const involved = Array.isArray(s.cuc_team_involved) ? s.cuc_team_involved : [];
    const newInvolved = involved.filter((x) => x !== NIELS_ID);
    const newRoles = { ...(s.metadata?.cuc_team_roles || {}) };
    delete newRoles[NIELS_ID];
    const newFilmMeta = { ...(s.metadata || {}), cuc_team_roles: newRoles };

    console.log(`AVANT : involved=${JSON.stringify(involved)} roles=${JSON.stringify(s.metadata?.cuc_team_roles || {})}`);
    console.log(`APRÈS : involved=${JSON.stringify(newInvolved)} roles=${JSON.stringify(newRoles)}`);

    if (APPLY) {
        await client.query(
            `update site_films
       set cuc_team_involved = $2, metadata = $3, updated_at = now()
       where id = $1`,
            [REMOVED_FILM_ID, newInvolved, JSON.stringify(newFilmMeta)]
        );
        console.log('→ site_films mis à jour.');
    } else {
        console.log('→ [dry-run] site_films serait mis à jour.');
    }
}

await client.end();
console.log(`\n${APPLY ? 'APPLIQUÉ.' : 'DRY-RUN terminé (aucune écriture).'}`);
