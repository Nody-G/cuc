import { FilmCredit, ParsedCredit, parseCredit } from '@/types';

/**
 * Score de notoriété d'un film du catalogue.
 *
 * Sert à proposer un ordre par défaut « plus gros films d'abord » dans le
 * Cockpit et sur les fiches coachs. Le score reste volontairement sobre et
 * factuel : il ne s'appuie que sur des signaux déjà présents en base
 * (`highlight`, `category`, `year`, présence d'une affiche, liens externes).
 *
 * Aucune donnée n'est inventée : un film sans signal reste à 0.
 */
export function scoreFilmNotability(film: FilmCredit): number {
    let score = 0;

    // Mise en avant éditoriale explicite (curation humaine).
    if (film.highlight) score += 100;

    // Catégorie : les blockbusters et grosses productions passent devant.
    const category = (film.category || '').toLowerCase();
    if (category.includes('blockbuster')) score += 60;
    else if (category.includes('gros') || category.includes('production')) score += 40;
    else if (category.includes('série') || category.includes('serie') || category.includes('tv')) score += 25;
    else if (category.includes('court')) score -= 20;

    // Récence : un film récent a plus de poids qu'un film ancien.
    const year = parseInt(String(film.year || ''), 10);
    if (Number.isFinite(year) && year > 1900) {
        // 2026 → +26, 2000 → +0, borné à [0, 30].
        score += Math.max(0, Math.min(30, year - 2000));
    }

    // Qualité de la fiche : affiche + liens externes = fiche exploitable.
    if (film.image) score += 8;
    if (film.imdbUrl) score += 4;
    if (film.trailerUrl) score += 3;

    // Un rôle de coordination est plus « vitrine » qu'un rôle générique.
    const stuntRoles = (film.stuntRoles || '').toLowerCase();
    if (stuntRoles.includes('coordinat')) score += 10;

    return score;
}

/**
 * Trie une liste de films par notoriété décroissante (sans muter l'entrée).
 */
export function sortFilmsByNotability(films: FilmCredit[]): FilmCredit[] {
    return [...films].sort((a, b) => {
        const diff = scoreFilmNotability(b) - scoreFilmNotability(a);
        if (diff !== 0) return diff;
        // Départage stable : année décroissante puis titre alphabétique.
        const yearA = parseInt(String(a.year || ''), 10) || 0;
        const yearB = parseInt(String(b.year || ''), 10) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return a.title.localeCompare(b.title, 'fr');
    });
}

/**
 * Normalise un titre pour comparaison tolérante (accents, casse, ponctuation).
 */
export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/**
 * Retrouve le film du catalogue correspondant à un crédit de tournage.
 *
 * Le crédit est au format « Titre (Année) — Rôle ». On tente d'abord une
 * correspondance exacte sur le titre, puis une correspondance partielle
 * (le titre du catalogue peut contenir une précision, ex: « Dunkerque (Dunkirk) »).
 */
export function matchFilmForCredit(credit: ParsedCredit, films: FilmCredit[]): FilmCredit | undefined {
    const target = normalizeTitle(credit.title);
    if (!target) return undefined;

    const exact = films.find((f) => normalizeTitle(f.title) === target);
    if (exact) return exact;

    return films.find((f) => {
        const candidate = normalizeTitle(f.title);
        return candidate.includes(target) || target.includes(candidate);
    });
}

/**
 * Construit la liste ordonnée des crédits d'un coach, en mettant en tête les
 * films explicitement sélectionnés dans le Cockpit (`featuredCredits`), puis
 * les autres par notoriété décroissante.
 *
 * `featuredCredits` contient des chaînes de crédit brutes (identiques à celles
 * de `notableCredits`) : la sélection est donc stable même si l'ordre de
 * `notableCredits` change.
 */
export function orderCreditsForDisplay(
    notableCredits: string[],
    featuredCredits: string[] | undefined,
    films: FilmCredit[]
): ParsedCredit[] {
    const parsed = notableCredits.map(parseCredit);
    const featured = featuredCredits || [];

    if (featured.length === 0) {
        return sortCreditsByFilmNotability(parsed, films);
    }

    const featuredSet = new Set(featured);
    const pinned: ParsedCredit[] = [];
    const rest: ParsedCredit[] = [];

    for (const credit of parsed) {
        if (featuredSet.has(credit.raw)) pinned.push(credit);
        else rest.push(credit);
    }

    // Conserve l'ordre de sélection choisi dans le Cockpit.
    pinned.sort((a, b) => featured.indexOf(a.raw) - featured.indexOf(b.raw));

    return [...pinned, ...sortCreditsByFilmNotability(rest, films)];
}

/**
 * Trie des crédits selon la notoriété du film correspondant dans le catalogue.
 * Les crédits sans film correspondant conservent leur ordre relatif (fin de liste).
 */
export function sortCreditsByFilmNotability(credits: ParsedCredit[], films: FilmCredit[]): ParsedCredit[] {
    const withScore = credits.map((credit, index) => {
        const film = matchFilmForCredit(credit, films);
        return {
            credit,
            index,
            score: film ? scoreFilmNotability(film) : -1,
        };
    });

    withScore.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
    });

    return withScore.map((entry) => entry.credit);
}
