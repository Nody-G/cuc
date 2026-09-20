/**
 * ==============================================================================
 * CUC — Registre des coachs pour le scraper de crédits
 * ==============================================================================
 * Source de vérité pour l'identité de chaque coach : identifiant CUC (slug),
 * identifiant IMDb, identifiant TMDB (si déjà connu), et variantes de nom
 * utilisées pour la recherche TMDB.
 *
 * IMPORTANT : ce fichier ne contient AUCUN crédit. Il ne sert qu'à résoudre
 * l'identité des personnes. Les crédits proviennent exclusivement de TMDB.
 *
 * Les coachs marqués `imdbId: null` n'ont pas de fiche IMDb connue : leur
 * résolution TMDB se fera par recherche nominative et sera marquée
 * `À CONFIRMER` (jamais écrite automatiquement).
 * ==============================================================================
 */

/**
 * @typedef {Object} CoachIdentity
 * @property {string} id            - slug CUC (clé primaire site_team)
 * @property {string} name          - nom affiché officiel
 * @property {string|null} imdbId   - identifiant IMDb (nmXXXXXXX) ou null
 * @property {number|null} tmdbId   - identifiant TMDB connu (évite une résolution)
 * @property {string[]} nameVariants - variantes orthographiques pour la recherche
 * @property {string} discipline    - domaine principal (contexte de désambiguïsation)
 */

/** @type {CoachIdentity[]} */
export const COACH_REGISTRY = [
    {
        // IMDb corrigé : nm8686683 pointait vers « Sigismund Payne Best »
        // (Archive Footage, 1998). Le vrai profil est nm9598200
        // (Stunt Coordinator / Stunts, 34 crédits dont John Wick: Chapter 4).
        id: 'lucas-dollfus',
        name: 'Lucas Dollfus',
        imdbId: 'nm9598200',
        tmdbId: null,
        nameVariants: ['Lucas Dollfus', 'Lucas Dollfuss'],
        discipline: 'Coordination de cascades',
    },
    {
        id: 'jerome-gaspard',
        name: 'Jérôme Gaspard',
        imdbId: 'nm2285249',
        tmdbId: null,
        nameVariants: ['Jérôme Gaspard', 'Jerome Gaspard', 'Jérôme Gaspard (cascadeur)'],
        discipline: 'Coordination de cascades',
    },
    {
        // IMDb corrigé : nm3763784 pointait vers « Skyler Sprague »
        // (Actor, 2011). Le vrai profil est nm4933991
        // (Stunts / Actor / Director, 92 crédits dont John Wick: Chapter 4).
        id: 'vincent-bouillon',
        name: 'Vincent Bouillon',
        imdbId: 'nm4933991',
        tmdbId: null,
        nameVariants: ['Vincent Bouillon'],
        discipline: 'Cascadeur & doublure',
    },
    {
        id: 'malik-diouf',
        name: 'Malik Diouf',
        imdbId: 'nm0228086',
        tmdbId: null,
        nameVariants: ['Malik Diouf', 'Malik Diouf Yamakasi'],
        discipline: 'Parkour',
    },
    {
        id: 'franck-blanc',
        name: 'Franck Blanc',
        imdbId: 'nm6923086',
        tmdbId: null,
        nameVariants: ['Franck Blanc', 'Franck Blanc (cascadeur)'],
        discipline: 'Câblage & pyrotechnie',
    },
    {
        id: 'kefi-abrikh',
        name: 'Kefi Abrikh',
        imdbId: 'nm3768608',
        tmdbId: null,
        nameVariants: ['Kefi Abrikh', 'Kefi Abrik', 'Kefi Abrikh (stunts)'],
        discipline: 'Action design & chorégraphie',
    },
    {
        id: 'maurice-chan',
        name: 'Maurice Chan',
        imdbId: 'nm0151023',
        tmdbId: null,
        nameVariants: ['Maurice Chan', 'Maurice Chan (cascadeur)'],
        discipline: 'Combats & arts martiaux',
    },
    {
        id: 'michael-troude',
        name: 'Michaël Troude',
        imdbId: 'nm0873735',
        tmdbId: null,
        nameVariants: ['Michaël Troude', 'Michael Troude', 'Mickaël Troude'],
        discipline: 'Combat rapproché',
    },
    {
        // IMDb corrigé : nm5449764 était erroné (aucune fiche). Le vrai profil
        // stunt est nm1000561 (119 crédits, dont John Wick: Chapter 4).
        id: 'amedeo-cazzella',
        name: 'Amédéo Cazzella',
        imdbId: 'nm1000561',
        tmdbId: null,
        nameVariants: ['Amédéo Cazzella', 'Amedeo Cazzella', 'Amédéo Cazzella (stunts)'],
        discipline: 'Armes & combats',
    },
    {
        // Aucune fiche IMDb publique identifiée pour ce coach (recherche
        // nominative infructueuse). Résolution manuelle requise.
        // Participation confirmée par la direction : « Sous la Seine » (2024)
        // uniquement. Aucun autre crédit de tournage à recenser.
        id: 'niels-dalery',
        name: 'Niels Dalery',
        imdbId: null,
        tmdbId: null,
        nameVariants: ['Niels Dalery', 'Niels Daléry'],
        discipline: 'Acrobatie & freerun',
    },
    {
        // IMDb identifié via l'API de suggestion : nm9687362 (Stunts, Anna).
        id: 'bastien-trouve',
        name: 'Bastien Trouvé',
        imdbId: 'nm9687362',
        tmdbId: null,
        nameVariants: ['Bastien Trouvé', 'Bastien Trouve'],
        discipline: 'Cascadeur',
    },
    {
        // IMDb identifié via l'API de suggestion : nm10995720 (Stunts, Anna).
        id: 'alan-cueff',
        name: 'Alan Cueff',
        imdbId: 'nm10995720',
        tmdbId: null,
        nameVariants: ['Alan Cueff', 'Allan Cueff'],
        discipline: 'Cascadeur & acrobatie',
    },
];

/**
 * Retourne un coach par son slug CUC.
 * @param {string} id
 * @returns {CoachIdentity|undefined}
 */
export function getCoachById(id) {
    return COACH_REGISTRY.find((c) => c.id === id);
}

/**
 * Retourne la liste des coachs dépourvus d'identifiant IMDb.
 * @returns {CoachIdentity[]}
 */
export function getCoachesWithoutImdb() {
    return COACH_REGISTRY.filter((c) => !c.imdbId);
}

/**
 * Normalise une chaîne pour comparaison de noms (minuscules, sans accents,
 * sans ponctuation).
 * @param {string} str
 * @returns {string}
 */
export function normalizeName(str) {
    return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
