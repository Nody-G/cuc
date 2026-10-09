/**
 * Résolution inverse « nom de comédien doublé → fiche du catalogue ».
 *
 * Sens couvert ici : `Instructor.doubledActors` porte des **noms publiés** (texte
 * libre, saisi au Cockpit), alors que la fiche appartient au catalogue
 * `DOUBLED_CELEBRITIES` identifié par un `id`. Ce module établit le
 * rapprochement entre les deux, de façon déterministe et testable.
 *
 * Docteur du contrat (`AGENTS.md` § 1) : **aucun appariement approximatif**.
 * Seule une égalité exacte après normalisation (accents, casse, ponctuation)
 * produit un lien. « Adil », « Liu » ou « Policier En Civil » ne désignent
 * aucune fiche : ils restent du texte, jamais un lien faux.
 */

import type { DoubledCelebrity } from '@/types';
import { creditTitleKey } from './credit-title';

/** Clé canonique d'un nom de comédien : accents, casse et ponctuation neutralisés. */
export function celebrityNameKey(value: string): string {
    return creditTitleKey(value ?? '');
}

/**
 * Correction orthographique **vérifiée** d'un nom publié.
 *
 * Chaque entrée est justifiée par une source externe absolue (la fiche du
 * catalogue et son IMDb) : ce n'est jamais un rapprochement approximatif, mais
 * la correction d'une coquille de saisie vers l'identité canonique.
 */
export interface CelebritySpellingFix {
    /** Forme fautive telle qu'elle est publiée dans les données. */
    published: string;
    /** `id` de la fiche catalogue visée — la seule source de vérité interne. */
    catalogueId: string;
    /** Preuve d'identité (catalogue + IMDb) justifiant la correction. */
    source: string;
}

/**
 * Table unique des corrections connues, partagée par :
 *   - la résolution affichée par la vitrine (un nom fautif est tout de même
 *     relié à sa fiche, car l'identité est certaine) ;
 *   - la migration `scripts/apply_actor_name_alignment_migration.ts`, qui aligne
 *     la base sur le catalogue.
 *
 * Toute correction sans preuve externe est refusée : elle resterait un lien faux.
 */
export const CELEBRITY_SPELLING_FIXES: readonly CelebritySpellingFix[] = [
    {
        published: 'Aahmir Khan',
        catalogueId: 'aahmir-khan',
        source: "Catalogue « Aamir Khan » (IMDb nm0451148) — doublure CUC sur « Thugs de l'Hindostan ».",
    },
    {
        published: 'Camille Rozat',
        catalogueId: 'camille-razat',
        source: 'Catalogue « Camille Razat » (IMDb nm4253884) — rôle de La Borgne dans la série Néro sur Netflix.',
    },
];

/**
 * Entrées de `doubled_actors` qui ne désignent **aucun comédien**.
 *
 * Deux sources concordantes, aucune déduction :
 *   1. **IMDb** (`scripts/coaches_scraped_full_imdb.json`) publie ces crédits
 *      sous la forme `stunt double: <personnage>` — l'acteur n'y est pas
 *      identifié, donc aucun patronyme n'existe à récupérer ;
 *   2. la liste de curation canonique du dépôt
 *      (`scripts/curate_doubled_actors.mjs`, « Filter out character names,
 *      generic roles, or non-actors ») exclut exactement ces entrées.
 *
 * Conséquence : ces noms ne doivent jamais être présentés comme des acteurs.
 * Les lignes de crédits (« Doublure de X ») restent, elles, factuelles.
 */
export const NON_ACTOR_DOUBLED_ENTRIES: readonly string[] = [
    'Policier En Civil',
    'Porte',
    'Sentinelle',
    'Adolescent',
    'Père Xavier',
    'Tony',
    'Ronan',
    'Fabrice',
    'Jojo',
    'Matthieu',
    'Christophe',
    'Kamel',
    'Manu',
    'Harold',
    'Joseph',
    'JP',
    'Jp',
    'Hakan',
    'Cara',
    'Albana',
    'Selma',
    'Christa',
    'Cléa',
    'Loïe',
    'José',
    'Malik',
    'Samir',
    'Adil',
    'Liu',
    'Ramzy',
    'Marc Laroche',
    'Joseph Bellegarde',
    'Laurent Le Suicidé',
    'Ezio Burntwood',
    'Kenji Sakaguchi',
    'Myo Leong',
    'Nacim Beliouz',
    /* « Benjamin de la Fère » n'est PAS exclu : le catalogue déclare lui-même ce
       nom comme alias d'une fiche existante (`benjamin-de-la-fere`). */
];

const NON_ACTOR_KEYS = new Set(NON_ACTOR_DOUBLED_ENTRIES.map((entry) => celebrityNameKey(entry)));

/** Vrai si le nom publié désigne un personnage, un rôle ou une identité non établie. */
export function isNonActorDoubledEntry(name: string): boolean {
    return NON_ACTOR_KEYS.has(celebrityNameKey(name));
}

/**
 * Alias déclarés entre parenthèses dans le catalogue, par ex.
 * « Gabriel Almaer (Benjamin de la Fère) » → « Benjamin de la Fère ».
 */
function declaredAliases(name: string): string[] {
    return [...name.matchAll(/\(([^)]+)\)/g)].map((match) => match[1]);
}

/**
 * Index des fiches par clé de nom. Pour chaque comédien sont adressables :
 *   - le nom complet ;
 *   - le nom débarrassé de ses parenthèses ;
 *   - chaque alias déclaré entre parenthèses.
 *
 * En cas de collision de clés, la **première** fiche du catalogue gagne : le
 * résultat est stable et ne dépend pas de l'ordre d'appel.
 */
export function buildCelebrityIndex(
    celebrities: readonly DoubledCelebrity[],
): Map<string, DoubledCelebrity> {
    const index = new Map<string, DoubledCelebrity>();

    for (const celebrity of celebrities) {
        const name = celebrity?.name ?? '';
        const keys = [
            celebrityNameKey(name),
            celebrityNameKey(name.replace(/\([^)]*\)/g, ' ')),
            ...declaredAliases(name).map(celebrityNameKey),
        ];

        for (const key of keys) {
            if (key && !index.has(key)) index.set(key, celebrity);
        }
    }

    // Corrections vérifiées : la forme fautive pointe vers la fiche visée.
    // Une correction dont la fiche est absente du catalogue est ignorée — on ne
    // fabrique jamais de cible.
    const byId = new Map(celebrities.map((celebrity) => [celebrity.id, celebrity]));
    for (const fix of CELEBRITY_SPELLING_FIXES) {
        const celebrity = byId.get(fix.catalogueId);
        const key = celebrityNameKey(fix.published);
        if (!celebrity || !key || index.has(key)) continue;
        index.set(key, celebrity);
    }

    return index;
}

/**
 * Fiche du catalogue correspondant à un nom publié, ou `null` si le nom ne
 * désigne aucune fiche (rôle, prénom seul, nom absent du catalogue).
 */
export function resolveCelebrityByActorName(
    name: string,
    index: ReadonlyMap<string, DoubledCelebrity>,
): DoubledCelebrity | null {
    const key = celebrityNameKey(name);
    if (!key) return null;
    return index.get(key) ?? null;
}

/**
 * Déduplique des noms qui ne diffèrent que par la casse, les accents ou la
 * ponctuation — le cas réel `["Benjamin De LA Fere", "Benjamin De LA Fère"]`
 * ne doit produire qu'une seule entrée. La première écriture est conservée.
 */
export function uniqueActorNames(names: readonly string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const name of names ?? []) {
        const key = celebrityNameKey(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(name.trim());
    }

    return unique;
}

/**
 * Noms réellement affichables comme « acteurs doublés » : entrées non-comédiens
 * écartées, doublons fusionnés, ordre conservé.
 */
export function publishedActorNames(names: readonly string[]): string[] {
    return uniqueActorNames((names ?? []).filter((name) => !isNonActorDoubledEntry(name)));
}
