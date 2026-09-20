/**
 * ==============================================================================
 * CUC — Migration d'identité : michael-troude → michel-bouis
 * ==============================================================================
 * Corrige l'identité du coach dans Supabase :
 *   - `site_team` : renomme la ligne (id, name, role, title, specialties, bio,
 *     notable_credits, imdb, external_url, metadata.film_roles) ;
 *   - `site_films` : remplace `michael-troude` par `michel-bouis` dans
 *     `cuc_team_involved` et `metadata.cuc_team_roles` ;
 *   - `site_settings` (clé `team`) : met à jour le miroir complet.
 *
 * Idempotent : relancer le script ne crée aucun doublon.
 * Aucune table CUC Sign n'est touchée (doctrine d'isolation).
 *
 * Usage :
 *   node scripts/migrate_michel_bouis_supabase.mjs --preview
 *   node scripts/migrate_michel_bouis_supabase.mjs
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config();

const OLD_ID = 'michael-troude';
const NEW_ID = 'michel-bouis';
const PREVIEW = process.argv.includes('--preview');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL manquant dans .env.local');
    process.exit(1);
}

/**
 * Charge la fiche corrigée depuis `src/data/team.ts` (fichier TypeScript non
 * importable directement par Node). On extrait le bloc de l'objet `michel-bouis`
 * et on l'évalue comme littéral JS.
 */
function loadMember() {
    const file = path.resolve(process.cwd(), 'src', 'data', 'team.ts');
    const src = fs.readFileSync(file, 'utf8');
    const anchor = src.indexOf(`id: '${NEW_ID}'`);
    if (anchor === -1) throw new Error(`Fiche « ${NEW_ID} » introuvable dans team.ts`);

    // Remonte au début de l'objet englobant, puis descend jusqu'à sa fermeture.
    const start = src.lastIndexOf('{', anchor);
    let depth = 0;
    let end = -1;
    for (let i = start; i < src.length; i += 1) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') {
            depth -= 1;
            if (depth === 0) {
                end = i + 1;
                break;
            }
        }
    }
    if (end === -1) throw new Error('Impossible de délimiter l\'objet de la fiche.');

    const literal = src.slice(start, end);
    // eslint-disable-next-line no-new-func
    return new Function(`return (${literal});`)();
}

const member = loadMember();
if (!member?.id) {
    console.error('Fiche invalide.');
    process.exit(1);
}

async function main() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    console.log(`Mode : ${PREVIEW ? 'APERÇU (aucune écriture)' : 'ÉCRITURE RÉELLE'}\n`);

    // --- 1. site_team -------------------------------------------------------
    const existing = await client.query('select id, name from site_team where id = $1', [OLD_ID]);
    const already = await client.query('select id, name from site_team where id = $1', [NEW_ID]);

    if (already.rows.length) {
        console.log(`[site_team] « ${NEW_ID} » existe déjà — mise à jour des champs.`);
    } else if (existing.rows.length) {
        console.log(`[site_team] « ${OLD_ID} » trouvé — renommage vers « ${NEW_ID} ».`);
    } else {
        console.log(`[site_team] Ni « ${OLD_ID} » ni « ${NEW_ID} » — insertion.`);
    }

    const teamSql = `
        insert into site_team (
            id, name, role, title, specialties, bio, notable_credits,
            avatar_url, imdb, external_url, metadata, is_published, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,now())
        on conflict (id) do update set
            name = excluded.name,
            role = excluded.role,
            title = excluded.title,
            specialties = excluded.specialties,
            bio = excluded.bio,
            notable_credits = excluded.notable_credits,
            avatar_url = excluded.avatar_url,
            imdb = excluded.imdb,
            external_url = excluded.external_url,
            metadata = excluded.metadata,
            updated_at = now()
    `;
    const teamParams = [
        NEW_ID,
        member.name,
        member.role,
        member.title,
        member.specialties,
        member.bio,
        member.notableCredits,
        member.avatarUrl,
        member.imdb,
        member.externalUrl ?? null,
        JSON.stringify(member.metadata ?? {}),
    ];

    if (!PREVIEW) {
        await client.query(teamSql, teamParams);
        console.log(`[site_team] « ${NEW_ID} » écrit (${member.notableCredits.length} crédits).`);
        if (existing.rows.length && !already.rows.length) {
            await client.query('delete from site_team where id = $1', [OLD_ID]);
            console.log(`[site_team] ancienne ligne « ${OLD_ID} » supprimée.`);
        }
    } else {
        console.log(`[site_team] APERÇU : ${member.name} | ${member.role} | ${member.notableCredits.length} crédits`);
    }

    // --- 2. site_films ------------------------------------------------------
    const films = await client.query(
        `select id, cuc_team_involved, metadata from site_films where $1 = any(cuc_team_involved)`,
        [OLD_ID],
    );
    console.log(`\n[site_films] ${films.rows.length} film(s) référencent « ${OLD_ID} ».`);

    for (const film of films.rows) {
        const involved = (film.cuc_team_involved || []).map((id) => (id === OLD_ID ? NEW_ID : id));
        const roles = { ...(film.metadata?.cuc_team_roles || {}) };
        if (roles[OLD_ID] !== undefined) {
            roles[NEW_ID] = roles[OLD_ID];
            delete roles[OLD_ID];
        }
        const metadata = { ...(film.metadata || {}), cuc_team_roles: roles };

        if (!PREVIEW) {
            await client.query(
                'update site_films set cuc_team_involved = $2, metadata = $3, updated_at = now() where id = $1',
                [film.id, involved, JSON.stringify(metadata)],
            );
        }
        console.log(`  ${PREVIEW ? '[aperçu] ' : ''}${film.id}`);
    }

    // --- 3. site_settings (clé team) ---------------------------------------
    const settings = await client.query(`select value from site_settings where key = 'team'`);
    if (settings.rows.length) {
        const value = settings.rows[0].value;
        const list = Array.isArray(value) ? value : value?.members;
        if (Array.isArray(list)) {
            const idx = list.findIndex((m) => m.id === OLD_ID);
            if (idx !== -1) {
                list[idx] = { ...list[idx], ...member, id: NEW_ID };
                const payload = Array.isArray(value) ? list : { ...value, members: list };
                if (!PREVIEW) {
                    await client.query(
                        `update site_settings set value = $1, updated_at = now() where key = 'team'`,
                        [JSON.stringify(payload)],
                    );
                }
                console.log(`\n[site_settings] miroir « team » mis à jour (index ${idx}).`);
            } else {
                console.log(`\n[site_settings] « ${OLD_ID} » absent du miroir « team ».`);
            }
        }
    }

    await client.end();
    console.log(`\n${PREVIEW ? 'Aperçu terminé.' : 'Migration terminée.'}`);
}

main().catch((err) => {
    console.error('ERREUR', err);
    process.exit(1);
});
