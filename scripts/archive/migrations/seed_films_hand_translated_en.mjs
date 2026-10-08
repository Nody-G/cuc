#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Synopsis EN des 5 fiches films sans source anglaise automatique
 * ==============================================================================
 * TMDB, IMDb et Wikipédia anglophone ont été interrogés sans succès (voir
 * `plans/revue-traductions-films-imdb-en.md`, section « Sources anglaises
 * épuisées »). Le synopsis français du cockpit reste donc la seule source : il
 * est ici **traduit fidèlement**, exactement comme les disciplines, les
 * partenaires, les événements et les programmes — aucune phrase n'est inventée,
 * aucune information n'est ajoutée.
 *
 * Effet de bord signalé : le texte FR de `mon-frere-yves` a perdu ses
 * apostrophes à l'import (« dune », « dun », « laidera »…). La traduction
 * anglaise est propre ; la correction du texte FR relève d'une relecture
 * éditoriale et n'est pas faite ici (on ne réécrit pas un contenu de vitrine
 * dans un script de traduction).
 *
 * Usage :
 *   node scripts/seed_films_hand_translated_en.mjs --dry
 *   node scripts/seed_films_hand_translated_en.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body.slice(0, 200)}`);
    return body ? JSON.parse(body) : null;
}

const TRANSLATIONS = {
    '6-x-confine-e-s': {
        description:
            'Six stories with one thing in common: they all take place during the first lockdown. Six fables exploring, in different registers, how the worst — and sometimes the best — in each of us comes out in this unprecedented situation.',
    },
    'commissaire-moulin': {
        description:
            'Superintendent Moulin puts all his investigative talent at the service of justice.',
    },
    'mon-frere-yves': {
        description: [
            'Through the story of an almost amorous brotherhood — a stormy, passionate fraternal love — naval officer Julien Viaud, better known as Pierre Loti, gives himself a substitute brother: the sailor Yves Kermadec.',
            "On one side, Yves's natural, rough and primary side, a man who can barely read or write; on the other, the ambiguity, the extravagance, the refinement, the hierarchical and social superiority and the prestige of culture and knowledge that mark Pierre.",
            "The worst dangers threatening Yves are less the perils inherent in the sea and in his trade as a topman than the risks linked to dry land — above all the sailors' haunts that draw him in irresistibly, where he drinks until he becomes another man, a being steeped in fury and violence.",
            "His luck was to have crossed paths with Loti, who swore to Yves's mother that he would always watch over him as if he were a brother: he will not only keep his 'brother' Yves from being entirely lost, he will help him build himself as a man, start a family and build his house. He will love him — but the word carries so many different meanings that Loti will need a whole lifetime to separate loving from loving.",
            'Mon frère Yves insists on a universal notion contained in the novel: it is above all a tremendous coming-of-age story.',
            "'When they are this consoling, the stories of life,' Pierre Loti concludes in his novel, 'should be able to be stopped at will, like those in books.' Or those in films, one might add.",
        ].join('\n\n'),
    },
    'panique-au-grand-magasin': {
        description:
            'A year after saving the Passo Club, Arnaud goes from success to success and becomes the reference for turning struggling companies around. He is then called in to save a department store before 31 December.',
    },
    'sauveur-giordano': {
        description:
            'A former officer of the juvenile squad puts his skills at the service of a victim-support association.',
    },
};

const ids = Object.keys(TRANSLATIONS);
const films =
    (await rest(`site_films?select=id,title&id=in.(${ids.join(',')})`)) || [];
const overlays =
    (await rest(`site_translations?select=entity_id,payload&entity=eq.film&locale=eq.en&entity_id=in.(${ids.join(',')})`)) ||
    [];
const overlayIndex = new Map(overlays.map((row) => [row.entity_id, row.payload || {}]));

let seeded = 0;
const missing = [];

for (const id of ids) {
    const film = films.find((entry) => entry.id === id);
    if (!film) {
        missing.push(id);
        continue;
    }
    const payload = { ...(overlayIndex.get(id) || {}), ...TRANSLATIONS[id] };
    if (!DRY) {
        await rest('site_translations?on_conflict=entity,entity_id,locale', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                entity: 'film',
                entity_id: id,
                locale: 'en',
                payload,
                is_published: true,
            }),
        });
    }
    seeded += 1;
    console.log(`${DRY ? '[dry] ' : ''}film/${id} — ${film.title}`);
}

const review = [];
review.push('# Revue — Synopsis EN des dernières fiches films (traduction humaine)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_films_hand_translated_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push(
    'Ces cinq fiches n’ont **aucune source anglaise** : TMDB (pas d’`overview`), IMDb (pas d’intrigue, ou intrigue française), Wikipédia anglophone (aucune entrée). Le synopsis français du cockpit a donc été traduit fidèlement — même procédé que pour les disciplines, partenaires, événements et programmes.'
);
review.push('');
review.push('| id | titre | longueur EN |');
review.push('|---|---|---|');
for (const id of ids) {
    const film = films.find((entry) => entry.id === id);
    review.push(`| \`${id}\` | ${film?.title ?? id} | ${TRANSLATIONS[id].description.length} car. |`);
}
review.push('');
review.push(
    '**Signalement éditorial** : le texte FR de `mon-frere-yves` a perdu ses apostrophes à l’import (« dune », « dun », « laidera », « dinitiation »…). La traduction anglaise est propre, mais la fiche FR mérite une relecture — ce n’est pas un travail de traduction, donc non modifié ici.'
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-films-humaines.md', review.join('\n'), 'utf8');

console.log(`\n${DRY ? '[dry] ' : ''}${seeded} synopsis EN écrit(s)${missing.length ? ` · ${missing.length} fiche(s) absente(s) : ${missing.join(', ')}` : ''}.`);
console.log('Revue : plans/revue-traductions-films-humaines.md\n');
