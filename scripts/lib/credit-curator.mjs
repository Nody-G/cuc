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
    // Titres sportifs / distinctions personnelles : ne sont pas des tournages.
    'champion de france speed running',
]);

/**
 * Listes blanches par coach : quand un coach n'a qu'une participation
 * cinématographique vérifiée, on restreint explicitement ses crédits à cette
 * œuvre (doctrine « zéro invention » + arbitrage utilisateur).
 *
 * Clé = id du coach, valeur = ensemble de titres normalisés (minuscules).
 * Un coach absent de cette table n'est pas filtré.
 */
export const COACH_TITLE_ALLOWLIST = {
    // Niels Dalery : « Sous la Seine » uniquement (demande explicite répétée).
    'niels-dalery': new Set(['sous la seine']),
};

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
// 2. Normalisation des rôles — 3 libellés canoniques SEULEMENT
// ---------------------------------------------------------------------------

/**
 * Les 3 libellés de rôle autorisés sur les fiches coachs CUC.
 *
 * Demande explicite de l'utilisateur : « marque juste si ils ont ete
 * cascadeur doublure ou coordinateur. je veux que ces 3 titre rien d autre,
 * pas parkour ou autre ».
 *
 * Toute autre précision (parkour, câblage, chorégraphie, action designer,
 * superviseur…) est ramenée à l'un de ces 3 libellés. La précision d'origine
 * reste conservée dans `metadata.cuc_team_roles_detail` côté Supabase.
 */
export const CANONICAL_ROLES = ['Coordinateur des cascades', 'Doublure', 'Cascadeur'];

/**
 * Motifs de détection, testés sur le libellé replié (minuscules, sans accents).
 * L'ordre de priorité est : coordination > doublure > cascadeur.
 */
const COORDINATION_PATTERNS = [
    /\bcoordinateur\b/,
    /\bcoordinatrice\b/,
    /\bcoordinator\b/,
    /\bstunt coord/,
    /\bregisseur\b/,
    /\bchef cascadeur\b/,
    /\baction designer\b/,
    /\baction director\b/,
    /\bsuperviseur\b/,
    /\bsupervisor\b/,
];

const DOUBLURE_PATTERNS = [
    /\bdoublure\b/,
    /\bdoublure\b/,
    /\bdouble\b/,
    /\bstunt double\b/,
    /\bphoto double\b/,
    /\bstand[- ]?in\b/,
];

const CASCADEUR_PATTERNS = [
    /\bcascadeur\b/,
    /\bcascadeuse\b/,
    /\bstunt\b/,
    /\bstunts\b/,
    /\bcascade\b/,
    /\bcascades\b/,
    /\bparkour\b/,
    /\bcablage\b/,
    /\bwire\b/,
    /\bchute\b/,
    /\bcombat\b/,
    /\bchor[ée]graph/,
];

/**
 * Replie une chaîne : minuscules, accents retirés. Permet une détection
 * robuste indépendante de la casse et des diacritiques.
 *
 * @param {string} value
 * @returns {string}
 */
function fold(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Ramène un libellé de rôle brut à l'un des 3 libellés canoniques.
 *
 * Priorité : Coordinateur des cascades > Doublure > Cascadeur.
 * Un libellé vide ou non reconnu devient « Cascadeur » (repli neutre, jamais
 * inventé : tout crédit IMDb de cascade est au minimum un cascadeur).
 *
 * @param {string} role
 * @returns {'Coordinateur des cascades'|'Doublure'|'Cascadeur'}
 */
export function toCanonicalRole(role) {
    const f = fold(role);
    if (!f) return 'Cascadeur';
    if (COORDINATION_PATTERNS.some((re) => re.test(f))) return 'Coordinateur des cascades';
    if (DOUBLURE_PATTERNS.some((re) => re.test(f))) return 'Doublure';
    if (CASCADEUR_PATTERNS.some((re) => re.test(f))) return 'Cascadeur';
    // Libellé inconnu : repli neutre sur Cascadeur (aucune invention).
    return 'Cascadeur';
}

/**
 * Un rôle est « riche » s'il apporte une précision au-delà du simple
 * « Cascadeur » : coordination ou doublure. Utilisé pour le tri éditorial
 * (les rôles précis passent devant les génériques).
 *
 * @param {string} role
 * @returns {boolean}
 */
export function isRichRole(role) {
    const canonical = toCanonicalRole(role);
    return canonical === 'Coordinateur des cascades' || canonical === 'Doublure';
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
 * Choisit le rôle éditorial final d'un crédit, ramené à l'un des 3 libellés
 * canoniques (Cascadeur / Doublure / Coordinateur des cascades).
 *
 * Priorité de lecture (doctrine « zéro appauvrissement ») :
 *   1. Rôle déclaré (le coach sait ce qu'il a fait) ;
 *   2. Rôle IMDb ;
 *   3. Rôle TMDB ;
 *   4. « Cascadeur » par défaut.
 *
 * Le libellé retenu est ensuite normalisé via `toCanonicalRole`, ce qui
 * garantit exactement 3 valeurs possibles en sortie.
 *
 * @param {{ declaredRole?: string, imdbRole?: string, tmdbRole?: string }} entry
 * @returns {'Coordinateur des cascades'|'Doublure'|'Cascadeur'}
 */
export function pickEditorialRole(entry) {
    const declared = (entry.declaredRole || '').trim();
    const imdb = (entry.imdbRole || '').trim();
    const tmdb = (entry.tmdbRole || '').trim();

    // On privilégie d'abord un libellé riche (coordination / doublure), quel
    // que soit le champ d'origine, puis on retombe sur le premier disponible.
    const candidates = [declared, imdb, tmdb].filter(Boolean);
    for (const candidate of candidates) {
        if (isRichRole(candidate)) return toCanonicalRole(candidate);
    }
    for (const candidate of candidates) {
        return toCanonicalRole(candidate);
    }
    return 'Cascadeur';
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
 * Curation d'un coach : filtre, fusionne et trie ses crédits.
 *
 * AUCUN PLAFOND : tous les crédits cinématographiques vérifiables sont
 * conservés (demande utilisateur : « je devrais avoir des centaines de rôle
 * de mes coach et surement des centaines de films »).
 *
 * @param {Object} coachReport  Entrée `coaches[]` du rapport IMDb
 * @param {Object} [options]
 * @param {number} [options.currentYear]  Année de référence pour la récence
 * @param {boolean} [options.keepExcluded=false] Conserver la trace des exclus
 * @returns {{ kept: CuratedCredit[], excluded: CuratedCredit[], stats: Object }}
 */
export function curateCoachCredits(coachReport, options = {}) {
    const currentYear = options.currentYear ?? new Date().getFullYear();
    const keepExcluded = options.keepExcluded ?? false;

    const entries = Array.isArray(coachReport?.entries) ? coachReport.entries : [];

    // Liste blanche éventuelle : restreint les crédits d'un coach à des titres
    // explicitement validés (ex. Niels Dalery → « Sous la Seine » uniquement).
    const allowlist = COACH_TITLE_ALLOWLIST[coachReport?.id] || null;

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

        // Une année absente ou nulle (0) est normalisée en `null` : on ne
        // fabrique jamais une date pour combler un vide (doctrine « zéro
        // invention »).
        const rawYear = Number(entry.year);
        const record = {
            title,
            year: Number.isFinite(rawYear) && rawYear > 1900 ? rawYear : null,
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

        // Exclusion : hors liste blanche du coach (arbitrage utilisateur).
        if (allowlist && !allowlist.has(title.toLowerCase())) {
            record.excluded = true;
            record.reason = 'Hors périmètre validé pour ce coach';
            excluded.push(record);
            continue;
        }

        // Exclusion : crédit non publiable. Un crédit sans identifiant IMDb ET
        // sans année ne peut être daté ni rattaché à une œuvre vérifiable. Le
        // publier obligerait à inventer une date (doctrine « zéro invention »).
        // Un crédit rattaché à IMDb (imdbId) reste publiable même sans année :
        // l'œuvre est vérifiable, seule la date est inconnue (film non sorti).
        if (!record.imdbId && !record.year) {
            record.excluded = true;
            record.reason = 'Crédit non daté et non rattaché à IMDb — non publiable';
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

    // Tous les crédits retenus (aucun plafond).
    kept.push(...byTitle.values());

    // Tri final : rôles précis d'abord (coordination / doublure), puis score
    // décroissant, puis année décroissante, puis titre.
    kept.sort((a, b) => {
        const ra = isRichRole(a.role) ? 1 : 0;
        const rb = isRichRole(b.role) ? 1 : 0;
        if (rb !== ra) return rb - ra;
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
        excludedUnverifiable: excluded.filter((e) => e.reason.startsWith('Crédit non daté')).length,
        coordinators: kept.filter((c) => c.role === 'Coordinateur des cascades').length,
        doublures: kept.filter((c) => c.role === 'Doublure').length,
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
        totalExcludedUnverifiable: 0,
        totalCoordinators: 0,
        totalDoublures: 0,
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
        globalStats.totalExcludedUnverifiable += stats.excludedUnverifiable;
        globalStats.totalCoordinators += stats.coordinators;
        globalStats.totalDoublures += stats.doublures;
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
    const year = Number(credit.year);
    const yearPart = Number.isFinite(year) && year > 1900 ? ` (${year})` : '';
    return `${credit.title}${yearPart} — ${credit.role}`;
}
