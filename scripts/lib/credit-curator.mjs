/**
 * credit-curator.mjs
 * ---------------------------------------------------------------------------
 * Curation éditoriale des crédits IMDb bruts pour les fiches coachs CUC.
 *
 * Problème résolu : le scraping IMDb produit un « vrac » fiable mais non
 * publiable (894 crédits bruts) contenant :
 *   - des clips musicaux, publicités, émissions de plateau, captations ;
 *   - des fonds de catalogue sans intérêt éditorial ;
 *   - des rôles techniques écrasés à « Cascadeur » alors que la déclaration
 *     du coach est riche (« Coordinateur des cascades », « Doublure Keanu
 *     Reeves », « Câblage 3D »…).
 *
 * Doctrine appliquée (AGENTS.md) :
 *   - Zéro invention : on ne crée aucun crédit, on filtre et on fusionne.
 *   - Zéro texte orphelin : chaque crédit conservé est traçable (source IMDb).
 *   - Sobriété : pas de badge marketing, pas de superlatif.
 *   - Terminologie Parkour : jamais « ADD » ni « Art du Déplacement ».
 *
 * Le module est PUR (aucune I/O) : il transforme une liste d'entrées de revue
 * en une liste curatée, ce qui le rend testable et déterministe.
 */

// ---------------------------------------------------------------------------
// 1. Filtres d'exclusion — contenus non cinématographiques
// ---------------------------------------------------------------------------

/**
 * Motifs de titres à exclure : clips, publicités, émissions, captations,
 * making-of, jeux, podcasts, cérémonies. Ces contenus ne relèvent pas d'une
 * fiche de cascadeur professionnel et polluent la lecture.
 *
 * Chaque motif est testé en minuscules sur le titre complet.
 */
export const NON_CINEMA_PATTERNS = [
    // Clips musicaux et vidéos musicales
    /\bft\.\s/i,
    /\bfeat\.\s/i,
    /\bmusic video\b/i,
    /\bofficial video\b/i,
    /\bfan video\b/i,
    /\blyric video\b/i,
    /\bclip officiel\b/i,
    // Publicités et contenus promotionnels
    /\bcoca-cola\b/i,
    /\brefresh your galaxy\b/i,
    /\bpublicit[ée]\b/i,
    /\bcommercial\b/i,
    /\bpub\s+[a-z0-9]/i,
    // Émissions, plateaux, divertissement
    /\bcabaret du monde\b/i,
    /\btalk[- ]?show\b/i,
    /\bgame show\b/i,
    /\breality\b/i,
    /\btelethon\b/i,
    /\bt[ée]l[ée]thon\b/i,
    // Cérémonies et remises de prix
    /\bawards?\b/i,
    /\bceremony\b/i,
    /\bc[ée]r[ée]monie\b/i,
    /\bgolden globe\b/i,
    /\boscars?\b/i,
    /\bc[ée]sars?\b/i,
    // Making-of, documentaires sur le tournage, captations
    /\bmaking[- ]of\b/i,
    /\bbehind the scenes\b/i,
    /\bthe musical\b/i,
    /\bconcert\b/i,
    /\blive at\b/i,
    // Jeux vidéo et contenus interactifs
    /\bvideo game\b/i,
    /\bjeu vid[ée]o\b/i,
    /\bgameplay\b/i,
    // Podcasts et émissions web
    /\bpodcast\b/i,
    /\bweb[- ]?s[ée]rie\b/i,
];

/**
 * Titres explicitement non cinématographiques (liste noire nominative).
 * Complète les motifs ci-dessus pour les cas ambigus.
 */
export const NON_CINEMA_TITLES = new Set([
    'kavinsky ft. kareen lomax: cameo',
    'coca-cola x star wars: refresh your galaxy',
    'le plus grand cabaret du monde',
    'back to the future (the musical)',
    'the prodigy: run with the wolves (fan video)',
]);

/**
 * Détermine si un titre relève d'un contenu non cinématographique.
 *
 * @param {string} title
 * @returns {boolean} true si le titre doit être exclu de la fiche
 */
export function isNonCinemaTitle(title) {
    if (!title) return true;
    const normalized = String(title).trim().toLowerCase();
    if (!normalized) return true;
    if (NON_CINEMA_TITLES.has(normalized)) return true;
    return NON_CINEMA_PATTERNS.some((re) => re.test(title));
}

// ---------------------------------------------------------------------------
// 2. Préservation des rôles déclarés riches
// ---------------------------------------------------------------------------

/**
 * Rôles génériques qui n'apportent aucune information éditoriale et qui
 * doivent céder la place à une déclaration plus riche si elle existe.
 */
const GENERIC_ROLES = new Set([
    'cascadeur',
    'stunts',
    'stunt',
    'cascade',
    'cascades',
    'stunt performer',
    'cascadeur parkour',
]);

/**
 * Un rôle est « riche » s'il apporte une précision au-delà du simple
 * « Cascadeur » : coordination, doublure nommée, câblage, chorégraphie,
 * parkour, effets physiques, etc.
 *
 * @param {string} role
 * @returns {boolean}
 */
export function isRichRole(role) {
    if (!role) return false;
    const normalized = String(role).trim().toLowerCase();
    if (!normalized) return false;
    if (GENERIC_ROLES.has(normalized)) return false;
    // Un rôle composé (« Cascadeur & Câblage ») est riche dès qu'il dépasse
    // le générique seul.
    return true;
}

// ---------------------------------------------------------------------------
// 2bis. Assainissement doctrinal des rôles
// ---------------------------------------------------------------------------

/**
 * Remplacements terminologiques imposés par la doctrine éditoriale (AGENTS.md).
 * Chaque entrée est [motif, remplacement]. Les motifs sont insensibles à la
 * casse et respectent les limites de mot.
 */
const DOCTRINE_REPLACEMENTS = [
    // Terminologie Parkour : jamais « ADD » ni « Art du Déplacement ».
    [/\bADD\b/g, 'Parkour'],
    [/Art du D[ée]placement/gi, 'Parkour'],
    // Bannir le sensationnalisme « gun-fu ».
    [/gun[- ]?fu/gi, 'Combats rapprochés'],
    // Superlatifs creux à neutraliser.
    [/l[ée]gendaire/gi, 'reconnu'],
    [/r[ée]f[ée]rence supr[êe]me/gi, 'référence'],
    [/chutes massives/gi, 'chutes'],
    [/dossier pro complet/gi, 'parcours'],
    [/\b[ée]lite\b/gi, 'expérimenté'],
];

/**
 * Applique la doctrine éditoriale à un libellé de rôle : neutralise les
 * termes interdits ou sensationnalistes sans jamais inventer de contenu.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizeRoleText(text) {
    if (!text) return '';
    let out = String(text);
    for (const [pattern, replacement] of DOCTRINE_REPLACEMENTS) {
        out = out.replace(pattern, replacement);
    }
    // Supprime les redondances créées par un remplacement :
    // « Combats rapprochés & Combats » → « Combats rapprochés ».
    out = out.replace(/Combats rapproch[ée]s\s*&\s*Combats/gi, 'Combats rapprochés');
    out = out.replace(/\b([\wÀ-ÿ][\wÀ-ÿ\s]*?)\s*&\s*\1\b/gi, '$1');
    // Normalise les espaces multiples introduits par les remplacements.
    return out.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Choisit le rôle éditorial final d'un crédit.
 *
 * Priorité (doctrine « zéro appauvrissement ») :
 *   1. Rôle déclaré riche (le coach sait ce qu'il a fait) ;
 *   2. Rôle IMDb spécifique (ex. « Cascadeur Parkour ») ;
 *   3. Rôle déclaré même générique ;
 *   4. Rôle IMDb générique ;
 *   5. « Cascadeur » par défaut.
 *
 * @param {{ declaredRole?: string, imdbRole?: string, tmdbRole?: string }} entry
 * @returns {string}
 */
export function pickEditorialRole(entry) {
    const declared = (entry.declaredRole || '').trim();
    const imdb = (entry.imdbRole || '').trim();
    const tmdb = (entry.tmdbRole || '').trim();

    let chosen;
    if (isRichRole(declared)) chosen = declared;
    else if (isRichRole(imdb)) chosen = imdb;
    else if (declared) chosen = declared;
    else if (imdb) chosen = imdb;
    else if (tmdb) chosen = tmdb;
    else chosen = 'Cascadeur';

    // Assainissement doctrinal systématique (Parkour, zéro « gun-fu », etc.).
    return sanitizeRoleText(chosen) || 'Cascadeur';
}

// ---------------------------------------------------------------------------
// 3. Score de notabilité — classement des crédits
// ---------------------------------------------------------------------------

/**
 * Pondération par statut de vérification. Un crédit confirmé passe devant un
 * crédit simplement nouveau ; un crédit non vérifiable reste en fin de liste.
 */
const STATUS_WEIGHT = {
    'CONFIRMÉ': 100,
    'CONTRADICTOIRE': 60,
    'NOUVEAU': 40,
    'NON VÉRIFIABLE': 10,
};

/**
 * Bonus pour les rôles riches : un rôle précis est plus informatif qu'un
 * « Cascadeur » générique.
 */
const RICH_ROLE_BONUS = 25;

/**
 * Calcule un score de notabilité pour trier les crédits d'un coach.
 * Plus le score est élevé, plus le crédit mérite d'être affiché.
 *
 * @param {{ status?: string, year?: number|null, declaredRole?: string, imdbRole?: string }} entry
 * @param {number} currentYear
 * @returns {number}
 */
export function notabilityScore(entry, currentYear) {
    let score = STATUS_WEIGHT[entry.status] ?? 0;

    if (isRichRole(entry.declaredRole) || isRichRole(entry.imdbRole)) {
        score += RICH_ROLE_BONUS;
    }

    // Récence : un crédit récent est plus parlant pour un prospect.
    const year = Number(entry.year);
    if (Number.isFinite(year) && year > 1900) {
        const age = Math.max(0, currentYear - year);
        score += Math.max(0, 30 - age); // bonus dégressif sur 30 ans
    }

    return score;
}

// ---------------------------------------------------------------------------
// 4. Pipeline de curation
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CuratedCredit
 * @property {string} title
 * @property {number|null} year
 * @property {string} role
 * @property {string} status
 * @property {string|null} imdbId
 * @property {number} score
 * @property {boolean} excluded
 * @property {string} reason
 */

/**
 * Curation d'un coach : filtre, fusionne, trie et plafonne ses crédits.
 *
 * @param {Object} coachReport  Entrée `coaches[]` du rapport IMDb
 * @param {Object} [options]
 * @param {number} [options.limit=24]     Nombre max de crédits retenus
 * @param {number} [options.currentYear]  Année de référence pour la récence
 * @param {boolean} [options.keepExcluded=false] Conserver la trace des exclus
 * @returns {{ kept: CuratedCredit[], excluded: CuratedCredit[], stats: Object }}
 */
export function curateCoachCredits(coachReport, options = {}) {
    const limit = options.limit ?? 24;
    const currentYear = options.currentYear ?? new Date().getFullYear();
    const keepExcluded = options.keepExcluded ?? false;

    const entries = Array.isArray(coachReport?.entries) ? coachReport.entries : [];

    /** @type {CuratedCredit[]} */
    const kept = [];
    /** @type {CuratedCredit[]} */
    const excluded = [];

    // Déduplication par titre normalisé : on garde la meilleure occurrence.
    const byTitle = new Map();

    for (const entry of entries) {
        const title = (entry.title || '').trim();
        const role = pickEditorialRole(entry);
        const score = notabilityScore(entry, currentYear);

        const record = {
            title,
            year: Number.isFinite(Number(entry.year)) ? Number(entry.year) : null,
            role,
            status: entry.status || 'NOUVEAU',
            imdbId: entry.imdbId || null,
            score,
            excluded: false,
            reason: '',
        };

        // Exclusion : contenu non cinématographique.
        if (isNonCinemaTitle(title)) {
            record.excluded = true;
            record.reason = 'Contenu non cinématographique (clip, publicité, émission…)';
            excluded.push(record);
            continue;
        }

        // Déduplication : même titre → on conserve le meilleur score.
        const key = title.toLowerCase();
        const existing = byTitle.get(key);
        if (!existing || record.score > existing.score) {
            byTitle.set(key, record);
        }
    }

    // Tri par score décroissant, puis par année décroissante, puis titre.
    const ranked = Array.from(byTitle.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const ya = a.year ?? 0;
        const yb = b.year ?? 0;
        if (yb !== ya) return yb - ya;
        return a.title.localeCompare(b.title, 'fr');
    });

    // Doctrine « zéro appauvrissement » : un rôle précis (coordination,
    // doublure nommée, câblage, chorégraphie…) ne doit JAMAIS être écarté par
    // le plafond. On garantit d'abord la présence de tous les rôles précis,
    // puis on complète avec les meilleurs crédits génériques.
    const rich = ranked.filter((r) => isRichRole(r.role));
    const generic = ranked.filter((r) => !isRichRole(r.role));

    for (const record of rich) {
        kept.push(record);
    }

    for (const record of generic) {
        if (kept.length < limit) {
            kept.push(record);
        } else {
            record.excluded = true;
            record.reason = `Au-delà du plafond éditorial (${limit})`;
            excluded.push(record);
        }
    }

    // Si les rôles précis dépassent à eux seuls le plafond, on les conserve
    // tous (l'information prime sur le plafond) et on le signale.
    if (rich.length > limit) {
        console.warn(
            `⚠ ${coachReport?.name || coachReport?.id || 'coach'} : ` +
            `${rich.length} rôles précis > plafond ${limit} — tous conservés.`
        );
    }

    // Réordonnancement final : score décroissant sur l'ensemble retenu.
    kept.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const ya = a.year ?? 0;
        const yb = b.year ?? 0;
        if (yb !== ya) return yb - ya;
        return a.title.localeCompare(b.title, 'fr');
    });

    const stats = {
        total: entries.length,
        kept: kept.length,
        excludedNonCinema: excluded.filter((e) => e.reason.startsWith('Contenu')).length,
        excludedOverLimit: excluded.filter((e) => e.reason.startsWith('Au-delà')).length,
        richRoles: kept.filter((c) => isRichRole(c.role)).length,
    };

    return {
        kept,
        excluded: keepExcluded ? excluded : [],
        stats,
    };
}

/**
 * Curation de l'ensemble des coachs d'un rapport.
 *
 * @param {Object} report  Rapport IMDb complet ({ coaches: [...] })
 * @param {Object} [options]
 * @returns {{ coaches: Array, globalStats: Object }}
 */
export function curateReport(report, options = {}) {
    const coaches = Array.isArray(report?.coaches) ? report.coaches : [];
    const results = [];
    const globalStats = {
        coaches: 0,
        totalRaw: 0,
        totalKept: 0,
        totalExcludedNonCinema: 0,
        totalExcludedOverLimit: 0,
        totalRichRoles: 0,
    };

    for (const coach of coaches) {
        const { kept, excluded, stats } = curateCoachCredits(coach, options);
        results.push({
            id: coach.id,
            name: coach.name,
            identityStatus: coach.identity?.status ?? coach.status ?? null,
            declaredCreditsCount: coach.declaredCreditsCount ?? null,
            curated: kept,
            excluded,
            stats,
        });

        globalStats.coaches++;
        globalStats.totalRaw += stats.total;
        globalStats.totalKept += stats.kept;
        globalStats.totalExcludedNonCinema += stats.excludedNonCinema;
        globalStats.totalExcludedOverLimit += stats.excludedOverLimit;
        globalStats.totalRichRoles += stats.richRoles;
    }

    return { coaches: results, globalStats };
}

/**
 * Formate un crédit curaté en chaîne `notableCredits` : « Titre (Année) — Rôle ».
 *
 * @param {CuratedCredit} credit
 * @returns {string}
 */
export function formatCuratedCredit(credit) {
    const yearPart = credit.year ? ` (${credit.year})` : '';
    return `${credit.title}${yearPart} — ${credit.role}`;
}
