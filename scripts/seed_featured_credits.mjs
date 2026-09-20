/**
 * Pré-remplit `site_team.featured_credits` avec les plus gros films de chaque coach.
 *
 * Objectif : donner immédiatement une mise en avant pertinente (« les plus gros
 * films d'abord ») sans intervention manuelle dans le Cockpit. La sélection
 * reste ensuite entièrement modifiable depuis l'interface d'administration.
 *
 * Doctrine : aucune donnée inventée. On ne sélectionne que des crédits déjà
 * présents dans `notable_credits`, et on s'appuie sur des signaux factuels du
 * catalogue (`highlight`, `category`, `year`, présence d'affiche/liens).
 *
 * Usage :
 *   node scripts/seed_featured_credits.mjs            # aperçu (dry-run)
 *   node scripts/seed_featured_credits.mjs --write    # écriture en base
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const FEATURED_COUNT = 6;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Variables Supabase manquantes dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

/** Normalise un titre pour comparaison tolérante. */
function normalizeTitle(title) {
    return String(title || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Extrait le titre d'un crédit « Titre (Année) — Rôle ». */
function creditTitle(credit) {
    return String(credit || '').split('—')[0].replace(/\(\d{4}\)/, '').trim();
}

/** Score de notoriété d'un film (miroir de src/lib/credit-notability.ts). */
function scoreFilm(film) {
    let score = 0;
    if (film.highlight) score += 100;

    const category = String(film.category || '').toLowerCase();
    if (category.includes('blockbuster')) score += 60;
    else if (category.includes('gros') || category.includes('production')) score += 40;
    else if (category.includes('série') || category.includes('serie') || category.includes('tv')) score += 25;
    else if (category.includes('court')) score -= 20;

    const year = parseInt(String(film.year || ''), 10);
    if (Number.isFinite(year) && year > 1900) {
        score += Math.max(0, Math.min(30, year - 2000));
    }

    if (film.image) score += 8;
    if (film.imdb_url) score += 4;
    if (film.trailer_url) score += 3;

    const stuntRoles = String(film.stunt_roles || '').toLowerCase();
    if (stuntRoles.includes('coordinat')) score += 10;

    return score;
}

/** Retrouve le film du catalogue correspondant à un crédit. */
function matchFilm(credit, films) {
    const target = normalizeTitle(creditTitle(credit));
    if (!target) return undefined;

    const exact = films.find((f) => normalizeTitle(f.title) === target);
    if (exact) return exact;

    return films.find((f) => {
        const candidate = normalizeTitle(f.title);
        return candidate.includes(target) || target.includes(candidate);
    });
}

async function main() {
    // Lecture résiliente : la colonne `featured_credits` peut ne pas encore
    // exister si la migration SQL n'a pas été exécutée dans Supabase.
    let team;
    let teamError;
    ({ data: team, error: teamError } = await supabase
        .from('site_team')
        .select('id, name, notable_credits, featured_credits')
        .order('order_index', { ascending: true }));

    if (teamError && /featured_credits/.test(teamError.message)) {
        console.warn(
            '⚠ Colonne site_team.featured_credits absente — exécutez scripts/schema_team_featured_credits.sql dans le SQL Editor Supabase.\n' +
            '  Aperçu de la sélection sans lecture de la colonne.\n'
        );
        ({ data: team, error: teamError } = await supabase
            .from('site_team')
            .select('id, name, notable_credits')
            .order('order_index', { ascending: true }));
    }

    if (teamError) {
        console.error('Erreur lecture site_team :', teamError.message);
        process.exit(1);
    }

    const { data: films, error: filmsError } = await supabase
        .from('site_films')
        .select('id, title, year, category, highlight, image, imdb_url, trailer_url, stunt_roles')
        .eq('is_published', true);

    if (filmsError) {
        console.error('Erreur lecture site_films :', filmsError.message);
        process.exit(1);
    }

    console.log(`Mode : ${WRITE ? 'ÉCRITURE' : 'APERÇU (dry-run)'}`);
    console.log(`Fiches : ${team.length} | Films catalogue : ${films.length}\n`);

    let updated = 0;

    for (const member of team) {
        const credits = member.notable_credits || [];
        if (credits.length === 0) {
            console.log(`— ${member.name} : aucun crédit, ignoré.`);
            continue;
        }

        // Conserve une sélection existante (ne jamais écraser un choix humain).
        if (Array.isArray(member.featured_credits) && member.featured_credits.length > 0) {
            console.log(`— ${member.name} : sélection existante conservée (${member.featured_credits.length}).`);
            continue;
        }

        const scored = credits
            .map((credit, index) => {
                const film = matchFilm(credit, films);
                return { credit, index, score: film ? scoreFilm(film) : -1 };
            })
            .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index));

        const featured = scored
            .filter((entry) => entry.score > 0)
            .slice(0, FEATURED_COUNT)
            .map((entry) => entry.credit);

        if (featured.length === 0) {
            console.log(`— ${member.name} : aucun film notable identifié, ignoré.`);
            continue;
        }

        console.log(`— ${member.name} (${featured.length} mis en avant) :`);
        for (const credit of featured) {
            const film = matchFilm(credit, films);
            console.log(`    • ${credit}  [score ${film ? scoreFilm(film) : '?'}]`);
        }

        if (WRITE) {
            const { error } = await supabase
                .from('site_team')
                .update({ featured_credits: featured, updated_at: new Date().toISOString() })
                .eq('id', member.id);

            if (error) {
                console.error(`    ! Erreur écriture ${member.id} : ${error.message}`);
                continue;
            }
            updated++;
        }
    }

    console.log(
        WRITE
            ? `\n${updated} fiche(s) mise(s) à jour.`
            : `\nAperçu terminé. Relancez avec --write pour appliquer.`
    );
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
