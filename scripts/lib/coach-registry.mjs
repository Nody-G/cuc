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
        id: 'frederic-dessains',
        name: 'Frédéric Dessains',
        imdbId: 'nm1178395',
        tmdbId: null,
        nameVariants: ['Frédéric Dessains', 'Frederic Dessains'],
        discipline: 'Acrobatie, combat & comédie',
    },
    {
        id: 'niels-dalery',
        name: 'Niels Dalery',
        imdbId: null,
        tmdbId: null,
        nameVariants: ['Niels Dalery', 'Niels Daléry'],
        discipline: 'Acrobatie & freerun',
    },
    {
        id: 'amedeo-cazzella',
        name: 'Amédéo Cazzella',
        imdbId: 'nm1000561',
        tmdbId: null,
        nameVariants: ['Amédéo Cazzella', 'Amedeo Cazzella', 'Amédéo Cazzella (stunts)'],
        discipline: 'Armes & combats',
    },
    {
        id: 'vincent-bouillon',
        name: 'Vincent Bouillon',
        imdbId: 'nm4933991',
        tmdbId: null,
        nameVariants: ['Vincent Bouillon'],
        discipline: 'Cascadeur & doublure',
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
        id: 'kefi-abrikh',
        name: 'Kefi Abrikh',
        imdbId: 'nm3768608',
        tmdbId: null,
        nameVariants: ['Kefi Abrikh', 'Kefi Abrik', 'Kefi Abrikh (stunts)'],
        discipline: 'Action design & chorégraphie',
    },
    {
        id: 'anthony-pho',
        name: 'Anthony Pho',
        imdbId: 'nm4131136',
        tmdbId: null,
        nameVariants: ['Anthony Pho'],
        discipline: 'Chorégraphie de combat',
    },
    {
        id: 'alex-vu',
        name: 'Alex Vu',
        imdbId: 'nm4842137',
        tmdbId: null,
        nameVariants: ['Alex Vu', 'Alexandre Vu'],
        discipline: 'Tricks, chutes & combats',
    },
    {
        id: 'michel-bouis',
        name: 'Michel Bouis',
        imdbId: 'nm0099365',
        tmdbId: null,
        nameVariants: ['Michel Bouis', 'Michel Bouis (cascadeur)'],
        discipline: 'Chutes & maniement d\'armes',
    },
    {
        id: 'sarah-belala',
        name: 'Sarah Belala',
        imdbId: 'nm5404934',
        tmdbId: null,
        nameVariants: ['Sarah Belala'],
        discipline: 'Combats & chutes',
    },
    {
        id: 'pierre-toubas',
        name: 'Pierre Toubas',
        imdbId: 'nm4947290',
        tmdbId: null,
        nameVariants: ['Pierre Toubas'],
        discipline: 'Combats & acrobaties',
    },
    {
        id: 'jonathan-bernard',
        name: 'Jonathan Bernard',
        imdbId: 'nm6788253',
        tmdbId: null,
        nameVariants: ['Jonathan Bernard'],
        discipline: 'Combats & chutes',
    },
    {
        id: 'bastien-trouve',
        name: 'Bastien Trouvé',
        imdbId: 'nm9687362',
        tmdbId: null,
        nameVariants: ['Bastien Trouvé', 'Bastien Trouve'],
        discipline: 'Combats & maniement d\'armes',
    },
    {
        id: 'teddy-ponceau',
        name: 'Teddy Ponceau',
        imdbId: 'nm12249560',
        tmdbId: null,
        nameVariants: ['Teddy Ponceau'],
        discipline: 'Parkour, combats & chutes',
    },
    {
        id: 'alan-cueff',
        name: 'Alan Cueff',
        imdbId: 'nm10995720',
        tmdbId: null,
        nameVariants: ['Alan Cueff', 'Allan Cueff'],
        discipline: 'Acrobatie & chutes',
    },
    {
        id: 'nicolas-retabi',
        name: 'Nicolas Retabi',
        imdbId: 'nm6912508',
        tmdbId: null,
        nameVariants: ['Nicolas Retabi', 'Nicolas Rertabi'],
        discipline: 'Chutes, acrobaties & airbag',
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
